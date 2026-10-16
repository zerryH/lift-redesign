import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const freshHash=()=>crypto.createHash('sha256').update([
  fs.readFileSync('sw.js','utf8').replace(/const V='[^']+',F=/,"const V='BUILD_CACHE',F="),
  fs.readFileSync('app.js','utf8'),fs.readFileSync('styles.css','utf8'),fs.readFileSync('index.html','utf8'),fs.readFileSync('exercises.json','utf8'),
  fs.readFileSync('ranks-config.json','utf8'),fs.readFileSync('ranking-engine.js','utf8'),fs.readFileSync('data-integrity.js','utf8'),fs.readFileSync('recovery-contract.js','utf8'),fs.readFileSync('recovery-store.js','utf8'),fs.readFileSync('diagnostics-contract.js','utf8'),fs.readFileSync('diagnostics-view.js','utf8'),fs.readFileSync('catalogue-model.js','utf8'),fs.readFileSync('performance-contract.js','utf8'),fs.readFileSync('persistence.js','utf8'),fs.readFileSync('workout-model.js','utf8'),fs.readFileSync('dialog-view.js','utf8'),fs.readFileSync('enhanced-features.js','utf8'),fs.readFileSync('rest-notifications.js','utf8'),fs.readFileSync('native-rest.js','utf8'),fs.readFileSync('anatomy-map.css','utf8'),fs.readFileSync('manifest.webmanifest','utf8'),fs.readFileSync('lift-icon-photo-fit.png').toString('base64'),fs.readFileSync('apple-touch-icon-photo-fit.png').toString('base64')
].join('\n')).digest('hex').slice(0,12);

const ex=JSON.parse(fs.readFileSync('exercises.json','utf8'));
const ranks=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
assert(ex.ex.length>0,'catalogue must not be empty');
assert.equal(new Set(ex.ex.map(x=>x.split('|')[0])).size,ex.ex.length,'catalogue names must be unique');
assert(Object.keys(ranks.t).length>0,'rank standards must not be empty');
assert(!/469|471/.test(fs.readFileSync('build.mjs','utf8')),'build must not hardcode obsolete catalogue counts');

const before=fs.readFileSync('sw.js','utf8');
const m=before.match(/const V='liftlog-v[^-]+-([0-9a-f]{12})'/);
assert(m,'service worker cache hash missing');
assert.equal(m[1],freshHash(),'service worker cache hash is stale before/after build');

const persistSource=fs.readFileSync('app.js','utf8');
assert(persistSource.includes('const p=navigator.storage?.persist?.();') && persistSource.includes('p.catch(()=>{})'),'storage.persist rejection is not handled');

execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});
const after=fs.readFileSync('sw.js','utf8');
const am=after.match(/const V='liftlog-v[^-]+-([0-9a-f]{12})'/);
assert(am,'service worker cache hash missing after build');
assert.equal(am[1],freshHash(),'built service worker hash does not equal freshly computed hash');
fs.writeFileSync('sw.js',after+'\n// Worker-only change probe.\n');
try{execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});assert.notEqual(JSON.parse(fs.readFileSync('version.json','utf8')).cache,'liftlog-v'+JSON.parse(fs.readFileSync('version.json','utf8')).version+'-'+am[1],'worker-only changes get a new cache identity');}
finally{fs.writeFileSync('sw.js',after);execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});}
// A stale asset list is corrected and hashed from the same final bytes in one build.
fs.writeFileSync('sw.js',after.replace("'recovery-contract.js',",''));
try{execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});const worker=fs.readFileSync('sw.js','utf8');assert(worker.includes("'recovery-contract.js'"));assert.equal(worker.match(/const V='liftlog-v[^-]+-([0-9a-f]{12})'/)[1],freshHash(),'asset-list edits must not require a second build');}
finally{fs.writeFileSync('sw.js',after);execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});}
console.log('build safety ok · derived catalogue validation + exact SW hash + persist handling');
