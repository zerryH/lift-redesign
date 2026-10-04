import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
class El{
  constructor(doc){this.doc=doc;this.style={setProperty(){}};this.dataset={};this.classList={add(){},remove(){},contains(){return false}};this.parentElement=this;this.value='';this.textContent='';this.innerHTML='';this.offsetWidth=0;this.disabled=false;this.id='';this.listeners={};this.childrenBySelector=new Map()}
  querySelector(s){if(!this.childrenBySelector.has(s))this.childrenBySelector.set(s,new El(this.doc));return this.childrenBySelector.get(s)}
  querySelectorAll(){return []}
  closest(){return null}
  addEventListener(t,fn){(this.listeners[t]??=[]).push(fn)}
  append(x){if(x){x.parentElement=this;this.doc.created.push(x);if(x.id)this.doc.byId.set(x.id,x);if(x.id==='reset-modal'){for(const id of ['reset-countdown','reset-progress']){const e=new El(this.doc);e.id=id;this.doc.byId.set(id,e);x.childrenBySelector.set('#'+id,e)}const b=new El(this.doc);b.disabled=true;x.childrenBySelector.set('[data-reset-confirm]',b)}}}
  appendChild(x){this.append(x)}
  remove(){if(this.id)this.doc.byId.delete(this.id)}
  setAttribute(k,v){if(k==='id'){this.id=String(v);this.doc.byId.set(this.id,this)}}
  focus(){}
  dispatchEvent(){}
  getContext(){return {clearRect(){},fillText(){},strokeRect(){},beginPath(){},lineTo(){},moveTo(){},stroke(){}}}
}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const run=async()=>{
  const listeners={};
  const doc={created:[],byId:new Map(),querySelector(s){if(s.startsWith('#'))return this.byId.get(s.slice(1))||((s==='#v'||s==='#n')?this.root:null);return new El(this)},querySelectorAll(){return []},createElement(){return new El(this)},body:null,documentElement:{dataset:{}},visibilityState:'visible',addEventListener(type,fn){(listeners[type]??=[]).push(fn)},removeEventListener(){}};
  doc.root=new El(doc);doc.body=new El(doc);
  const old={savedAt:123,workouts:[{id:1,d:'2026-09-20',split:'Push',ex:[]}],custom:[],bw:[{d:'2026-09-20',kg:80}],set:{table:'M',dark:1,motion:0,v:4,age:'',ageAdjust:true,heightCm:'',heightAdjust:true,unit:'kg',rest:90,tutorialSeen:true,tutorialVersion:3},rk:{},cur:null,editingId:null,lastBackup:0};
  const local=new Map([['liftlog-state',JSON.stringify(old)]]);
  const dbStore=new Map([['s',structuredClone(old)]]);
  let failPut=true,reloads=0;
  const db={createObjectStore(){},transaction(){const tx={oncomplete:null,onerror:null,onabort:null,objectStore(){return {put(v,k){queueMicrotask(()=>{if(failPut){tx.onerror?.({target:{error:new Error('simulated put failure')}})}else{dbStore.set(k,structuredClone(v));tx.oncomplete?.()}})},delete(k){queueMicrotask(()=>{if(failPut){tx.onerror?.({target:{error:new Error('simulated delete failure')}})}else{dbStore.delete(k);tx.oncomplete?.()}})},get(k){const q={onsuccess:null,onerror:null};queueMicrotask(()=>q.onsuccess?.({target:{result:dbStore.get(k)}}));return q}}}};return tx}};
  const indexedDB={open(){const q={result:db,onsuccess:null,onerror:null,onupgradeneeded:null};queueMicrotask(()=>{q.onupgradeneeded?.({target:{result:db}});q.onsuccess?.({target:{result:db}})});return q}};
  const localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,String(v)),removeItem:k=>local.delete(k)};
  const sessionStorage={removeItem(){}};
  const location={protocol:'https:',reload(){reloads++}};
  const navigator={storage:{persist(){return Promise.resolve(false)}}};
  const ctx={innerWidth:390,innerHeight:844,console,document:doc,localStorage,sessionStorage,indexedDB,location,window:{isSecureContext:true},navigator,MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame:fn=>0,cancelAnimationFrame(){},setTimeout,clearTimeout,setInterval,clearInterval,File:class{},URL:{createObjectURL(){return 'blob:'}},confirm:()=>true,alert(){},Event:class{constructor(type,opts={}){this.type=type;Object.assign(this,opts)}},crypto,Math,Date,JSON,Promise,parseFloat,Number,String,Array,Object,Set,Map,RegExp,Error,TypeError,Infinity,NaN,isFinite,isNaN};
  ctx.globalThis=ctx;vm.createContext(ctx);
  const instrumented=source.replace('(async()=>{','globalThis.__liftBoot=(async()=>{').replace('if(S.set.v!==4)S.set.v=4;repairState();','if(S.set.v!==4)S.set.v=4;repairState();globalThis.__liftTest={A,confirmReset,dbRead,localGet,save};');
  vm.runInContext(instrumented,ctx,{filename:'app.js'});await ctx.__liftBoot;await delay(15);
  ctx.setTimeout=(fn)=>{fn();return 0};
  ctx.__liftTest.A.reset();
  await delay(5);
  const modal=doc.byId.get('reset-modal');assert(modal,'reset confirmation must exist');
  const btn=modal.querySelector('[data-reset-confirm]');assert.equal(btn.disabled,false,'reset confirm should unlock after countdown');
  const click=modal.listeners.click?.[0];assert(click,'reset modal click handler must exist');
  await click({target:{closest:s=>s==='[data-reset-confirm]'?btn:null,classList:{contains:()=>false}}});
  await delay(5);
  const localAfter=local.get('liftlog-state');
  const dbAfter=dbStore.get('s');
  assert.equal(reloads,0,'reset must not reload when IndexedDB clearing/writing fails');
  assert(localAfter,'localStorage must remain intact when reset cannot safely clear IndexedDB');
  const persisted=JSON.parse(localAfter);
  assert.deepEqual(persisted.workouts,old.workouts,'workouts must survive failed reset');
  assert.deepEqual(persisted.custom,old.custom,'custom exercises must survive failed reset');
  assert.deepEqual(persisted.bw,old.bw,'bodyweight history must survive failed reset');
  assert.equal(persisted.set.table,old.set.table);
  assert.equal(persisted.set.heightCm,old.set.heightCm);
  assert.equal(persisted.set.heightAdjust,old.set.heightAdjust);
  assert.equal(persisted.set.ageAdjust,old.set.ageAdjust);
  assert.equal(persisted.set.birthYear,'','legacy age is migrated to birthYear when available');
  assert.equal(persisted.rk,undefined,'rank cache must not be persisted');
  const dbPersisted=dbAfter;
  assert.deepEqual(dbPersisted.workouts,old.workouts,'IndexedDB workouts must survive failed reset');
  assert.deepEqual(dbPersisted.custom,old.custom,'IndexedDB custom exercises must survive failed reset');
  assert.deepEqual(dbPersisted.bw,old.bw,'IndexedDB bodyweight history must survive failed reset');
  console.log('reset failure safety ok');
};
await run();

// Persistence race guards: saves are serialized and reset waits for queued writes.
assert(source.includes('let saveTail=Promise.resolve(),saveEpoch=0;'),'saves must be serialized to prevent stale IndexedDB writes');
assert(source.includes('const snapshot=JSON.parse(JSON.stringify(S))'),'each queued save must capture an immutable state snapshot');
assert(source.includes('saveEpoch++;await saveTail.catch(()=>false);'),'reset must wait for queued saves before clearing storage');
assert(source.includes("localStorage.removeItem('liftlog-ranking-migration-backup')"),'reset must remove the ranking migration backup too');
