import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

let stamp=Date.UTC(2026,9,14,12);
class Clock extends Date{
 constructor(...args){super(...(args.length?args:[stamp]))}
 static now(){return stamp}
}
const app=await boot({...base(),cur:workout('Bench Press',60,8)},{Date:Clock});
const messages=[];
app.ctx.window.webkit={messageHandlers:{slatRestTimer:{postMessage:m=>messages.push(m)}}};
app.h.qolRestStart(90);await app.h.flush();
const deadline=app.h.qolState.endAt,start=app.h.qolState.startedAt,timer=app.h.qolState.timer;
const draft=JSON.stringify(app.h.S.cur),durable=app.store.get('liftlog-state');
const beforeMessages=messages.length;
app.failWrites.add('liftlog-state');
vm.runInContext('saveTail=new Promise(resolve=>globalThis.releaseFinishSave=resolve)',app.ctx);
const pending=app.h.A.fin();
assert.equal(app.h.S.cur,null,'finish uses a temporary completed state while its save is pending');
app.h.qolRenderRest();app.h.qolRestoreRest();app.h.qolSyncNativeRest();
for(const f of app.listeners.visibilitychange||[])f({});
for(const f of app.listeners['slat-native-rest-resume']||[])f({});
assert.equal(app.h.qolState.endAt,deadline,'ticks and resume cannot stop a pending-finish timer');
assert.equal(app.h.qolState.timer,timer);
assert.equal(app.intervals.size,1);
assert.equal(messages.slice(beforeMessages).filter(m=>m.action==='stop').length,0,'native countdown stays active before save acknowledgement');
app.ctx.releaseFinishSave(true);await pending;
assert.equal(JSON.stringify(app.h.S.cur),draft,'failed finish restores the full draft');
assert.equal(app.store.get('liftlog-state'),durable,'failed finish cannot replace durable state');
assert.equal(app.h.S.workouts.length,0);
assert.equal(app.h.qolState.endAt,deadline);
assert.equal(app.h.qolState.startedAt,start);
assert.equal(app.intervals.size,1,'rollback retains one countdown interval');

// Successful retry commits exactly once and then stops both timers.
app.failWrites.delete('liftlog-state');await app.h.A.fin();
assert.equal(app.h.S.cur,null);assert.equal(app.h.S.workouts.length,1);
assert.equal(app.h.qolState.endAt,0);assert.equal(app.intervals.size,0);
assert.equal(messages.at(-1).action,'stop');

// Time spent waiting still counts; an expired timer is not restarted on rollback.
stamp=Date.UTC(2026,9,14,12);
const elapsed=await boot({...base(),cur:workout('Bench Press',60,8)},{Date:Clock});
elapsed.h.qolRestStart(1);await elapsed.h.flush();
elapsed.failWrites.add('liftlog-state');
vm.runInContext('saveTail=new Promise(resolve=>globalThis.releaseFinishSave=resolve)',elapsed.ctx);
const elapsedFinish=elapsed.h.A.fin();stamp+=2000;elapsed.h.qolRenderRest();
assert(elapsed.h.qolState.endAt>0,'expiry cleanup waits for the pending finish');
elapsed.ctx.releaseFinishSave(true);await elapsedFinish;
assert(elapsed.h.S.cur);assert.equal(elapsed.h.S.cur.ex[0].sets[0].kg,60);
assert.equal(elapsed.h.S.workouts.length,0);assert.equal(elapsed.h.qolState.endAt,0);
assert.equal(elapsed.intervals.size,0,'an elapsed rest ends after rollback instead of restarting');
assert.deepEqual(elapsed.errors,[]);

// Expiry callbacks also cannot change a paused recovery draft under any guard.
for(const guard of ['storageConflict','importing','finishing']){
 stamp=Date.UTC(2026,9,14,12);
 const paused=await boot({...base(),cur:workout('Bench Press',60,8)},{Date:Clock});
 paused.h.qolRestStart(1);await paused.h.flush();
 const before=JSON.stringify(paused.h.S),stored=paused.store.get('liftlog-state'),end=paused.h.qolState.endAt;
 vm.runInContext(guard+'=true',paused.ctx);stamp+=2000;
 paused.h.qolRenderRest();paused.h.qolRestoreRest();paused.h.qolSyncNativeRest();
 assert.equal(JSON.stringify(paused.h.S),before,guard+' preserves the paused recovery draft');
 assert.equal(paused.store.get('liftlog-state'),stored);
 assert.equal(paused.h.qolState.endAt,end);
 vm.runInContext(guard+'=false',paused.ctx);paused.h.qolRenderRest();await paused.h.flush();
 assert.equal(paused.h.qolState.endAt,0,'expiry is processed after the guard clears');
 assert.equal(paused.h.S.cur.ex[0].sets[0].kg,60);
 assert.deepEqual(paused.errors,[]);
}
assert.deepEqual(app.errors,[]);
console.log('failed workout finish preserves active rest clocks; expiry and native sync honor safety guards');
