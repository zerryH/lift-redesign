/* One release gate: source tests, reproducible data/build, then real browsers. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const outputs=['app.js','index.html','lift-local.html','sw.js','version.json'];
const before=outputs.map(p=>fs.readFileSync(p));
function run(script,args=[]){
 const r=spawnSync(process.execPath,[script,...args],{stdio:'inherit',env:process.env});
 if(r.status!==0){if(r.error)console.error(r.error);process.exit(r.status||1);}
}
run('tools/check-editor.mjs');
run('tools/test-release.mjs');
run('tools/generate-rank-standards-v9.mjs',['--check']);
run('build.mjs');
outputs.forEach((p,i)=>assert(before[i].equals(fs.readFileSync(p)),'Stale generated output: '+p));
run('tools/test-browser.mjs');
console.log('Release gate passed. Physical-device and product approval gates remain separate.');
