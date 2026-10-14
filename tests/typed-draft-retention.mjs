import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const initial={...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]},{n:'Plank',sets:[]}]}};
const run=await boot(initial),{h,get,listeners,store}=run;
const input=async(id,value)=>{const el=get('#'+id);Object.assign(el,{id,value,tagName:'INPUT'});for(const fn of listeners.input)fn({target:el});await h.flush();};
const field=(html,id)=>html.match(new RegExp('id="'+id+'"[^>]*value="([^"]*)"'))?.[1];

await input('qol-weight','oops');await input('qol-reps','8abc');
h.A.selectExercise({i:1});h.A.selectExercise({i:0});
let html=h.V.today();assert.equal(field(html,'qol-weight'),'oops');assert.equal(field(html,'qol-reps'),'8abc');
assert.match(html,/id="qol-weight"[^>]*aria-invalid="true"/);assert.match(html,/aria-valuetext="Enter a valid weight"/);
assert(!html.includes('value="NaN"'));assert.equal(h.makeDraftSet(),null);

let reload=await boot(JSON.parse(store.get('liftlog-state')));html=reload.h.V.today();
assert.equal(field(html,'qol-weight'),'oops');assert.equal(field(html,'qol-reps'),'8abc');assert.equal(reload.h.makeDraftSet(),null);
const backup=JSON.parse(JSON.stringify({...h.S,settings:h.S.set}));h.SlatData.validateBackup(backup,h.X.catalogue,{importText:true});
const restored=await boot();await restored.h.importBackup(backup);html=restored.h.V.today();
assert.equal(field(html,'qol-weight'),'oops');assert.equal(field(html,'qol-reps'),'8abc');
const inconsistent=JSON.parse(JSON.stringify(backup));const copied=Object.values(inconsistent.cur.drafts)[0];
Object.assign(copied,{weightText:'invalid',kg:100,invalidWeight:false,repsText:'bad',reps:8,invalidReps:false});
const rejected=await boot(inconsistent);assert.equal(rejected.h.dr.invalidWeight,true);assert.equal(rejected.h.dr.invalidReps,true);assert.equal(rejected.h.makeDraftSet(),null);

await input('qol-weight','67.25');await input('qol-reps','10');
h.A.selectExercise({i:1});h.A.selectExercise({i:0});html=h.V.today();
assert.equal(field(html,'qol-weight'),'67.25');assert.match(html,/aria-valuetext="67.25 kg"/);assert.equal(h.makeDraftSet().kg,67.25);
reload=await boot(JSON.parse(store.get('liftlog-state')));assert.equal(field(reload.h.V.today(),'qol-weight'),'67.25');
h.S.set.unit='lb';html=h.V.today();assert.equal(field(html,'qol-weight'),'148.260695');assert.match(html,/aria-valuetext="148.260695 lb"/);assert.equal(h.makeDraftSet().kg,67.25);
h.S.set.unit='kg';assert.equal(field(h.V.today(),'qol-weight'),'67.25');

await input('qol-weight','');await input('qol-reps','');h.A.selectExercise({i:1});h.A.selectExercise({i:0});
html=h.V.today();assert.equal(field(html,'qol-weight'),'');assert.equal(field(html,'qol-reps'),'');assert.equal(h.makeDraftSet(),null);
await input('qol-weight','67,25');await input('qol-reps','10');assert.equal(field(h.V.today(),'qol-weight'),'67,25');assert.equal(h.makeDraftSet().kg,67.25);

const payload='8" autofocus onfocus="alert(1)';await input('qol-weight',payload);await input('qol-reps',payload);html=h.V.today();
assert(!html.includes('onfocus="alert(1)'));assert(html.includes('&quot; autofocus'));
const slider=get('#ws');Object.assign(slider,{id:'ws',value:'75',tagName:'INPUT'});for(const fn of listeners.input)fn({target:slider});
assert.equal(h.dr.weightText,undefined);assert.equal(get('#qol-weight').attrs['aria-invalid'],'false');assert.equal(field(h.V.today(),'qol-weight'),'75');

await input('qol-weight','invalid');await input('qol-reps','invalid');h.S.workouts=[workout('Bench Press',50,8)];
for(const fn of listeners.click)fn({target:{closest:()=>({dataset:{qol:'repeatLast'}}),classList:{contains:()=>false}}});
assert.equal(h.dr.weightText,undefined);assert.equal(h.dr.repsText,undefined);assert.equal(field(h.V.today(),'qol-weight'),'50');assert.equal(h.makeDraftSet().kg,50);
await input('qol-weight','80');await input('qol-reps','9');h.resetEquipmentDrafts(h.S.cur.ex[0].exerciseId);html=h.V.today();
assert.equal(field(html,'qol-weight'),'50');assert.equal(field(html,'qol-reps'),'8');
assert.deepEqual(run.errors,[]);
console.log('Typed drafts retain invalid/blank/comma/precise text through navigation, reload and backup; sliders, Repeat and setup changes clear stale text');
