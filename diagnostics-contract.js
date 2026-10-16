/* Redacted device diagnostics. No state, workout, exception text, URL or stack input. */
var SlatDiagnostics=globalThis.SlatDiagnostics=(()=>{
 const KEY='slat-diagnostics-v1',LIMIT=32;
 const STEPS={STORAGE_QUOTA:'storage/quota',IDB_WRITE_FAILED:'save/indexeddb',LOCAL_WRITE_FAILED:'save/local',SAVE_UNACKNOWLEDGED:'save/acknowledgement',SAVE_INTERRUPTED:'save/interrupted',STATE_STALE_TAB:'save/stale-tab',FINISH_INTERRUPTED:'finish/acknowledgement',UPDATE_OFFLINE:'update/connection',UPDATE_CHECK_FAILED:'update/check',UPDATE_INSTALL_PENDING:'update/download',UPDATE_INSTALL_FAILED:'update/install',UPDATE_ACTIVATION_FAILED:'update/activation',UPDATE_SAVE_FAILED:'update/save-before-reload',RENDER_FAILED:'view/render',RECOVERY_CAPTURE_FAILED:'recovery/capture'};
 const CAUSES=['QuotaExceededError','SecurityError','AbortError','TimeoutError','InvalidStateError'];
 let paused=false,storageAvailable=true;
 const clean=item=>{if(!item||typeof item.code!=='string'||!Object.hasOwn(STEPS,item.code)||!Number.isSafeInteger(item.at)||item.at<0)return null;return {code:item.code,step:STEPS[item.code],at:item.at,count:Math.min(999,Math.max(1,Number.isSafeInteger(item.count)?item.count:1)),...(CAUSES.includes(item.cause)?{cause:item.cause}:{})};};
 let events=[];try{const raw=globalThis.localStorage?.getItem(KEY);if(raw&&raw.length<32768){const parsed=JSON.parse(raw);if(Array.isArray(parsed))events=parsed.map(clean).filter(Boolean).slice(-LIMIT);}}catch{storageAvailable=false;}
 function record(code,error){
  if(paused||typeof code!=='string'||!Object.hasOwn(STEPS,code))return;
  const cause=CAUSES.includes(error?.name)?error.name:undefined,previous=events.at(-1),at=Date.now();
  if(previous?.code===code&&previous.cause===cause){previous.count=Math.min(999,previous.count+1);previous.at=at;}
  else events.push({code,step:STEPS[code],at,count:1,...(cause?{cause}:{})});
  events=events.slice(-LIMIT);
  try{globalThis.localStorage?.setItem(KEY,JSON.stringify(events));}catch{storageAvailable=false;}
 }
 const pause=()=>{const before=paused;paused=true;return()=>{paused=before;};};
 const resetMemory=()=>{events=[];paused=true;storageAvailable=true;};
 const clear=()=>{try{globalThis.localStorage?.removeItem(KEY);events=[];storageAvailable=true;return true;}catch{storageAvailable=false;return false;}};
 const browserInfo=ua=>{const s=String(ua||''),pick=(re,name)=>{const m=s.match(re);return m?name+' '+m[1]:null;};return {browser:pick(/(?:Edg|EdgiOS)\/(\d+)/,'Edge')||pick(/(?:Chrome|CriOS)\/(\d+)/,'Chrome')||pick(/(?:Firefox|FxiOS)\/(\d+)/,'Firefox')||pick(/Version\/(\d+).*Safari/,'Safari')||'Other',os:/iPhone|iPad|iPod/.test(s)?'iOS':/Android/.test(s)?'Android':/Windows/.test(s)?'Windows':/Macintosh|Mac OS/.test(s)?'macOS':/Linux/.test(s)?'Linux':'Other'};};
 function report({build='',steps='',exerciseId='',catalogueVersion=0,saveStatus='unknown'}={}){
  const nav=/** @type {Partial<Navigator>} */(globalThis.navigator||{}),env=browserInfo(nav.userAgent),media=typeof globalThis.matchMedia==='function'?globalThis.matchMedia('(display-mode: standalone)').matches:false;
  return JSON.stringify({format:'slat-device-diagnostics',version:1,build:/^\d+\.\d+\.\d+$/.test(build)?build:'unknown',...env,installed:media||nav.standalone===true,online:nav.onLine!==false,features:{serviceWorker:'serviceWorker' in nav,indexedDB:typeof globalThis.indexedDB!=='undefined',webLocks:typeof nav.locks?.request==='function',clipboard:typeof nav.clipboard?.writeText==='function',integrity:!!globalThis.crypto?.subtle,persistentStorage:typeof nav.storage?.persist==='function'},saveStatus:['saving','saved','failed'].includes(saveStatus)?saveStatus:'unknown',localEventStorageAvailable:storageAvailable,events:events.map(clean).filter(Boolean),...(/^ex\d{3,5}$/.test(exerciseId)?{exercise:{id:exerciseId,catalogueVersion:Number.isSafeInteger(catalogueVersion)&&catalogueVersion>0?catalogueVersion:null}}:{}),reproductionSteps:typeof steps==='string'?steps.slice(0,2000):''},null,2);
 }
 return {key:KEY,record,report,pause,resetMemory,clear,limit:LIMIT};
})();
