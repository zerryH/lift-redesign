import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const app=fs.readFileSync('app.js','utf8');
const renderer=fs.readFileSync('muscle3d.js','utf8');
const exercises=JSON.parse(fs.readFileSync('exercises.json','utf8'));
const ranks=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
for(const f of ['app.js','muscle3d.js','build.mjs'])execFileSync(process.execPath,['--check',f]);
assert(exercises.ex.length>=300,'exercise catalogue should contain 300+ exercises');
const rows=exercises.ex.map(x=>x.split('|'));assert(rows.every(x=>x.length>=4&&x[0]&&x[3]),'exercise catalogue rows need complete fields');
for(const n of ['Cable Lateral Raise','Dumbbell Bicep Curl','Machine Biceps Curl','Incline Dumbbell Curl','Single-Arm Cable Curl','Rope Triceps Pushdown','Bayesian Cable Curl'])assert(rows.some(x=>x[0]===n),`missing common exercise ${n}`);
for(const n of ['Cable Lateral Raise','Dumbbell Bicep Curl','Rope Triceps Pushdown'])assert(ranks.alias[n],`missing benchmark alias ${n}`);
const embedded=app.slice(app.indexOf('const EMBED_X=')+'const EMBED_X='.length,app.indexOf(',EMBED_R='));assert.deepEqual(JSON.parse(embedded),exercises,'offline exercise catalogue differs from exercises.json');
const er=app.indexOf('EMBED_R=');const embeddedRanks=app.slice(er+'EMBED_R='.length,app.indexOf(';',er));assert.deepEqual(JSON.parse(embeddedRanks),ranks,'offline rank aliases differ from ranks-config.json');
for(const marker of ["if(t.id==='age'||t.id==='heightCm')",'exercise-library-panel','exercisePickerResults','qolShowProgress','qolRestStart','qolPlatePlan','qolAgeFactor','heightFactor','savedAt','navigator.wakeLock','MUSCLE_LIFTS','muscleStates','rearDelts','tutorialSteps','theme-choices','retryRender','Could not load'])assert(app.includes(marker),`missing app feature ${marker}`);
for(const marker of ['new T.WebGLRenderer','new T.PerspectiveCamera','new T.SphereGeometry(1,32,24)','pointerdown','pointermove','data-muscle-turn','rankStyle','HemisphereLight','DirectionalLight','muscle3d-root','ACESFilmicToneMapping'])assert(renderer.includes(marker),`new procedural 3D renderer missing ${marker}`);
for(const id of ['frontDelts','chest','biceps','triceps','abs','quads','calves','rearDelts','upperBack','lats','glutes','hamstrings'])assert(renderer.includes(`'${id}'`),`3D model missing muscle group ${id}`);
assert(!renderer.includes('GLTFLoader')&&!renderer.includes('DRACOLoader')&&!renderer.includes('body.glb.gz')&&!renderer.includes('LIFT_ANATOMY_GZ_BASE64'),'new model must not depend on old GLB/DRACO pipeline');
function getScript(h,open){const a=h.indexOf(open);assert(a>=0,`missing ${open}`);const start=a+open.length,end=h.indexOf('</script>',start);assert(end>start,'script close missing');return h.slice(start,end)}
for(const n of ['index.html','lift-local.html']){const h=fs.readFileSync(n,'utf8');assert.equal(getScript(h,'<script>'),app,`${n} app is stale`);assert.equal(getScript(h,'<script id="lift-muscle3d">'),renderer,`${n} model is stale`);assert(h.includes('lift-procedural-3d-style'));assert(!h.includes('DRACOLoader.js')&&!h.includes('GLTFLoader.js')&&!h.includes('body.glb.gz'),'legacy model dependencies remain in HTML');assert(!h.includes('user-scalable=no'));assert(h.includes('.exercise-option{'));assert(h.includes('＋ Browse exercise library'));assert(h.includes('lift-icon-192-v2.png'));assert(h.includes('manifest.webmanifest'));}
const hosted=fs.readFileSync('index.html','utf8'),local=fs.readFileSync('lift-local.html','utf8');assert(hosted.includes('<script src="./three.min.js"></script>'),'hosted app must load Three.js');assert(local.includes('<script id="lift-three-runtime">'),'standalone HTML must embed Three.js');assert(!local.includes('<script src="./three.min.js"></script>'),'standalone should not need a separate Three.js file');
const sw=fs.readFileSync('sw.js','utf8');for(const n of ['index.html','lift-local.html','muscle3d.js','three.min.js','manifest.webmanifest'])assert(sw.includes(n),`service worker missing ${n}`);assert(!sw.includes('body.glb.gz')&&!sw.includes('GLTFLoader.js')&&!sw.includes('DRACOLoader.js'),'service worker still precaches old model');
for(const [n,w] of [['lift-icon-192-v2.png',192],['lift-icon-512-v2.png',512],['lift-icon-180-v2.png',180]]){const b=fs.readFileSync(n);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`${n} must be PNG`);assert.equal(b.readUInt32BE(16),w);assert.equal(b.readUInt32BE(20),w)}
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));assert.equal(manifest.display,'standalone');assert(manifest.icons.some(i=>i.src==='./lift-icon-192-v2.png'));
console.log('smoke tests passed: procedural 3D model, rank groups, standalone build, exercise library, profile logic and offline assets');
