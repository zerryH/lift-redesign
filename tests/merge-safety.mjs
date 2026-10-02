import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
class El{constructor(doc){this.doc=doc;this.style={setProperty(){}};this.dataset={};this.classList={add(){},remove(){},contains(){return false}};this.parentElement=this;this.value='';this.textContent='';this.innerHTML='';this.offsetWidth=0;this.disabled=false;this.listeners={};this.id='';}querySelector(){return new El(this.doc)}querySelectorAll(){return []}closest(){return null}addEventListener(t,fn){(this.listeners[t]??=[]).push(fn)}append(){}appendChild(){}remove(){}setAttribute(){}focus(){}dispatchEvent(){}getContext(){return {clearRect(){},fillText(){},strokeRect(){},beginPath(){},lineTo(){},moveTo(){},stroke(){}}}}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function load(initial){
 const listeners={};const root=new El({});let document;document={querySelector(s){return s==='#v'||s==='#n'?root:new El(document)},querySelectorAll(){return[]},createElement(){return new El(document)},body:new El(document),documentElement:{dataset:{}},visibilityState:'visible',addEventListener(t,f){(listeners[t]??=[]).push(f)},removeEventListener(){}};
 const store=new Map([['liftlog-state',JSON.stringify(initial)]]);const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 const ctx={console,document,localStorage,location:{protocol:'file:'},window:{isSecureContext:false},navigator:{storage:{}},MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame:fn=>0,cancelAnimationFrame(){},setTimeout,clearTimeout,setInterval,clearInterval,File:class{},URL:{createObjectURL(){return'blob:'}},confirm:()=>true,alert(){},Event:class{constructor(type,opts={}){this.type=type;Object.assign(this,opts)}},crypto,Math,Date,JSON,Promise,parseFloat,Number,String,Array,Object,Set,Map,RegExp,Error,TypeError,Infinity,NaN,isFinite,isNaN};
 ctx.globalThis=ctx;vm.createContext(ctx);const instrumented=source.replace('(async()=>{','globalThis.__liftBoot=(async()=>{').replace('if(S.set.v!==4)S.set.v=4;repairState();','if(S.set.v!==4)S.set.v=4;repairState();globalThis.__liftTest={A,S,R,EX,repairState};');vm.runInContext(instrumented,ctx,{filename:'app.js'});await ctx.__liftBoot;await wait(15);return{ctx,listeners,store,state:ctx.__liftTest.S}}
const base={savedAt:1,workouts:[{id:123,d:'2026-09-20',split:'Push',ex:[{n:'Bench Press',sets:[{kg:100,reps:5,t:''}]}]}],custom:[],bw:[{d:'2026-09-20',kg:80}],set:{table:'M',dark:1,motion:0,v:4,age:'',ageAdjust:true,heightCm:'',heightAdjust:true,unit:'kg',rest:90,tutorialSeen:true,tutorialVersion:3},rk:{},cur:null,editingId:null,lastBackup:0};
const h=await load(base);const change=h.listeners.change?.[0];assert(change,'real backup import change handler must be registered');
const different={workouts:[{id:123,d:'2026-09-21',split:'Pull',ex:[{n:'Deadlift',sets:[{kg:180,reps:3,t:''}]}]}],custom:[],bw:[{d:'2026-09-21',kg:81}],rk:{}};
await change({target:{id:'imp',files:[{text:async()=>JSON.stringify(different)}]}});await wait(10);
assert.equal(h.state.workouts.length,2,'different content with colliding ID must be imported with a new ID');assert.notEqual(h.state.workouts[1].id,123,'remapped imported workout must have a new ID');
const identical={workouts:[{id:123,d:'2026-09-20',split:'Push',ex:[{n:'Bench Press',sets:[{kg:100,reps:5,t:''}]}]}],custom:[],bw:[],rk:{}};
await change({target:{id:'imp',files:[{text:async()=>JSON.stringify(identical)}]}});await wait(10);
assert.equal(h.state.workouts.length,2,'identical collision must be skipped on re-import');
const exported=JSON.parse(JSON.stringify({workouts:h.state.workouts,custom:h.state.custom,bw:h.state.bw,settings:h.state.set,rk:h.state.rk}));
const round=await load({...base,workouts:[]});const change2=round.listeners.change?.[0];await change2({target:{id:'imp',files:[{text:async()=>JSON.stringify(exported)}]}});await wait(10);assert.equal(round.state.workouts.length,2,'export/import round-trip must preserve both workouts');
console.log('merge collision and round-trip tests passed');
