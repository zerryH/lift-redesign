import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
const run=await boot({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]}}),{h,get,listeners,store}=run;
h.dr={n:'Bench Press',kg:20,reps:8};
for(const [id,value,field] of [['qol-weight','67.5','kg'],['qol-reps','11','reps']]){
 const input=get('#'+id);Object.assign(input,{id,value,tagName:'INPUT'});
 for(const f of listeners.input)f({target:input});await h.flush();
 assert.equal(h.dr[field],Number(value));assert.equal(JSON.parse(store.get('liftlog-state')).cur.drafts[h.S.cur.ex[0].entryId][field],Number(value),'save final typed '+field);
}
const reloaded=await boot(JSON.parse(store.get('liftlog-state')));assert.equal(reloaded.h.dr.kg,67.5);assert.equal(reloaded.h.dr.reps,11);
h.S.workouts=[{...workout('Bench Press',40),id:1},{...workout('Bench Press',80),id:2}];h.dr={};assert.match(h.V.today(),/LAST TIME<\/small><b>80 kg/,'latest of two same-day workouts');
h.A.openx();const input=get('#ex-search');input.id='ex-search';
for(const [alias,target] of Object.entries(h.X.synonyms)){
 input.value=alias;for(const fn of listeners.input)fn({target:input});
 assert(get('#exercise-results').innerHTML.includes('data-v="'+target+'"'),'alias search '+alias+' resolves to '+target);
}
assert.deepEqual(run.errors,[]);console.log('Typed weight/reps persist immediately; latest same-day workout; all 25 declared aliases searchable');
