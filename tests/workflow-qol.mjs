import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

// Two entries with the same movement have independent, reloadable input drafts.
const duplicate=await boot({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]},{n:'Bench Press',sets:[]}]}});
const h=duplicate.h,first=h.S.cur.ex[0].entryId,second=h.S.cur.ex[1].entryId;
h.dr.kg=67.5;h.dr.reps=11;h.dr.note='First entry';h.persistDraft();
h.A.selectExercise({i:1});assert.equal(h.dr.kg,20);assert.equal(h.dr.note,'');
h.dr.kg=42.5;h.dr.note='Second entry';h.persistDraft();
h.A.selectExercise({i:0});assert.equal(h.dr.kg,67.5);assert.equal(h.dr.note,'First entry');
h.A.selectExercise({i:1});assert.equal(h.dr.kg,42.5);assert.equal(h.dr.note,'Second entry');
await h.flush();const restored=await boot(JSON.parse(duplicate.store.get('liftlog-state')));
assert.equal(restored.h.dr.kg,67.5);restored.h.A.selectExercise({i:1});assert.equal(restored.h.dr.kg,42.5);
h.A.log();assert.equal(h.S.cur.ex[1].sets[0].kg,42.5);assert(h.S.cur.drafts[first]);assert(!h.S.cur.drafts[second]);

// The old name-keyed draft is migrated only to the first matching entry.
const legacy=await boot({...base(),cur:{...workout(),drafts:{'Bench Press':{kg:55,reps:9,note:'Legacy draft'}},ex:[{n:'Bench Press',sets:[]},{n:'Bench Press',sets:[]}]}});
assert.equal(legacy.h.dr.kg,55);legacy.h.A.selectExercise({i:1});assert.equal(legacy.h.dr.kg,20);
legacy.h.A.selectExercise({i:0});legacy.h.persistDraft();assert(!legacy.h.S.cur.drafts['Bench Press']);assert.equal(legacy.h.S.cur.drafts[legacy.h.S.cur.ex[0].entryId].kg,55);

// Last time follows workout dates, ignores warm-ups/future sessions and isolates setups.
const history=await boot({...base(),cur:{...workout(),d:'2026-09-20',ex:[{n:'Bench Press',sets:[]}]},workouts:[
 {...workout('Bench Press',150,8),id:10,d:'2026-09-21'},
 {...workout('Bench Press',60,8),id:3,d:'2026-09-19',ex:[{n:'Bench Press',sets:[{kg:60,reps:8,t:''},{kg:20,reps:15,t:'w'}]}]},
 {...workout('Bench Press',100,8),id:2,d:'2026-09-20',ex:[{n:'Bench Press',sets:[{kg:100,reps:8,t:'',equipmentContext:{label:'Gym B'}}]}]},
]});
assert.equal(history.h.qolPrevSet('Bench Press').kg,60);assert.equal(history.h.dr.kg,60);
history.h.S.exercisePreferences={ex001:{equipmentLabel:'Gym B'}};history.h.dr={};history.h.V.today();assert.equal(history.h.qolPrevSet('Bench Press').kg,100);assert.equal(history.h.dr.kg,100);
history.h.S.editingId=2;assert.equal(history.h.qolPrevSet('Bench Press'),null);

// Routine targets guide input, progress ignores warm-ups and extra sets, and reorder keeps selection/drafts.
const routine=await boot();const r={id:'routine:test',name:'Target session',split:'Push',ex:[
 {n:'Bench Press',exerciseId:'ex001',sets:2,reps:12,seconds:30,meters:20,rest:90},
 {n:'Plank',exerciseId:routine.h.catalogueRecord('Plank').id,sets:1,reps:8,seconds:45,meters:20,rest:0},
]};
routine.h.launchRoutine(r);assert.equal(routine.h.dr.reps,12);
routine.h.dr.kg=50;routine.h.persistDraft();const active=routine.h.S.cur.ex[0].entryId;
routine.h.A.moveExercise({v:1});assert.equal(routine.h.ci,1);assert.equal(routine.h.S.cur.ex[1].entryId,active);assert.equal(routine.h.dr.kg,50);
routine.h.A.nextUnfinished();assert.equal(routine.h.ci,0);assert.equal(routine.h.dr.seconds,45);
routine.h.S.cur.ex[0].sets=[{kg:0,reps:0,seconds:45,t:'w'},{kg:0,reps:0,seconds:45,t:''}];
routine.h.S.cur.ex[1].sets=[{kg:50,reps:12,t:''},{kg:50,reps:12,t:''},{kg:50,reps:12,t:''}];
assert.equal(JSON.stringify(routine.h.routineProgress(routine.h.S.cur)),JSON.stringify({done:3,total:3,completed:2,exercises:2}));
assert.match(routine.h.V.today(),/All targets reached/);assert(!routine.h.V.today().includes('data-a=nextUnfinished'));
const before=routine.h.ci;routine.h.A.moveExercise({v:-1});assert.equal(routine.h.ci,before,'cannot move first entry beyond beginning');

// Reserved-looking setup labels are ordinary text and can be charted without mixing profiles.
const setup=await boot({...base(),exercisePreferences:{ex001:{equipmentLabel:'__all'}},cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]}});
setup.h.dr.kg=60;setup.h.dr.reps=8;setup.h.A.log();setup.h.SlatData.validateBackup(setup.h.S);
setup.h.S.workouts=[{...workout('Bench Press'),ex:[{n:'Bench Press',sets:[{kg:60,reps:8,t:'',equipmentContext:{label:'__all'}},{kg:100,reps:8,t:'',equipmentContext:{label:'Gym B'}}]}]}];
assert.equal(setup.h.progressSeries('Bench Press','load','__all','',0,false)[0].v,60);
assert.equal(setup.h.progressSeries('Bench Press','load','__all','',0,true)[0].v,100);

// Retiring never hides historical chart data; calendar-day windows include their first whole day.
const retired=await boot({...base(),custom:[{id:'custom:retired',n:'Retired curl',t:'M',c:'Biceps',archived:true},{id:'custom:unused',n:'Unused retired',t:'M',c:'Biceps',archived:true}],workouts:[workout('Retired curl',25,8)]});
assert(retired.h.progressNames().includes('Retired curl'));assert(!retired.h.progressNames().includes('Unused retired'));
assert.equal(retired.h.progressWindowCut('90',new Date(2026,9,11,23,40)),new Date(2026,6,14).getTime());
assert.equal(retired.h.progressWindowCut('all'),0);
const large=Array.from({length:200000},(_,i)=>({t:i,v:i%1000}));assert.equal(JSON.stringify(retired.h.chartRange(large)),JSON.stringify({t0:0,t1:199999,low:0,high:999}));
assert.deepEqual([duplicate,restored,legacy,history,routine,setup,retired].flatMap(x=>x.errors),[]);
console.log('Independent entry drafts, comparable last sets, routine progress/navigation, setup round trips and retired/large charts passed');
