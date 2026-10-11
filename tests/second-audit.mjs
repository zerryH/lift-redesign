import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
const z=await boot({...base(),workouts:[workout()]});
assert.deepEqual(z.errors,[]);const before=JSON.stringify(z.h.S.set);
for(const fn of z.listeners.input)fn({target:{id:'heightCm',value:'999',dataset:{}}});assert.equal(JSON.stringify(z.h.S.set),before,'unsaved input must not mutate profile');
assert.throws(()=>z.h.SlatData.validateBackup({workouts:[],bw:[],custom:{invalid:true}}));
for(const x of ['2026-02-30','not a date','2026-13-01'])assert.equal(z.h.SlatData.date(x),false);
const r=z.h.S.rk['Bench Press'];assert(r.need>=0);assert.equal(z.h.observers,undefined);
console.log('profile draft, validation and rank progress regression checks passed');
