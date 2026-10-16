import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {boot,base,workout} from './support/runtime.mjs';

const z=await boot({...base(),workouts:[workout()],cur:{...workout(),id:2,ex:[{n:'Bench Press',entryId:'exercise:pending',sets:[]}],drafts:{'exercise:pending':{kg:null,weightText:'keep typed text',note:'Keep this draft',rpe:'8,5'}}}});
z.ctx.crypto=webcrypto;z.ctx.TextEncoder=TextEncoder;
const create=z.ctx.document.createElement,dialogs=[],toasts=[];
z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;return el;};
z.ctx.document.body.append=el=>{if(el.className==='toast')toasts.push(el);else dialogs.push(el);};
const change=z.listeners.change[0],copy=value=>JSON.parse(JSON.stringify(value));
vm.runInContext('globalThis.verifyForTest=verifyBackupContents;globalThis.recoveryForTest=SlatRecovery',z.ctx);
const backup={...copy(z.h.S),version:4,settings:copy(z.h.S.set),futureField:{keep:['unchanged']}};
const before=JSON.stringify(z.h.S),stored=JSON.stringify([...z.store]);
assert(z.h.V.settings().includes('data-a=verifyBackup'));
let clicked=false;z.get('#verify-backup').click=()=>clicked=true;z.h.A.verifyBackup();assert(clicked);
const input={id:'verify-backup',value:'selected',files:[{name:'<legacy>.json',size:26*1024*1024,text:async()=>JSON.stringify(backup)}]};
await change({target:input});assert.equal(input.value,'');
let modal=dialogs.at(-1);assert(modal.innerHTML.includes('Verify backup'));assert(modal.innerHTML.includes('&lt;legacy&gt;.json'));assert(modal.innerHTML.includes('no embedded checksum'));assert(modal.innerHTML.includes('Calendar days'));assert(modal.innerHTML.includes('Includes an unfinished workout'));assert(!modal.innerHTML.includes('confirm-import'));assert(!modal.innerHTML.includes('Replace data'));
assert.equal(JSON.stringify(z.h.S),before);assert.equal(JSON.stringify([...z.store]),stored,'verification never writes or updates backup freshness');
const result=await z.ctx.verifyForTest(backup);assert.equal(result.integrity,false);assert.equal(JSON.stringify(result.data),JSON.stringify(backup));
const envelope=await z.ctx.recoveryForTest.create(backup,{id:'snapshot:verify-test',reason:'manual',appVersion:'5.7.52',revision:7,savedAt:1000,createdAt:2000},z.h.X.catalogue);
input.files=[{name:'snapshot.json',text:async()=>JSON.stringify(envelope)}];await change({target:input});modal=dialogs.at(-1);assert(modal.innerHTML.includes('SHA-256 checksum and record counts match'));assert(modal.innerHTML.includes('source revision 7'));assert(!modal.innerHTML.includes('confirm-import'));
const corrupt=copy(envelope);corrupt.data.workouts[0].ex[0].sets[0].kg=777;input.files=[{name:'corrupt.json',text:async()=>JSON.stringify(corrupt)}];await change({target:input});assert.equal(dialogs.at(-1),modal,'corruption cannot open a successful verification');assert(toasts.length);await assert.rejects(()=>z.ctx.verifyForTest(corrupt),error=>error.code==='RECOVERY_INTEGRITY');
for(const data of ['not json',JSON.stringify({...backup,version:5})]){input.files=[{name:'bad.json',text:async()=>data}];await change({target:input});assert.equal(dialogs.at(-1),modal);}
// Import and Verify share one latest-selection sequence, including asynchronous checksum work.
let releaseRead;input.files=[{name:'old-verify.json',text:()=>new Promise(resolve=>releaseRead=resolve)}];const pending=change({target:input});
await change({target:{id:'imp',value:'selected',files:[{name:'latest-import.json',text:async()=>JSON.stringify(backup)}]}});const latest=dialogs.at(-1);assert(latest.innerHTML.includes('latest-import.json'));assert(latest.innerHTML.includes('confirm-import'));releaseRead(JSON.stringify(envelope));await pending;assert.equal(dialogs.at(-1),latest);
for(const lock of ['importing','finishing','storageConflict']){
 let release;input.files=[{name:'late-verify.json',text:()=>new Promise(resolve=>release=resolve)}];const late=change({target:input});vm.runInContext(lock+'=true',z.ctx);release(JSON.stringify(backup));await late;assert.equal(dialogs.at(-1),latest);vm.runInContext(lock+'=false',z.ctx);
}
// A state pause which starts while hashing must also prevent the late report.
let releaseHash,hashStarted;const started=new Promise(resolve=>hashStarted=resolve),digest=webcrypto.subtle.digest.bind(webcrypto.subtle);z.ctx.crypto={subtle:{digest:(...args)=>new Promise(resolve=>{releaseHash=()=>digest(...args).then(resolve);hashStarted();})}};
input.files=[{name:'hash-paused.json',text:async()=>JSON.stringify(envelope)}];const hashing=change({target:input});await started;assert(releaseHash);vm.runInContext('importing=true',z.ctx);releaseHash();await hashing;vm.runInContext('importing=false',z.ctx);assert.equal(dialogs.at(-1),latest);
let releaseOldHash,oldHashStarted;const oldStarted=new Promise(resolve=>oldHashStarted=resolve);z.ctx.crypto={subtle:{digest:(...args)=>new Promise(resolve=>{releaseOldHash=()=>digest(...args).then(resolve);oldHashStarted();})}};
input.files=[{name:'obsolete-hash.json',text:async()=>JSON.stringify(envelope)}];const oldHash=change({target:input});await oldStarted;
input.files=[{name:'newest-verify.json',text:async()=>JSON.stringify(backup)}];await change({target:input});const newest=dialogs.at(-1);assert(newest.innerHTML.includes('newest-verify.json'));assert(!newest.innerHTML.includes('confirm-import'));releaseOldHash();await oldHash;assert.equal(dialogs.at(-1),newest,'late checksum work cannot replace the newer selected report');
assert.equal(JSON.stringify(z.h.S),before);assert.equal(JSON.stringify([...z.store]),stored);assert.deepEqual(z.errors,[]);
console.log('Read-only backup verification preserves all data/freshness, distinguishes legacy structure from checksummed snapshots, rejects tampering and respects shared selection/save races');
