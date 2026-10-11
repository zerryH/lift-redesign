import fs from 'node:fs';
import vm from 'node:vm';
export const base=()=>({savedAt:1,workouts:[],custom:[],bw:[{d:'2026-09-20',kg:80}],set:{table:'M',dark:1,motion:0,v:4,birthYear:1996,ageAdjust:true,heightCm:178,heightAdjust:true,unit:'kg',rest:90,tutorialSeen:true,tutorialVersion:5,installGuideSeen:true},rk:{},checks:{},cur:null,editingId:null,lastBackup:0,rankingVersion:10});
export const workout=(n='Bench Press',kg=100,reps=5)=>({id:1,d:'2026-09-20',split:'Push',ex:[{n,sets:[{kg,reps,t:'',bw:80,height:178}]}]});
class El {
 constructor(){this.style={setProperty(){}};this.dataset={};this.classList={add(){},remove(){},toggle(){},contains(){return false}};this.parentElement=this;this.value='';this.textContent='';this.innerHTML='';this.offsetWidth=0;this.disabled=false;this.listeners={};this.attrs={};}
 querySelector(){return new El()}querySelectorAll(){return []}closest(){return null}matches(){return false}contains(){return false}
 addEventListener(t,f){(this.listeners[t]??=[]).push(f)}append(){}appendChild(){}prepend(){}remove(){}setAttribute(k,v){this.attrs[k]=v}getAttribute(k){return this.attrs[k]||null}focus(){}dispatchEvent(){}
 getContext(){return{clearRect(){},fillText(){},strokeRect(){},beginPath(){},lineTo(){},moveTo(){},stroke(){},arc(){},fill(){}}}
}
export async function boot(initial=base(),options={}){
 const nodes=new Map(),listeners={},errors=[],failWrites=new Set(),store=options.store||new Map([['liftlog-state',typeof initial==='string'?initial:JSON.stringify(initial)]]);
 const get=s=>{if(!nodes.has(s))nodes.set(s,new El());return nodes.get(s)};
 const document={querySelector:get,querySelectorAll:()=>[],getElementById:id=>get('#'+id),createElement:()=>new El(),body:new El(),documentElement:{dataset:{}},scrollingElement:new El(),visibilityState:'visible',addEventListener(t,f){(listeners[t]??=[]).push(f)},removeEventListener(){}};
 const localStorage={getItem:k=>store.get(k)||null,setItem(k,v){if(failWrites.has(k))throw new Error('Quota');store.set(k,String(v))},removeItem:k=>store.delete(k)};
 let dbValue=null,observers=0;
 const db={transaction(){const tx={objectStore(){return{get(){const q={};setTimeout(()=>{q.result=dbValue;q.onsuccess?.()},options.delay||0);return q},put(v){dbValue=JSON.parse(JSON.stringify(v));setTimeout(()=>tx.oncomplete?.(),0)},delete(){dbValue=null;setTimeout(()=>tx.oncomplete?.(),0)}}}};return tx}};
 const indexedDB={open(){const q={result:db};setTimeout(()=>q.onsuccess?.(),options.delay||0);return q}};
 const ctx={console:{log(){},warn(){},error(...a){errors.push(a.map(x=>x?.message||String(x)).join(' '))}},document,localStorage,indexedDB,location:{protocol:options.delay?'https:':'file:',reload(){}},window:{isSecureContext:!!options.delay,scrollTo(){},addEventListener(t,f){(listeners[t]??=[]).push(f)}},navigator:{storage:{}},history:{scrollRestoration:'auto'},MutationObserver:class{constructor(){observers++}observe(){}disconnect(){}},requestAnimationFrame:()=>0,cancelAnimationFrame(){},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},queueMicrotask,Blob,File:class{},URL:{createObjectURL(){return'blob:'},revokeObjectURL(){}},confirm:()=>true,alert(){},Event:class{},crypto,Math,Date:options.Date||Date,JSON,Promise,parseFloat,Number,String,Array,Object,Set,Map,RegExp,Error,TypeError,Infinity,NaN,isFinite,isNaN};
 ctx.globalThis=ctx;vm.createContext(ctx);
 const source=fs.readFileSync(new URL('../../app.js',import.meta.url),'utf8').replace('(async()=>{','globalThis.__boot=(async()=>{');
 vm.runInContext(source+`\nglobalThis.api={A,V,get S(){return S},set S(v){S=v},get EX(){return EX},get R(){return R},get X(){return X},get gr(){return gr},set gr(v){gr=v},get dr(){return dr},set dr(v){dr=v},get ci(){return ci},set ci(v){ci=v},get conflict(){return storageConflict},get qolStarted(){return qolStarted},get view(){return view},set view(v){view=v},calculateRank,refreshRanks,rankMetrics,rankScore,rankThresholds,rankSetEst,bests,muscleStates,muscleStateNames,exerciseMeta,exerciseEquipmentLabel,trackingMode,canonicalExercise,displayExercise,athleteAge,importBackup,save,flush:()=>saveTail,repairState,rebuildRegistry,makeDraftSet,persistDraft,setSummary,qolState,qolStart,qolPlatePlan,qolKg,iso,SlatData,rankProgressText,historicalBest,exercisePickerResults};`,ctx,{filename:'app.js'});
 await ctx.__boot;await ctx.api.flush();
 return {h:ctx.api,ctx,store,failWrites,get,listeners,errors,get observers(){return observers}};
}
