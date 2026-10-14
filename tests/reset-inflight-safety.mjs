import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

// A reset waits for an outstanding save; real delegated controls must stay paused.
const z=await boot({...base(),cur:workout('Bench Press',60,8)});
z.ctx.innerWidth=390;z.ctx.innerHeight=844;
const create=z.ctx.document.createElement,query=z.ctx.document.querySelector;let modal;
z.ctx.document.querySelector=s=>s==='#reset-modal'?null:query(s);
z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;modal??=el;return el;};
z.h.A.reset();z.get('[data-reset-confirm]').disabled=false;
vm.runInContext('saveTail=new Promise(resolve=>globalThis.releaseResetSave=resolve)',z.ctx);
const target={closest:s=>s==='[data-reset-confirm]'?{}:null,classList:{contains:()=>false}};
const resetting=modal.listeners.click.at(-1)({target});
const before=JSON.stringify(z.h.S),stored=z.store.get('liftlog-state');
const log={dataset:{a:'log'}},logEvent={target:{closest:s=>s==='[data-a]'?log:null,classList:{contains:()=>false}}};
for(const fn of z.listeners.click)fn(logEvent);
assert.equal(JSON.stringify(z.h.S),before,'logging is paused throughout an in-flight reset');
for(const fn of z.listeners.input)fn({target:{id:'qol-note',value:'Should stay paused',dataset:{},setAttribute(){}}});
assert.equal(JSON.stringify(z.h.S),before,'draft edits are paused throughout an in-flight reset');
// A cleanup failure must release the pause and leave the intact saved data usable.
z.ctx.localStorage.removeItem=()=>{throw new Error('Cleanup blocked');};
z.ctx.releaseResetSave(true);await resetting;
assert.equal(z.store.get('liftlog-state'),stored);
assert.equal(z.get('[data-reset-confirm]').disabled,false,'failed cleanup can be retried');
for(const fn of z.listeners.click)fn(logEvent);
assert.equal(z.h.S.cur.ex[0].sets.length,2,'the app resumes after a safely failed reset');
await z.h.flush();assert.deepEqual(z.errors,[]);

// Reset must wait for another writer holding the same Web Lock as save().
const store=new Map([['liftlog-state',JSON.stringify({savedAt:1,revision:1,workouts:[],set:{}})]]);
let releaseWriter;const writer=new Promise(resolve=>releaseWriter=resolve),lockNames=[];
const ctx={location:{protocol:'file:'},navigator:{locks:{request(name,job){lockNames.push(name);return writer.then(job);}}},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},setTimeout,clearTimeout,Date,JSON,Number,Promise,Error};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('persistence.js','utf8')+'\nglobalThis.clearForTest=clearStoredState;',ctx);
const clear=ctx.clearForTest();await Promise.resolve();await Promise.resolve();
assert(store.has('liftlog-state'),'reset cannot clear storage while another writer owns the lock');
releaseWriter();assert.equal(await clear,true);assert.deepEqual(lockNames,['slat-state-write']);
assert.equal(store.has('liftlog-state'),false);
console.log('Reset pauses logging/draft edits, safely resumes on failure and shares the writer lock');
