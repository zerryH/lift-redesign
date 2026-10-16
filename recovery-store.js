/* Same-browser recovery copies. Never replace the active workout record here. */
const RECOVERY_LIMITS={maxCount:3,maxBytes:8*1024*1024};
let recoveryTail=Promise.resolve(),recoveryEpoch=0,recoveryStatus='';
const recoveryError=(code,message)=>Object.assign(new Error(message),{code});
const recoveryStale=()=>recoveryError('RECOVERY_STALE','Data changed before the recovery copy was saved.');
async function recoveryRead(key){
 if(location.protocol==='file:')return JSON.parse(localStorage.getItem(key)||'null');
 const db=await idb();return storageRequest(db,'readonly',(tx,finish)=>{
  const q=tx.objectStore('kv').get(key);
  q.onsuccess=()=>finish(null,q.result??null);
  q.onerror=()=>finish(q.error||recoveryError('RECOVERY_READ','Recovery storage could not be read.'));
  tx.onabort=()=>finish(tx.error||recoveryError('RECOVERY_READ','Recovery read was interrupted.'));
 });
}
async function recoveryWrite(key,value,guard=()=>true){
 if(!guard())throw recoveryStale();
 if(location.protocol==='file:'){
  if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(value));
  const stored=localStorage.getItem(key);
  if(value===null?stored!==null:stored!==JSON.stringify(value))throw recoveryError('RECOVERY_WRITE','Recovery write was not acknowledged.');
  return;
 }
 const db=await idb();if(!guard())throw recoveryStale();
 await storageRequest(db,'readwrite',(tx,finish)=>{
  const store=tx.objectStore('kv');if(value===null)store.delete(key);else store.put(value,key);
  tx.oncomplete=()=>finish(null,true);
  tx.onerror=()=>finish(tx.error||recoveryError('RECOVERY_WRITE','Recovery write failed.'));
  tx.onabort=()=>finish(tx.error||recoveryError('RECOVERY_WRITE','Recovery write was interrupted.'));
 });
}
function recoveryBundleRecords(value){
 if(value===null)return [];
 if(value?.format!=='slat-recovery-store'||value.version!==1||!Array.isArray(value.records)||value.records.length>RECOVERY_LIMITS.maxCount)throw recoveryError('RECOVERY_INDEX','The recovery list is unreadable. Existing copies were not changed.');
 const ids=new Set();let bytes=0;
 for(const item of value.records){const m=SlatRecovery.describe(item);if(ids.has(m.id))throw recoveryError('RECOVERY_INDEX','The recovery list repeats an identity.');ids.add(m.id);bytes+=m.bytes;}
 if(bytes>RECOVERY_LIMITS.maxBytes)throw recoveryError('RECOVERY_LIMITS','The recovery list exceeds its storage budget.');
 return value.records;
}
async function recoveryContents(catalogue){
 const [bundle,pending]=await Promise.all(RECOVERY_KEYS.map(recoveryRead)),records=recoveryBundleRecords(bundle).slice();
 if(pending){const m=SlatRecovery.describe(pending);if(m.bytes>RECOVERY_LIMITS.maxBytes)throw recoveryError('RECOVERY_LIMITS','The pending recovery copy exceeds its storage budget.');const duplicate=records.find(x=>x.id===pending.id);if(duplicate&&duplicate.checksum.value!==pending.checksum.value)throw recoveryError('RECOVERY_INDEX','Recovery copies disagree about an identity.');if(!duplicate)records.unshift(pending);}
 const items=[];
 for(const envelope of records){try{const verified=await SlatRecovery.verify(envelope,catalogue);items.push({...verified,envelope,valid:true,pending:pending?.id===envelope.id&&!bundle?.records?.some(x=>x.id===envelope.id)});}catch(error){items.push({envelope,manifest:SlatRecovery.describe(envelope),valid:false,error:error?.code||'RECOVERY_INVALID',pending:pending?.id===envelope.id});}}
 return {items,bundle,pending};
}
function recoveryPlan(records,incoming){
 const plan=SlatRecovery.planRetention(records.map(SlatRecovery.describe),SlatRecovery.describe(incoming),RECOVERY_LIMITS),all=[incoming,...records];
 return {format:'slat-recovery-store',version:1,records:plan.keep.map(m=>all.find(e=>e.id===m.id))};
}
async function retainRecovery(envelope,catalogue,guard){
 const ownEpoch=recoveryEpoch;
 const current=()=>ownEpoch===recoveryEpoch&&guard();
 const job=async()=>{
  if(!current())throw recoveryStale();
  // Web Locks also coordinate with save/import/reset. Do not emulate a lock with a timeout.
  if(location.protocol!=='file:'&&!navigator.locks?.request)throw recoveryError('RECOVERY_LOCK_UNAVAILABLE','Automatic recovery needs Web Locks in this browser. Export a backup instead.');
  const locked=async()=>{
   if(!current())throw recoveryStale();
   await SlatRecovery.verify(envelope,catalogue);
   const state=await dbGet();
   if(!current()||Number(state?.savedAt||0)!==envelope.sourceSavedAt||Number(state?.revision||0)!==envelope.sourceRevision)throw recoveryStale();
   const previous=await recoveryContents(catalogue);
   if(previous.items.some(x=>!x.valid))throw recoveryError('RECOVERY_INTEGRITY','An existing recovery copy is corrupt. It was retained, not pruned.');
   let records=recoveryBundleRecords(previous.bundle);
   // A prior interrupted index write is itself durable. Promote it before reusing staging.
   if(previous.pending&&!records.some(x=>x.id===previous.pending.id)){
    const recovered=recoveryPlan(records,previous.pending);
    await recoveryWrite(RECOVERY_KEYS[0],recovered,current);records=recovered.records;
   }
   const next=recoveryPlan(records,envelope);
   await recoveryWrite(RECOVERY_KEYS[1],envelope,current); // First acknowledgement: complete new copy.
   await recoveryWrite(RECOVERY_KEYS[0],next,current);     // Only now may old indexed copies be pruned.
   // A failed cleanup only leaves a duplicate durable copy, never an unreadable list.
   try{await recoveryWrite(RECOVERY_KEYS[1],null,current);}catch{}
   return SlatRecovery.describe(envelope);
  };
  return navigator.locks?.request?navigator.locks.request('slat-state-write',locked):locked();
 };
 const result=recoveryTail.then(job,job);recoveryTail=result.catch(()=>false);return result;
}
