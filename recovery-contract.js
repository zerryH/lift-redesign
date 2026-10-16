/* Versioned recovery envelopes. Pure contracts never replace or prune stored data. */
var SlatRecovery=globalThis.SlatRecovery=(()=>{
 const FORMAT='slat-recovery',VERSION=1,MAX_BYTES=16*1024*1024;
 const REASONS=['finish','before-import','before-migration','manual'];
 const COUNT_FIELDS=['version','workouts','activityDays','sets','bodyweights','custom','routines','exercisePreferences','checks','hasDraft'];
 const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
 const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 const integer=(value,min=0)=>Number.isSafeInteger(value)&&value>=min;
 const identity=value=>typeof value==='string'&&/^[A-Za-z0-9:._-]{1,160}$/.test(value);
 const canonical=value=>Array.isArray(value)?value.map(canonical):object(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
 const wireCopy=value=>{try{return JSON.parse(JSON.stringify(value));}catch{fail('RECOVERY_JSON','Recovery data is not readable JSON.');}};
 const encoding=()=>{if(typeof TextEncoder!=='function'||!globalThis.crypto?.subtle)fail('RECOVERY_HASH_UNAVAILABLE','Integrity checks are unavailable in this browser.');return new TextEncoder();};
 const byteLength=value=>encoding().encode(typeof value==='string'?value:JSON.stringify(value)).byteLength;
 async function checksum(value){
  const bytes=encoding().encode(JSON.stringify(canonical(value)));
  if(bytes.byteLength>MAX_BYTES)fail('RECOVERY_TOO_LARGE','This snapshot exceeds the on-device recovery limit. Export a full backup instead.');
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
 }
 const unsigned=envelope=>Object.fromEntries(Object.entries(envelope).filter(([key])=>key!=='checksum'));
 // Format 1 counts are frozen: future backup-summary additions cannot invalidate older snapshots.
 const counts=data=>{const summary=SlatData.backupSummary(data);return Object.fromEntries(COUNT_FIELDS.map(key=>[key,summary[key]]));};
 function header(envelope){
  if(!object(envelope)||envelope.format!==FORMAT||envelope.formatVersion!==VERSION)fail('RECOVERY_VERSION','Unsupported recovery snapshot format.');
  if(!identity(envelope.id)||!REASONS.includes(envelope.reason)||typeof envelope.appVersion!=='string'||!/^\d+\.\d+\.\d+$/.test(envelope.appVersion)||!integer(envelope.createdAt,1)||!integer(envelope.sourceRevision)||!integer(envelope.sourceSavedAt)||!object(envelope.counts)||!object(envelope.data))fail('RECOVERY_MANIFEST','The recovery manifest is not valid.');
  if(!object(envelope.checksum)||envelope.checksum.algorithm!=='SHA-256'||typeof envelope.checksum.value!=='string'||!/^[a-f0-9]{64}$/.test(envelope.checksum.value))fail('RECOVERY_CHECKSUM','The recovery checksum is not valid.');
 }
 async function create(data,options={},catalogue={}){
  // Callers pass the JSON-wire backup, not live application objects or a lossy field subset.
  const copy=SlatData.validateBackup(data,catalogue,{importText:true});
  const envelope={format:FORMAT,formatVersion:VERSION,id:options.id,reason:options.reason,appVersion:options.appVersion,createdAt:options.createdAt??Date.now(),sourceRevision:options.revision??0,sourceSavedAt:options.savedAt??0,counts:counts(copy),data:copy,checksum:{algorithm:'SHA-256',value:'0'.repeat(64)}};
  header(envelope);envelope.checksum.value=await checksum(unsigned(envelope));
  if(byteLength(envelope)>MAX_BYTES)fail('RECOVERY_TOO_LARGE','This snapshot exceeds the on-device recovery limit. Export a full backup instead.');
  return envelope;
 }
 async function verify(value,catalogue={}){
  // Copy before the first await: an asynchronous caller cannot swap data after verification.
  const envelope=wireCopy(value);header(envelope);
  if(byteLength(envelope)>MAX_BYTES)fail('RECOVERY_TOO_LARGE','This snapshot exceeds the on-device recovery limit. Export a full backup instead.');
  if(await checksum(unsigned(envelope))!==envelope.checksum.value)fail('RECOVERY_INTEGRITY','The recovery snapshot failed its integrity check. No data was replaced.');
  const data=SlatData.validateBackup(envelope.data,catalogue,{importText:true});
  if(JSON.stringify(canonical(counts(data)))!==JSON.stringify(canonical(envelope.counts)))fail('RECOVERY_COUNTS','The recovery counts do not match its contents.');
  return {manifest:describe(envelope),data};
 }
 function describe(envelope){header(envelope);return {id:envelope.id,reason:envelope.reason,appVersion:envelope.appVersion,createdAt:envelope.createdAt,sourceRevision:envelope.sourceRevision,sourceSavedAt:envelope.sourceSavedAt,counts:wireCopy(envelope.counts),checksum:envelope.checksum.value,bytes:byteLength(envelope)};}
 function planRetention(previous,incoming,options={}){
  const maxCount=options.maxCount??3,maxBytes=options.maxBytes??8*1024*1024;
  if(!integer(maxCount,1)||maxCount>20||!integer(maxBytes,1)||maxBytes>MAX_BYTES||!Array.isArray(previous)||previous.length>100)fail('RECOVERY_LIMITS','Invalid recovery retention limits.');
  const ids=new Set();
  for(const record of [...previous,incoming]){
   if(!object(record)||!identity(record.id)||!integer(record.createdAt,1)||!integer(record.bytes,1)||record.bytes>MAX_BYTES||typeof record.checksum!=='string'||!/^[a-f0-9]{64}$/.test(record.checksum)||ids.has(record.id))fail('RECOVERY_INDEX','The recovery index is invalid or repeats an identity.');
   ids.add(record.id);
  }
  if(incoming.bytes>maxBytes)fail('RECOVERY_TOO_LARGE','This snapshot exceeds the on-device recovery limit. Export a full backup instead.');
  const keep=[wireCopy(incoming)];let bytes=incoming.bytes;
  for(const record of previous)if(keep.length<maxCount&&bytes+record.bytes<=maxBytes){keep.push(wireCopy(record));bytes+=record.bytes;}
  const retained=new Set(keep.map(record=>record.id));
  // Storage must acknowledge this new envelope before applying the index/prune plan.
  return {persistFirst:incoming.id,keep,remove:previous.filter(record=>!retained.has(record.id)).map(record=>record.id),bytes};
 }
 return {FORMAT,VERSION,MAX_BYTES,REASONS,create,verify,describe,planRetention,checksum};
})();
