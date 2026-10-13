import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

class RepeatedClock extends Date {
  static now(){return 42;}
}

const existing={...workout(),id:42};
const app=await boot({...base(),workouts:[existing]},{Date:RepeatedClock});
app.h.A.start({v:'Push'});
assert.equal(app.h.S.cur.id,43,'a free-workout draft must not reuse an existing workout ID');
assert.equal(app.h.newWorkoutId(),43,'allocation remains deterministic until the draft is saved');

app.h.S.cur=null;
const routine={id:'routine:one',name:'Collision proof',split:'Push',ex:[{n:'Bench Press',exerciseId:app.h.catalogueRecord('Bench Press').id,sets:3,reps:8,seconds:30,meters:20,rest:90}]};
assert.equal(app.h.routineSession(routine).id,43,'routine sessions use the same collision-safe allocator');

app.h.S.cur={...workout(),id:42};app.h.S.editingId=null;app.h.repairState();
assert.equal(app.h.S.cur.id,43,'an active imported draft collision is repaired before finishing');
const finished=app.h.SlatWorkout.replace(app.h.S.workouts,app.h.SlatWorkout.complete(app.h.S.cur),null);
assert.equal(finished.length,2,'the repaired draft is appended instead of silently discarded');

app.h.S.cur={...workout(),id:42};app.h.S.editingId=42;app.h.repairState();
assert.equal(app.h.S.cur.id,42,'editing intentionally keeps the saved workout identity');
assert.equal(app.h.S.editingId,42);
assert.deepEqual(app.errors,[]);
console.log('Free, routine and repaired drafts avoid workout ID collisions while saved-workout editing retains identity');
