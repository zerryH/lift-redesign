import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const app=fs.readFileSync('app.js','utf8');
const exercises=JSON.parse(fs.readFileSync('exercises.json','utf8'));
const ranks=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
for(const f of ['app.js','build.mjs'])execFileSync(process.execPath,['--check',f]);
assert(exercises.ex.length>=450,'exercise catalogue should contain 450+ exercises');
const rows=exercises.ex.map(x=>x.split('|'));assert(rows.every(x=>x.length>=4&&x[0]&&x[3]),'exercise catalogue rows need complete fields');
for(const n of ['Cable Lateral Raise','Dumbbell Bicep Curl','Machine Biceps Curl','Incline Dumbbell Curl','Single-Arm Cable Curl','Rope Triceps Pushdown','Bayesian Cable Curl','Standing Cable Chest Press','Single-Arm Lat Pulldown','Cable Glute Kickback','Pallof Press'])assert(rows.some(x=>x[0]===n),`missing common exercise ${n}`);
for(const n of ['Cable Lateral Raise','Dumbbell Bicep Curl','Rope Triceps Pushdown'])assert(ranks.alias[n],`missing benchmark alias ${n}`);
const embedded=app.slice(app.indexOf('const EMBED_X=')+'const EMBED_X='.length,app.indexOf(',EMBED_R='));assert.deepEqual(JSON.parse(embedded),exercises,'offline exercise catalogue differs from exercises.json');
const er=app.indexOf('EMBED_R=');const embeddedRanks=app.slice(er+'EMBED_R='.length,app.indexOf(';',er));assert.deepEqual(JSON.parse(embeddedRanks),ranks,'offline rank aliases differ from ranks-config.json');
for(const marker of ["if(t.id==='age'||t.id==='heightCm')",'exercise-library-panel','exercisePickerResults','qolShowProgress','qolRestStart','qolPlatePlan','qolAgeFactor','heightFactor','savedAt','navigator.wakeLock','MUSCLE_LIFTS','calc:async()=>','muscleStates','rearDelts','sideDelts','tutorialSteps','theme-choices','retryRender','Could not load'])assert(app.includes(marker),`missing app feature ${marker}`);
for(const id of ['frontDelts','sideDelts','chest','biceps','triceps','abs','quads','calves','rearDelts','upperBack','lats','glutes','hamstrings'])assert(app.includes(`['${id}'`)||app.includes(`\"${id}\"`),`anatomy map missing muscle group ${id}`);
assert(app.includes('<figure class="anatomy-figure">${front}<figcaption>Front</figcaption></figure>'),'front anatomy figure missing');
assert(app.includes('<figure class="anatomy-figure">${back}<figcaption>Back</figcaption></figure>'),'back anatomy figure missing');
assert(!app.includes('data-muscle-turn')&&!app.includes('data-muscle-spin')&&!app.includes('muscleAngle'),'old rotation hooks must be removed');assert(app.includes('semantic-anatomy'),'semantic anatomy atlas missing');assert(app.includes('data-muscle=\"chest\"'),'semantic chest path missing');assert(app.includes('data-muscle=\"rearDelts\"'),'semantic rear-delt path missing');assert(!app.includes('viewBox=\"0 0 180 420'),'old mannequin must stay removed');
assert(!app.includes('hpfrei / Z-Anatomy'),'retired GLB attribution must be gone');
function getScript(h,open){const a=h.indexOf(open);assert(a>=0,`missing ${open}`);const start=a+open.length,end=h.indexOf('</script>',start);assert(end>start,'script close missing');return h.slice(start,end)}
for(const n of ['index.html','lift-local.html']){const h=fs.readFileSync(n,'utf8');assert.equal(getScript(h,'<script>'),app,`${n} app is stale`);assert(h.includes('lift-anatomy-map-style'));assert(h.includes('anatomy-pair'));assert(h.includes('<figcaption>Front</figcaption>'));assert(h.includes('<figcaption>Back</figcaption>'));for(const old of ['muscle3d-root','muscle3d-canvas','muscle3d.js','three.min.js','DRACOLoader.js','GLTFLoader.js','body.glb.gz','lift-muscle3d','body-spin'])assert(!h.includes(old),`${n} still contains retired 3D marker ${old}`);assert(!h.includes('user-scalable=no'));assert(h.includes('.exercise-option{'));assert(h.includes('＋ Browse exercise library'));assert(h.includes('lift-icon-192-v2.png'));assert(h.includes('manifest.webmanifest'))}
assert(fs.existsSync('anatomy-map.css'),'anatomy-map.css missing');
const css=fs.readFileSync('anatomy-map.css','utf8');for(const s of ['.anatomy-pair{','.anatomy-figure{','.muscle-zone{','.muscle-zone.locked{'])assert(css.includes(s),`missing anatomy CSS ${s}`);assert(!css.includes('perspective:')&&!css.includes('transform-style:preserve-3d'));
const sw=fs.readFileSync('sw.js','utf8');for(const n of ['index.html','lift-local.html','app.js','exercises.json','ranks-config.json','anatomy-map.css','manifest.webmanifest'])assert(sw.includes(n),`service worker missing ${n}`);for(const old of ['muscle3d.js','three.min.js','GLTFLoader.js','DRACOLoader.js','body.glb.gz'])assert(!sw.includes(old),`service worker still caches ${old}`);
for(const [n,w] of [['lift-icon-192-v2.png',192],['lift-icon-512-v2.png',512],['lift-icon-180-v2.png',180]]){const b=fs.readFileSync(n);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`${n} must be PNG`);assert.equal(b.readUInt32BE(16),w);assert.equal(b.readUInt32BE(20),w)}
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));assert.equal(manifest.display,'standalone');assert(manifest.icons.some(i=>i.src==='./lift-icon-192-v2.png'));
console.log('smoke tests passed: static front/back anatomy map, rank colors, exercise library, profile logic and offline assets');
