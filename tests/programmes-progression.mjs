import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';
const copy=x=>JSON.parse(JSON.stringify(x)),run=(ctx,code)=>vm.runInContext(code,ctx);
const routine={id:'routine:a',name:'A routine',split:'Push',ex:[{n:'Bench Press',exerciseId:'ex001',sets:2,reps:8,seconds:30,meters:20,rest:90}]};
{
 const t=await boot({...base(),rankingVersion:11,routines:[routine]}),{h,ctx}=t,P=ctx.SlatPlanning;
 assert.equal(P.nextDate({mode:'weekdays',weekdays:[0,2,4]},'2026-10-16'),'2026-10-19');assert.equal(P.nextDate({mode:'rotation'},'2026-12-31'),'2027-01-01');
 const p={id:'programme:a',name:'A/B',mode:'rotation',routineIds:[routine.id],weekdays:[],cursor:0,paused:false};h.S.programmesV1=[p];h.S.planSlots=[P.slot(p,'2026-10-15','plan-slot:a',h.S.routines)];await h.save();
 const old=copy(h.S.routines);h.A.planStart({v:'plan-slot:a'});assert(h.S.cur.planLink);assert.equal(h.S.programmesV1[0].cursor,0,'Start cannot advance');assert.equal(h.S.workouts.length,0);assert.deepEqual(copy(h.S.routines),old);assert.equal(h.S.cur.ex[0].sets.length,0);
 h.V.today();h.dr={...h.dr,kg:60.123456789,reps:8};h.A.log();await h.flush();const id=h.S.cur.id,before=copy(h.S.planSlots);
 t.failWrites.add('liftlog-state');await h.A.fin();assert.equal(h.S.cur.id,id);assert.equal(h.S.programmesV1[0].cursor,0);assert.deepEqual(copy(h.S.planSlots),before);assert.equal(h.S.workouts.length,0,'failed Finish creates no completion');
 t.failWrites.clear();await h.A.fin();assert.equal(h.S.cur,null);assert.equal(h.S.workouts.length,1);assert.equal(h.S.programmesV1[0].cursor,1);assert.equal(h.S.planSlots[0].status,'advanced');assert.equal(h.S.planSlots.length,2);assert.equal(h.S.workouts[0].ex[0].sets[0].kg,60.123456789);assert.equal(P.completed(h.S.planSlots[0],h.S.workouts).length,1);
 const source=copy(h.S.workouts[0]);h.S.workouts=[];assert.notEqual(P.nextSlot(h.S.programmesV1[0],h.S.planSlots,h.S.workouts).id,'plan-slot:a','history deletion cannot silently replay an advanced rotation slot');h.S.workouts=[source];
 h.S.cur=copy(source);h.S.editingId=source.id;await h.A.fin();assert.equal(h.S.programmesV1[0].cursor,1,'editing a linked workout does not advance twice');assert.equal(h.S.planSlots.length,2);
 const portable={...copy(h.S),version:4,settings:copy(h.S.set)};h.SlatData.validateBackup(portable,h.X.catalogue);await h.importBackup(portable);assert.deepEqual(copy(h.S.programmesV1),portable.programmesV1);assert.deepEqual(copy(h.S.planSlots),portable.planSlots);assert.equal(h.SlatData.restoreSummary(portable).planSlots,2);
 const day=run(ctx,"planDayMarkup({date:S.planSlots[1].scheduledDate},'', '<button class=\"activity-day rest-day\" aria-label=\"0 workouts\" title=\"0 workouts\"></button>')");assert(day.includes('planned-day'));assert(!day.includes(' trained'));
 assert.throws(()=>h.SlatData.validateBackup({...portable,programmesV1:[{...p,weekdays:[7]}]},h.X.catalogue),/programme/);
 assert.throws(()=>h.SlatData.validateBackup({...portable,workouts:[source,{...source,id:source.id+1}]},h.X.catalogue),/duplicate completed plan/);
}
for(const n of ['Bench Press','Assisted Pull-Up Machine','Resistance Band Curl']){
 const t=await boot({...base(),rankingVersion:11}),{h,ctx}=t,record=h.catalogueRecord(n);assert(record,n);const p=run(ctx,'progressionProtocol('+JSON.stringify(n)+')'),band=n==='Resistance Band Curl',assisted=n==='Assisted Pull-Up Machine',load=assisted?20:60;
 const rule={id:'progression:test',version:1,exerciseId:record.id,setupLabel:'Gym A',protocol:copy(p),minReps:8,maxReps:12,targetSets:2,incrementKg:band?0:2.5,incrementReps:1,sourceUnit:'kg',enabled:true,band:band?'Red':''};
 const z={id:'set:one',kg:band?0:load,reps:12,t:'',bw:80,height:178,trackingMode:p.trackingMode,band:rule.band,equipmentContext:{label:'Gym A'},loadProtocol:{mode:p.mode,multiplier:p.multiplier,unilateral:p.unilateral,bodyweightFactor:p.bodyweightFactor}};
 h.S.workouts=[{...workout(n),id:10,ex:[{n,exerciseId:record.id,entryId:'exercise:progress',target:{sets:2},sets:[copy(z),{...copy(z),id:'set:two'},{...copy(z),id:'set:warm',t:'w',kg:band?0:200}]}]}];h.S.progressionRules=[rule];ctx.testRule=rule;ctx.testName=n;
 const get=()=>run(ctx,'progressionSuggestion(testRule,testName)');let s=get();assert(s.increase,n);assert.equal(s.sourceSetIds.length,2);assert.equal(s.nextKg,band?0:assisted?17.5:62.5);if(band)assert.equal(s.nextReps,13);
 h.S.workouts[0].ex[0].sets[1].reps=11;s=get();assert(!s.increase);assert.equal(s.nextKg,band?0:load);
 h.S.workouts[0].ex[0].sets[1].reps=12;h.S.workouts[0].ex[0].target.sets=3;assert(!get().increase,'partial routine target cannot increase');h.S.workouts[0].ex[0].target.sets=2;
 for(const set of h.S.workouts[0].ex[0].sets)set.equipmentContext.label='Gym B';assert.equal(get(),null,'different setup is not comparable');for(const set of h.S.workouts[0].ex[0].sets)set.equipmentContext.label='Gym A';
 if(band){for(const set of h.S.workouts[0].ex[0].sets)set.band='Blue';assert.equal(get(),null,'different bands are not comparable');for(const set of h.S.workouts[0].ex[0].sets)set.band='Red';}
 h.SlatData.validateBackup({...copy(h.S),version:4,settings:copy(h.S.set)},h.X.catalogue);h.S.progressionRules[0].enabled=false;assert.equal(get(),null);
}
console.log('Programme copies and rotations acknowledge Finish once; dates, backup and failed saves remain safe. Progression excludes partial/warm-up/setup/band mismatches and reduces assistance.');
