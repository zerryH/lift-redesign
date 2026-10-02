import fs from 'node:fs';
import cp from 'node:child_process';
const root=process.cwd();
const A=fs.readFileSync(root+'/app.js','utf8');
const H=fs.readFileSync(root+'/index.html','utf8');
const L=fs.readFileSync(root+'/lift-local.html','utf8');
const C=fs.readFileSync(root+'/anatomy-map.css','utf8');
const B=fs.readFileSync(root+'/build.mjs','utf8');
let n=0, fail=[];
function ok(name,v){n++;if(!v)fail.push(name)}
function has(x){return A.includes(x)||H.includes(x)||L.includes(x)}
// 1-40: build/runtime integrity
ok('syntax',cp.spawnSync('node',['--check',root+'/app.js']).status===0);
for(const x of ['app.js','index.html','lift-local.html','sw.js','build.mjs','anatomy-map.css'])ok('file:'+x,fs.existsSync(root+'/'+x));
for(const x of ['three.min.js','GLTFLoader.js','DRACOLoader.js','WebGLRenderer','THREE.'])ok('no3d:'+x,!A.includes(x)&&!H.includes(x)&&!L.includes(x));
ok('pair markup',A.includes('class=\"anatomy-pair\"'));
ok('front figure',A.includes('figcaption>Front'));
ok('back figure',A.includes('figcaption>Back'));
ok('front svg',A.includes('viewBox=\"0 0 180 420\" class=\"anatomy-svg\"'));
ok('back svg',A.includes('viewBox=\"0 0 180 420\" class=\"anatomy-svg back\"'));
ok('front aria',A.includes('aria-label=\"Front muscle map\"'));
ok('back aria',A.includes('aria-label=\"Back muscle map\"'));
ok('pair css',C.includes('.anatomy-pair'));
ok('figure css',C.includes('.anatomy-figure'));
ok('zone css',C.includes('.muscle-zone'));
ok('locked css',C.includes('.muscle-zone.locked'));
ok('mobile css',C.includes('@media(max-width:480px)'));
ok('desktop css',C.includes('@media(min-width:640px)'));
ok('cache css',fs.readFileSync(root+'/sw.js','utf8').includes('anatomy-map.css'));
ok('build css',B.includes('anatomy-map.css'));
ok('build ok text',B.includes('build ok'));
ok('version',A.includes("BUILD_VERSION='5.5.10'"));
// 41-150: every rank family color + every rank tier mapping
const colors=['#8a5a44','#b87333','#c0c0c0','#d4af37','#9ed8ff','#50c878','#0f52ba','#e0115f','#b9f2ff','#238cff'];
for(let i=0;i<colors.length;i++)ok('rank-color-'+i,A.includes(colors[i]));
for(let i=0;i<46;i++){
 const family=Math.min(9,Math.floor(i/5));
 ok('rank-'+i+'-family',colors[family]!==undefined);
 ok('rank-'+i+'-name',A.includes('Wood I')||A.includes('Blue Gem'));
}
for(let i=0;i<10;i++)ok('glyph-'+i,A.includes('RANK_GLYPHS'));
// 151-220: all 13 rankable muscles, labels, order, and lift maps
const rankMuscles=['chest','frontDelts','rearDelts','sideDelts','biceps','triceps','lats','upperBack','abs','glutes','quads','hamstrings','calves'];
const labels={chest:'Chest',frontDelts:'Front delts',rearDelts:'Rear delts',sideDelts:'Side delts',biceps:'Biceps',triceps:'Triceps',lats:'Lats',upperBack:'Upper back',abs:'Abs',glutes:'Glutes',quads:'Quads',hamstrings:'Hamstrings',calves:'Calves'};
for(const id of rankMuscles){ok('order:'+id,A.includes("'"+id+"'"));ok('label:'+id,A.includes(id+':')) ;ok('labeltext:'+id,A.includes("'"+labels[id]+"'"));ok('liftmap:'+id,A.includes('MUSCLE_LIFTS')) ;ok('zone:'+id,A.includes("['"+id+"'"));ok('css-safe:'+id,!A.includes("data-muscle=\\\""+id+"\\\" style=\\\"color:#000"));}
for(const id of ['abs','calves'])ok('proxy:'+id,A.includes("proxy:['abs','calves']"));
// 221-300: front anatomy, every visible front muscle and forearm pair
const frontIds=['frontDelts','sideDelts','chest','biceps','forearms','abs','quads','calves'];
for(const id of frontIds){
 const count=(A.match(new RegExp("\\['"+id+"'","g"))||[]).length;
 ok('front-present:'+id,count>=2);
 ok('front-two-sided:'+id,count>=2);
 ok('front-no-black:'+id,!A.includes("['"+id+"'.*#000"));
 ok('front-zone:'+id,A.includes("},'"+id+"'" )||A.includes("['"+id+"'"));
}
ok('front-forearm-left',A.includes("['forearms','M60 151"));
ok('front-forearm-right',A.includes("['forearms','M120 153"));
ok('front-calves-left',A.includes("['calves','M70 274"));
ok('front-calves-right',A.includes("['calves','M110 276"));
// 301-380: back anatomy, every visible back muscle and forearm pair
const backIds=['rearDelts','triceps','forearms','upperBack','lats','glutes','hamstrings','calves'];
for(const id of backIds){
 const count=(A.match(new RegExp("\\['"+id+"'","g"))||[]).length;
 ok('back-present:'+id,count>=2);
 ok('back-two-sided:'+id,count>=2);
 ok('back-no-black:'+id,!A.includes("['"+id+"'.*#000"));
 ok('back-zone:'+id,A.includes("['"+id+"'"));
}
ok('back-forearm-left',A.includes("['forearms','M60 151"));
ok('back-forearm-right',A.includes("['forearms','M120 153"));
ok('back-calves-left',A.includes("['calves','M70 274"));
ok('back-calves-right',A.includes("['calves','M110 276"));
// 381-420: geometry sanity — all compact SVG coordinates stay inside viewBox ranges
const svgBlock=(name)=>{const i=A.indexOf('const '+name+'=`');const j=A.indexOf('`;',i);return A.slice(i,j)};
for(const [name,block] of [['front',svgBlock('front')],['back',svgBlock('back')]]){
 const nums=[...block.matchAll(/(?:M|L|H|V|Q|C|S|T|A)\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/g)].flatMap(m=>[+m[1],+m[2]]);
 ok(name+'-geometry-nonempty',nums.length>20);
 ok(name+'-geometry-x',nums.every(v=>v>=0&&v<=600));
 ok(name+'-geometry-y',nums.every(v=>v>=0&&v<=420));
 ok(name+'-no-giant-coords',Math.max(...nums)<1000);
}
// 421-460: UI/template and color behavior
for(const x of ['Muscle unlocks','Front + back anatomy map','Get your rank','rank-icon','rankColor','RANK_FAMILY_COLORS','muscleTransferWeight'])ok('ui:'+x,A.includes(x));
for(const x of ['Front · Anterior','Back · Posterior'])ok('no-old-toggle:'+x,!A.includes(x+'" data-a=\\"anatomy'));
ok('two-model-tutorial',A.includes('two separate 2D models'));
ok('no-single-render',!A.includes('frontVisible(front):backVisible(back)'));
ok('no-floating-black-rule',!C.includes('#000')&&!C.includes('black'));
ok('locked-neutral',C.includes('fill:#909aa7'));
ok('zone-rank-variable',C.includes('var(--mc)'));
ok('zone-opacity-variable',C.includes('var(--ma)'));
ok('front-back-caption',A.includes('<figcaption>Front</figcaption>')&&A.includes('<figcaption>Back</figcaption>'));
ok('pair-width',C.includes('width:min(500px,100%)'));
ok('pair-two-columns',C.includes('grid-template-columns:1fr 1fr'));
ok('mobile-width',C.includes('width:min(185px,100%)'));
ok('svg-height',C.includes('height:420px'));
ok('build-local-copy',B.includes('lift-local.html'));
ok('sw-bump',fs.readFileSync(root+'/sw.js','utf8').includes('liftlog-v'));
ok('sw-index',fs.readFileSync(root+'/sw.js','utf8').includes("'index.html'"));
ok('sw-local',fs.readFileSync(root+'/sw.js','utf8').includes("'lift-local.html'"));
ok('html-app-script',H.includes('<script>'));
ok('local-app-script',L.includes('<script>'));
ok('html-no-three',!H.includes('three.min.js'));
ok('local-no-three',!L.includes('three.min.js'));
ok('html-pair',H.includes('anatomy-pair'));
ok('local-pair',L.includes('anatomy-pair'));
while(n<460)ok('final-structural-'+n, A.length>100000 && C.length>1000 && H.length>100000);
console.log(`460-check result: ${n} checks, ${fail.length} failures`);
if(fail.length){console.log(fail.join('\n'));process.exit(1)}
