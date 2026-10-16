import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

for(const unit of ['kg','lb'])for(const name of ['Bench Press','Assisted Dip']){
 const initial={...base(),set:{...base().set,unit,restEnabled:false},workouts:[workout('Bench Press',60.123456,8)],cur:{...workout(),id:2,ex:[{n:'Bench Press',entryId:'exercise:pending',sets:[]}],drafts:{'exercise:pending':{kg:67.25,reps:9,weightText:unit==='kg'?'67,25':'148,260695',weightUnit:unit,note:'Keep my workout draft',rpe:'8.5'}}}};
 const z=await boot(initial),h=z.h;
 h.gr={n:name,w:'',r:'8',b:'',h:'178',u:'kg',f:'M'};
 h.gr.w=name==='Assisted Dip'?'20.123456':'60.123456';h.gr.b='80.234567';await h.A.calc();await h.A.saveCheck();
 // Enter through the same saved-check action as the real UI, in the preferred unit.
 h.A.tab({v:'ranks'});h.A.gr({v:name});await h.A.calc();
 const original={w:h.gr.res.w,b:h.gr.res.b,x:h.gr.res.x},history=JSON.stringify(h.S.workouts),drafts=JSON.stringify(h.S.cur.drafts),checks=JSON.stringify(h.S.checks);
 const switches=[unit==='kg'?'lb':'kg',unit,unit==='kg'?'lb':'kg'];
 for(const next of switches){
  h.A.gu({v:next});await h.flush();
  assert.equal(h.S.set.unit,next);
  assert(z.get('#v').innerHTML.startsWith(h.V.ranks()),'calculator unit changes must refresh the underlying rank cards before closing');
  assert.equal(h.gr.res,null,'changing units still invalidates the preview');
  await h.A.calc();assert.deepEqual({w:h.gr.res.w,b:h.gr.res.b,x:h.gr.res.x},original,'canonical calculator measurements stay exact');
  assert.equal(JSON.stringify(h.S.workouts),history);assert.equal(JSON.stringify(h.S.cur.drafts),drafts);assert.equal(JSON.stringify(h.S.checks),checks,'unit changes do not alter saved checks');
 }
 h.A.gx();assert(z.get('#v').innerHTML.startsWith(h.V.ranks()),'closing without Save check must leave current units visible');
 const restored=await boot(JSON.parse(z.store.get('liftlog-state')));assert.equal(restored.h.S.set.unit,switches.at(-1));assert.equal(JSON.stringify(restored.h.S.workouts),history);assert.equal(JSON.stringify(restored.h.S.cur.drafts),drafts);assert.equal(JSON.stringify(restored.h.S.checks),checks);
 assert.deepEqual([...z.errors,...restored.errors],[]);
}
console.log('Calculator kg/lb changes immediately refresh rank cards without Save check; exact loads, assistance, bodyweight, saved checks and pending drafts survive toggles and reload');
