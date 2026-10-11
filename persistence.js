/* storage: whole state in one IndexedDB record, saved on every change */
let dbPromise=null;const idb=()=>{if(location.protocol==='file:')return Promise.reject(new Error('Use localStorage for file URLs'));if(!dbPromise)dbPromise=new Promise((r,j)=>{try{const q=indexedDB.open('liftlog',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>r(q.result);q.onerror=()=>{dbPromise=null;j(q.error||new Error('IndexedDB unavailable'))}}catch(e){dbPromise=null;j(e)}});return dbPromise};
let unreadableLocal=false;const localGet=()=>{try{const raw=localStorage.getItem('liftlog-state');const value=JSON.parse(raw||'null');unreadableLocal=raw!==null&&(!value||typeof value!=='object'||Array.isArray(value));return unreadableLocal?null:value}catch{unreadableLocal=true;return null}};
const localSave=value=>{try{localStorage.setItem('liftlog-state',JSON.stringify(value));return true}catch{return false}};
const dbRead=async()=>{const d=await idb();return await new Promise((r,j)=>{const q=d.transaction('kv').objectStore('kv').get('s');q.onsuccess=()=>r(q.result||null);q.onerror=()=>j(q.error||new Error('IndexedDB read failed'))})};
const dbWrite=async(value,expectedSavedAt,expectedRevision)=>{const d=await idb();return await new Promise((resolve,reject)=>{const tx=d.transaction('kv','readwrite'),store=tx.objectStore('kv');let failure=null;const q=store.get('s');q.onsuccess=event=>{const previous=q.result??event?.target?.result;if(Number(previous?.savedAt)>expectedSavedAt||Number(previous?.revision)>expectedRevision){failure=new Error('Another tab saved changes');failure.code='STATE_CONFLICT';tx.abort();return;}store.put(value,'s');};q.onerror=()=>{failure=q.error||new Error('IndexedDB comparison failed');tx.abort();};tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(failure||tx.error||new Error('IndexedDB write failed'));tx.onabort=()=>reject(failure||tx.error||new Error('IndexedDB write aborted'));})};
const dbClear=async()=>{const d=await idb();await new Promise((r,j)=>{const tx=d.transaction('kv','readwrite');tx.objectStore('kv').delete('s');tx.oncomplete=r;tx.onerror=()=>j(tx.error||new Error('IndexedDB delete failed'));tx.onabort=()=>j(tx.error||new Error('IndexedDB delete aborted'))});return (await dbRead())==null};
const dbGet=async()=>{const l=localGet();let d=null;if(location.protocol!=='file:')try{d=await dbRead()}catch{}const out=l&&(!d||Number(l.revision||0)>Number(d.revision||0)||(Number(l.revision||0)===Number(d.revision||0)&&(Number(l.savedAt)||0)>(Number(d.savedAt)||0)))?l:(d||l);if(!out&&unreadableLocal)throw new Error('Saved data could not be read. Export a recovery copy before retrying.');return out};
let saveTail=Promise.resolve(),saveEpoch=0,storageRevision=0,storageConflict=false;
let durableRevision=0,persistenceStatus='saved';const stateChannel=location.protocol!=='file:'&&typeof BroadcastChannel==='function'?new BroadcastChannel('slat-state'):null;
const save=()=>{
 if(storageConflict)return Promise.resolve(false);
 S.savedAt=Math.max(Date.now(),(Number(S.savedAt)||0)+1,storageRevision+1);
 const snapshot=JSON.parse(JSON.stringify(S));snapshot.rk={};if(snapshot.set)delete snapshot.set.age;
 const epoch=saveEpoch;
 const job=async()=>{
  if(epoch!==saveEpoch||storageConflict)return false;
  const current=localGet();
  if(current&&Number(current.savedAt)>storageRevision){storageConflict=true;showStorageConflict();return false;}
  snapshot.revision=durableRevision+1;setPersistenceStatus('saving');let dbOk=false;
  if(location.protocol!=='file:')try{await dbWrite(snapshot,storageRevision,durableRevision);dbOk=true}catch(error){if(error?.code==='STATE_CONFLICT'){storageConflict=true;setPersistenceStatus('failed');showStorageConflict();return false;}}
  const localOk=localSave(snapshot);
  if(localOk||dbOk){storageRevision=Number(snapshot.savedAt);durableRevision=snapshot.revision;S.revision=durableRevision;setPersistenceStatus('saved');stateChannel?.postMessage({savedAt:storageRevision,revision:durableRevision});}
  else {setPersistenceStatus('failed');toast('Could not save. Keep this tab open and export a backup.');}
  return localOk||dbOk;
 };
 const run=()=>navigator.locks?.request?navigator.locks.request('slat-state-write',job):job();
 const result=saveTail.then(run,run);saveTail=result.catch(()=>false);return result;
};
const clearStoredState=async()=>{saveEpoch++;await saveTail.catch(()=>false);const localBefore=localStorage.getItem('liftlog-state');if(location.protocol!=='file:'){try{await dbRead()}catch{return false}}try{localStorage.removeItem('liftlog-state');if(localStorage.getItem('liftlog-state')!==null)throw new Error('localStorage reset verification failed')}catch{if(localBefore!==null){try{localStorage.setItem('liftlog-state',localBefore)}catch{}}return false}if(location.protocol==='file:'){try{sessionStorage?.removeItem?.('liftlog-state')}catch{}return true}try{if(!await dbClear())throw new Error('IndexedDB reset verification failed')}catch{if(localBefore!==null){try{localStorage.setItem('liftlog-state',localBefore)}catch{}}return false}try{sessionStorage?.removeItem?.('liftlog-state')}catch{}return true};
