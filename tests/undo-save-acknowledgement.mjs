import assert from 'node:assert/strict';
import fs from 'node:fs';
import {boot,base,workout} from './support/runtime.mjs';

const shared='exercise:restored-entry',note='Keep my unsaved identity draft';
const record={...workout('Plank'),id:11,ex:[{n:'Plank',entryId:shared,sets:[]}],drafts:{[shared]:{kg:27.25,reps:11,seconds:'75.5',note,rpe:'8.5'}}};
const initial={...base(),set:{...base().set,restEnabled:false},workouts:[{...workout('Bench Press',60,8),id:10,ex:[{n:'Bench Press',entryId:shared,sets:[{id:'set:history',kg:60,reps:8,t:''}]}]}],cur:null,undo:{type:'draft',record,editingId:null,removedAt:1}};
for(const denied of [false,true]){
 const z=await boot(initial);let release,requested;
 const started=new Promise(resolve=>requested=resolve);
 z.ctx.navigator.locks={request(_name,job){return new Promise(resolve=>{release=()=>Promise.resolve(job()).then(resolve);requested();});}};
 if(denied)z.failWrites.add('liftlog-state');
 z.h.A.undo();await started;
 assert(z.h.S.cur,'Undo renders its recovered draft before asynchronous persistence finishes');
 const unacknowledged=JSON.parse(z.store.get('liftlog-state'));
 assert.equal(unacknowledged.cur,null,'reloading before acknowledgement still reads the previously durable state');
 assert.equal(unacknowledged.undo.record.drafts[shared].note,note,'the durable Undo recovery record is retained while saving');
 const premature=await boot(unacknowledged);assert.equal(premature.h.S.cur,null);assert.equal(premature.h.S.undo.type,'draft');
 release();const acknowledged=await z.h.flush();assert.equal(acknowledged,!denied);
 if(denied){assert.equal(JSON.parse(z.store.get('liftlog-state')).cur,null);assert(z.h.S.cur,'failed persistence keeps the in-memory draft available');}
 else{
  const saved=JSON.parse(z.store.get('liftlog-state')),id=z.h.S.cur.ex[0].entryId;
  assert.notEqual(id,shared);assert.equal(saved.cur.ex[0].entryId,id);assert.equal(saved.cur.drafts[id].note,note);assert.equal(saved.cur.drafts[id].seconds,'75.5');assert.equal(saved.undo,null);
  const reloaded=await boot(saved);assert.equal(reloaded.h.S.cur.ex[0].entryId,id);assert.equal(reloaded.h.dr.note,note);assert.equal(reloaded.h.dr.seconds,'75.5');assert.deepEqual(reloaded.errors,[]);
 }
 assert.deepEqual([...z.errors,...premature.errors],[]);
}
const browser=fs.readFileSync('tools/test-browser.mjs','utf8');
assert(browser.includes('const acknowledged=await saveTail,stored=JSON.parse(localStorage.getItem(\'liftlog-state\'));'));
assert(browser.includes('must acknowledge the recovered draft before reload'));
console.log('Deterministic held/denied Undo writes distinguish rendered, pending and durable recovery; reload journeys require acknowledgement and retain all identity/draft assertions');
