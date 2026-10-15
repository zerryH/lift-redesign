import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

const name='Bench Press';
async function calculator(existing){
 const z=await boot({...base(),cur:workout(name,60,8)});
 if(existing)z.h.S.checks[name]=z.h.calculateRank(name,50,8,80,178);
 z.h.qolRestStart(90);await z.h.save();
 const modal=z.get('#sh'),button=z.get('[data-a=saveCheck]'),locked=z.get('[data-g=h]'),inputs=[button,z.get('[data-g=w]'),z.get('[data-g=r]'),z.get('[data-a=gx]'),z.get('[data-a=calc]'),locked];locked.disabled=true;
 modal.querySelector=z.get;modal.querySelectorAll=s=>s==='button,input,select'?inputs:[];button.textContent='Save check';
 z.h.A.gr({v:name});z.h.gr.res=z.h.calculateRank(name,60,8,80,178);
 return {...z,modal,button,inputs,locked};
}
for(const existing of [false,true])for(const fail of [false,true]){
 const z=await calculator(existing),before=JSON.stringify(z.h.S.checks),stored=z.store.get('liftlog-state'),workoutBefore=JSON.stringify(z.h.S.cur),endAt=z.h.qolState.endAt;
 let calls=0,release;z.ctx.navigator.locks={request:(_name,job)=>++calls===1?new Promise((resolve,reject)=>release=()=>fail?reject(new Error('Interrupted check lock')):resolve(job())):job()};
 const first=z.h.A.saveCheck();await new Promise(setImmediate);
 assert.equal(calls,1);assert(z.inputs.every(c=>c.disabled));assert.equal(z.button.textContent,'Saving…');assert.equal(z.modal.getAttribute('aria-busy'),'true');
 const duplicate=z.h.A.saveCheck();await new Promise(setImmediate);assert.equal(calls,1,'queued duplicate taps must not enqueue another snapshot');
 z.h.qolRenderRest();assert.equal(z.h.qolState.endAt,endAt);assert.equal(JSON.stringify(z.h.S.cur),workoutBefore);
 assert.equal(z.h.S.checks[name].w,60);assert.equal(z.store.get('liftlog-state'),stored);
 release();await Promise.all([first,duplicate]);await z.h.flush();
 assert.equal(calls,1);assert.equal(vm.runInContext('importing',z.ctx),false);assert(z.inputs.every(c=>c.disabled===(c===z.locked)),'pre-existing disabled controls stay disabled');
 assert.equal(z.button.textContent,'Save check');assert.equal(z.modal.getAttribute('aria-busy'),'false');
 if(fail){
  assert.equal(JSON.stringify(z.h.S.checks),before);assert.equal(z.store.get('liftlog-state'),stored);assert.equal(z.h.gr.res.w,60,'failed checks keep their calculated preview for retry');
  await z.h.A.saveCheck();await z.h.flush();assert.equal(calls,2);
 }
 assert.equal(z.h.S.checks[name].w,60);assert.equal(JSON.parse(z.store.get('liftlog-state')).checks[name].w,60);
 assert.equal(JSON.stringify(z.h.S.cur),workoutBefore);assert.equal(z.h.qolState.endAt,endAt);assert.deepEqual(z.errors,[]);
}

for(const guard of ['finishing','importing','storageConflict']){
 const z=await calculator(true),before=JSON.stringify(z.h.S),stored=z.store.get('liftlog-state');
 vm.runInContext(guard+'=true',z.ctx);await z.h.A.saveCheck();
 assert.equal(JSON.stringify(z.h.S),before,guard+' blocks direct saved-check mutations');assert.equal(z.store.get('liftlog-state'),stored);
 assert.deepEqual(z.errors,[]);
}
console.log('Rank-check saves serialize duplicate taps, retain failed previews for retry, preserve workouts/rest and honor persistence guards');
