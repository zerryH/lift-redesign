import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
const z=await boot({...base(),workouts:[workout()]});
const before=JSON.stringify(z.h.S.rk);
for(const weight of [40,180]){z.h.gr={n:'Bench Press',w:String(weight),r:'5',b:'80',h:'178',u:'kg',f:'M'};await z.h.A.calc();assert.equal(z.h.gr.res.w,weight);await z.h.A.saveCheck();assert.equal(JSON.stringify(z.h.S.rk),before);assert.equal(z.h.S.checks['Bench Press'].w,weight);}
console.log('rank preview/saved check/earned workout separation passed');
