import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

const z=await boot({...base(),workouts:[workout()]});
const malicious='<img src=x onerror="this.dataset.audit=1">';
for(const target of [{sets:malicious},{sets:3,reps:'8" autofocus onfocus="this.dataset.audit=1'},[],{rest:14},{seconds:0}]){
 const cur=workout();cur.ex[0].target=target;const before=z.store.get('liftlog-state');
 await assert.rejects(()=>z.h.importBackup({workouts:[],bw:[],cur}),/target/);assert.equal(z.store.get('liftlog-state'),before,'invalid targets cannot replace saved state');
}
for(const corrections of ['invalid',{},[null],[{date:'2026-02-30'}]]){
 const w=workout();w.corrections=corrections;const before=z.store.get('liftlog-state');
 await assert.rejects(()=>z.h.importBackup({workouts:[w],bw:[]}),/corrections/);assert.equal(z.store.get('liftlog-state'),before);
}
const good=workout();good.corrections=[{date:'2026-09-19',name:'',correctedAt:1}];good.ex[0].target={sets:'3',reps:'8',seconds:'30',meters:'20',rest:'0'};
z.h.SlatData.validateBackup({workouts:[good],bw:[]});
z.h.S.workouts=[{...workout(),corrections:'invalid'}];assert.doesNotThrow(()=>z.h.A.sessionView({i:0}),'existing malformed history must remain viewable');
assert.equal(z.h.SlatWorkout.correct({...workout(),corrections:{}},'2026-09-19','Fixed',Date.UTC(2026,9,12)).corrections.length,1);

// Existing local records and invalid draft text must render only as text, never attributes/elements.
const draft=workout();draft.drafts={'Bench Press':{kg:'20" onpointerdown="this.dataset.audit=1',reps:'8" autofocus onfocus="this.dataset.audit=1',note:'Keep this draft',entryId:'spoofed',n:'spoofed'}};
const d=await boot({...base(),cur:draft});const html=d.h.V.today();
assert(!html.includes('value="8" autofocus onfocus='));assert(!html.includes('value="20" onpointerdown='));assert.equal(d.h.dr.entryId,d.h.S.cur.ex[0].entryId);assert.equal(d.h.dr.n,'Bench Press');assert.equal(d.h.dr.note,'Keep this draft');
d.h.S.cur.ex[0].target={sets:malicious,reps:malicious,rest:malicious};const legacy=d.h.V.today();assert(!legacy.includes('<img src=x onerror='));assert(legacy.includes('&lt;img'));

// Custom backup names cannot shadow a canonical exercise or another custom identity.
for(const custom of [[{id:'custom:shadow',n:'Bench Press',t:'D'}],[{n:'My curl',t:'M'},{n:'my curl',t:'D'}]]){
 const before=z.store.get('liftlog-state');await assert.rejects(()=>z.h.importBackup({workouts:[],bw:[],custom}),/collision/);assert.equal(z.store.get('liftlog-state'),before);
}
const valid=await boot();await valid.h.importBackup({workouts:[workout()],bw:[{d:'2026-09-20',kg:80}],custom:[{id:'custom:unique',n:'My exact curl',t:'M',c:'Biceps'}]});assert(valid.h.rankThresholds('Bench Press'));
for(const name of ['toString','valueOf','hasOwnProperty']){const proto=await boot();await proto.h.importBackup({workouts:[workout(name,25,8)],bw:[{d:'2026-09-20',kg:80}],custom:[{id:'custom:'+name,n:name,t:'M',c:'Biceps',rank:'Cable Curl'}]});assert.equal(proto.h.catalogueRecord(name).id,'custom:'+name);assert(proto.h.rankThresholds(name));assert(proto.h.S.rk[name].i>=0,'valid names must use their own mapped standard, not Object.prototype');}
const before=valid.store.get('liftlog-state');await assert.rejects(()=>valid.h.importBackup({workouts:[],bw:[],custom:[{id:'custom:'+'x'.repeat(161),n:'Long identity curl',t:'M'}]}),/identity/);assert.equal(valid.store.get('liftlog-state'),before);

