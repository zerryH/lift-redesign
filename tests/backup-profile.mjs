import assert from 'node:assert/strict';
import {boot,base} from './support/runtime.mjs';
const z=await boot();await z.h.importBackup({version:3,workouts:[],bw:[],custom:[],profile:{age:45,heightCm:180},settings:{unit:'lb'}});assert.equal(z.h.athleteAge(),45);assert.equal(z.h.S.set.heightCm,180);assert.equal(z.h.S.set.unit,'lb');
const saved=JSON.parse(z.store.get('liftlog-state'));assert(saved.set.birthYear);assert(!('age' in saved.set));
const next=await boot(saved);assert.equal(next.h.athleteAge(),45);assert.deepEqual(next.errors,[]);
console.log('profile import migrates age to durable birth year');
