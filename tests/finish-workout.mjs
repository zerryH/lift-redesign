import fs from 'node:fs';
import assert from 'node:assert/strict';
const s=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
assert.match(s,/const tiers=\(\)=>Object\.fromEntries\(Object\.entries\(bests\(\)\)\.map\(\(\[n,e\]\)=>\[n,tier\(n,e\)\]\)\);/);
assert.match(s,/fin:\(\)=>\{const a=tiers\(\),done=S\.cur;/);
console.log('finish-workout regression passed · tiers helper is defined before A.fin');
