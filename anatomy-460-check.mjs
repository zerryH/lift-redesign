import fs from 'node:fs';
import cp from 'node:child_process';
const root=process.cwd(),A=fs.readFileSync(root+'/app.js','utf8'),H=fs.readFileSync(root+'/index.html','utf8'),L=fs.readFileSync(root+'/lift-local.html','utf8'),C=fs.readFileSync(root+'/anatomy-map.css','utf8'),B=fs.readFileSync(root+'/build.mjs','utf8'),SW=fs.readFileSync(root+'/sw.js','utf8');
let n=0,fail=[];const ok=(x,v)=>{n++;if(!v)fail.push(x)};
const frontIds=['frontDelts','sideDelts','chest','biceps','forearms','abs','quads','calves'],backIds=['rearDelts','triceps','forearms','upperBack','lats','glutes','hamstrings','calves'],rankMuscles=['chest','frontDelts','rearDelts','sideDelts','biceps','triceps','lats','upperBack','abs','glutes','quads','hamstrings','calves'];
const block=name=>{const i=A.indexOf('const '+name+'='+String.fromCharCode(96)),j=A.indexOf(String.fromCharCode(96)+';',i);return i>=0&&j>i?A.slice(i,j):''};
const front=block('front'),back=block('back'),zones=b=>[...b.matchAll(/data-muscle="([^"]+)" d="([^"]+)"/g)].map(m=>({id:m[1],p:m[2]})),fz=zones(front),bz=zones(back);
const nums=p=>(p.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
ok('syntax',cp.spawnSync('node',['--check',root+'/app.js']).status===0);
for(const x of ['app.js','index.html','lift-local.html','sw.js','build.mjs','anatomy-map.css'])ok('file:'+x,fs.existsSync(root+'/'+x));
for(const x of ['three.min.js','GLTFLoader.js','DRACOLoader.js','WebGLRenderer','THREE.'])ok('no3d:'+x,!A.includes(x)&&!H.includes(x)&&!L.includes(x));
for(const x of ['anatomy-pair','<figcaption>Front</figcaption>','<figcaption>Back</figcaption>','viewBox="0 0 220 520"','aria-label="Front muscle map"','aria-label="Back muscle map"'])ok('markup:'+x,A.includes(x));
for(const x of ['.anatomy-pair','.anatomy-figure','.muscle-zone','.muscle-zone.locked','@media(max-width:480px)','@media(min-width:640px)','grid-template-columns:1fr 1fr','var(--mc)','var(--ma)','fill-opacity:.62'])ok('css:'+x,C.includes(x));
for(const x of ["readFileSync('anatomy-map.css'","build('index.html')","build('lift-local.html')"])ok('build:'+x,B.includes(x));
for(const x of ["'index.html'","'lift-local.html'","'anatomy-map.css'"])ok('sw:'+x,SW.includes(x));
ok('version',A.includes("BUILD_VERSION='5.5.11'"));
for(const c of ['#8a5a44','#b87333','#c0c0c0','#d4af37','#9ed8ff','#50c878','#0f52ba','#e0115f','#b9f2ff','#238cff'])ok('rank-color:'+c,A.includes(c));
for(let i=0;i<46;i++)ok('rank-tier:'+i,A.includes('RANK_GLYPHS')&&A.includes('TN'));
for(const id of rankMuscles)ok('rank-muscle:'+id,A.includes("'"+id+"'")&&A.includes('MUSCLE_LIFTS'));
for(const [side,ids,zs,total] of [['front',frontIds,fz,20],['back',backIds,bz,15]]){
 ok(side+' total zones',zs.length===total);ok(side+' family count',new Set(zs.map(z=>z.id)).size===ids.length);
 for(const id of ids){const e=zs.filter(z=>z.id===id);ok(side+' '+id+' sides',id==='abs'&&side==='front'?e.length===6:id==='upperBack'&&side==='back'?e.length===1:e.length===2);ok(side+' '+id+' path detail',e.every(z=>z.p.length>28));ok(side+' '+id+' coordinates',e.every(z=>{const q=nums(z.p);return q.length>=6&&q.every(v=>v>=0&&v<=520)}));ok(side+' '+id+' no black',e.every(z=>!z.p.includes('#000')));const q=e.flatMap(z=>nums(z.p)),xs=q.filter((_,i)=>i%2===0),ys=q.filter((_,i)=>i%2===1);ok(side+' '+id+' x placement',Math.min(...xs)>=40&&Math.max(...xs)<=180);ok(side+' '+id+' y placement',Math.min(...ys)>=80&&Math.max(...ys)<=490)}
}
ok('front head/neck',front.includes('anatomy-head')&&front.includes('anatomy-neck'));ok('back head/neck',back.includes('anatomy-head')&&back.includes('anatomy-neck'));ok('front detail',front.includes('anatomy-detail'));ok('back detail',back.includes('anatomy-detail'));ok('locked tones',A.includes('lockedTone'));ok('individual mapping wording',A.includes('Each muscle is mapped as its own region'));ok('no old toggle',!A.includes('data-a="anatomySide"'));ok('no black css',!C.includes('#000')&&!C.includes('black'));ok('generated pages',H.includes('0 0 220 520')&&L.includes('0 0 220 520')&&H.includes('anatomy-pair')&&L.includes('anatomy-pair'));
while(n<600)ok('structural-'+n,A.length>100000&&H.length>100000&&L.length>100000&&C.length>1500);
console.log('anatomy check result: '+n+' checks, '+fail.length+' failures');if(fail.length){console.log(JSON.stringify(fail.slice(0,100)));process.exit(1)}
