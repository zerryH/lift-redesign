/* storage: whole state in one IndexedDB record, saved on every change */
const STORAGE_TIMEOUT_MS=5000;
let dbPromise=null;const idb=()=>{if(location.protocol==='file:')return Promise.reject(new Error('Use localStorage for file URLs'));if(!dbPromise){const pending=new Promise((resolve,reject)=>{let settled=false;const finish=(error,db)=>{if(settled){db?.close?.();return;}settled=true;clearTimeout(timer);if(error)reject(error);else{db.onversionchange=()=>{db.close?.();dbPromise=null;};resolve(db);}};const timer=setTimeout(()=>finish(new Error('IndexedDB open timed out')),STORAGE_TIMEOUT_MS);try{const q=indexedDB.open('liftlog',1);q.onupgradeneeded=()=>{if(!settled)q.result.createObjectStore('kv');else q.transaction?.abort?.();};q.onsuccess=()=>finish(null,q.result);q.onerror=()=>finish(q.error||new Error('IndexedDB unavailable'));q.onblocked=()=>finish(new Error('IndexedDB upgrade blocked by another tab'));}catch(error){finish(error);}});dbPromise=pending;pending.catch(()=>{if(dbPromise===pending)dbPromise=null;});}return dbPromise;};
const storageRequest=(db,mode,operation)=>new Promise((resolve,reject)=>{let settled=false;const tx=db.transaction('kv',mode);const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value);};const timer=setTimeout(()=>{finish(new Error('IndexedDB transaction timed out'));try{tx.abort();}catch{}},STORAGE_TIMEOUT_MS);try{operation(tx,finish);}catch(error){finish(error);try{tx.abort();}catch{}}});
let unreadableLocal=false;const localGet=()=>{try{const raw=localStorage.getItem('liftlog-state');const value=JSON.parse(raw||'null');unreadableLocal=raw!==null&&(!value||typeof value!=='object'||Array.isArray(value));return unreadableLocal?null:value}catch{unreadableLocal=true;return null}};
const localSave=value=>{try{localStorage.setItem('liftlog-state',JSON.stringify(value));return true}catch{return false}};
const dbRead=async()=>{const d=await idb();return storageRequest(d,'readonly',(tx,finish)=>{const q=tx.objectStore('kv').get('s');q.onsuccess=event=>finish(null,q.result??event?.target?.result??null);q.onerror=()=>finish(q.error||new Error('IndexedDB read failed'));tx.onabort=()=>finish(tx.error||new Error('IndexedDB read aborted'));});};
const dbWrite=async(value,expectedSavedAt,expectedRevision)=>{const d=await idb();return storageRequest(d,'readwrite',(tx,finish)=>{const store=tx.objectStore('kv');let failure=null;const q=store.get('s');q.onsuccess=event=>{const previous=q.result??event?.target?.result;if(Number(previous?.savedAt)>expectedSavedAt||Number(previous?.revision)>expectedRevision){failure=Object.assign(new Error('Another tab saved changes'),{code:'STATE_CONFLICT'});tx.abort();return;}store.put(value,'s');};q.onerror=()=>{failure=q.error||new Error('IndexedDB comparison failed');tx.abort();};tx.oncomplete=()=>finish(null,true);tx.onerror=()=>finish(failure||tx.error||new Error('IndexedDB write failed'));tx.onabort=()=>finish(failure||tx.error||new Error('IndexedDB write aborted'));});};
const dbClear=async()=>{const d=await idb();await storageRequest(d,'readwrite',(tx,finish)=>{tx.objectStore('kv').delete('s');tx.oncomplete=()=>finish(null,true);tx.onerror=()=>finish(tx.error||new Error('IndexedDB delete failed'));tx.onabort=()=>finish(tx.error||new Error('IndexedDB delete aborted'));});return (await dbRead())==null;};
const dbGet=async()=>{const l=localGet();let d=null;if(location.protocol!=='file:')try{d=await dbRead()}catch{}const out=l&&(!d||Number(l.revision||0)>Number(d.revision||0)||(Number(l.revision||0)===Number(d.revision||0)&&(Number(l.savedAt)||0)>(Number(d.savedAt)||0)))?l:(d||l);if(!out&&unreadableLocal)throw new Error('Saved data could not be read. Export a recovery copy before retrying.');return out};
/** @type {Promise<boolean|void>} */
let saveTail=Promise.resolve(),saveEpoch=0,storageRevision=0,storageConflict=false;
let durableRevision=0,persistenceStatus='saved';const stateChannel=(()=>{try{return location.protocol!=='file:'&&typeof BroadcastChannel==='function'?new BroadcastChannel('slat-state'):null;}catch{return null;}})();
// Cross-tab messages are advisory; storage acknowledgements remain authoritative.
const broadcastState=message=>{try{stateChannel?.postMessage(message);}catch{}};
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
  if(!dbOk&&location.protocol!=='file:'&&!navigator.locks?.request){setPersistenceStatus('failed');toast('Storage is unavailable. Keep this tab open and export a backup. Retry in a browser with Web Locks.');return false;}
  const latest=localGet();if(!dbOk&&latest&&(Number(latest.savedAt)>storageRevision||Number(latest.revision)>durableRevision)){storageConflict=true;setPersistenceStatus('failed');showStorageConflict();return false;}
  const localOk=localSave(snapshot);
  if(localOk||dbOk){storageRevision=Number(snapshot.savedAt);durableRevision=snapshot.revision;S.revision=durableRevision;setPersistenceStatus('saved');broadcastState({savedAt:storageRevision,revision:durableRevision});}
  else {setPersistenceStatus('failed');toast('Could not save. Keep this tab open and export a backup.');}
  return localOk||dbOk;
 };
 const run=async()=>{try{return await (navigator.locks?.request?navigator.locks.request('slat-state-write',job):job());}catch{setPersistenceStatus('failed');toast('Could not save. Keep this tab open and export a backup.');return false;}};
 const result=saveTail.then(run,run);saveTail=result.catch(()=>false);return result;
};
const PERSONAL_STORAGE_KEYS=['liftlog-state','liftlog-import-recovery','liftlog-ranking-migration-backup','liftlog-startup-recovery'];
const storageCopies=storage=>PERSONAL_STORAGE_KEYS.map(key=>[key,storage.getItem(key)]);
const restoreCopies=(storage,copies)=>{for(const [key,value] of copies)try{if(value===null)storage.removeItem(key);else storage.setItem(key,value);}catch{}};
const clearCopies=(storage,copies,label)=>{for(const [key] of copies){storage.removeItem(key);if(storage.getItem(key)!==null)throw new Error(label+' reset verification failed');}};
const clearStoredState=async()=>{
 saveEpoch++;await saveTail.catch(()=>false);
 const clear=async()=>{
 let localCopies,sessionCopies=null,dbCopy=null;const web=location.protocol!=='file:',session=typeof sessionStorage!=='undefined'?sessionStorage:null;
 try{localCopies=storageCopies(localStorage);if(session)sessionCopies=storageCopies(session);if(web)dbCopy=await dbRead();}catch{return false;}
 const restore=async()=>{restoreCopies(localStorage,localCopies);if(session&&sessionCopies)restoreCopies(session,sessionCopies);if(web)try{if(dbCopy==null)await dbClear();else await dbWrite(dbCopy,Infinity,Infinity);}catch{}};
 try{clearCopies(localStorage,localCopies,'Local storage');if(session&&sessionCopies)clearCopies(session,sessionCopies,'Session storage');if(web&&!await dbClear())throw new Error('IndexedDB reset verification failed');}
 catch{await restore();return false;}
 return true;
 };
 try{return await (navigator.locks?.request?navigator.locks.request('slat-state-write',clear):clear());}catch{return false;}
};
