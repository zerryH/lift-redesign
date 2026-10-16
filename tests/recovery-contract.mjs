import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';
import {base,workout} from './support/runtime.mjs';

const context=vm.createContext({crypto:webcrypto,TextEncoder});
for(const file of ['data-integrity.js','recovery-contract.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const api=context.SlatRecovery,copy=value=>JSON.parse(JSON.stringify(value));
const options={id:'snapshot:one',reason:'finish',appVersion:'5.7.51',revision:22,savedAt:1000,createdAt:2000};
const state={...base(),version:4,settings:{...base().set,unit:'lb'},workouts:[workout('Bench Press',60.123456,8),{...workout('Bench Press',65.987654,7),id:2}],cur:{...workout(),id:3,ex:[{n:'Bench Press',entryId:'exercise:draft',sets:[]}],drafts:{'exercise:draft':{kg:null,weightText:'invalid typed text',weightUnit:'lb',reps:9,repsText:'9',invalidWeight:true,note:'Keep\tall\noriginal text',rpe:'8,5'}}},routines:[{id:'routine:one',name:'Plan',split:'Push',ex:[{n:'Bench Press',exerciseId:'ex001',sets:3,reps:8,seconds:30,meters:20,rest:90}]}],exercisePreferences:{ex001:{equipmentLabel:'Gym A · cable 2:1',rest:120}},favourites:['ex001'],programmes:[{id:'plan:future',extra:{retain:true}}],goals:[{id:'goal:future',paused:true}],futureField:{nested:['keep',1,{value:'unchanged'}]}};
const before=JSON.stringify(state),envelope=await api.create(state,options);
assert.equal(JSON.stringify(state),before,'creating a snapshot never changes live/source data');
const verified=await api.verify(copy(envelope));assert.equal(JSON.stringify(verified.data),before,'all fields, including unknown future feature fields, survive');
assert.equal(verified.manifest.counts.workouts,2);assert.equal(verified.manifest.counts.activityDays,1);assert.equal(verified.manifest.counts.hasDraft,true);assert.equal(verified.manifest.sourceRevision,22);
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const unsigned=copy(envelope);delete unsigned.checksum;assert.equal(envelope.checksum.value,createHash('sha256').update(JSON.stringify(canonical(unsigned))).digest('hex'),'checksum agrees with the independent Node SHA-256 implementation');
const reordered=Object.fromEntries(Object.entries(copy(envelope)).reverse());assert.equal(JSON.stringify((await api.verify(reordered)).data),before,'JSON formatting and object-key order do not invalidate contents');
for(const field of ['payload','counts','reason','revision','time']){
 const corrupt=copy(envelope);if(field==='payload')corrupt.data.workouts[0].ex[0].sets[0].kg=99;else if(field==='counts')corrupt.counts.workouts=1;else if(field==='reason')corrupt.reason='manual';else if(field==='revision')corrupt.sourceRevision++;else corrupt.createdAt++;
 await assert.rejects(()=>api.verify(corrupt),error=>error.code==='RECOVERY_INTEGRITY');assert.equal(JSON.stringify(state),before);
}
for(const patch of [{formatVersion:2},{id:'../bad'},{reason:'unknown'},{createdAt:0},{sourceRevision:-1},{checksum:{algorithm:'CRC',value:'0'.repeat(64)}}])await assert.rejects(()=>api.verify({...copy(envelope),...patch}));
const wrongCounts=copy(envelope);wrongCounts.counts.workouts=999;const raw=copy(wrongCounts);delete raw.checksum;wrongCounts.checksum.value=await api.checksum(raw);await assert.rejects(()=>api.verify(wrongCounts),error=>error.code==='RECOVERY_COUNTS');
const mutable=copy(envelope),pending=api.verify(mutable);mutable.data.workouts[0].ex[0].sets[0].kg=123;assert.equal((await pending).data.workouts[0].ex[0].sets[0].kg,60.123456,'verification returns the captured copy, not data changed while hashing');
const catalogue=JSON.parse(fs.readFileSync('exercises.json','utf8')).catalogue;assert.equal(JSON.stringify((await api.verify(envelope,catalogue)).data),before);
const summary=context.SlatData.backupSummary;context.SlatData.backupSummary=data=>({...summary(data),programmes:99,goals:99});assert.equal(JSON.stringify((await api.verify(envelope)).data),before,'later feature counts cannot break valid format-1 snapshots');context.SlatData.backupSummary=summary;
const history=Array.from({length:1000},(_,i)=>({...workout('Bench Press',50.123456,8),id:i+1,d:'2024-07-01'}));const large=await api.create({...state,cur:null,workouts:history},{...options,id:'snapshot:large'});assert.equal((await api.verify(large)).data.workouts.length,1000,'long histories are complete, never truncated');
const item=(id,bytes=100)=>({id:'snapshot:'+id,createdAt:2000,bytes,checksum:'a'.repeat(64)}),previous=[item('a'),item('b'),item('c')],incoming=item('new');
const plan=api.planRetention(previous,incoming,{maxCount:3,maxBytes:250});assert.equal(plan.persistFirst,incoming.id);assert.deepEqual(copy(plan.keep).map(x=>x.id),['snapshot:new','snapshot:a']);assert.deepEqual(copy(plan.remove),['snapshot:b','snapshot:c']);assert.equal(plan.bytes,200);assert.equal(previous.length,3,'retention only returns a plan; it never prunes storage');
plan.keep[0].id='changed';assert.equal(incoming.id,'snapshot:new','retention returns copies');
assert.throws(()=>api.planRetention(previous,item('a')),error=>error.code==='RECOVERY_INDEX');assert.throws(()=>api.planRetention(previous,item('huge',300),{maxBytes:250}),error=>error.code==='RECOVERY_TOO_LARGE');
assert.throws(()=>api.planRetention(previous,incoming,{maxCount:0}));assert.throws(()=>api.planRetention([{...item('bad'),bytes:-1}],incoming));
const unsupported=vm.createContext({crypto:{}});for(const file of ['data-integrity.js','recovery-contract.js'])vm.runInContext(fs.readFileSync(file,'utf8'),unsupported);await assert.rejects(()=>unsupported.SlatRecovery.create(state,options),error=>error.code==='RECOVERY_HASH_UNAVAILABLE');
assert.equal(JSON.stringify(state),before);console.log('Versioned full-field recovery envelopes, SHA-256 integrity, immutable async verification, long history and non-destructive bounded retention plans passed');
