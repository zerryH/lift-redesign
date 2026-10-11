import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

// Reusing a known set must recover from invalid typed input, rather than retaining its rejection flags.
const reuse=await boot({...base(),workouts:[workout('Bench Press',60,8)],cur:{...workout('Bench Press'),id:2}});
reuse.h.dr={n:'Bench Press',kg:NaN,reps:NaN,invalidWeight:true,invalidReps:true};
const repeat={dataset:{qol:'repeatLast'}};
const target={classList:{contains:()=>false},closest:s=>s==='[data-qol]'?repeat:null};
for(const f of reuse.listeners.click||[])f({target});
assert.equal(reuse.h.dr.kg,60);assert.equal(reuse.h.dr.reps,8);
assert(reuse.h.makeDraftSet(),'Last time must produce a valid loggable set after correcting invalid input');

// Importing a running timer into an idle page must actually schedule ticks, replacing any previous clock.
const clock=await boot();
const imported={version:4,workouts:[],bw:[],cur:{...workout(),restEndAt:Date.now()+90000},settings:{restEnabled:true}};
await clock.h.importBackup(imported);
assert(clock.h.qolState.timer);assert(clock.intervals.has(clock.h.qolState.timer));
const originalTimer=clock.h.qolState.timer;
await clock.h.importBackup({...imported,cur:{...workout(),restEndAt:Date.now()+120000}});
assert(!clock.intervals.has(originalTimer));assert.equal(clock.intervals.size,1);
await clock.h.importBackup({...imported,settings:{restEnabled:false}});
assert.equal(clock.intervals.size,0);assert.equal(clock.h.qolState.endAt,0);

// Zero-rest exercises stop the previous exercise's timer; editing another workout clears its draft and clock.
const zero=await boot({...base(),cur:workout(),workouts:[{...workout('Cable Curl',25),id:2}]});
zero.h.qolRestStart(90);zero.h.S.exercisePreferences={ex001:{rest:0}};
zero.h.dr={n:'Bench Press',kg:60,reps:8};zero.h.A.log();
assert.equal(zero.h.S.cur.ex[0].sets.length,2);assert.equal(zero.h.qolState.endAt,0);assert.equal(zero.intervals.size,0);assert.equal(zero.h.S.cur.restEndAt,undefined);
zero.h.qolRestStart(90);zero.h.S.cur=null;zero.h.dr={n:'Cable Curl',kg:999,reps:3,note:'Unrelated draft'};
zero.h.A.he({i:0});
assert.equal(zero.h.qolState.endAt,0);assert.equal(zero.intervals.size,0);assert.notEqual(zero.h.dr.note,'Unrelated draft');

// Muscle totals include custom movements resolved through the same catalogue lookup as logging.
const custom=await boot({...base(),custom:[{id:'custom:chest',n:'My chest press',t:'M',c:'Chest',g:'Push'}],workouts:[workout('My chest press',40,8)]});
const totals=custom.h.SlatWorkout.summary(custom.h.S.workouts,'2026-09-01','2026-09-30',custom.h.catalogueRecord);
assert.equal(totals.sets,1);assert.equal(totals.muscles.chest,1);

// Imports must obey the same target constraints and unambiguous identities as the editor.
const routine={id:'routine:one',name:'My routine',ex:[{n:'Bench Press',exerciseId:'ex001',sets:3,reps:8,seconds:30,meters:20,rest:90}]};
const backup={workouts:[],bw:[],routines:[routine]};custom.h.SlatData.validateBackup(backup);
for(const [k,v] of [['sets',0],['sets',1.5],['reps',0],['reps',8.5],['seconds',0],['meters',0],['rest',2],['rest',30.5]])assert.throws(()=>custom.h.SlatData.validateBackup({...backup,routines:[{...routine,ex:[{...routine.ex[0],[k]:v}]}]}));
assert.throws(()=>custom.h.SlatData.validateBackup({...backup,routines:[routine,routine]}));
assert.throws(()=>custom.h.SlatData.validateBackup({...backup,exercisePreferences:{ex001:{rest:2}}}));
for(const name of ['constructor','prototype','__proto__'])assert.throws(()=>custom.h.SlatWorkout.correct(workout(),'2024-07-01',name));
custom.h.dr={kg:60,reps:8,rpe:'0x8'};custom.h.S.cur=workout();assert.equal(custom.h.makeDraftSet(),null);
custom.h.gr={n:'Bench Press',w:'60',r:'0x8',b:'80',h:'178',u:'kg',f:'M',res:null};await custom.h.A.calc();assert.equal(custom.h.gr.res,null);
custom.h.gr={n:'Bench Press',w:'60',r:'8',b:'80',h:'178oops',u:'kg',f:'M',res:null};await custom.h.A.calc();assert.equal(custom.h.gr.res,null);
assert.deepEqual([...reuse.errors,...clock.errors,...zero.errors,...custom.errors],[]);
console.log('Draft reuse, imported and zero-rest timers, workout switching, custom summaries and consistent import/input contracts passed');
