import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';
const context=vm.createContext({});vm.runInContext(fs.readFileSync('catalogue-model.js','utf8'),context);
const ex=JSON.parse(fs.readFileSync('exercises.json')),ranks=JSON.parse(fs.readFileSync('ranks-config.json'));
assert.equal(context.SlatCatalogue.validate(ex,ranks).identities,447);
const badCases=[x=>x.catalogue['Cable Curl'].equipment='Dumbell',x=>x.catalogue['Cable Curl'].tracking='weight',x=>x.catalogue['Cable Curl'].muscles.neck=1,x=>x.catalogue['Cable Curl'].id=x.catalogue['Bench Press'].id,x=>x.synonyms['Cable Curl']='Cable Curl'];
for(const damage of badCases){const copy=structuredClone(ex);damage(copy);assert.throws(()=>context.SlatCatalogue.validate(copy,ranks),/Invalid catalogue/);}
const z=await boot({...base(),set:{...base().set,unit:'lb'},cur:workout('Cable Curl',20,8)});
z.h.dr={n:'Cable Curl',kg:25,reps:8,note:'Original context',rpe:8};const logged=z.h.makeDraftSet();
assert.equal(logged.exerciseId,ex.catalogue['Cable Curl'].id);assert.equal(logged.sourceUnit,'lb');assert.equal(logged.trackingMode,'load_reps');assert.equal(logged.benchmarkId,ex.catalogue['Cable Curl'].benchmarkId);assert.equal(logged.catalogueVersion,3);assert.equal(logged.standardsVersion,10);assert.equal(logged.measurementUnits.load,'kg');assert.equal(logged.performanceContext.reference,'M');
z.h.S.cur.ex[0].sets=[logged];await z.h.save();const roundtrip=await boot(JSON.parse(z.store.get('liftlog-state')));assert.equal(JSON.stringify(roundtrip.h.S.cur.ex[0].sets[0]),JSON.stringify(logged));
for(const name of ['Plank','Dumbbell Farmer Carry']){
 const old={...base(),workouts:[workout(name,20,30)]};const migrated=await boot(old),set=migrated.h.S.workouts[0].ex[0].sets[0];
 assert.equal(set.trackingMode,'legacy_reps');assert.equal(set.kg,20);assert.equal(set.reps,30);assert.equal(set.seconds,undefined);assert.equal(set.meters,undefined);assert.equal(set.migration.originalMeasurements.reps,30);assert(migrated.h.setSummary(name,set).includes('legacy entry'));assert(!migrated.h.setSummary(name,set).includes('0 sec'));
 const restarted=await boot(JSON.parse(migrated.store.get('liftlog-state')));assert.equal(JSON.stringify(restarted.h.S.workouts[0].ex[0].sets[0]),JSON.stringify(set));
}
console.log('catalogue enums/identity/cycles, durable provenance and honest legacy measurements passed');
