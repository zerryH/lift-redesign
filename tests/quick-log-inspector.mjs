import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';
const run=(ctx,code)=>vm.runInContext(code,ctx),copy=x=>JSON.parse(JSON.stringify(x));
{
 const t=await boot({...base(),rankingVersion:11,cur:{...workout(),ex:[{n:'Bench Press',entryId:'exercise:quick',sets:[]}]}}),{h,ctx}=t;
 const id=h.catalogueRecord('Bench Press').id,other=h.catalogueRecord('Squat').id;
 await h.A.pinExercise({v:id});await h.A.pinExercise({v:other});assert.deepEqual(copy(h.S.favourites),[id,other]);
 await h.A.pinMove({v:other,step:-1});assert.deepEqual(copy(h.S.favourites),[other,id]);
 run(ctx,"exercisePickerMode='Pinned'");assert.deepEqual(copy(run(ctx,"quickExerciseNames(['Bench Press','Squat','Deadlift'])")),['Squat','Bench Press']);
 const before=copy(h.S.workouts);h.V.today();h.dr={...h.dr,kg:50.123456789,reps:8};
 assert.equal(run(ctx,'quickLogAttempt({timeStamp:1000},()=>A.log())'),true);assert.equal(run(ctx,'quickLogAttempt({timeStamp:1100},()=>A.log())'),false);assert.equal(h.S.cur.ex[0].sets.length,1);await h.flush();
 const marker=copy(h.S.logUndo),saved=copy(JSON.parse(t.store.get('liftlog-state')));assert.equal(marker.setId,h.S.cur.ex[0].sets[0].id);assert(h.V.today().includes('Undo log'));
 const reloaded=await boot(saved);assert(reloaded.h.V.today().includes('Undo log'));await reloaded.h.A.undoLog();assert.equal(reloaded.h.S.cur.ex[0].sets.length,0);assert.deepEqual(copy(reloaded.h.S.workouts),before);
 run(ctx,'quickInputRevision++');assert.equal(run(ctx,'quickLogAttempt({timeStamp:1150},()=>A.log())'),true,'editing input permits a new intentional log');
 assert.equal(h.S.cur.ex[0].sets[0].kg,50.123456789);h.dr={...h.dr,weightText:'invalid typed load',invalidWeight:true};assert.equal(h.A.log(),false);assert.equal(h.dr.weightText,'invalid typed load');
 const portable={...copy(h.S),version:4,settings:copy(h.S.set)};h.SlatData.validateBackup(portable,h.X.catalogue);const summary=h.SlatData.restoreSummary(portable,h.X.catalogue);assert.equal(summary.favourites,2);
 await h.importBackup(portable);assert.deepEqual(copy(h.S.favourites),[other,id]);assert.deepEqual(copy(h.S.logUndo),portable.logUndo);assert.equal(h.S.cur.ex[0].sets[0].kg,50.123456789);
 assert.throws(()=>h.SlatData.validateBackup({...portable,favourites:[id,id]},h.X.catalogue),/favourites/);assert.throws(()=>h.SlatData.validateBackup({...portable,logUndo:{workoutId:1,entryId:8,setId:'x'}},h.X.catalogue),/Undo/);
 const failed=await boot(portable);failed.failWrites.add('liftlog-state');const accepted=copy(failed.h.S.cur);await failed.h.A.undoLog();assert.deepEqual(copy(failed.h.S.cur),accepted,'failed Undo retains the accepted logged set and typed draft');assert.deepEqual(copy(failed.h.S.logUndo),portable.logUndo);
}
{
 const w=workout('Bench Press',60.123456789,8);w.id=10;
 const z={id:'set:source',...w.ex[0].sets[0],trackingMode:'load_reps',sourceUnit:'lb',standardsVersion:11,catalogueVersion:'test',loadProtocol:{mode:'normal',multiplier:1,unilateral:false,bodyweightFactor:1},performanceContext:{reference:'M',age:30,ageAdjust:true,heightAdjust:true,workoutDate:w.d,timeZone:'Europe/Helsinki'},equipmentContext:{label:'Rack A'}};
 w.ex=[{n:'Bench Press',entryId:'exercise:source',sets:[z,{...z,id:'set:warm',kg:150,t:'w'},{...z,id:'set:other',kg:70,equipmentContext:{label:'Rack B'}}]}];
 const future={...copy(w),id:11,d:'2099-01-01'},t=await boot({...base(),rankingVersion:11,workouts:[w,future],cur:{...workout('Bench Press',250),id:12}}),{h,ctx}=t,before=JSON.stringify(h.S.workouts);
 const info=run(ctx,"rankInspection('Bench Press')");assert.equal(info.groups.length,2);assert.equal(info.earned.workoutId,10);assert(info.excluded.some(x=>x.reason==='Warm-up'));assert(info.excluded.some(x=>x.reason==='Future-dated workout'));assert(info.groups.every(x=>x.workoutId===10));
 h.A.inspectRank({v:'Bench Press'});assert(h.qolState.modal.innerHTML.includes('60.123456789'));assert(h.qolState.modal.innerHTML.includes('Rack A'));assert(h.qolState.modal.innerHTML.includes('Rack B'));assert(h.qolState.modal.innerHTML.includes('population percentiles'));assert(h.qolState.modal.innerHTML.includes('Recorded context'));assert.equal(JSON.stringify(h.S.workouts),before);
 assert.deepEqual(copy(run(ctx,'recentExerciseIds()')),[h.catalogueRecord('Bench Press').id],'Recent excludes future workouts and unfinished drafts');
}
console.log('Quick logging, stable ordered pins, reloadable Undo, private raw provenance and separate rank setups verified');
