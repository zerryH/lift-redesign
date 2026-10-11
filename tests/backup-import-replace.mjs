import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
const z=await boot({...base(),workouts:[workout()],custom:[{n:'Old custom',t:'B',rank:'Bench Press'}]});
await z.h.importBackup({version:4,workouts:[{...workout('Cable Curl',30),id:9}],custom:[],bw:[{d:'2026-09-20',kg:70}],settings:{table:'F',unit:'lb'}});
assert.equal(z.h.S.workouts.length,1);assert.equal(z.h.S.workouts[0].id,9);assert.equal(z.h.S.bw[0].kg,70);assert.equal(z.h.S.set.table,'F');assert.equal(z.h.S.set.unit,'lb');assert.equal(z.h.EX['Old custom'],undefined);assert.equal(z.h.R.alias['Old custom'],undefined);assert(z.store.get('liftlog-import-recovery'));assert.deepEqual(z.errors,[]);
console.log('validated backup fully replaces data and runtime registry');
