import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const A=fs.readFileSync('app.js','utf8');
const C=fs.readFileSync('anatomy-map.css','utf8');
const I=fs.readFileSync('index.html','utf8');
const L=fs.readFileSync('lift-local.html','utf8');
const S=fs.readFileSync('sw.js','utf8');

let checks=0,failures=[];
const ok=(name,cond)=>{checks++;if(!cond)failures.push(name)};
const fm=A.match(/const REAL_FRONT=(.*?);\nconst REAL_BACK=/s);
const bm=A.match(/const REAL_BACK=(.*?);\nconst front=/s);
const views={front:fm?JSON.parse(fm[1]):'',back:bm?JSON.parse(bm[1]):''};
const all=['chest','frontDelts','rearDelts','sideDelts','biceps','triceps','forearms','upperBack','lats','abs','glutes','quads','hamstrings','calves'];
const frontIds=new Set(['chest','frontDelts','sideDelts','biceps','triceps','forearms','upperBack','lats','abs','glutes','quads','hamstrings','calves']);
const backIds=new Set(['rearDelts','sideDelts','triceps','forearms','upperBack','lats','abs','glutes','hamstrings','calves']);

execFileSync(process.execPath,['--check','app.js']);

for(const [side,svg] of Object.entries(views)){
  for(const id of all){
    const expected=(side==='front'?frontIds:backIds).has(id);
    const has=svg.includes('data-muscles="'+id+'"');
    [
      A.includes(id), expected===has, expected?has:true, expected?!svg.includes('data-muscles="'+id+','):true,
      svg.startsWith('<svg'),svg.endsWith('</svg>'),svg.includes('class="real-body-base"'),
      svg.includes('class="muscle-zone-group"'),/viewBox="0 0 (587 1137|596 1133)"/.test(svg),
      (svg.match(/<path\b/g)||[]).length>40,!svg.includes('0 0 220 520'),
      !/three\.js|GLTFLoader|DRACOLoader|sphereGeometry|cubeGeometry/i.test(svg),
      !svg.includes('<canvas'),!svg.includes('WebGL'),!svg.includes('anatomy-muscle'),
      A.includes('paintAnatomy'),A.includes('rankColor'),A.includes('rankShade'),
      A.includes('rankGradientDefs'),C.includes('.muscle-zone-group')
    ].forEach((v,i)=>ok(side+' '+id+' check '+(i+1),v));
  }
}

[
 A.includes("BUILD_VERSION='5.5.14'"),!A.includes("5.5.13"),A.includes('MUSCLE_LIFTS'),A.includes('MUSCLE_ORDER'),
 A.includes('MUSCLE_LABEL'),A.includes('muscleStates'),A.includes('muscleTransferWeight'),A.includes('refreshRanks'),
 !A.includes('Three.js'),!A.includes('three.min.js'),!A.includes('GLTFLoader'),!A.includes('DRACOLoader'),
 !A.includes('sphereGeometry'),!A.includes('cubeGeometry'),!A.includes('WebGLRenderer'),!A.includes('THREE.'),
 C.includes('.anatomy-pair'),C.includes('grid-template-columns:1fr 1fr'),C.includes('.real-body-base'),
 C.includes('.muscle-zone-group.locked'),C.includes('.muscle-zone-group.unlocked'),C.includes('drop-shadow'),
 C.includes('shape-rendering:geometricPrecision'),C.includes('vector-effect:non-scaling-stroke'),
 C.includes('stroke-linejoin:round'),C.includes('stroke-linecap:round'),C.includes('paint-order:stroke fill'),
 C.includes('@media(max-width:480px)'),C.includes('@media(min-width:640px)'),
 I.includes("BUILD_VERSION='5.5.14'"),L.includes("BUILD_VERSION='5.5.14'"),
 I.includes('data-muscles'),L.includes('data-muscles'),S.includes('5.14-detailed-anatomy'),
 S.includes('anatomy-map.css'),I.length>250000,L.length>250000,A.length>200000,C.length>1000,
 A.includes('paintAnatomy')
].forEach((v,i)=>ok('global '+(i+1),v));

console.log('anatomy check result: '+checks+' checks, '+failures.length+' failures');
if(failures.length){console.log(failures.join('\n'));process.exit(1)}
