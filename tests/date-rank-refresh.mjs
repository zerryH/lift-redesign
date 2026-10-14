import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

let stamp=Date.UTC(2026,9,14,12);
class Clock extends Date{
 constructor(...args){super(...(args.length?args:[stamp]))}
 static now(){return stamp}
}
const workouts=[{...workout('Bench Press',60,8),d:'2026-10-14'},{...workout('Bench Press',300,8),id:2,d:'2026-10-15'}];
const app=await boot({...base(),workouts},{Date:Clock});
const history=JSON.stringify(app.h.S.workouts),durable=app.store.get('liftlog-state');
const chest=()=>app.h.muscleStates({},80).find(x=>x.id==='chest').i;
const first=app.h.S.rk['Bench Press'].e,firstChest=chest();

stamp=Date.UTC(2026,9,15,12);
app.h.A.tab({v:'ranks'});
assert(app.h.S.rk['Bench Press'].e>first,'navigation refreshes date-eligible ranks');
assert(chest()>firstChest,'muscle ranks use the same newly eligible workout');
assert.equal(app.h.S.rk['Bench Press'].d,'2026-10-15');
assert(!app.h.V.ranks().includes('future-dated workout'));

// A timezone/clock change backwards must also remove now-ineligible cached ranks.
stamp=Date.UTC(2026,9,14,12);
for(const f of app.listeners.visibilitychange||[])f({});
assert.equal(app.h.S.rk['Bench Press'].e,first);
assert.equal(chest(),firstChest);
assert(app.h.V.ranks().includes('1 future-dated workout'));

// Returning to an open Ranks screen refreshes without an action or reload.
stamp=Date.UTC(2026,9,15,12);
for(const f of app.listeners.focus||[])f({});
assert(app.h.S.rk['Bench Press'].e>first);
assert(chest()>firstChest);
assert.equal(JSON.stringify(app.h.S.workouts),history);
assert.equal(app.store.get('liftlog-state'),durable,'derived date refresh cannot write workout history');

// One local-midnight deadline refreshes an already-open screen; resume replaces it.
const timers=new Map();let nextTimer=1;
app.ctx.setTimeout=(f,delay)=>{const id=nextTimer++;timers.set(id,{f,delay});return id;};
app.ctx.clearTimeout=id=>timers.delete(id);
stamp=new Date(2026,9,14,23,59,59).getTime();
app.h.A.tab({v:'ranks'});
for(const f of app.listeners.focus||[])f({});
for(const f of app.listeners.focus||[])f({});
assert.equal(timers.size,1,'resume cannot accumulate date timers');
const midnight=[...timers.values()][0];assert.equal(midnight.delay,1100);
timers.clear();stamp=new Date(2026,9,15,0,0,0,100).getTime();midnight.f();
assert.equal(app.h.S.rk['Bench Press'].d,'2026-10-15');
assert(chest()>firstChest);
assert.equal(timers.size,1,'midnight refresh schedules only the next deadline');
assert.equal(JSON.stringify(app.h.S.workouts),history);
assert.equal(app.store.get('liftlog-state'),durable);

// Refresh stays paused under the same conflict/import/finish guards as other work.
for(const guard of ['storageConflict','importing','finishing']){
 stamp=Date.UTC(2026,9,14,12);
 vm.runInContext(guard+'=true',app.ctx);
 for(const f of app.listeners.focus||[])f({});
 assert.equal(app.h.S.rk['Bench Press'].d,'2026-10-15',guard+' holds derived refresh');
 vm.runInContext(guard+'=false',app.ctx);
 app.h.A.tab({v:'ranks'});
 assert.equal(app.h.S.rk['Bench Press'].d,'2026-10-14');
 stamp=Date.UTC(2026,9,15,12);
 app.h.A.tab({v:'ranks'});
}
assert.deepEqual(app.errors,[]);
console.log('date changes refresh exercise and muscle ranks together without rewriting history');
