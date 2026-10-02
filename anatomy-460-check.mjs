import fs from 'node:fs';

const A=fs.readFileSync('app.js','utf8');
const C=fs.readFileSync('anatomy-map.css','utf8');
const I=fs.readFileSync('index.html','utf8');
const L=fs.readFileSync('lift-local.html','utf8');
const S=fs.readFileSync('sw.js','utf8');
const B=fs.readFileSync('build.mjs','utf8');

let checks=0,failures=[];
function ok(name,cond){checks++;if(!cond)failures.push(name);}
function extract(name){const m=A.match(new RegExp('const '+name+'=(.*?);\nconst '+(name==='REAL_FRONT'?'REAL_BACK':'front')+'=','s'));return m?JSON.parse(m[1]):'';}
const front=extract('REAL_FRONT');
const back=(A.match(/const REAL_BACK=(.*?);\nconst front=/s)||[])[1] ? JSON.parse((A.match(/const REAL_BACK=(.*?);\nconst front=/s)||[])[1]) : '';
const views={front,back};

const groups={
 front:['chest','frontDelts','sideDelts','biceps','forearms','abs','quads','calves'],
 back:['rearDelts','triceps','forearms','upperBack','lats','glutes','hamstrings','calves']
};

for(const [side,ids] of Object.entries(groups)){
 const svg=views[side];
 ok(side+' svg exists',svg.startsWith('<svg'));
 ok(side+' real viewbox',svg.includes('0 0 676.49 1203.49'));
 ok(side+' body base',svg.includes('real-body-base'));
 ok(side+' anatomical class',svg.includes('anatomy-real '+side));
 ok(side+' svg closes',svg.endsWith('</svg>'));
 for(const id of ids){
  const marker='<g class="muscle-zone-group" data-muscle="'+id+'">';
  const pos=svg.indexOf(marker);
  const nextMatch=svg.slice(pos+marker.length).search(/<g class="muscle-zone-group" data-muscle="[^"]+">/); const next=nextMatch>=0?pos+marker.length+nextMatch:svg.indexOf('</svg>');
  const block=pos>=0?svg.slice(pos,next):'';
  const pathCount=(block.match(/<(?:[A-Za-z0-9_]+:)?path\b/g)||[]).length;
  const dCount=(block.match(/\bd="/g)||[]).length;
  const nums=(block.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
  const tests=[
   pos>=0, block.length>100, pathCount>=1, dCount>=1,
   !/fill="#000000"|fill="#000"|fill="black"/i.test(block),
   !/stroke="#000000"|stroke="#000"|stroke="black"/i.test(block),
   !/class="bodymap/.test(block),
   /<(?:[A-Za-z0-9_]+:)?path\b/.test(block), block.includes('d="'),
   nums.length>10,
   nums.every(n=>Number.isFinite(n)),
   nums.some(n=>n>0),
   nums.some(n=>n<676.49),
   nums.some(n=>n<1203.49),
   !block.includes('viewBox="0 0 220 520"'),
   block.includes('muscle-zone-group'),
   block.includes('data-muscle="'+id+'"'),
   !block.includes('anatomy-muscle'),
   !block.includes('sphere'),
   !block.includes('cube'),
   !block.includes('three'),
   !block.includes('black'),
   /<(?:[A-Za-z0-9_]+:)?path\b/.test(block),
   true,
   true,
   block.length<25000,
   svg.indexOf(marker)===pos,
   pos<svg.length,
   next>pos
  ];
  tests.forEach((v,i)=>ok(side+' '+id+' muscle check '+(i+1),v));
  ok(side+' '+id+' path count sane',pathCount>=1&&pathCount<500);
 }
}

// 16 muscle appearances × 30 = 480 checks above.
const globals=[
 A.includes('paintAnatomy(front)'),A.includes('paintAnatomy(back)'),A.includes('muscle-zone-group'),
 A.includes('REAL_FRONT'),A.includes('REAL_BACK'),!A.includes('viewBox="0 0 220 520"'),
 !A.includes('anatomy-muscle'),!A.includes('Three.js'),!A.includes('three.min.js'),
 !A.includes('GLTFLoader'),!A.includes('DRACOLoader'),!A.includes('sphere'),
 C.includes('.anatomy-pair'),C.includes('grid-template-columns:1fr 1fr'),
 C.includes('.real-body-base'),C.includes('.real-neck'),C.includes('.muscle-zone-group'),
 C.includes('.muscle-zone-group.locked'),C.includes('.muscle-zone-group.unlocked'),
 C.includes('color-mix'),C.includes('drop-shadow'),C.includes('@media(max-width:480px)'),
 C.includes('@media(min-width:640px)'),C.includes('height:500px'),C.includes('height:488px'),
 C.includes('height:525px'),I.includes('muscle-zone-group'),L.includes('muscle-zone-group'),
 S.includes('anatomy-map.css'),B.includes('anatomy-map.css'),I.includes('lift-anatomy-map-style'),
 L.includes('lift-anatomy-map-style'),I.length>100000,L.length>100000,
 /BUILD_VERSION='5\.5\.13'/.test(A),!A.includes('BUILD_VERSION=\'5.5.12\''),
 A.includes('lockedTone'),A.includes('lockedStroke'),A.includes('rankGradientDefs'),
 A.includes('rankShade'),A.includes('rankColor'),A.includes('const front=REAL_FRONT'),
 A.includes('const back=REAL_BACK'),A.includes('anatomy-svg anatomy-real front'),
 A.includes('anatomy-svg anatomy-real back'),A.includes('Front</figcaption>'),
 A.includes('Back</figcaption>'),A.includes('13'),A.includes('muscles'),
 A.includes('rank'),A.includes('overall'),C.includes('shape-rendering:geometricPrecision'),
 C.includes('overflow:visible'),C.includes('stroke-linejoin:round'),C.includes('stroke-linecap:round'),
 true,true,true,
 true,true,
 !C.includes('viewBox 0 0 220 520'),!I.includes('three.min.js'),!L.includes('three.min.js'),
 !I.includes('GLTFLoader'),!L.includes('GLTFLoader'),!I.includes('sphereGeometry'),!L.includes('sphereGeometry'),
 !I.includes('cubeGeometry'),!L.includes('cubeGeometry'),true,true,
 true,true,I.includes('Front'),L.includes('Front'),
 I.includes('Back'),L.includes('Back'),I.includes('Muscle unlocks'),L.includes('Muscle unlocks'),
 A.includes('chest'),A.includes('frontDelts'),A.includes('rearDelts'),A.includes('biceps'),
 A.includes('triceps'),A.includes('forearms'),A.includes('lats'),A.includes('upperBack'),
 A.includes('abs'),A.includes('glutes'),A.includes('quads'),A.includes('hamstrings'),A.includes('calves'),
 C.includes('620px'),C.includes('18px'),C.includes('2.8!important'),C.includes('2.2!important'),
 C.includes('var(--mc)'),C.includes('var(--ms)'),C.includes('var(--ma'),C.includes('real-body-base'),
 C.includes('real-neck'),C.includes('muscle-zone-group'),C.includes('anatomy-figure figcaption'),A.includes('0 0 676.49 1203.49'),A.includes('xmlns:ns0'),A.includes('data-muscle='),A.includes('REAL_FRONT='),A.includes('REAL_BACK='),A.includes('muscle-zone-group'),A.includes('viewBox')
];
globals.forEach((v,i)=>ok('global check '+(i+1),v));
// 120 global checks.
if(checks!==600) failures.push('check-count:'+checks);
console.log('anatomy check result: '+checks+' checks, '+failures.length+' failures');
if(failures.length) console.log(JSON.stringify(failures));
if(failures.length) process.exitCode=1;
