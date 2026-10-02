import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const app=fs.readFileSync('app.js','utf8');
const ex=JSON.parse(fs.readFileSync('exercises.json','utf8'));
const ranks=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const local=fs.readFileSync('lift-local.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

function marker(name){
  const re=new RegExp('/\\*BEGIN:'+name+'\\*/([\\s\\S]*?)/\\*END:'+name+'\\*/');
  const m=app.match(re);
  assert(m, 'missing '+name+' marker');
  return JSON.parse(m[1]);
}
const embeddedEx=marker('EXERCISES');
const embeddedRanks=marker('RANKS');

assert.deepEqual(embeddedEx, ex, 'embedded exercises != exercises.json');
assert.deepEqual(embeddedRanks, ranks, 'embedded ranks != ranks-config.json');
assert.equal(ranks.tiers.length,46,'rank tiers must be 46');
assert.equal(Object.keys(ranks.t).length,460,'rank standards must be 460');
for(const [name,sets] of Object.entries(ranks.t)){
  assert(Array.isArray(sets) && sets.length===2, 'bad standard: '+name);
  for(const sex of sets){
    assert(Array.isArray(sex) && sex.length===46,'standard does not have 46 tiers: '+name);
    assert(sex.every(Number.isFinite),'non-finite rank threshold: '+name);
  }
}
assert.equal((html.match(/<style id="lift-anatomy-map-style">/g)||[]).length,1,'index anatomy CSS must occur once');
assert.equal((local.match(/<style id="lift-anatomy-map-style">/g)||[]).length,1,'local anatomy CSS must occur once');
assert.equal(html,local,'index.html and lift-local.html must be identical');
assert(!/three.min.js|DRACOLoader|GLTFLoader|lift-muscle3d|lift-three-runtime|lift-anatomy-data|lift-procedural-3d-style|Real WebGL muscle model/.test(fs.readFileSync('build.mjs','utf8')),'build contains dead 3D cleanup');
const v=(app.match(/const BUILD_VERSION='([^']+)'/)||[])[1];
assert(v,'missing BUILD_VERSION');
assert(sw.includes("const V='liftlog-v"+v+"-"),'service worker version mismatch');
assert.equal((html.match(/BUILD_VERSION='([^']+)'/)||[])[1],v,'HTML version mismatch');

const before={};
for(const n of ['app.js','index.html','lift-local.html','sw.js']) before[n]=fs.readFileSync(n);
execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});
const after1={};
for(const n of Object.keys(before)) after1[n]=fs.readFileSync(n);
execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});
for(const n of Object.keys(before)) assert.deepEqual(after1[n],fs.readFileSync(n), 'build is not idempotent: '+n);

console.log('smoke ok');
