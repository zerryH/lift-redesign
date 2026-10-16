import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const fixture=(name,unit='kg')=>{
 const initial=base();initial.set={...initial.set,unit,restEnabled:false};
 initial.workouts=[{...workout('Bench Press',60,8),id:10,d:'2026-09-19'}];
 initial.cur={...workout(name),id:11,ex:[{n:name,entryId:'exercise:older-draft',sets:[]}],drafts:{'exercise:older-draft':{kg:60,weightText:'not a weight',weightUnit:unit,invalidWeight:true,reps:9,seconds:45.5,meters:32.25,band:'red',note:'Keep this typed note',rpe:'8.5'}}};
 return initial;
};

for(const unit of ['kg','lb'])for(const [name,mode,quantity,value] of [
 ['Push-Up','reps','reps',9],
 ['Resistance Band Curl','band_reps','reps',9],
 ['Plank','duration','seconds',45.5],
]){
 const initial=fixture(name,unit),z=await boot(initial);
 assert.equal(z.h.trackingMode(name),mode);assert(!z.h.V.today().includes('id="qol-weight"'),'unloaded exercises have no weight control');
 assert.equal(z.h.dr.invalidWeight,true,'older typed weight is retained, not silently repaired');
 const before=JSON.stringify(z.h.S),stored=z.store.get('liftlog-state');
 assert(z.h.makeDraftSet(),name+': a hidden obsolete weight error must not block a valid set');
 assert.equal(JSON.stringify(z.h.S),before);assert.equal(z.store.get('liftlog-state'),stored);
 const restored=await boot(JSON.parse(stored)),imported=await boot();
 const backup={...initial,version:4,settings:initial.set};z.h.SlatData.validateBackup(backup,z.h.X.catalogue,{importText:true});await imported.h.importBackup(backup);
 for(const run of [z,restored,imported]){
  const history=JSON.stringify(run.h.S.workouts);
  assert.equal(run.h.dr.note,'Keep this typed note');assert.equal(run.h.dr.invalidWeight,true);
  const amount=run.h.dr[quantity];run.h.dr[quantity]='invalid';assert.equal(run.h.A.log(),false,name+': visible quantity still validates');run.h.dr[quantity]=amount;
  assert.equal(run.h.A.log(),true,name+': the valid visible fields must remain loggable');await run.h.flush();
  const set=run.h.S.cur.ex[0].sets[0];assert.equal(set.kg,0);assert.equal(set[quantity],value);assert.equal(set.trackingMode,mode);assert.equal(set.note,'Keep this typed note');assert.equal(set.rpe,8.5);
  if(mode==='band_reps')assert.equal(set.band,'red');
  assert.equal(JSON.stringify(run.h.S.workouts),history,'saved measurements remain untouched');
  const reload=await boot(JSON.parse(run.store.get('liftlog-state')));assert.equal(JSON.stringify(reload.h.S.cur.ex[0].sets[0]),JSON.stringify(set));
  assert.deepEqual([...run.errors,...reload.errors],[]);
 }
}

for(const unit of ['kg','lb'])for(const name of ['Bench Press','Weighted Plank','Farmer’s Carry']){
 const z=await boot(fixture(name,unit)),before=JSON.stringify(z.h.S),stored=z.store.get('liftlog-state');
 assert(z.h.V.today().includes('id="qol-weight"'),'loaded protocols retain a visible weight control');
 assert.equal(z.h.A.log(),false,name+': loaded protocols must still reject invalid weight');
 assert.equal(JSON.stringify(z.h.S),before);assert.equal(z.store.get('liftlog-state'),stored);
 const input=z.get('#qol-weight');Object.assign(input,{id:'qol-weight',tagName:'INPUT',value:'20,5'});for(const fn of z.listeners.input)fn({target:input});
 assert.equal(z.h.A.log(),true,name+': correcting a required weight still works');await z.h.flush();
 assert.equal(z.h.S.cur.ex[0].sets[0].kg,20.5/(unit==='lb'?2.20462:1));assert.deepEqual(z.errors,[]);
}
console.log('Reps, bands and unloaded holds ignore obsolete hidden weight errors after reload/import; visible quantities and all loaded protocols remain strict');
