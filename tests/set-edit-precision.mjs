import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

async function editor(unit,name,kg,extra={}){
 const initial=base();initial.set.unit=unit;initial.cur=workout(name,kg,8);Object.assign(initial.cur.ex[0].sets[0],extra);
 const z=await boot(initial),create=z.ctx.document.createElement;
 z.ctx.document.createElement=()=>{const el=create();el.querySelector=s=>s==='#edit-weight'&&!el.innerHTML.includes('id="edit-weight"')?null:z.get(s);return el;};
 z.h.A.editSet({i:0,j:0});
 const html=z.h.qolState.modal.innerHTML;
 for(const [,id,value] of html.matchAll(/<input id="?([\w-]+)"?[^>]*value="([^"]*)"/g))z.get('#'+id).value=value;
 return z;
}
async function submit(z){z.get('#save-set-edit').listeners.click.at(-1)();await z.h.flush();return z.h.S.cur.ex[0].sets[0];}

for(const unit of ['kg','lb'])for(const [name,kg,extra] of [
 ['Bench Press',60.123456,{}],
 ['Assisted Pull-Up Machine',-20.123456,{}],
 ['Dumbbell Farmer Carry',24.123456,{meters:35,trackingMode:'load_distance',protocolVersion:2,reps:0}],
 ['Plank',0,{seconds:45,trackingMode:'duration',protocolVersion:2,reps:0}],
]){
 const z=await editor(unit,name,kg,extra),before=JSON.stringify(z.h.S.cur.ex[0].sets[0]);
 z.get('#edit-note').value='Note only';z.get('#edit-rpe').value='8.5';
 const changed=await submit(z);assert.equal(changed.kg,kg,`${unit} ${name}: unchanged display must retain original load`);assert.equal(changed.rpe,8.5);assert.equal(changed.note,'Note only');
 const restored=await boot(JSON.parse(z.store.get('liftlog-state')));assert.equal(restored.h.S.cur.ex[0].sets[0].kg,kg,'exact load survives saving and reload');
 assert.notEqual(JSON.stringify(changed),before);assert.deepEqual([...z.errors,...restored.errors],[]);
}
for(const unit of ['kg','lb']){
 const z=await editor(unit,'Bench Press',60.123456);z.get('#edit-weight').value=unit==='kg'?'65.5':'144.4';
 const changed=await submit(z);assert.equal(changed.kg,unit==='kg'?65.5:144.4/2.20462,'explicit changes still convert from the editor unit');
}
const invalid=await editor('lb','Bench Press',60.123456);invalid.get('#edit-weight').value='bad';await submit(invalid);assert.equal(invalid.h.S.cur.ex[0].sets[0].kg,60.123456,'invalid edits retain original measurements');
console.log('Note/RPE edits preserve exact kg/lb, legacy assistance, carry and duration loads through reload; explicit changes remain validated');
