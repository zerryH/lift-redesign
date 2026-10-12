import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

async function routineNumbers(){
 const routine={id:'routine:import',name:'Imported plan',split:'Push',ex:[{n:'Bench Press',exerciseId:'ex001',sets:'3',reps:'12',seconds:'45',meters:'20',rest:'0'}]};
 const z=await boot();await z.h.importBackup({version:4,workouts:[],bw:[],routines:[routine]});
 const r=z.h.S.routines[0];assert.equal(r.ex[0].sets,3,'accepted numeric targets must work after import');
 assert.equal(r.ex[0].rest,0,'zero rest must stay zero');z.h.launchRoutine(r);
 assert.equal(z.h.routineProgress(z.h.S.cur).total,3);assert.equal(z.h.dr.reps,12);
 z.h.A.log();assert.equal(z.h.routineProgress(z.h.S.cur).done,1);
 const copy=z.h.routineFromWorkout(z.h.S.cur);assert.equal(copy.ex[0].sets,3);assert.equal(copy.ex[0].rest,0);
 await z.h.flush();const restored=await boot(JSON.parse(z.store.get('liftlog-state')));
 assert.equal(restored.h.routineProgress(restored.h.S.cur).total,3);assert.equal(restored.h.routineProgress(restored.h.S.cur).done,1);
 assert.deepEqual([...z.errors,...restored.errors],[]);
}
async function optionalRpe(){
 const z=await boot({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]}});
 z.h.dr.rpe='  ';const set=z.h.makeDraftSet();assert(set,'whitespace is an empty optional RPE');assert.equal(set.rpe,undefined);
 z.h.dr.rpe=' 8,5 ';assert.equal(z.h.makeDraftSet().rpe,8.5);
 z.h.dr.rpe='oops';assert.equal(z.h.makeDraftSet(),null);z.h.dr.rpe='11';assert.equal(z.h.makeDraftSet(),null);
}
async function wakeRaces(){
 const z=await boot({...base(),cur:workout()});z.ctx.location.protocol='https:';z.ctx.window.isSecureContext=true;
 const requests=[],sentinels=[];z.ctx.navigator.wakeLock={request:()=>new Promise((resolve,reject)=>requests.push({resolve,reject}))};
 const sentinel=()=>{const s={released:false,releases:0,async release(){this.released=true;this.releases++;}};sentinels.push(s);return s;};
 const settle=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
 z.h.qolRestStart(90);z.h.qolRestStart(90);await settle();assert.equal(requests.length,1,'pending wake requests must be shared');
 z.h.qolStopRest();const stale=sentinel();requests[0].resolve(stale);await settle();assert.equal(stale.releases,1,'a stopped timer must release a late wake lock');assert.equal(z.h.qolState.wake,null);
 z.h.qolRestStart(90);await settle();z.h.qolStopRest();z.h.qolRestStart(90);await settle();assert.equal(requests.length,3,'a new rest must acquire its own request after stop');
 const old=sentinel(),active=sentinel();requests[2].resolve(active);await settle();requests[1].resolve(old);await settle();
 assert.equal(old.releases,1);assert.equal(active.releases,0);assert.equal(z.h.qolState.wake,active);
 z.h.qolStopRest();await settle();assert.equal(active.releases,1);
 z.h.qolRestStart(90);await settle();requests[3].reject(new Error('Denied'));await settle();z.h.qolRestStart(90);await settle();assert.equal(requests.length,5,'denied requests may be retried');
 requests[4].resolve(sentinel());await settle();z.h.qolStopRest();await settle();assert(sentinels.every(s=>s.releases===1));assert.deepEqual(z.errors,[]);
}
let failed=0;for(const [name,fn] of Object.entries({routineNumbers,optionalRpe,wakeRaces})){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+': '+e.message);}}
assert.equal(failed,0,'workflow edge cases must pass');
