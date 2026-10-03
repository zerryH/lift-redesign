import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const app=fs.readFileSync('app.js','utf8');
const ex=JSON.parse(fs.readFileSync('exercises.json','utf8'));
const ranks=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const local=fs.readFileSync('lift-local.html','utf8');
const build=fs.readFileSync('build.mjs','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));

function marker(name){
  const re=new RegExp('/\\*BEGIN:'+name+'\\*/([\\s\\S]*?)/\\*END:'+name+'\\*/');
  const m=app.match(re); assert(m,'missing '+name+' marker'); return JSON.parse(m[1]);
}
assert.deepEqual(marker('EXERCISES'),ex,'embedded exercises differ from exercises.json');
assert.deepEqual(marker('RANKS'),ranks,'embedded ranks differ from ranks-config.json');
assert(ex.ex.length>0,'exercise catalogue must not be empty');
assert.equal(new Set(ex.ex.map(x=>x.split('|')[0])).size,ex.ex.length,'duplicate exercise names');
assert(ranks.tiers.length>0,'rank tier count');
assert(Object.keys(ranks.t).length>0,'rank standard count');
for(const [name,sexes] of Object.entries(ranks.t)){
  assert.equal(sexes.length,2,'standard must have two benchmark sets: '+name);
  for(const sex of sexes){assert.equal(sex.length,46,'standard tier length: '+name);assert(sex.every(Number.isFinite),'non-finite threshold: '+name)}
}
assert.equal((html.match(/<style id="lift-anatomy-map-style">/g)||[]).length,1,'index anatomy CSS count');
assert.equal((local.match(/<style id="lift-anatomy-map-style">/g)||[]).length,1,'local anatomy CSS count');
assert.equal(html,local,'generated HTML files differ');
assert(!/three\.min\.js|DRACOLoader|GLTFLoader|lift-muscle3d|lift-three-runtime|lift-anatomy-data|lift-procedural-3d-style|Real WebGL muscle model/.test(build),'dead 3D cleanup remains in build');
assert(!/5\.5\.(14|15|16|17|18|19|20|21|22|23)\b/.test(app+build+html+local+sw),'stale release version string remains');
const version=(app.match(/const BUILD_VERSION='([^']+)'/)||[])[1];assert(version,'missing BUILD_VERSION');
assert(build.includes("const BUILD_VERSION = '"+version+"';"),'build version mismatch');
assert(html.includes("BUILD_VERSION='"+version+"'"),'HTML version mismatch');
assert(sw.includes("const V='liftlog-v"+version+"-"),'SW version prefix mismatch');
assert.equal(manifest.icons.length,1);assert.equal(manifest.icons[0].src,'./lift-icon-photo-fit.png');
assert(html.includes('apple-touch-icon') && html.includes('lift-icon-photo-fit.png'));
assert(!html.includes('lift-icon-v2.svg')&&!html.includes('lift-icon-192-v2.png')&&!html.includes('lift-icon-512-v2.png'),'stale icon refs remain');

const s=app.indexOf('const REAL_FRONT='); const e=app.indexOf(';const front=REAL_FRONT;',s);
assert(s>=0&&e>s,'anatomy string boundary missing');
const ctx={};vm.createContext(ctx);vm.runInContext(app.slice(s,e)+';globalThis.svg={front:REAL_FRONT,back:REAL_BACK};',ctx);
const pref=(svg,p)=>{const used={};return svg.replace(/id="([^"]+)"/g,(m,id)=>{const base=p+id,n=(used[base]||0)+1;used[base]=n;return 'id="'+base+(n>1?'-'+n:'')+'"'});};
const ids=svg=>[...svg.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
const gradients=p=>Array.from({length:46},(_,i)=>p+'rank-grad-'+i);const front=pref(ctx.svg.front,'front-')+gradients('front-').map(id=>'<linearGradient id="'+id+'"></linearGradient>').join(''),back=pref(ctx.svg.back,'back-')+gradients('back-').map(id=>'<linearGradient id="'+id+'"></linearGradient>').join('');
assert.equal(new Set(ids(front)).size,ids(front).length,'duplicate front SVG IDs');
assert.equal(new Set(ids(back)).size,ids(back).length,'duplicate back SVG IDs');
const both=ids(front).concat(ids(back));assert.equal(new Set(both).size,both.length,'front/back SVG ID collision');
const grads=both.filter(id=>id.includes('rank-grad-'));assert(grads.length>=92,'rank gradient IDs were not namespaced');

const before={};for(const n of ['app.js','index.html','lift-local.html','sw.js'])before[n]=fs.readFileSync(n);
execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});
const once={};for(const n of Object.keys(before))once[n]=fs.readFileSync(n);
execFileSync(process.execPath,['build.mjs'],{stdio:'pipe'});
for(const n of Object.keys(before))assert.deepEqual(once[n],fs.readFileSync(n),'build not idempotent: '+n);
console.log('smoke ok · architecture + ranks + state/build hygiene');
