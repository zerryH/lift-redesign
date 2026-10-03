import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
assert(source.includes("let saveTail=Promise.resolve(),saveEpoch=0;"),'saves must be serialized to prevent stale IndexedDB writes');
assert(source.includes("const snapshot=JSON.parse(JSON.stringify(S))"),'each queued save must capture an immutable state snapshot');
assert(source.includes("saveEpoch++;await saveTail.catch(()=>false);"),'reset must wait for queued saves before clearing storage');
console.log('persistence race regression guards passed');
