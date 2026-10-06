import fs from 'node:fs';
import assert from 'node:assert/strict';
for(const file of ['app.js','index.html','lift-local.html']){
 const s=fs.readFileSync(file,'utf8');
 assert.doesNotMatch(s,/[ÃÂâð][\u0080-\u00bf]/,`${file} contains mojibake`);
 assert.doesNotMatch(s,/�/,`${file} contains replacement characters`);
}
console.log('text encoding safety: ok');
