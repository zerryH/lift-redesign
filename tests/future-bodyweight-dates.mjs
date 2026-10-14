import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const clockAt=stamp=>class Clock extends Date{
 constructor(...args){super(...(args.length?args:[stamp]))}
 static now(){return stamp}
};
const currentWorkout=()=>({...workout('Bench Press'),id:2,d:'2026-10-14',ex:[{n:'Bench Press',sets:[]}]});
const history=[{d:'2026-10-13',kg:80},{d:'2026-10-15',kg:200}];
const today=await boot({...base(),bw:history,cur:currentWorkout()},{Date:clockAt(Date.UTC(2026,9,14,12))});
const before=JSON.stringify(today.h.S.bw);

today.h.A.gr({v:'Bench Press'});
assert.equal(Number(today.h.gr.b),80,'rank calculator uses the latest eligible bodyweight');
today.h.dr.kg=60;today.h.dr.reps=8;today.h.A.log();
assert.equal(today.h.S.cur.ex[0].sets[0].bw,80,'a set cannot capture a future bodyweight');
assert.equal(JSON.stringify(today.h.S.bw),before,'eligibility checks cannot rewrite bodyweight history');
assert(today.h.V.settings().includes('200 kg'),'the future measurement remains visible in Profile');
assert(today.h.V.settings().includes('1 future-dated bodyweight entry is preserved but excluded'));

const futureOnly=await boot({...base(),bw:[history[1]],cur:currentWorkout()},{Date:clockAt(Date.UTC(2026,9,14,12))});
futureOnly.h.A.gr({v:'Bench Press'});
assert.equal(futureOnly.h.gr.b,'','a future-only history supplies no false current default');
futureOnly.h.dr.kg=60;futureOnly.h.dr.reps=8;futureOnly.h.A.log();
assert.equal(Object.hasOwn(futureOnly.h.S.cur.ex[0].sets[0],'bw'),false,"a future-only measurement is not stamped onto today's set");

const tomorrow=await boot({...base(),bw:[history[1]]},{Date:clockAt(Date.UTC(2026,9,15,12))});
tomorrow.h.A.gr({v:'Bench Press'});
assert.equal(Number(tomorrow.h.gr.b),200,'the preserved measurement activates on its recorded date');
assert(!tomorrow.h.V.settings().includes('future-dated bodyweight'));
assert.deepEqual([...today.errors,...futureOnly.errors,...tomorrow.errors],[]);
console.log('future-dated bodyweight stays preserved without contaminating current logging or rank defaults');
