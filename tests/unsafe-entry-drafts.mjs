import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
for(const unsafe of ['__proto__','constructor','prototype']){
 const drafts={};Object.defineProperty(drafts,unsafe,{value:{kg:null,weightText:'invalid typed load',weightUnit:'kg',reps:8,note:'Retain the original draft'},enumerable:true});
 const cur={...workout('Bench Press'),id:77,ex:[{n:'Bench Press',entryId:unsafe,sets:[]}],drafts};
 const z=await boot({...base(),rankingVersion:11,cur}),id=z.h.S.cur.ex[0].entryId;
 assert.notEqual(id,unsafe,'dictionary-reserved entry identities must be repaired before drafts are written');
 assert.equal(z.h.S.cur.drafts[id].note,'Retain the original draft');assert.equal(z.h.dr.weightText,'invalid typed load');assert(!Object.hasOwn(z.h.S.cur.drafts,unsafe));
 z.h.dr.note='New text after repair';z.h.persistDraft();await z.h.flush();
 const stored=JSON.parse(z.store.get('liftlog-state'));assert.equal(stored.cur.ex[0].entryId,id);assert.equal(stored.cur.drafts[id].note,'New text after repair');assert.equal(Object.getPrototypeOf(stored.cur.drafts).note,undefined);
 const again=await boot(stored);assert.equal(again.h.S.cur.ex[0].entryId,id);assert.equal(again.h.dr.note,'New text after repair');assert.equal(again.h.dr.weightText,'invalid typed load');assert.deepEqual([...z.errors,...again.errors],[]);
}
console.log('Reserved exercise-entry identities are repaired with their owning draft before typed edits, persistence and reload');
