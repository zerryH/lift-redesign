import assert from 'node:assert/strict';
import {boot} from './support/runtime.mjs';

const z=await boot();
const appended=[];
z.ctx.document.body.append=element=>appended.push(element);

const exported={app:'slat',version:4,date:'2026-10-13',workouts:[],bw:[]};
const input={
  id:'imp',
  files:[{
    name:'slat-backup-2026-10-13.json',
    // A backup can legitimately cross the former 25 MiB gate as history grows.
    size:25*1024*1024+1,
    text:async()=>JSON.stringify(exported)
  }],
  value:'selected'
};

for(const listener of z.listeners.change||[])await listener({target:input});

assert(appended.some(element=>String(element.className).includes('action-modal')),'a valid large backup must reach the review screen');
assert.equal(appended.some(element=>element.className==='toast'),false,'a valid large backup must not be rejected by an arbitrary byte ceiling');
assert.equal(input.value,'','the file input is reset after processing');
assert.deepEqual(z.errors,[]);
console.log('valid large backup files reach review without an export/import size mismatch');
