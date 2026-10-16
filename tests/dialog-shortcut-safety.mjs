import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

const initial=()=>({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[{id:'set:first',kg:60,reps:8,t:''},{id:'set:second',kg:65,reps:7,t:''}]}]}});
const key=async(z,modifier='ctrlKey',tagName='BUTTON')=>{
 let prevented=false;
 const event={key:'z',[modifier]:true,target:{tagName,closest:()=>null},preventDefault(){prevented=true;}};
 for(const listener of z.listeners.keydown||[])listener(event);
 await z.h.flush();return prevented;
};

for(const modifier of ['ctrlKey','metaKey'])for(const recovery of [false,true]){
 const z=await boot(initial());
 if(recovery){const x=z.h.S.cur.ex[0];z.h.S.undo={type:'set',record:{id:'set:removed',kg:55,reps:9,t:''},workoutId:z.h.S.cur.id,entryId:x.entryId,index:0,removedAt:1};await z.h.save();}
 const create=z.ctx.document.createElement,query=z.ctx.document.querySelector,modals=[];
 z.ctx.document.querySelector=s=>s==='#action-modal'?null:query(s);
 z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;modals.push(el);return el;};
 z.h.A.ds({i:0,j:0});
 const modal=modals.at(-1),dialog=z.get('#visible-test-dialog');dialog.parentElement=null;
 const selector=vm.runInContext('dialogSelector',z.ctx);let open=true;
 z.ctx.document.querySelectorAll=s=>s===selector&&open?[dialog]:[];
 const before=JSON.stringify(z.h.S),stored=z.store.get('liftlog-state');
 const prevented=await key(z,modifier);
 assert.equal(JSON.stringify(z.h.S),before,'an open confirmation must prevent hidden workout undo');
 assert.equal(z.store.get('liftlog-state'),stored,'a dialog shortcut cannot write hidden changes');
 assert.equal(prevented,true,'non-editor dialog controls cannot invoke browser-native undo behind the dialog');
 assert.equal(await key(z,modifier,'INPUT'),false,'text fields keep their native undo');
 assert.equal(JSON.stringify(z.h.S),before);
 open=false;
 await modal.listeners.click.at(-1)({target:{closest:s=>s==='[data-action-confirm]'?{}:null,classList:{contains:()=>false}}});
 await z.h.flush();
 assert.deepEqual([...z.h.S.cur.ex[0].sets].map(s=>s.id),['set:second'],'confirmation removes only the selected set');
 assert.equal(await key(z,modifier),true,'the app shortcut resumes after closing');
 assert.deepEqual([...z.h.S.cur.ex[0].sets].map(s=>s.id),['set:first','set:second']);
 const reloaded=await boot(JSON.parse(z.store.get('liftlog-state')));
 assert.deepEqual([...reloaded.h.S.cur.ex[0].sets].map(s=>s.id),['set:first','set:second']);
 assert.deepEqual([...z.errors,...reloaded.errors],[]);
}
console.log('Ctrl/Cmd+Z cannot mutate workouts behind a dialog; confirmation, native text undo and normal workout recovery remain available');
