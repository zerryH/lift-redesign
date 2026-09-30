import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const app=fs.readFileSync('app.js','utf8');
execFileSync(process.execPath,['--check','app.js']);
for(const n of ['index.html','lift-local.html']){const h=fs.readFileSync(n,'utf8'),m=h.match(/<script[^>]*>([\s\S]*?)<\/script>/);assert(m,`${n} missing inline app`);fs.writeFileSync('/tmp/lift-inline.js',m[1]);execFileSync(process.execPath,['--check','/tmp/lift-inline.js']);assert(!h.includes('user-scalable=no'));}
const idx=fs.readFileSync('index.html','utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];const loc=fs.readFileSync('lift-local.html','utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];assert.equal(idx,loc);
for(const marker of ['qolShowProgress','qolRestStart','qolPlatePlan','qolAgeFactor','bestBW','S.editingId','savedAt','navigator.wakeLock'])assert(app.includes(marker),`missing ${marker}`);
const age=Function(`return (${app.match(/const qolAgeFactor=(.*?);\nconst ageFactor=/s)[1]})`)();assert(Math.abs(age(40)-1)<1e-9);assert(Math.abs(age(45)-.975)<1e-9);assert(Math.abs(age(70)-.85)<1e-9);assert.equal(age(45,false),1);
const plateSrc=app.match(/const qolPlatePlan=(.*?);\nconst qolRankedNames=/s)[1];const plate=Function('const num=v=>parseFloat(String(v).replace(\',\',\'.\'))||0;return ('+plateSrc+')')();const pr=plate(100,20);assert.equal(pr.side,40);assert(pr.exact);assert.deepEqual(pr.plates,[{plate:25,count:1},{plate:15,count:1}]);
console.log('smoke tests passed');
