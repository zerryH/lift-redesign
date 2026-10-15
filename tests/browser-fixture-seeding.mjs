import assert from 'node:assert/strict';
import vm from 'node:vm';
import {seedFixture} from '../tools/browser-fixture.mjs';

function seed(entries,state){
 const store=new Map(entries),writes=[];
 const localStorage={getItem:key=>store.has(key)?store.get(key):null,setItem(key,value){writes.push(key);store.set(key,String(value));}};
 vm.runInNewContext('('+seedFixture.toString()+')(fixture)',{localStorage,fixture:state});
 return {store,writes};
}
const fixture={cur:{ex:[]}},saved=JSON.stringify({revision:7,cur:{ex:[{entryId:'exercise:saved',n:'Cable Curl',sets:[]}],drafts:{'exercise:saved':{note:'Keep this saved draft'}}}});
const initial=seed([],fixture);assert.equal(initial.store.get('liftlog-state'),JSON.stringify(fixture));assert.equal(initial.store.get('slat-test-seeded'),'1');
const existing=seed([['liftlog-state',saved]],fixture);
assert.equal(existing.store.get('liftlog-state'),saved,'a missing marker cannot overwrite persisted app data');assert.deepEqual(existing.writes,['slat-test-seeded']);
for(const raw of ['', 'null', '{invalid JSON']){
 const corrupt=seed([['liftlog-state',raw]],fixture);assert.equal(corrupt.store.get('liftlog-state'),raw,'recovery fixtures must not be silently replaced');
}
const reset=seed([['slat-test-seeded','1']],fixture);assert.equal(reset.store.has('liftlog-state'),false,'a deliberate reset must remain empty after reload');
const marked=seed([['liftlog-state',saved],['slat-test-seeded','1']],fixture);assert.equal(marked.store.get('liftlog-state'),saved);assert.deepEqual(marked.writes,[]);
const raw=seed([],'{raw fixture');assert.equal(raw.store.get('liftlog-state'),'{raw fixture');
console.log('Browser fixtures seed only empty storage; missing markers never replace saved/recovery data or undo deliberate resets');
