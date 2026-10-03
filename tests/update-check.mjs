import fs from 'node:fs';
import assert from 'node:assert/strict';
const s=fs.readFileSync('app.js','utf8');
assert(s.includes("Update available — tap to reload"));
assert(s.includes("w.postMessage('skip')"));
assert(!s.includes("setTimeout(()=>location.reload(),250)"));
console.log('update prompt regression test passed');
