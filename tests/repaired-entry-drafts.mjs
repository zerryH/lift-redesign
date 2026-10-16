import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const shared='exercise:restored-entry';
const draft=unit=>({kg:27.25,reps:11,weightText:unit==='lb'?'60,077445':'27,25',weightUnit:unit,repsText:'11',seconds:'75.5',meters:'42.25',band:'Yellow test band',note:'Keep my unsaved identity draft',rpe:'8.5',invalidWeight:false,invalidReps:false});
const fixture=(name,unit='kg')=>({...base(),set:{...base().set,unit,restEnabled:false},workouts:[{...workout('Bench Press',60,8),id:10,ex:[{n:'Bench Press',entryId:shared,sets:[{id:'set:original-history',kg:60,reps:8,t:''}]}]}],cur:{...workout(name),id:11,ex:[{n:name,entryId:shared,sets:[]}],drafts:{[shared]:draft(unit)}}});
const json=value=>JSON.stringify(value);

for(const unit of ['kg','lb'])for(const [name,key,value] of [['Bench Press','reps',11],['Push-Up','reps',11],['Plank','seconds',75.5],['Resistance Band Curl','reps',11],['Farmer’s Carry','meters',42.25]]){
 for(const path of ['startup','import','undo']){
  const initial=fixture(name,unit),z=path==='startup'?await boot(initial):await boot({...initial,cur:null,undo:path==='undo'?{type:'draft',record:initial.cur,editingId:null,removedAt:1}:null});
  z.h.SlatData.validateBackup({...initial,version:4,settings:initial.set},z.h.X.catalogue,{importText:true});
  if(path==='import')await z.h.importBackup({...initial,version:4,settings:initial.set});
  if(path==='undo'){z.h.A.undo();await z.h.flush();}
  const x=z.h.S.cur.ex[0],history=json(z.h.S.workouts);
  assert.notEqual(x.entryId,shared,'colliding entry identities still get repaired');
  assert.equal(z.h.dr.note,draft(unit).note,path+' '+name+': repairing entry identity must retain the typed draft');
  assert.equal(json(z.h.S.cur.drafts[x.entryId]),json(draft(unit)),'draft bytes follow the repaired entry');
  assert.equal(z.h.S.cur.drafts[shared],undefined,'do not leave an unreachable stale identity key');
  assert.equal(z.h.dr.weightText,draft(unit).weightText);assert.equal(z.h.dr.repsText,'11');assert.equal(z.h.dr.band,'Yellow test band');assert.equal(z.h.dr.rpe,'8.5');
  const id=x.entryId;z.h.repairState();assert.equal(z.h.S.cur.ex[0].entryId,id,'repair is idempotent');assert.equal(json(z.h.S.cur.drafts[id]),json(draft(unit)));
  const before=await boot(JSON.parse(z.store.get('liftlog-state')));assert.equal(before.h.dr.note,draft(unit).note);assert.equal(before.h.S.cur.ex[0].entryId,id);
  assert.equal(z.h.A.log(),true);await z.h.flush();const set=z.h.S.cur.ex[0].sets[0];assert.equal(set[key],value);assert.equal(set.note,draft(unit).note);assert.equal(set.rpe,8.5);
  if(name==='Resistance Band Curl')assert.equal(set.band,'Yellow test band');
  if(['Bench Press','Farmer’s Carry'].includes(name))assert.equal(set.kg,unit==='lb'?60.077445/2.20462:27.25);else assert.equal(set.kg,0);
  assert.equal(json(z.h.S.workouts),history,'saved history stays unchanged');
  const after=await boot(JSON.parse(z.store.get('liftlog-state')));assert.equal(json(after.h.S.cur.ex[0].sets[0]),json(set));assert.equal(json(after.h.S.workouts),history);
  assert.deepEqual([...z.errors,...before.errors,...after.errors],[]);
 }
}

// A colliding identity-keyed draft still takes precedence over a legacy name-keyed draft.
const alias=fixture('Cable Bicep Curl');alias.cur.drafts['Cable Bicep Curl']={kg:1,reps:2,note:'Legacy fallback'};
const resolved=await boot(alias);assert.equal(resolved.h.S.cur.ex[0].n,'Cable Curl');assert.equal(resolved.h.dr.note,draft('kg').note);assert.equal(resolved.h.S.cur.drafts['Cable Bicep Curl'],undefined);

// One ambiguous identity-keyed draft belongs to the first occurrence, not every duplicate.
for(const collisionWithHistory of [false,true]){
 const initial=fixture('Bench Press');if(!collisionWithHistory)initial.workouts=[];
 initial.cur.ex.push({n:'Bench Press',entryId:shared,sets:[]});
 const z=await boot(initial),first=z.h.S.cur.ex[0],second=z.h.S.cur.ex[1];assert.notEqual(first.entryId,second.entryId);assert.equal(z.h.dr.note,draft('kg').note);
 z.h.A.selectExercise({i:1});assert.equal(z.h.dr.note,'');assert.equal(z.h.S.cur.drafts[second.entryId],undefined,'never copy another duplicate entry’s draft');
}

// A legitimate editor mirror keeps its identity and its draft without touching saved history.
const editing=fixture('Bench Press');editing.cur.id=10;editing.editingId=10;
const editor=await boot(editing);assert.equal(editor.h.S.cur.ex[0].entryId,shared);assert.equal(editor.h.dr.note,draft('kg').note);assert.equal(editor.h.S.workouts[0].ex[0].sets[0].kg,60);

// Identity repair does not clean up invalid input or bypass visible-field validation.
for(const unit of ['kg','lb']){
 const initial=fixture('Bench Press',unit);Object.assign(initial.cur.drafts[shared],{weightText:'bad weight',repsText:'bad reps',invalidWeight:true,invalidReps:true});
 const z=await boot(initial);assert.equal(z.h.dr.weightText,'bad weight');assert.equal(z.h.dr.repsText,'bad reps');assert.equal(z.h.dr.invalidWeight,true);assert.equal(z.h.dr.invalidReps,true);assert.equal(z.h.A.log(),false);
 assert.equal(z.h.S.cur.ex[0].sets.length,0);assert.equal(z.h.dr.note,draft(unit).note);
 for(const [id,value] of [['qol-weight','20,5'],['qol-reps','9']]){const input=z.get('#'+id);Object.assign(input,{id,tagName:'INPUT',value});for(const fn of z.listeners.input)fn({target:input});}
 assert.equal(z.h.A.log(),true);await z.h.flush();assert.equal(z.h.S.cur.ex[0].sets[0].kg,20.5/(unit==='lb'?2.20462:1));assert.equal(z.h.S.cur.ex[0].sets[0].reps,9);assert.equal(z.h.S.cur.ex[0].sets[0].note,draft(unit).note);assert.deepEqual(z.errors,[]);
}
console.log('Repaired entry identities retain exact owned drafts through startup/import/Undo, aliases, duplicates, kg/lb and persisted logging; editor mirrors stay stable');
