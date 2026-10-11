import assert from 'node:assert/strict';
import {boot} from './support/runtime.mjs';
const {h}=await boot();
// Largest-first greedy selection would strand 5 kg; two 10 kg pairs reach the exact target.
const sizes=[{plate:25,limit:0},{plate:20,limit:0},{plate:15,limit:1},{plate:10,limit:2},{plate:5,limit:0}];
const exact=h.qolPlatePlan(60,20,sizes);assert.equal(exact.exact,true);assert.equal(exact.remainder,0);assert.equal(exact.plates[0].plate,10);assert.equal(exact.plates[0].count,2);
assert.equal(h.qolPlatePlan(22.5,20).exact,true,'1.25 kg and 0.5 kg plates share a 0.25 kg quantum');
const closest=h.qolPlatePlan(62,20,sizes);assert.equal(closest.remainder,1);assert.equal(closest.exact,false);
const empty=h.qolPlatePlan(100,20,sizes.map(x=>({...x,limit:0})));assert.equal(empty.plates.length,0);assert.equal(empty.remainder,40);
const lb=h.qolPlatePlan(225/2.20462,45/2.20462,[{plate:45/2.20462,limit:2},{plate:35/2.20462,limit:1},{plate:1.25/2.20462,limit:0}]);assert.equal(lb.exact,true);assert(lb.remainder<1e-8);
console.log('finite inventory chooses exact or closest reachable load in both units');
