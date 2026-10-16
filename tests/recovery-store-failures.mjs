import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {base,workout} from './support/runtime.mjs';
import {recoveryBoot,keys,copy} from './support/recovery.mjs';

const z=await recoveryBoot({...base(),rankingVersion:11,workouts:[workout()]});
for(let i=1;i<=5;i++){z.h.S.additionalFeatureData={sequence:i};await z.h.save();assert.equal(await z.recovery.captureRecovery('manual'),true);}
let records=JSON.parse(z.store.get(keys[0])).records;assert.equal(records.length,3);assert.deepEqual(records.map(x=>x.data.additionalFeatureData.sequence),[5,4,3]);
const original=z.store.get(keys[0]),state=z.store.get('liftlog-state');
z.failWrites.add(keys[1]);assert.equal(await z.recovery.captureRecovery('manual'),false);assert.equal(z.store.get(keys[0]),original,'failed first acknowledgement never prunes old copies');z.failWrites.delete(keys[1]);
z.failWrites.add(keys[0]);z.h.S.additionalFeatureData.sequence=6;await z.h.save();assert.equal(await z.recovery.captureRecovery('manual'),false);assert.equal(z.store.get(keys[0]),original,'failed index acknowledgement retains every original copy');
let pending=JSON.parse(z.store.get(keys[1]));assert.equal(pending.data.additionalFeatureData.sequence,6);let list=await z.recovery.recoveryContents(z.h.X.catalogue);assert.equal(list.items.length,4);assert(list.items[0].pending&&list.items[0].valid,'the staged acknowledged copy remains recoverable after index failure');
z.failWrites.delete(keys[0]);z.h.S.additionalFeatureData.sequence=7;await z.h.save();assert.equal(await z.recovery.captureRecovery('manual'),true);records=JSON.parse(z.store.get(keys[0])).records;assert.deepEqual(records.map(x=>x.data.additionalFeatureData.sequence),[7,6,5]);assert.equal(z.store.has(keys[1]),false,'retry promotes a prior durable staging copy before reuse');
assert.equal(JSON.parse(z.store.get('liftlog-state')).workouts[0].ex[0].sets[0].kg,JSON.parse(state).workouts[0].ex[0].sets[0].kg);
const limited=z.store.get(keys[0]);z.h.S.additionalLargeData='x'.repeat(8*1024*1024);await z.h.save();assert.equal(await z.recovery.captureRecovery('manual'),false);assert.equal(z.recovery.status,'RECOVERY_TOO_LARGE');assert.equal(z.store.get(keys[0]),limited);assert.equal(z.store.has(keys[1]),false,'oversized copies never consume staging or prune history');delete z.h.S.additionalLargeData;await z.h.save();
const corrupt=JSON.parse(z.store.get(keys[0]));corrupt.records[1].data.workouts[0].ex[0].sets[0].kg=999;z.store.set(keys[0],JSON.stringify(corrupt));const corrupted=z.store.get(keys[0]);
assert.equal(await z.recovery.captureRecovery('manual'),false);assert.equal(z.store.get(keys[0]),corrupted,'corrupt prior data is retained, never silently pruned');list=await z.recovery.recoveryContents(z.h.X.catalogue);assert.equal(list.items.filter(x=>!x.valid).length,1);assert.equal(list.items.filter(x=>x.valid).length,2);
// Reset clears indexed and pending copies, and does not touch unrelated origin keys.
z.store.set(keys[1],JSON.stringify(records[0]));z.store.set('other-app-key','keep');assert.equal(await z.recovery.clearStoredState(),true);assert.equal(z.store.size,1);assert.equal(z.store.get('other-app-key'),'keep');
const late=await recoveryBoot({...base(),rankingVersion:11,workouts:[workout()]});let release,started;const began=new Promise(resolve=>started=resolve),digest=webcrypto.subtle.digest.bind(webcrypto.subtle);
late.ctx.crypto={subtle:{digest:(...args)=>new Promise(resolve=>{release=()=>digest(...args).then(resolve);started();})}};
const capture=late.recovery.captureRecovery('manual');await began;assert.equal(await late.recovery.clearStoredState(),true);release();assert.equal(await capture,false);assert.equal(late.store.size,0,'a late hash cannot recreate snapshots after reset');
// Web persistence uses distinct IndexedDB keys and the same lock as active-state writes.
let queue=Promise.resolve();const names=[],locks={request(name,job){names.push(name);const next=queue.then(job);queue=next.catch(()=>{});return next;}},database={value:null,records:new Map()};
const web=await recoveryBoot({...base(),rankingVersion:11,workouts:[workout()]},{delay:1,database,navigator:{locks}});await web.h.save();assert.equal(await web.recovery.captureRecovery('manual'),true);assert(database.records.has(keys[0]));assert(!web.store.has(keys[0]));assert(names.every(name=>name==='slat-state-write'));
const saved=copy(database.value);assert.equal((await web.recovery.recoveryContents(web.h.X.catalogue)).items[0].data.workouts[0].ex[0].sets[0].kg,saved.workouts[0].ex[0].sets[0].kg);
web.ctx.navigator.locks=undefined;const prior=JSON.stringify([...database.records]);assert.equal(await web.recovery.captureRecovery('manual'),false);assert.equal(web.recovery.status,'RECOVERY_LOCK_UNAVAILABLE');assert.equal(JSON.stringify([...database.records]),prior,'unsupported coordination never overwrites existing recovery storage');
web.ctx.navigator.locks=locks;assert.equal(await web.recovery.clearStoredState(),true);assert.equal(database.value,null);assert.equal(database.records.size,0);assert.equal(web.store.size,0);
// A reset cleanup failure rolls back current and recovery copies together.
const rollback=await recoveryBoot({...base(),rankingVersion:11,workouts:[workout()]});await rollback.h.save();assert(await rollback.recovery.captureRecovery('manual'));const before=[...rollback.store];
rollback.ctx.localStorage.removeItem=key=>{if(key===keys[0])throw new Error('Cleanup denied');rollback.store.delete(key);};
assert.equal(await rollback.recovery.clearStoredState(),false);assert.deepEqual([...rollback.store].sort(),before.sort());
const stale=await recoveryBoot({...base(),rankingVersion:11,workouts:[workout()]});await stale.h.save();const oldCopies=stale.store.get(keys[0]),newer={...copy(stale.h.S),savedAt:stale.h.S.savedAt+1,revision:stale.h.S.revision+1};stale.store.set('liftlog-state',JSON.stringify(newer));assert.equal(await stale.recovery.captureRecovery('manual'),false);assert.equal(stale.recovery.status,'RECOVERY_STALE');assert.equal(stale.store.get(keys[0]),oldCopies);assert.equal(stale.store.get('liftlog-state'),JSON.stringify(newer),'stale capture never replaces another writer');
assert.deepEqual([...z.errors,...late.errors,...web.errors,...rollback.errors,...stale.errors],[]);
console.log('Durable-before-prune retention, both failed-write phases, staged recovery, corruption, Web Locks, reset rollback and late hashing preserve user data');
