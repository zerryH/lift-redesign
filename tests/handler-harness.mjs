import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
class El{constructor(){this.style={setProperty(){}};this.dataset={};this.classList={add(){},remove(){},contains(){return false}};this.parentElement=this;this.value='';this.textContent='';this.innerHTML='';this.offsetWidth=0;this.disabled=false}querySelector(){return new El()}querySelectorAll(){return []}closest(){return null}addEventListener(){}append(){}appendChild(){}remove(){}setAttribute(){}focus(){}dispatchEvent(){}getContext(){return {clearRect(){},fillText(){},strokeRect(){},beginPath(){},lineTo(){},moveTo(){},stroke(){}}}}
const root=new El();
const listeners={};
const document={querySelector(s){return s==='#v'||s==='#n'?root:new El()},querySelectorAll(){return []},createElement(){return new El()},body:new El(),documentElement:{dataset:{}},visibilityState:'visible',addEventListener(type,fn){(listeners[type]??=[]).push(fn)},removeEventListener(){}};
const store=new Map([['liftlog-state',JSON.stringify({savedAt:1790959000000,workouts:[{id:1,d:'2026-09-20',split:'Push',ex:[{n:'Bench Press',sets:[{kg:100,reps:5,t:''}]}]}],custom:[],bw:[{d:'2026-09-20',kg:80}],set:{table:'M',dark:1,motion:0,v:4,age:'',ageAdjust:true,heightCm:'',heightAdjust:true,unit:'kg',rest:90,tutorialSeen:true,tutorialVersion:3},rk:{},cur:null,editingId:null,lastBackup:0})]]);
const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const ctx={console,document,localStorage,location:{protocol:'file:'},navigator:{storage:{}},MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame:fn=>0,cancelAnimationFrame(){},setTimeout:()=>0,clearTimeout(){},File:class{},URL:{createObjectURL(){return 'blob:'}},confirm:()=>true,alert(){},Event:class{constructor(type,opts={}){this.type=type;Object.assign(this,opts)}},crypto,Math,Date,JSON,Promise,parseFloat,Number,String,Array,Object,Set,Map,RegExp,Error,TypeError,Infinity,NaN,isFinite,isNaN};
ctx.globalThis=ctx;
const instrumented=source.replace('(async()=>{','globalThis.__liftBoot=(async()=>{').replace('if(S.set.v!==4)S.set.v=4;repairState();','if(S.set.v!==4)S.set.v=4;repairState();globalThis.__liftTest={A,S,R,EX,repairState,rankMetrics};');
vm.createContext(ctx);vm.runInContext(instrumented,ctx,{filename:'app.js'}); await ctx.__liftBoot;
const {A,S}=ctx.__liftTest;
assert.equal(S.rk['Bench Press']?.i>=0,true,'baseline rank should exist before handler test');
A.gr({v:'Bench Press'}); let threw=false;try{await A.calc()}catch(e){threw=/nx is not defined/.test(String(e))}
assert.equal(threw,true,'Get/Update Rank handler must reproduce nx ReferenceError on baseline');
console.log('handler harness baseline: nx ReferenceError reproduced');
