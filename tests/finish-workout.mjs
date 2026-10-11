import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
const z=await boot();await z.h.A.fin();assert.equal(z.h.S.workouts.length,0);
z.h.S.cur=workout();await z.h.A.fin();assert.equal(z.h.S.cur,null);assert.equal(z.h.S.workouts.length,1);assert(z.h.S.rk['Bench Press']);
z.h.S.editingId=1;z.h.S.cur=workout('Bench Press',110);await z.h.A.fin();assert.equal(z.h.S.workouts.length,1);assert.equal(z.h.S.workouts[0].ex[0].sets[0].kg,110);
await z.h.A.fin();assert.equal(z.h.S.workouts.length,1);assert.deepEqual(z.errors,[]);
console.log('finish and edit commit exactly one saved workout');
