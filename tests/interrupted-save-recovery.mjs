import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

for(const asynchronous of [false,true]){
 const z=await boot({...base(),cur:workout('Bench Press',60,8)});
 z.h.qolRestStart(90);await z.h.flush();
 const draft=JSON.stringify(z.h.S.cur),stored=z.store.get('liftlog-state'),deadline=z.h.qolState.endAt;
 z.ctx.navigator.locks={request:asynchronous?async()=>{throw new Error('Interrupted lock request');}:()=>{throw new Error('Rejected lock request');}};
 await assert.doesNotReject(()=>z.h.A.fin());
 assert.equal(JSON.stringify(z.h.S.cur),draft,'failed coordination must restore the complete workout draft');
 assert.equal(z.h.S.workouts.length,0);
 assert.equal(z.store.get('liftlog-state'),stored,'a denied lock must not fall back to an unlocked write');
 assert.equal(z.h.qolState.endAt,deadline,'rest remains available with the recovery draft');
 assert.equal(z.intervals.size,1);
 assert.equal(z.get('#save-state-label').textContent,'Changes are not saved yet');
 z.ctx.navigator.locks={request:(name,job)=>{assert.equal(name,'slat-state-write');return job();}};
 await z.h.A.fin();
 assert.equal(z.h.S.cur,null);assert.equal(z.h.S.workouts.length,1);
 assert.equal(JSON.parse(z.store.get('liftlog-state')).workouts.length,1);
 assert.equal(z.h.qolState.endAt,0);assert.equal(z.intervals.size,0);
 assert.deepEqual(z.errors,[]);
}

const edit=await boot({...base(),workouts:[workout('Bench Press',100,5)],cur:workout('Bench Press',110,5),editingId:1});
const edited=JSON.stringify(edit.h.S.cur);
edit.ctx.navigator.locks={request:async()=>{throw new Error('Lock unavailable');}};
await edit.h.A.fin();
assert.equal(JSON.stringify(edit.h.S.cur),edited,'a failed edit retains the unsaved measurements');
assert.equal(edit.h.S.workouts[0].ex[0].sets[0].kg,100,'the prior completed workout stays intact');
edit.ctx.navigator.locks={request:(_name,job)=>job()};await edit.h.A.fin();
assert.equal(edit.h.S.workouts.length,1);assert.equal(edit.h.S.workouts[0].ex[0].sets[0].kg,110);

// A closed cross-tab channel must not turn a durable success into a rejected save.
const originalRead=fs.readFileSync;
fs.readFileSync=(path,...args)=>{const source=originalRead(path,...args);return String(path).endsWith('/app.js')?'globalThis.BroadcastChannel=class{postMessage(){if(globalThis.brokenChannel)throw new Error("Channel closed");}addEventListener(){}};\n'+source:source;};
let acknowledged;const database={value:null};
try{acknowledged=await boot({...base(),cur:workout('Bench Press',60,8)},{delay:1,database});}finally{fs.readFileSync=originalRead;}
vm.runInContext('brokenChannel=true',acknowledged.ctx);
await assert.doesNotReject(()=>acknowledged.h.A.fin());
assert.equal(acknowledged.h.S.cur,null);assert.equal(acknowledged.h.S.workouts.length,1);
assert.equal(database.value.workouts.length,1);
assert.equal(JSON.parse(acknowledged.store.get('liftlog-state')).workouts.length,1);
assert.equal(acknowledged.get('#save-state-label').textContent,'Saved on this device');
assert.deepEqual([...edit.errors,...acknowledged.errors],[]);
console.log('Rejected storage locks preserve drafts and rest for retry; edits and durable broadcast failures stay consistent');
