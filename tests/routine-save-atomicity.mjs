import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

const routine=()=>({id:'routine:atomic',name:'Original plan',split:'Push',ex:[{n:'Bench Press',exerciseId:'ex001',sets:3,reps:8,seconds:30,meters:20,rest:90}]});
async function editor(editing){
 const z=await boot({...base(),routines:editing?[routine()]:[],cur:workout('Bench Press',60,8)}),create=z.ctx.document.createElement;
 const controls=['#routine-save','#routine-name','#routine-add','#routine-exercise','#routine-delete','#routine-close','#routine-up'].map(z.get);
 z.get('#routine-up').disabled=true;
 z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;el.querySelectorAll=s=>s==='button,input,select'?controls:[];return el;};
 if(editing)z.h.A.routineEdit({v:routine().id});else z.h.A.routineSave();
 z.get('#routine-name').value='Submitted plan';z.h.qolRestStart(90);await z.h.flush();
 return {...z,controls,click:()=>z.get('#routine-save').listeners.click.at(-1)()};
}

for(const editing of [false,true])for(const fail of [false,true]){
 const z=await editor(editing),old=JSON.stringify(z.h.S.routines),workoutBefore=JSON.stringify(z.h.S.cur),stored=z.store.get('liftlog-state'),modal=z.h.qolState.modal,deadline=z.h.qolState.endAt;
 let calls=0,release;
 z.ctx.navigator.locks={request:(_name,job)=>{calls++;return calls===1?new Promise((resolve,reject)=>{release=()=>fail?reject(new Error('Interrupted routine lock')):resolve(job());}):job();}};
 const first=z.click();await new Promise(setImmediate);
 assert.equal(calls,1);assert.equal(z.get('#routine-save').textContent,'Saving…');assert.equal(modal.getAttribute('aria-busy'),'true');
 assert(z.controls.every(c=>c.disabled),'every editor control is locked until acknowledgement');
 z.get('#routine-name').value='Later queued tap';const second=z.click();await new Promise(setImmediate);
 assert.equal(z.h.routineDraft.name,'Submitted plan','a queued second tap cannot recollect or mutate the draft');
 assert.equal(z.h.S.routines.at(-1).name,'Submitted plan');
 vm.runInContext('qolCloseModal()',z.ctx);assert.equal(z.h.qolState.modal,modal,'pending persistence keeps the editor available');
 const draftBefore=JSON.stringify(z.h.routineDraft);z.get('#routine-add').listeners.click.at(-1)();assert.equal(JSON.stringify(z.h.routineDraft),draftBefore);
 z.h.qolRenderRest();assert.equal(z.h.qolState.endAt,deadline);assert.equal(JSON.stringify(z.h.S.cur),workoutBefore);
 release();await Promise.all([first,second]);await z.h.flush();
 assert.equal(calls,1,'a double submission must make exactly one persistence request');
 assert.equal(vm.runInContext('importing',z.ctx),false);assert.equal(modal.getAttribute('aria-busy'),'false');
 assert.equal(z.get('#routine-up').disabled,true,'pre-existing disabled boundaries remain disabled');
 assert(z.controls.filter(c=>c!==z.get('#routine-up')).every(c=>!c.disabled));
 if(fail){
  assert.equal(JSON.stringify(z.h.S.routines),old);assert.equal(z.store.get('liftlog-state'),stored);
  assert.equal(z.h.qolState.modal,modal);assert.match(z.get('#routine-error').textContent,/Could not save/);
  z.get('#routine-name').value='Retried plan';await z.click();await z.h.flush();
  assert.equal(calls,2);assert.equal(z.h.S.routines.length,1);assert.equal(z.h.S.routines[0].name,'Retried plan');
 }else{assert.equal(z.h.S.routines.length,1);assert.equal(z.h.S.routines[0].name,'Submitted plan');}
 assert.equal(JSON.stringify(JSON.parse(z.store.get('liftlog-state')).routines),JSON.stringify(z.h.S.routines),'acknowledged memory and durable routines agree');
 assert.equal(z.h.qolState.modal,null);assert.equal(JSON.stringify(z.h.S.cur),workoutBefore);assert.equal(z.h.qolState.endAt,deadline);
 assert.deepEqual(z.errors,[]);
}

const invalid=await editor(false),stored=invalid.store.get('liftlog-state');invalid.get('#routine-name').value='';await invalid.click();
assert.equal(vm.runInContext('importing',invalid.ctx),false);assert.equal(invalid.get('#routine-save').disabled,false);assert.equal(invalid.store.get('liftlog-state'),stored);assert.equal(invalid.get('#routine-error').textContent,'Enter a routine name');
invalid.get('#routine-name').value='Valid retry';await invalid.click();assert.equal(invalid.h.S.routines[0].name,'Valid retry');
console.log('Routine saves serialize duplicate taps, retain failed drafts for retry, restore controls and preserve workouts/rest');
