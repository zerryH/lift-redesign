import fs from 'node:fs';
import assert from 'node:assert/strict';
import {boot} from './support/runtime.mjs';
const old=JSON.parse(fs.readFileSync(new URL('./fixtures/old-state.json',import.meta.url),'utf8'));
const z=await boot(old);assert.deepEqual(z.errors,[]);assert(Array.isArray(z.h.S.workouts));assert(Array.isArray(z.h.S.custom));assert.equal(z.h.S.set.v,4);
const ids=z.h.S.workouts.map(w=>w.id);assert.equal(new Set(ids).size,ids.length);
for(const w of z.h.S.workouts){assert(Number.isSafeInteger(w.id));assert(Array.isArray(w.ex));for(const x of w.ex){assert(x.n);assert(x.exerciseId);assert(Array.isArray(x.sets));}}
const first=JSON.stringify(z.h.S);z.h.repairState();assert.equal(JSON.stringify(z.h.S),first,'normalization must be idempotent');
console.log('legacy state safely normalizes to stable exercise identities');
