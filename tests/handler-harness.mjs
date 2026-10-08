import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
class El{constructor(){this.style={setProperty(){}};this.dataset={};this.classList={add(){},remove(){},contains(){return false}};this.parentElement=this;this.value='';this.textContent='';this.innerHTML='';this.offsetWidth=0;this.disabled=false}querySelector(){return new El()}querySelectorAll(){return []}closest(){return null}addEventListener(){}append(){}appendChild(){}remove(){}setAttribute(){}focus(){}dispatchEvent(){}getContext(){return {clearRect(){},fillText(){},strokeRect(){},beginPath(){},lineTo(){},moveTo(){},stroke(){}}}}
const run=async initial=>{
  const root=new El(),listeners={};
  const document={querySelector(s){return s==='#v'||s==='#n'?root:new El()},querySelectorAll(){return []},createElement(){return new El()},body:new El(),documentElement:{dataset:{}},scrollingElement:new El(),visibilityState:'visible',addEventListener(type,fn){(listeners[type]??=[]).push(fn)},removeEventListener(){}};
  const store=new Map([['liftlog-state',JSON.stringify(initial)]]);
  const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
  const ctx={console,document,localStorage,location:{protocol:'file:'},window:{isSecureContext:false,scrollTo(){}},navigator:{storage:{}}
  ,history:{scrollRestoration:'auto'},MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame:fn=>0,cancelAnimationFrame(){},setTimeout,clearTimeout,setInterval,clearInterval,File:class{},URL:{createObjectURL(){return 'blob:'}},confirm:()=>true,alert(){},Event:class{constructor(type,opts={}){this.type=type;Object.assign(this,opts)}},crypto,Math,Date,JSON,Promise,parseFloat,Number,String,Array,Object,Set,Map,RegExp,Error,TypeError,Infinity,NaN,isFinite,isNaN};
  ctx.globalThis=ctx; vm.createContext(ctx);
  const instrumented=source.replace('(async()=>{','globalThis.__liftBoot=(async()=>{').replace('if(S.set.v!==4)S.set.v=4;repairState();','if(S.set.v!==4)S.set.v=4;repairState();globalThis.__liftTest={A,S,R,EX,V,repairState,rankMetrics,est,tier};');
  vm.runInContext(instrumented,ctx,{filename:'app.js'}); await ctx.__liftBoot; await new Promise(r=>setTimeout(r,15)); return ctx.__liftTest;
};
const base={savedAt:1790959000000,workouts:[{id:1,d:'2026-09-20',split:'Push',ex:[{n:'Bench Press',sets:[{kg:100,reps:5,t:''}]}]}],custom:[],bw:[{d:'2026-09-20',kg:80}],set:{table:'M',dark:1,motion:0,v:4,age:'',ageAdjust:true,heightCm:'',heightAdjust:true,unit:'kg',rest:90,tutorialSeen:true,tutorialVersion:3},rk:{},cur:null,editingId:null,lastBackup:0};
const h=await run(base);
assert.doesNotReject(()=>{h.A.gr({v:'Bench Press'});return h.A.calc()},'Get/Update Rank must execute without nx ReferenceError');
const firstBench=h.R.t['Bench Press'][0][0];

assert.equal(h.tier('Bench Press',firstBench-.1,178),-1,'below first threshold must be Unranked');
const firstBenchFor80=firstBench*Math.pow(80/75,0.67);
assert.equal(h.tier('Bench Press',firstBenchFor80,178),0,'first threshold must enter tier 0 after allometric normalization');
const weighted={kg:20,reps:8,t:'',bw:70};
const h2=await run({...base,workouts:[],bw:[{d:'2026-09-20',kg:70}]});
h2.EX['Weighted Dip']={g:'Push',t:'W'}; const before=h2.est('Weighted Dip',weighted); h2.S.bw.push({d:'2026-09-21',kg:80}); const after=h2.est('Weighted Dip',weighted);
assert.equal(before,after,'historical bodyweight PR estimate must not change when current BW changes');
const boot={...base,workouts:[{id:2,d:'2026-09-20',split:'Pull',ex:[{n:'Sumo Deadlift',sets:[{kg:180,reps:3,t:''}]},{n:'My Custom',sets:[{kg:100,reps:5,t:''}]}]}],custom:[{n:'My Custom',t:'B',c:'Pull',rank:'Deadlift'}]};
const h3=await run(boot);
assert(h3.S.rk['Sumo Deadlift']&&h3.S.rk['Sumo Deadlift'].i>=0,'runtime staple rank must exist after fresh boot');
assert(h3.S.rk['My Custom']&&h3.S.rk['My Custom'].i>=0,'custom alias rank must exist after fresh boot');
console.log('rank handler/state boot tests passed');
const noProfileBw={...base,bw:[],workouts:[]};
const h4=await run(noProfileBw);
h4.S.rk['Bench Press']={n:'Bench Press',w:100,r:5,b:80,u:'kg',f:'M',i:12,x:100,e:100,pc:50,need:1,d:'2026-10-08',auto:false,rankVersion:9};
const rankHtml=h4.V.ranks();
assert(rankHtml.includes('Bench Press'),'overall ranks must include a saved manual rank even without a current profile BW');
assert(!rankHtml.includes('<b>Unranked</b>'),'overall rank must not be Unranked when a saved exercise rank exists');
h4.S.bw=[{d:'2026-10-08',kg:80}];
h4.S.cur={id:3,d:'2026-10-08',split:'Push',ex:[{n:'Bench Press',sets:[{kg:100,reps:5,t:''}]}]};
h4.S.editingId=null;
h4.A.fin();
assert(h4.S.workouts.some(w=>w.id===3),'finish must save the completed workout');
assert(h4.S.rk['Bench Press']&&h4.S.rk['Bench Press'].i>=0,'finish must refresh workout-derived ranks immediately');
assert(h4.S.workouts.find(w=>w.id===3).ex[0].sets[0].bw===80,'finish must snapshot bodyweight into logged sets for rank rebuilds');
console.log('rank finish/overall sync regressions passed');
