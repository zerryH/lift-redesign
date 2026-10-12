import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const custom={id:'custom:curl',n:'My curl',t:'M',c:'Biceps',g:'Pull',rank:'Cable Curl'};
const z=await boot({...base(),custom:[custom],cur:workout('My curl',25,8)}),h=z.h;
h.S.checks['My curl']=h.calculateRank('My curl',40,8,80,178,'M');
await h.save();const before=JSON.stringify(h.S),durable=z.store.get('liftlog-state');
// Keep real modal callbacks while giving each field a stable test node.
const create=z.ctx.document.createElement,nodes=new Map();
const node=s=>{if(!nodes.has(s))nodes.set(s,create());return nodes.get(s);};
z.ctx.document.createElement=()=>{const el=create();el.querySelector=node;return el;};
h.A.manageCustom({v:custom.id});node('#custom-rename').value='  My curl  ';
node('#save-custom-name').listeners.click[0]();await h.flush();
assert.equal(JSON.stringify(h.S),before,'saving an unchanged normalized name must preserve checks, sets, drafts and identities');
assert.equal(z.store.get('liftlog-state'),durable,'no-op name saves must not replace the durable state');

h.A.manageCustom({v:custom.id});node('#custom-rename').value='My renamed curl';
node('#save-custom-name').listeners.click[0]();await h.flush();
assert.equal(h.S.custom[0].id,custom.id);assert.equal(h.S.cur.ex[0].n,'My renamed curl');
assert.equal(h.S.cur.ex[0].sets[0].kg,25);assert.equal(h.S.checks['My curl'],undefined);
assert.equal(h.S.checks['My renamed curl'].w,40);
const restored=await boot(JSON.parse(z.store.get('liftlog-state')));
assert.equal(restored.h.S.checks['My renamed curl'].w,40);

const aliases=Object.keys(h.X.catalogue).filter(n=>h.X.catalogue[n].canonicalName);
assert(aliases.length>0);
const names=h.progressNames();
for(const alias of aliases){assert(!names.includes(alias),'progress hides alias '+alias);assert(names.includes(h.canonicalExercise(alias)));}
assert(names.includes('My renamed curl'),'custom movements remain selectable');
h.A.routineEdit({});
const builder=h.qolState.modal.innerHTML;
for(const alias of aliases)assert(!builder.includes('<option value="'+alias+'">'),'routine builder hides alias '+alias);
assert(builder.includes('<option value="My renamed curl">'));
assert.deepEqual([...z.errors,...restored.errors],[]);
console.log('Unchanged custom names preserve checks and data; real renames survive reload; routine and progress lists show canonical identities');