// Changing display units must not alter the calculator's canonical load or bodyweight.
const rank=await boot();rank.h.gr={n:'Bench Press',w:'60.123456',r:'8',b:'80.234567',h:'178',u:'kg',f:'M',res:null};await rank.h.A.calc();const score=rank.h.gr.res.x;
for(let i=0;i<10;i++){rank.h.A.gu({v:i%2?'kg':'lb'});await rank.h.A.calc();assert.equal(rank.h.gr.res.w,60.123456);assert.equal(rank.h.gr.res.b,80.234567);assert.equal(rank.h.gr.res.x,score);}
await rank.h.A.saveCheck();rank.h.A.gr({v:'Bench Press'});await rank.h.A.calc();assert.equal(rank.h.gr.res.w,60.123456,'opening a saved check retains its exact values behind the rounded display');
rank.h.gr.w='invalid';rank.h.A.gu({v:'lb'});assert.equal(rank.h.gr.w,'invalid');await rank.h.A.calc();assert.equal(rank.h.gr.res,null,'unit switching cannot turn invalid text into a valid zero load');

// The calendar bounds must not pass the whole history as function arguments.
const large=await boot();large.h.S.workouts=Array.from({length:150000},(_,i)=>({...workout(),id:i+1}));assert(large.h.V.history().includes('150000'),'large supported histories still render');
let time=Date.now();const Clock=class extends Date{constructor(...args){super(...(args.length?args:[time]));}static now(){return time;}};
const old={...workout('Bench Press',75,8),restEndAt:time+60000},incoming={...workout('Cable Curl',35,8),restEndAt:time+120000};
const busy=await boot({...base(),cur:old},{delay:30,Date:Clock});const importing=busy.h.importBackup({workouts:[],bw:[],cur:incoming});
for(let i=0;i<20&&busy.h.S.cur.ex[0].n!=='Cable Curl';i++)await new Promise(resolve=>setImmediate(resolve));
assert.equal(busy.h.S.cur.ex[0].n,'Cable Curl');await assert.rejects(()=>busy.h.importBackup({workouts:[],bw:[]}),/already in progress/);
const target={tagName:'BUTTON',closest:s=>s==='[data-a]'?{dataset:{a:'log'}}:null,classList:{contains:()=>false}};
for(const fn of busy.listeners.click||[])fn({target});for(const fn of busy.listeners.input||[])fn({target:{id:'qol-rest-setting',value:'600',dataset:{}}});assert.equal(busy.h.S.set.rest,90,'old input controls cannot mutate imported settings');time+=61000;busy.h.qolRenderRest();assert.equal(busy.h.S.cur.restEndAt,incoming.restEndAt,'the old rest interval cannot clear the incoming deadline');
vm.runInContext("qolState.modal=document.createElement('div');globalThis.beforeModal=qolState.modal;qolCloseModal();",busy.ctx);assert.equal(busy.h.qolState.modal,busy.ctx.beforeModal,'backdrop close cannot release the old screen during an import');
await importing;await busy.h.flush();assert.equal(busy.h.S.cur.ex[0].sets.length,1);assert.equal(busy.h.S.cur.ex[0].sets[0].kg,35);assert.equal(busy.h.qolState.endAt,incoming.restEndAt);
const conflict=await boot({...base(),cur:workout()});vm.runInContext('storageConflict=true',conflict.ctx);for(const fn of conflict.listeners.keydown||[])fn({key:'z',ctrlKey:true,target:{tagName:'BUTTON',closest:()=>null},preventDefault(){}});assert.equal(conflict.h.S.cur.ex[0].sets.length,1,'the global Undo shortcut honors the conflict pause');
const legal=await boot();const listeners=legal.listeners.keydown.length;for(let i=0;i<20;i++){legal.h.A.privacy();legal.h.A.legalClose();}assert.equal(legal.listeners.keydown.length,listeners,'closed legal sheets do not retain global key handlers');
assert.deepEqual([...d.errors,...valid.errors,...large.errors,...rank.errors,...busy.errors,...legal.errors],[]);
console.log('Rejected malformed targets/corrections and identity collisions preserve saved bytes; drafts render safely and 150,000-session history remains usable');
