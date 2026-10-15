import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

async function sharing(){
 let resolve,reject,file;
 const z=await boot({...base(),workouts:[workout()]},{navigator:{canShare:()=>true,share:payload=>{file=payload.files[0];return new Promise((a,b)=>{resolve=a;reject=b;});}}});
 const pending=z.h.A.exp();
 for(let i=0;i<20&&!resolve;i++)await Promise.resolve();
 assert(resolve,'the share sheet must open');
 return {z,pending,accept:()=>resolve(),cancel:()=>reject(Object.assign(new Error('Cancelled'),{name:'AbortError'})),payload:JSON.parse(file.parts[0])};
}

for(const persist of [true,false]){
 const s=await sharing(),{z}=s;
 z.h.S.workouts[0].ex[0].sets[0].kg=120;
 if(persist)await z.h.save();
 s.accept();await s.pending;
 assert.equal(s.payload.workouts[0].ex[0].sets[0].kg,100,'the exported file remains its original snapshot');
 assert.equal(z.h.S.workouts[0].ex[0].sets[0].kg,120,'newer measurements remain intact');
 assert.equal(z.h.backupChanged(),true,'newer data must not be claimed included in an older export');
 assert.match(z.h.backupStatus(),/changes since backup/);
 const reloaded=await boot(JSON.parse(z.store.get('liftlog-state')));
 assert.equal(reloaded.h.backupChanged(),true,'stale-export status survives reload');
 assert.equal(reloaded.h.S.workouts[0].ex[0].sets[0].kg,120);
 assert.deepEqual([...z.errors,...reloaded.errors],[]);
}

const unchanged=await sharing();await unchanged.z.h.save();unchanged.accept();await unchanged.pending;
assert.equal(unchanged.z.h.backupChanged(),false,'a metadata-only save does not stale an unchanged export');
assert.equal(unchanged.z.h.S.lastBackupRevision,unchanged.z.h.S.revision);

const replaced=await sharing();
await replaced.z.h.importBackup({version:4,workouts:[],bw:[],settings:base().set});
const imported=JSON.stringify(replaced.z.h.S),stored=replaced.z.store.get('liftlog-state');
replaced.accept();await replaced.pending;
assert.equal(JSON.stringify(replaced.z.h.S),imported,'finishing an old share cannot stamp a replacement data set');
assert.equal(replaced.z.store.get('liftlog-state'),stored);

const cancelled=await sharing();const before=JSON.stringify(cancelled.z.h.S);
cancelled.cancel();await cancelled.pending;
assert.equal(JSON.stringify(cancelled.z.h.S),before,'cancelling a share cannot record an export');
assert.deepEqual([...unchanged.z.errors,...replaced.z.errors,...cancelled.z.errors],[]);
console.log('Share-sheet changes retain stale backup status; unchanged saves, replacement imports and cancelled shares stay safe');
