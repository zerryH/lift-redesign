import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const custom={id:'custom:timed-hold',n:'My timed hold',t:'U',c:'Abs',g:'Core',equipment:'Bodyweight',protocol:{tracking:'duration',implementCount:1,loadMode:'bodyweight',bodyweightFactor:1,hasLoad:false}};
const renamed='My renamed hold';
const session=id=>({...workout(custom.n),id,ex:[{n:custom.n,exerciseId:custom.id,entryId:'exercise:hold-'+id,sets:[{id:'set:hold-'+id,kg:0,reps:0,seconds:45.25,t:'',trackingMode:'duration',protocolVersion:2,note:'Original measurement'}]}],drafts:{[custom.n]:{seconds:'75.5',note:'Keep my draft',rpe:'8'}}});
function modalNodes(z){
 const create=z.ctx.document.createElement,query=z.ctx.document.querySelector,modals=[];
 z.ctx.document.querySelector=s=>s==='#action-modal'?null:query(s);
 z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;modals.push(el);return el;};
 return modals;
}
async function remove(z,type,modals){
 z.h.A[({exercise:'rx',workout:'hd',draft:'cancel',set:'ds'})[type]]({i:0,j:0});
 await modals.at(-1).listeners.click.at(-1)({target:{closest:s=>s==='[data-action-confirm]'?{}:null,classList:{contains:()=>false}}});
 await z.h.flush();assert.equal(z.h.S.undo.type,type);
}
async function rename(z){
 z.h.A.manageCustom({v:custom.id});z.get('#custom-rename').value=renamed;
 z.get('#save-custom-name').listeners.click.at(-1)();await z.h.flush();
}
function recovered(z,type){return type==='workout'?z.h.S.workouts[0]:z.h.S.cur;}

for(const type of ['exercise','workout','draft','set']){
 const initial={...base(),custom:[custom],...(type==='workout'?{workouts:[session(101)]}:{cur:session(102)})};
 const z=await boot(initial),modals=modalNodes(z);
 const originalSet=JSON.stringify((type==='workout'?z.h.S.workouts[0]:z.h.S.cur).ex[0].sets[0]);
 await remove(z,type,modals);await rename(z);
 const beforeUndo=JSON.parse(z.store.get('liftlog-state'));
 for(const restored of [z,await boot(beforeUndo)]){
  restored.h.A.undo();await restored.h.flush();
  const w=recovered(restored,type),x=w.ex[0];
  assert.equal(x.n,renamed,type+': Undo must restore the current custom label');
  assert.equal(x.exerciseId,custom.id);assert.equal(restored.h.trackingMode(x.n),'duration',type+': Undo must retain the duration protocol');
  assert.equal(JSON.stringify(x.sets[0]),originalSet,type+': original measurements and provenance stay byte-for-byte unchanged');
  assert.equal(restored.h.S.undo,null);
  const durable=JSON.parse(restored.store.get('liftlog-state'));
  assert.equal((type==='workout'?durable.workouts[0]:durable.cur).ex[0].n,renamed,'recovery is normalized before saving');
  if(type!=='workout'){
   restored.h.A.selectExercise({i:0});const html=restored.h.V.today();
   assert(html.includes('id="log-seconds"'));assert(!html.includes('id="qol-reps"'));
   assert.equal(restored.h.dr.seconds,'75.5',type+': recovered typed duration stays intact');assert.equal(restored.h.dr.note,'Keep my draft');
   assert.equal(restored.h.makeDraftSet().seconds,75.5);
  }
  restored.h.SlatData.validateBackup({...restored.h.S,settings:restored.h.S.set,version:4},restored.h.X.catalogue);
  assert.deepEqual(restored.errors,[]);
 }
}

// A backup made by an older release may already contain a stale recovery label.
for(const type of ['exercise','workout','draft']){
 const w=session(103),record=type==='exercise'?w.ex[0]:w;
 const initial={...base(),custom:[{...custom,n:renamed}],cur:type==='exercise'?{...w,ex:[]}:null,undo:{type,record,index:0,workoutId:w.id,removedAt:1}};
 const z=await boot(initial);z.h.A.undo();await z.h.flush();
 const restored=recovered(z,type),x=restored.ex[0];assert.equal(x.n,renamed,'older '+type+' recovery resolves by stable identity');
 assert.equal(x.sets[0].seconds,45.25);assert.equal(x.exerciseId,custom.id);
 if(type==='draft')assert.equal(z.h.dr.seconds,'75.5','legacy name-keyed drafts follow the recovered identity');
 assert.deepEqual(z.errors,[]);
}

// Current identity-keyed input wins; one legacy draft belongs only to the first duplicate entry.
for(const modern of [false,true]){
 const w=session(104),first=w.ex[0];w.ex.push({...first,entryId:'exercise:second',sets:[]});
 if(modern)w.drafts[first.entryId]={seconds:'99.75',note:'Identity-keyed draft'};
 const z=await boot({...base(),custom:[{...custom,n:renamed}],cur:w});
 assert.equal(z.h.dr.seconds,modern?'99.75':'75.5');assert.equal(z.h.dr.note,modern?'Identity-keyed draft':'Keep my draft');
 assert.equal(z.h.S.cur.drafts[custom.n],undefined);
 z.h.A.selectExercise({i:1});assert.equal(z.h.dr.seconds,30);assert.equal(z.h.dr.note,'');
 assert.deepEqual(z.errors,[]);
}

const alias=await boot({...base(),cur:{...workout('Cable Bicep Curl'),drafts:{'Cable Bicep Curl':{kg:27.25,reps:11,note:'Alias draft'}}}});
assert.equal(alias.h.S.cur.ex[0].n,'Cable Curl');assert.equal(alias.h.dr.kg,27.25);assert.equal(alias.h.dr.note,'Alias draft');
const imported=await boot();await imported.h.importBackup({...base(),custom:[{...custom,n:renamed}],cur:session(105)});
assert.equal(imported.h.dr.seconds,'75.5');assert.equal(imported.h.dr.note,'Keep my draft');
assert.deepEqual([...alias.errors,...imported.errors],[]);

const rankedCustom={id:'custom:ranked-undo',n:'Renamed curl',t:'M',c:'Biceps',g:'Pull',rank:'Cable Curl'};
const removed={...workout('Old curl',40,8),ex:[{n:'Old curl',exerciseId:rankedCustom.id,entryId:'exercise:ranked-undo',sets:[{id:'set:ranked-undo',kg:40,reps:8,t:'',bw:80,height:178}]}]};
const ranked=await boot({...base(),custom:[rankedCustom],undo:{type:'workout',record:removed,index:0,removedAt:1}});
ranked.h.A.undo();await ranked.h.flush();
assert(ranked.h.S.rk[rankedCustom.n],'Undo recalculates earned ranks under the resolved name immediately');assert.equal(ranked.h.S.rk['Old curl'],undefined);
const saved=JSON.parse(ranked.store.get('liftlog-state'));assert.equal(saved.workouts[0].ex[0].n,rankedCustom.n);
const rankedReload=await boot(saved);assert(rankedReload.h.S.rk[rankedCustom.n]);
assert.deepEqual([...ranked.errors,...rankedReload.errors],[]);
console.log('Custom exercise renames retain Undo labels, protocols, exact measurements and drafts before/after reload, including older recovery copies');
