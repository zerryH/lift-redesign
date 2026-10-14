import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

const z=await boot({...base(),workouts:[workout()]});
const create=z.ctx.document.createElement,dialogs=[];
z.ctx.document.createElement=()=>{const el=create();el.querySelector=z.get;dialogs.push(el);return el;};
const change=z.listeners.change[0],input={id:'imp',value:'first.json',files:[]};
const backup=name=>JSON.stringify({version:4,workouts:[{...workout(),name}],bw:[]});
let resolveFirst;input.files=[{name:'first.json',text:()=>new Promise(resolve=>resolveFirst=resolve)}];
const first=change({target:input});
input.value='second.json';input.files=[{name:'second.json',text:async()=>backup('Second selection')}];
await change({target:input});
assert(dialogs.at(-1).innerHTML.includes('second.json'));
const latest=dialogs.at(-1);
resolveFirst(backup('Obsolete selection'));await first;
assert.equal(dialogs.at(-1),latest,'an older read must not replace review of the latest selected backup');
assert.equal(z.h.S.workouts[0].name,undefined,'reading a file never replaces current workout history');

// Same-file retry is available immediately while an earlier read is pending.
let rejectRead;input.value='retry.json';input.files=[{name:'retry.json',text:()=>new Promise((_r,reject)=>rejectRead=reject)}];
const pending=change({target:input});
assert.equal(input.value,'','the file input clears before asynchronous reading, so the same file can be selected again');
vm.runInContext('importing=true',z.ctx);rejectRead(new Error('Late file error'));await pending;
assert.equal(dialogs.at(-1),latest,'late read errors cannot open UI during data replacement/reset');
vm.runInContext('importing=false',z.ctx);assert.deepEqual(z.errors,[]);
console.log('Backup reads keep the latest selection, permit same-file retries and respect data mutation pauses');
