import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const z=await boot(),h=z.h;
const source={id:'routine:source',name:'Planned session',split:'Push',ex:[
 {n:'Bench Press',exerciseId:'ex001',sets:3,reps:12,seconds:45,meters:25,rest:0},
 {n:'Plank',exerciseId:h.catalogueRecord('Plank').id,sets:2,reps:8,seconds:60,meters:20,rest:120},
]};
h.launchRoutine(source);
for(const logged of [0,1,5]){
 h.S.cur.ex[0].sets=Array.from({length:logged},()=>({kg:60,reps:5,t:''}));
 const copy=h.routineFromWorkout(h.S.cur);
 assert.deepEqual(JSON.parse(JSON.stringify(copy.ex)),source.ex,'planned targets survive before logging, mid-session and extra sets');
 assert.notEqual(copy.id,source.id);
 h.SlatData.validateBackup({workouts:[],bw:[],routines:[copy]});
}
assert.deepEqual(source.ex[0],{n:'Bench Press',exerciseId:'ex001',sets:3,reps:12,seconds:45,meters:25,rest:0});

const history={...workout('Bench Press',75,10),ex:[{n:'Bench Press',sets:[{kg:20,reps:15,t:'w'},{kg:75,reps:10,t:''}]}]};
const actual=h.routineFromWorkout(history);
assert.equal(actual.ex[0].sets,1);assert.equal(actual.ex[0].reps,10,'unplanned history still derives performed targets');
const unknown=h.routineFromWorkout(workout('Old imported movement',25,8));
h.SlatData.validateBackup({workouts:[],bw:[],routines:[unknown]});

const setup=await boot({...base(),exercisePreferences:{ex001:{equipmentLabel:'A'}},cur:{...workout(),ex:[{n:'Bench Press',sets:[]},{n:'Bench Press',sets:[]},{n:'Plank',sets:[]}]},workouts:[{...history,ex:[{n:'Bench Press',sets:[{kg:75,reps:10,t:'',equipmentContext:{label:'A'}},{kg:40,reps:12,t:'',equipmentContext:{label:'B'}}]}]}]});
const q=setup.h;
q.dr.kg=85;q.dr.note='Keep this note';q.dr.rpe=8;q.persistDraft();
q.A.selectExercise({i:1});q.dr.kg=90;q.persistDraft();
q.A.selectExercise({i:2});q.dr.seconds=55;q.persistDraft();
q.A.selectExercise({i:0});q.resetEquipmentDrafts('ex001');q.S.exercisePreferences.ex001.equipmentLabel='B';q.save();q.V.today();
assert.equal(q.dr.kg,40);assert.equal(q.dr.reps,12);assert.equal(q.dr.note,'Keep this note');assert.equal(q.dr.rpe,8);
q.A.selectExercise({i:1});assert.equal(q.dr.kg,40,'other entries must not restore measurements from the old setup');
q.A.selectExercise({i:2});assert.equal(q.dr.seconds,55,'unrelated movement drafts stay intact');
await q.flush();const restored=await boot(JSON.parse(setup.store.get('liftlog-state')));
assert.equal(restored.h.dr.kg,40);assert.equal(restored.h.dr.note,'Keep this note');
assert.deepEqual([...z.errors,...setup.errors,...restored.errors],[]);
console.log('Routine targets, legacy movement copies and setup-specific drafts survive copying and reload');
