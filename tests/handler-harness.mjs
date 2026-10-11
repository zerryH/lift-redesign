import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
const z=await boot({...base(),workouts:[workout()]});assert.deepEqual(z.errors,[]);
z.h.A.gr({v:'Bench Press'});await z.h.A.calc();assert(z.h.gr.res);
const old=z.h.rankSetEst('Weighted Dip',{kg:20,reps:8,t:'',bw:70},70);z.h.S.bw.push({d:'2026-09-21',kg:80});assert.equal(z.h.rankSetEst('Weighted Dip',{kg:20,reps:8,t:'',bw:70},70),old);
const c=await boot({...base(),custom:[{n:'My Custom',t:'B',g:'Pull',c:'Hamstrings',rank:'Deadlift'}],workouts:[workout('My Custom',100)]});assert(c.h.S.rk['My Custom']);assert.deepEqual(c.errors,[]);
console.log('rank actions, historical bodyweight and explicit custom standards passed');
