import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

async function editor(initial){
 const z=await boot(initial),create=z.ctx.document.createElement;
 z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;el.querySelectorAll=s=>{if(s==='[data-routine-replace]'&&el.innerHTML.includes('data-routine-replace')){const b=z.get('[data-routine-replace]');b.dataset.routineReplace='0';return[b];}return[];};return el;};
 z.h.A.routineSave();z.get('#routine-name').value='Restorable plan';
 return z;
}
async function saveRoutine(z){await z.get('#routine-save').listeners.click.at(-1)();await z.h.flush();}

const legacy=await editor({...base(),cur:workout('Archive Press',42.5,8)}),before=JSON.stringify(legacy.h.S.cur),stored=legacy.store.get('liftlog-state');
await saveRoutine(legacy);
assert.equal(legacy.h.S.routines.length,0,'unknown historical names must not create an unrestorable routine');
assert.match(legacy.get('#routine-error').textContent,/Resolve|unresolved/);
assert.equal(JSON.stringify(legacy.h.S.cur),before,'the original workout remains untouched');
assert.equal(legacy.store.get('liftlog-state'),stored);
assert.match(legacy.h.qolState.modal.innerHTML,/data-routine-replace/,'the unresolved row provides a repair control');
assert(!legacy.h.qolState.modal.innerHTML.includes('<option value="Archive Press">'),'unknown archival names cannot be added again');
legacy.get('[data-routine-replace]').listeners.click.at(-1)();
legacy.get('#routine-replacement').value='Bench Press';legacy.get('#routine-replace-save').listeners.click.at(-1)();
await saveRoutine(legacy);assert.equal(legacy.h.S.routines.length,1);
assert.equal(legacy.h.S.routines[0].ex[0].n,'Bench Press');assert.equal(legacy.h.S.routines[0].ex[0].exerciseId,'ex001');
assert.equal(legacy.h.S.routines[0].ex[0].sets,1);assert.equal(legacy.h.S.routines[0].ex[0].reps,8);
assert.equal(JSON.stringify(legacy.h.S.cur),before,'repair changes only the routine reference');
let exported;
legacy.ctx.navigator.canShare=()=>true;legacy.ctx.navigator.share=async data=>{exported=JSON.parse(data.files[0].parts[0]);};
await legacy.h.A.exp();legacy.h.SlatData.validateBackup(exported,legacy.h.X.catalogue);
const roundTrip=await boot();await roundTrip.h.importBackup(exported);
assert.equal(roundTrip.h.S.cur.ex[0].n,'Archive Press');assert.equal(roundTrip.h.S.cur.ex[0].sets[0].kg,42.5);
assert.equal(roundTrip.h.S.routines[0].ex[0].n,'Bench Press');

for(const [name,custom] of [['Bench Press',[]],["Oskar's Press",[{id:'custom:press',n:"Oskar's Press",t:'M',c:'Chest',g:'Push'}]],['Dumbbell Bicep Curl',[]]]){
 const z=await editor({...base(),custom,cur:workout(name,42.5,8)});await saveRoutine(z);
 assert.equal(z.h.S.routines.length,1,'known built-in, custom and aliased exercises still save');
 z.h.SlatData.validateBackup({version:4,workouts:z.h.S.workouts,bw:z.h.S.bw,custom:z.h.S.custom,routines:z.h.S.routines,cur:z.h.S.cur},z.h.X.catalogue);
 const restored=await boot();await restored.h.importBackup({version:4,workouts:[],bw:[],custom:z.h.S.custom,routines:z.h.S.routines});
 restored.h.launchRoutine(restored.h.S.routines[0]);assert.equal(restored.h.S.cur.ex[0].sets.length,0);
 assert.deepEqual([...z.errors,...restored.errors],[]);
}
const malformed=await boot();
assert.throws(()=>malformed.h.routineSession({id:'routine:bad',name:'Bad reference',ex:[{n:'Bench Press',exerciseId:'missing',sets:3,reps:8,seconds:30,meters:20,rest:90}]}),/Repair/);
assert.deepEqual([...legacy.errors,...roundTrip.errors,...malformed.errors],[]);
console.log('Routine saves reject unresolved identities, offer repair, preserve history and round-trip built-in/custom/alias references');
