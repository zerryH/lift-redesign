import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

// Direct form listeners run before the document's delegated-action guard.
async function form(action,control,fields,lock,extra={},args={i:0,j:0}){
 const z=await boot({...base(),cur:workout(),...extra});
 const create=z.ctx.document.createElement;
 z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;return el;};
 z.h.A[action](args);
 for(const [selector,value] of Object.entries(fields))z.get(selector).value=value;
 await z.h.flush();const before=JSON.stringify(z.h.S),stored=z.store.get('liftlog-state');
 vm.runInContext(lock+'=true',z.ctx);
 await z.get(control).listeners.click.at(-1)();await z.h.flush();
 assert.equal(JSON.stringify(z.h.S),before,action+' must not mutate a paused state');
 assert.equal(z.store.get('liftlog-state'),stored,action+' must preserve durable state');
 assert.deepEqual(z.errors,[]);
}

for(const lock of ['storageConflict','importing','finishing']){
 await form('sessionInfo','#session-info-save',{'#session-date':'2026-09-19','#session-name':'Changed while paused'},lock);
 await form('exerciseOptions','#exercise-options-save',{'#exercise-rest':'120','#equipment-label':'Changed setup'},lock);
 await form('editSet','#save-set-edit',{'#edit-weight':'110','#edit-amount':'5','#edit-rpe':'8','#edit-note':'Changed while paused'},lock);
 const routine={id:'routine:paused',name:'Original routine',ex:[{n:'Bench Press',exerciseId:'ex001',sets:3,reps:8,seconds:30,meters:20,rest:90}]};
 await form('routineEdit','#routine-save',{'#routine-name':'Changed while paused'},lock,{routines:[routine]},{v:routine.id});
 const custom={id:'custom:paused',n:'Original exercise',t:'M',c:'Chest',g:'Push'};
 for(const control of ['#save-custom-name','#custom-retire'])await form('manageCustom',control,{'#custom-rename':'Changed while paused'},lock,{custom:[custom]},{v:custom.id});

 const deletion=await boot({...base(),cur:workout()}),create=deletion.ctx.document.createElement,query=deletion.ctx.document.querySelector;let modal;
 deletion.ctx.document.querySelector=s=>s==='#action-modal'?null:query(s);
 deletion.ctx.document.createElement=()=>{const el=create();el.querySelector=deletion.get;if(!modal)modal=el;return el;};
 deletion.h.A.ds({i:0,j:0});await deletion.h.flush();const before=JSON.stringify(deletion.h.S),stored=deletion.store.get('liftlog-state');
 vm.runInContext(lock+'=true',deletion.ctx);
 await modal.listeners.click.at(-1)({target:{closest:s=>s==='[data-action-confirm]'?{}:null,classList:{contains:()=>false}}});
 await deletion.h.flush();assert.equal(JSON.stringify(deletion.h.S),before,'delete confirmation must honor '+lock);
 assert.equal(deletion.store.get('liftlog-state'),stored);assert.deepEqual(deletion.errors,[]);

 const history=await boot({...base(),workouts:[workout()]});
 const historyCreate=history.ctx.document.createElement;
 history.ctx.document.createElement=()=>{const el=historyCreate();el.querySelector=history.get;return el;};
 history.h.A.sessionView({i:0});const historyState=JSON.stringify(history.h.S),draftBefore=history.h.routineDraft;
 vm.runInContext(lock+'=true',history.ctx);
 await history.get('#session-repeat').listeners.click.at(-1)();
 assert.equal(JSON.stringify(history.h.S),historyState,'Repeat session must honor '+lock);
 await history.get('#session-routine').listeners.click.at(-1)();
 assert.equal(history.h.routineDraft,draftBefore,'Save as routine must honor '+lock);

 const builderRoutine={id:'routine:builder-paused',name:'Builder',ex:[{n:'Bench Press',exerciseId:'ex001',sets:3,reps:8,seconds:30,meters:20,rest:90},{n:'Dumbbell Curl',exerciseId:'ex014',sets:3,reps:10,seconds:30,meters:20,rest:60}]};
 const builder=await boot({...base(),routines:[builderRoutine]}),builderCreate=builder.ctx.document.createElement;
 const move=builder.get('#test-routine-move'),remove=builder.get('#test-routine-remove');
 move.dataset={i:'0',routineMove:'1'};remove.dataset={routineRemove:'0'};
 builder.ctx.document.createElement=()=>{const el=builderCreate();el.querySelector=builder.get;el.querySelectorAll=s=>s==='[data-routine-move]'?[move]:s==='[data-routine-remove]'?[remove]:[];return el;};
 builder.h.A.routineEdit({v:builderRoutine.id});builder.get('#routine-exercise').value='Dumbbell Curl';const builderBefore=JSON.stringify(builder.h.routineDraft);
 vm.runInContext(lock+'=true',builder.ctx);
 for(const control of [builder.get('#routine-add'),move,remove]){
  await control.listeners.click.at(-1)();
  assert.equal(JSON.stringify(builder.h.routineDraft),builderBefore,'Routine draft controls must honor '+lock);
 }
}
console.log('Workout, equipment, set, routine, History and deletion dialogs honor conflict, import and finish locks');
