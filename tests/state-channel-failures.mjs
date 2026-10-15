import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

async function channelBoot(source,initial,options={}){
 const read=fs.readFileSync;
 fs.readFileSync=(path,...args)=>{const content=read(path,...args);return String(path).endsWith('/app.js')?source+'\n'+content:content;};
 try{return await boot(initial,{delay:1,...options});}finally{fs.readFileSync=read;}
}

// An optional API can exist but refuse construction in the current browser context.
const database={value:null};
const blocked=await channelBoot('globalThis.BroadcastChannel=class{constructor(){throw new Error("Channel creation refused");}};',{
 ...base(),workouts:[workout('Bench Press',75,5)],cur:{...workout('Bench Press',60,8),id:2},
},{database});
assert.equal(blocked.h.S.workouts[0].ex[0].sets[0].kg,75);
assert.equal(blocked.h.S.cur.ex[0].sets[0].kg,60);
await blocked.h.A.fin();
assert.equal(blocked.h.S.workouts.length,2,'logging and finish remain usable without the advisory channel');
assert.equal(database.value.workouts.length,2);
assert.equal(JSON.parse(blocked.store.get('liftlog-state')).workouts.length,2);

// The durable comparison must still reject another writer without BroadcastChannel.
const latest=JSON.parse(blocked.store.get('liftlog-state'));
latest.savedAt++;latest.revision++;latest.workouts[0].name='Other tab';
const latestBytes=JSON.stringify(latest);blocked.store.set('liftlog-state',latestBytes);
assert.equal(await blocked.h.save(),false);
assert.equal(blocked.h.conflict,true);
assert.equal(blocked.store.get('liftlog-state'),latestBytes);

for(const closed of [false,true]){
 const db={value:null};
 const z=await channelBoot('globalThis.channelMessages=[];globalThis.BroadcastChannel=class{postMessage(message){if(globalThis.closedChannel)throw new Error("Channel closed");channelMessages.push(message);}addEventListener(){}};',{
  ...base(),workouts:[workout()],cur:{...workout('Bench Press',60,8),id:2},
 },{database:db});
 z.ctx.innerWidth=390;z.ctx.innerHeight=844;let reloads=0;
 z.ctx.location.reload=()=>reloads++;
 const create=z.ctx.document.createElement,query=z.ctx.document.querySelector;let modal;
 z.ctx.document.querySelector=s=>s==='#reset-modal'?null:query(s);
 z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;modal??=el;return el;};
 z.h.A.reset();z.get('[data-reset-confirm]').disabled=false;
 vm.runInContext('closedChannel='+closed,z.ctx);
 await assert.doesNotReject(()=>modal.listeners.click.at(-1)({target:{closest:s=>s==='[data-reset-confirm]'?{}:null,classList:{contains:()=>false}}}));
 assert.equal(reloads,1,'a failed advisory reset message cannot prevent reload');
 assert.equal(z.h.S.workouts.length,0);assert.equal(z.h.S.cur,null);
 assert.equal(z.store.has('liftlog-state'),false);assert.equal(db.value,null);
 if(!closed)assert.equal(z.ctx.channelMessages.at(-1).reset,true,'working channels still notify other tabs');
 await z.h.save();
 assert.equal(JSON.parse(z.store.get('liftlog-state')).workouts.length,0,'a later save cannot resurrect the cleared workouts');
 assert.equal(db.value.workouts.length,0);
 assert.deepEqual(z.errors,[]);
}
assert.deepEqual(blocked.errors,[]);
console.log('Unavailable cross-tab channels cannot block startup, weaken conflict checks or interrupt a completed reset');
