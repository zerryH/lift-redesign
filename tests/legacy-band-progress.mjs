import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

const old=(name,id,reps,label='',band='')=>({...workout(name,25,reps),id,d:'2026-10-01',ex:[{n:name,sets:[{kg:25,reps,t:'',...(label?{equipmentContext:{label}}:{}),...(band?{band}:{})}]}]});
const modern={...workout('Resistance Band Curl',0,15),id:3,d:'2026-10-02',ex:[{n:'Resistance Band Curl',sets:[{kg:0,reps:15,t:'',band:'red',trackingMode:'band_reps',protocolVersion:2,equipmentContext:{label:'A'}}]}]};
const z=await boot({...base(),workouts:[old('Resistance Band Curl',1,12,'A','red'),old('Resistance Band Curl',2,8,'B','blue'),modern]});
const h=z.h,n='Resistance Band Curl',stored=z.store.get('liftlog-state'),before=JSON.stringify(h.S.workouts);
const metrics=h.progressMetrics(n).map(([key])=>key);
assert(metrics.includes('legacyReps'),'band charts need a selectable metric for preserved legacy repetitions');
assert(!metrics.includes('strength')&&!metrics.includes('load'),'old numeric loads must not become band strength or load charts');
assert.equal(h.S.workouts[0].ex[0].sets[0].trackingMode,'legacy_reps');
assert.equal(h.progressSeries(n,'legacyReps','A','red')[0].v,12);
assert.equal(h.progressSeries(n,'legacyReps','B','blue')[0].v,8);
assert.equal(h.progressSeries(n,'legacyReps','A','blue').length,0);
assert.equal(h.progressSeries(n,'reps','A','red')[0].v,15,'modern reps never mix with legacy reps');
assert.equal(h.progressSeries(n,'totalReps','A','red')[0].v,15);
assert.equal(h.progressSeries(n,'legacyReps','__all','red')[0].v,12);
assert.equal(JSON.stringify(h.S.workouts),before);assert.equal(z.store.get('liftlog-state'),stored,'chart selection must not rewrite records');

// Cover every built-in band identity, not just one picker label.
const bands=Object.keys(h.X.catalogue).filter(name=>h.X.catalogue[name].tracking==='band_reps'&&!h.X.catalogue[name].canonicalName);
assert(bands.length>0);
const all=await boot({...base(),workouts:bands.map((name,i)=>old(name,i+1,8+i))});
const untouched=JSON.stringify(all.h.S.workouts);
for(const [i,name] of bands.entries()){
 assert(all.h.progressMetrics(name).some(([metric])=>metric==='legacyReps'),name);
 assert.equal(all.h.progressSeries(name,'legacyReps','','')[0].v,8+i,name);
 assert.equal(all.h.progressSeries(name,'reps','','').length,0,name+' does not mislabel old data as modern band reps');
 all.get('#qol-progress-lift').value=name;all.get('#progress-metric').value='reps';vm.runInContext('progressControls()',all.ctx);
 assert.equal(all.get('#progress-metric').value,'legacyReps','legacy-only history opens on the usable metric');
 assert.match(all.get('#progress-help').textContent,/not band resistance/);
}
assert.equal(JSON.stringify(all.h.S.workouts),untouched);
const backup={version:4,workouts:all.h.S.workouts,bw:all.h.S.bw};all.h.SlatData.validateBackup(backup,all.h.X.catalogue);
const restored=await boot(JSON.parse(all.store.get('liftlog-state')));
assert.equal(JSON.stringify(restored.h.S.workouts),untouched,'original loads, reps and migration provenance survive reload');
assert.equal(restored.h.S.workouts[0].ex[0].sets[0].kg,25);
assert.equal(restored.h.S.workouts[0].ex[0].sets[0].migration.originalMeasurements.kg,25);
assert.deepEqual([...z.errors,...all.errors,...restored.errors],[]);
console.log('Legacy band reps are selectable for every band identity, remain separate from modern data and retain original measurements');
