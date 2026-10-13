import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const set=(kg,label='',loggedAt=0)=>({kg,reps:8,t:'',...(label?{equipmentContext:{label}}:{}),...(loggedAt?{loggedAt}:{})});
const session=(id,date,sets,name='Cable Curl')=>({...workout(name),id,d:date,ex:[{n:name,sets}]});
const badges=h=>(h.V.today().match(/<em>PR<\/em>/g)||[]).length;
const history=[session(1,'2026-09-19',[set(40,'A'),set(100,'B')]),session(2,'2026-09-21',[set(500,'A')])];
const z=await boot({...base(),workouts:history,cur:session(3,'2026-09-20',[set(50,'A'),set(45,'B'),set(60,'A')])});
const before=JSON.stringify(z.h.S);
assert.equal(badges(z.h),2,'A beats its own setup baseline; weaker B does not; future sessions are excluded');
assert.equal(JSON.stringify(z.h.S),before,'badge rendering cannot rewrite workout history or measurements');
assert.equal(z.h.historicalBest('Cable Curl',null,{date:'2026-09-20',equipmentLabel:'A'}),z.h.rankSetEst('Cable Curl',set(40),80));
assert.equal(z.h.historicalBest('Cable Curl',null,{date:'2026-09-20',equipmentLabel:''}),0,'unlabelled and labelled setups are distinct');

const cur=session(4,'2026-09-20',[]);
cur.ex=[{n:'Cable Curl',sets:[set(45,'A',20)]},{n:'Cable Bicep Curl',sets:[set(50,'A',10)]}];
const duplicate=await boot({...base(),workouts:[history[0]],cur});
assert.equal(badges(duplicate.h),0,'a later weaker set cannot reset the baseline in another entry');
duplicate.h.A.selectExercise({i:1});assert.equal(badges(duplicate.h),1,'canonical aliases share the chronological session baseline');
duplicate.h.S.cur.ex.reverse();duplicate.h.ci=0;assert.equal(badges(duplicate.h),1,'reordering exercise entries does not change timestamped records');
duplicate.h.ci=1;assert.equal(badges(duplicate.h),0);

const undated=await boot({...base(),cur:{...session(5,'2026-09-20',[],'Bench Press'),ex:[{n:'Bench Press',sets:[set(100)]},{n:'Bench Press',sets:[set(80)]}]}});
undated.h.ci=1;assert.equal(badges(undated.h),0,'older sets without timestamps use deterministic session order');
const warmup=await boot({...base(),cur:session(6,'2026-09-20',[{...set(200,'A',10),t:'w'},set(50,'A',20),set(50,'A',30)])});
assert.equal(badges(warmup.h),1,'warm-ups do not count and matching estimates do not get duplicate records');
const edited=await boot({...base(),workouts:[session(7,'2026-09-20',[set(80,'A')])],cur:session(7,'2026-09-20',[set(80,'A')]),editingId:7});
assert.equal(badges(edited.h),1,'an edited workout does not compare with its original saved copy');
await z.h.save();const restored=await boot(JSON.parse(z.store.get('liftlog-state')));assert.equal(badges(restored.h),2);
assert.deepEqual([...z.errors,...duplicate.errors,...undated.errors,...warmup.errors,...edited.errors,...restored.errors],[]);
console.log('PR badges respect workout dates, recorded setups, aliases, chronological duplicate entries, warm-ups and reload');
