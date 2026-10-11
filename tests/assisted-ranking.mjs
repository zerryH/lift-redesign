import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const R=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const E=JSON.parse(fs.readFileSync('exercises.json','utf8'));
const engine=fs.readFileSync('ranking-engine.js','utf8');
const ctx={};vm.runInNewContext(engine,ctx);
const L=ctx.LiftRankingEngine;
const names=E.ex.filter(x=>x.toLowerCase().includes('assisted ')).map(x=>x.split('|')[0]);
assert.deepEqual(names,['Assisted Dip','Assisted Chest Dip','Assisted Pull-Up Machine']);
for(const n of names){
  const m=R.exerciseMeta[n];
  assert.equal(m.kind,'assisted',n);
  assert.equal(m.loadMode,'assisted',n);
  assert.equal(m.standardsVersion,10,n);
  const t=R.t[n];
  assert.equal(t.length,2,n);
  assert.equal(t[0].length,46,n);
  assert.equal(t[1].length,46,n);
  assert.ok(t[0][45]>75,n+' Blue Gem must be above 75 kg effective load');
  assert.ok(t[1][45]>60,n+' Blue Gem must be above 60 kg effective load');
  const meta={loadMode:'assisted',loadMultiplier:1,unilateral:false};
  assert.equal(L.effectiveLoad({kg:0,reps:8},meta,68),68,n+' zero assistance');
  assert.equal(L.effectiveLoad({kg:68,reps:8},meta,68),0,n+' full assistance');
  assert.equal(L.effectiveLoad({kg:20,reps:8},meta,68),48,n+' partial assistance');
  assert.equal(L.estimate1RM({kg:68,reps:8},meta,68,R.ranking),0,n+' full assistance must be unranked');
}
const app=fs.readFileSync('app.js','utf8');
assert.match(app,/loadMode==='assisted'/);
assert.match(app,/ASSISTANCE/);
assert.match(app,/bodyweight minus assistance/);
assert.match(app,/refreshAssistedManualRank/);
const {boot,base}=await import('./support/runtime.mjs');
const z=await boot(base());z.h.gr={n:'Assisted Dip',w:'20',r:'5',b:'80',h:'178',u:'kg',f:'M'};await z.h.A.calc();assert(z.h.gr.res.e>0);await z.h.A.saveCheck();z.h.S.bw.push({d:'2026-10-10',kg:90});z.h.A.gr({v:'Assisted Dip'});assert.equal(Number(z.h.gr.b),80,'saved checks retain their original comparison bodyweight');
console.log('assisted ranking and saved comparison context passed');
