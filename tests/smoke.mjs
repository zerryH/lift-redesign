import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const app=fs.readFileSync('app.js','utf8');
execFileSync(process.execPath,['--check','app.js']);
for(const n of ['index.html','lift-local.html']){const h=fs.readFileSync(n,'utf8'),m=h.match(/<script[^>]*>([\s\S]*?)<\/script>/);assert(m,`${n} missing inline app`);execFileSync(process.execPath,['--check'],{input:m[1]});assert(!h.includes('user-scalable=no'));assert(h.includes('.row>.toggle{width:auto;flex:0 0 auto;min-width:88px'));assert(h.includes('.add{align-items:center}'));assert(!h.includes('.toggle{width:100%'));}
const idx=fs.readFileSync('index.html','utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];const loc=fs.readFileSync('lift-local.html','utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];assert.equal(idx,loc);
for(const marker of ['qolShowProgress','qolRestStart','qolPlatePlan','qolAgeFactor','heightFactor','S.editingId','savedAt','navigator.wakeLock','MUSCLE_LIFTS','muscleStates','rearDelts','tutorialSteps','theme-choices','body-spin','credits-card','retryRender','Could not load','skinFace','skinBackFace','aria-label=\"Front body muscle map\"'])assert(app.includes(marker),`missing ${marker}`);
const ageExpr=app.match(/const qolAgeFactor=([\s\S]*?);\s*const heightFactor=/)[1].replace(/;\s*$/,'');const age=Function(`return (${ageExpr})`)();assert(Math.abs(age(40)-1)<1e-9);assert(Math.abs(age(45)-.975)<1e-9);assert(Math.abs(age(70)-.85)<1e-9);assert.equal(age(45,false),1);
assert(app.includes("Math.pow(175/n,.15)"));
const plateExpr=app.match(/const qolPlatePlan=([\s\S]*?);\s*const qolRankedNames=/)[1].replace(/;\s*$/,'');const plate=Function('const num=v=>parseFloat(String(v).replace(\',\',\'.\'))||0;return ('+plateExpr+')')();const pr=plate(100,20);assert.equal(pr.side,40);assert(pr.exact);assert.deepEqual(pr.plates,[{plate:25,count:1},{plate:15,count:1}]);
console.log('smoke tests passed');
