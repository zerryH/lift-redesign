import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const NOW=Date.UTC(2026,9,14,12);
class Clock extends Date{
 constructor(...args){super(...(args.length?args:[NOW]))}
 static now(){return NOW}
}
const current={...workout('Bench Press',60,8),id:1,d:'2026-10-14'};
const future={...workout('Bench Press',300,8),id:2,d:'2026-10-15'};
const z=await boot({...base(),workouts:[current,future]},{Date:Clock});
const futureBefore=JSON.stringify(z.h.S.workouts[1]);
const currentEstimate=z.h.rankSetEst('Bench Press',z.h.S.workouts[0].ex[0].sets[0],80);
const futureEstimate=z.h.rankSetEst('Bench Press',z.h.S.workouts[1].ex[0].sets[0],80);

assert(futureEstimate>currentEstimate);
assert.equal(z.h.bests()['Bench Press'],currentEstimate,'a future workout cannot inflate an earned rank');
assert.equal(z.h.S.rk['Bench Press'].d,'2026-10-14','rank provenance stays on the eligible workout');
assert.equal(JSON.stringify(z.h.S.workouts[1]),futureBefore,'rank rebuilding must not rewrite the deferred workout');
assert(z.h.V.history().includes('2026-10-15'),'the deferred workout remains visible in History');
assert.equal(z.h.SlatWorkout.activity(z.h.S.workouts,2026).days.find(x=>x.date==='2026-10-15').count,1,'the deferred workout remains on its activity-calendar date');
assert(z.h.V.ranks().includes('1 future-dated workout is kept in History but excluded from earned ranks'));

z.h.S.workouts[1]=z.h.SlatWorkout.correct(z.h.S.workouts[1],'2026-10-14','',NOW);
z.h.refreshRanks();
assert.equal(z.h.bests()['Bench Press'],futureEstimate,'correcting the date makes the same set eligible');
assert.equal(z.h.S.rk['Bench Press'].d,'2026-10-14');
assert(!z.h.V.ranks().includes('future-dated workout'));
assert.deepEqual(z.errors,[]);
console.log('future-dated workouts stay in History but cannot affect earned ranks before their date');
