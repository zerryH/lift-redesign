import assert from 'node:assert/strict';
import vm from 'node:vm';
import {base,workout} from './support/runtime.mjs';
import {recoveryBoot,copy,keys} from './support/recovery.mjs';

const seed={...base(),rankingVersion:11,workouts:[{...workout('Bench Press',61.123456789,8),id:11},{...workout('Dumbbell Curl',12.987654321,9),id:12}],cur:{...workout('Plank'),id:13,ex:[{n:'Plank',entryId:'exercise:typed',sets:[]}],drafts:{'exercise:typed':{kg:null,weightText:'keep invalid text',weightUnit:'lb',reps:9,note:'Keep\tthis\nnote',rpe:'8,5'}}},exercisePreferences:{ex001:{rest:120,equipmentLabel:'Gym A · 2:1'}},routines:[{id:'routine:one',name:'My routine',split:'Push',ex:[{n:'Bench Press',exerciseId:'ex001',sets:3,reps:8,seconds:30,meters:20,rest:90}]}],additionalFeatureData:{ids:['entry:future'],paused:true}};
const z=await recoveryBoot(seed);await z.h.save();
const before=JSON.stringify(z.h.S);assert.equal(await z.recovery.captureRecovery('manual'),true);
let list=await z.recovery.recoveryContents(z.h.X.catalogue),item=list.items.find(x=>x.manifest.reason==='manual');
assert(item.valid);assert.equal(item.manifest.counts.activityDays,1);assert.equal(item.manifest.counts.workouts,2);assert.equal(item.data.workouts[0].ex[0].sets[0].kg,61.123456789);assert.equal(item.data.cur.drafts['exercise:typed'].weightText,'keep invalid text');
assert.equal(JSON.stringify(z.h.S),before,'capture changes neither current records nor backup freshness');
assert.equal(list.pending,null,'successful index acknowledgement cleans staging');
const envelope=copy(item.envelope),current=copy(z.h.S);
await z.h.importBackup({version:4,workouts:[],bw:[],settings:{table:'F',unit:'kg'}});
list=await z.recovery.recoveryContents(z.h.X.catalogue);const prior=list.items.find(x=>x.manifest.reason==='before-import');
assert(prior.valid);assert.deepEqual(copy(prior.data.workouts),current.workouts);assert.deepEqual(copy(prior.data.cur),current.cur);assert.deepEqual(copy(prior.data.exercisePreferences),current.exercisePreferences);
assert.equal(z.h.S.workouts.length,0);
// Importing a recovery envelope only opens the existing explicit replacement review.
const create=z.ctx.document.createElement,dialogs=[];z.ctx.document.createElement=()=>{const e=create();e.querySelector=z.get;return e;};z.ctx.document.body.append=e=>dialogs.push(e);
const stored=z.store.get('liftlog-state');await z.listeners.change[0]({target:{id:'imp',value:'chosen',files:[{name:'recovery.json',text:async()=>JSON.stringify(envelope)}]}});
assert(dialogs.at(-1).innerHTML.includes('confirm-import'));assert.equal(z.store.get('liftlog-state'),stored);
const verified=await z.recovery.verifyBackupContents(envelope);await z.h.importBackup(verified.data);
assert.deepEqual(copy(z.h.S.workouts),current.workouts);assert.deepEqual(copy(z.h.S.cur),current.cur);assert.deepEqual(copy(z.h.S.routines),current.routines);assert.deepEqual(copy(z.h.S.exercisePreferences),current.exercisePreferences);assert.deepEqual(copy(z.h.S.additionalFeatureData),current.additionalFeatureData);
assert.equal(z.h.S.lastBackup,0);assert.equal(z.h.S.lastBackupRevision,0);
assert.equal(z.h.SlatData.restoreSummary(z.h.S,z.h.X.catalogue).activityDays,1);
await z.recovery.openRecoveryCentre();assert(z.get('#recovery-content').innerHTML.includes('On this browser only'));assert(z.get('#recovery-content').innerHTML.includes('Last acknowledged save'));assert(z.get('#recovery-content').innerHTML.includes('Review restore'));

const finish=await recoveryBoot({...base(),rankingVersion:11,cur:workout('Bench Press',75.123456,8)});await finish.h.A.fin();
assert.equal(finish.h.S.cur,null);assert.equal(finish.h.S.workouts.length,1);const finished=(await finish.recovery.recoveryContents(finish.h.X.catalogue)).items.find(x=>x.manifest.reason==='finish');
assert(finished.valid);assert.equal(finished.data.cur,null);assert.equal(finished.manifest.sourceRevision,finish.h.S.revision);assert.equal(finished.manifest.sourceSavedAt,JSON.parse(finish.store.get('liftlog-state')).savedAt);assert.equal(finished.data.workouts[0].ex[0].sets[0].kg,75.123456);
const denied=await recoveryBoot({...base(),rankingVersion:11,cur:workout()});denied.failWrites.add('liftlog-state');await denied.h.A.fin();
assert(denied.h.S.cur);assert.equal(denied.h.S.workouts.length,0);assert(!(await denied.recovery.recoveryContents(denied.h.X.catalogue)).items.some(x=>x.manifest.reason==='finish'),'a failed Finish cannot produce a completed snapshot');
const quota=await recoveryBoot({...base(),rankingVersion:11,cur:workout()});quota.failWrites.add(keys[1]);await quota.h.A.fin();
assert.equal(quota.h.S.cur,null);assert.equal(quota.h.S.workouts.length,1);assert.equal(JSON.parse(quota.store.get('liftlog-state')).workouts.length,1,'snapshot quota never undoes an acknowledged workout');
assert(quota.recovery.status);
const migrated=await recoveryBoot({...seed,rankingVersion:10});const migration=(await migrated.recovery.recoveryContents(migrated.h.X.catalogue)).items.find(x=>x.manifest.reason==='before-migration');
assert(migration.valid);assert.equal(migration.data.rankingVersion,10);assert.equal(migration.data.workouts[0].ex[0].sets[0].kg,61.123456789);assert.equal(migrated.h.S.rankingVersion,11);
// An asynchronous list must not replace a newer dialog or selection.
vm.runInContext('globalThis.realContents=recoveryContents;recoveryContents=()=>new Promise(resolve=>globalThis.releaseContents=resolve);',z.ctx);
const loading=z.recovery.openRecoveryCentre();vm.runInContext("qolOpenModal('Newer dialog','keep')",z.ctx);z.ctx.releaseContents({items:[]});await loading;assert(dialogs.at(-1).innerHTML.includes('Newer dialog'));
assert.deepEqual([...z.errors,...finish.errors,...denied.errors,...quota.errors,...migrated.errors],[]);
console.log('Recovery capture/explicit restore preserves dates, IDs, typed drafts, precision, routines, setup and additional fields; Finish/migration acknowledgement and failures are isolated');
