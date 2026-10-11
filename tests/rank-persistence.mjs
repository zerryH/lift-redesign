import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
const z=await boot({...base(),workouts:[workout()],rk:{'Cable Curl':{n:'Cable Curl',w:25,r:5,b:80,h:178,f:'M',auto:false,d:'2026-09-20'}}});
assert(z.h.S.checks['Cable Curl']);assert(z.h.S.rk['Bench Press']);assert(!z.h.S.rk['Cable Curl']);await z.h.save();
const saved=JSON.parse(z.store.get('liftlog-state'));assert.deepEqual(saved.rk,{});assert(saved.checks['Cable Curl']);
const next=await boot(saved);assert.equal(next.h.S.checks['Cable Curl'].w,25);assert.equal(next.h.S.rk['Bench Press'].w,100);assert.deepEqual(next.errors,[]);
console.log('legacy manual checks migrate and earned ranks rebuild after restart');
