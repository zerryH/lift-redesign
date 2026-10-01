import fs from 'node:fs';
const app=fs.readFileSync('app.js','utf8');
const renderer=fs.readFileSync('muscle3d.js','utf8');
const three=fs.readFileSync('three.min.js','utf8');
const modelCSS=`<style id="lift-procedural-3d-style">
.body-stage{position:relative;isolation:isolate;min-height:390px;touch-action:pan-y;overflow:hidden}
.body-spin{display:none}
.muscle3d-root{position:absolute;inset:0;width:100%;height:100%;min-height:390px;z-index:2;overflow:hidden;touch-action:pan-y;background:radial-gradient(ellipse at 50% 44%,rgba(94,111,166,.09),transparent 65%)}
.muscle3d-canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab;outline:none}
.muscle3d-canvas.dragging{cursor:grabbing}
.muscle3d-error{display:grid;place-items:center;text-align:center;min-height:390px;padding:24px;color:var(--mu,#a5a0b7);font-size:13px}
@media(max-width:480px){.body-stage,.muscle3d-root{min-height:400px}.body-stage{height:440px}}
</style>`;
function inject(html){
 const appRe=/(<script[^>]*>)[\s\S]*?(<\/script>)/;
 if(!appRe.test(html))throw new Error('No inline app script found');
 html=html.replace(appRe,(_,open,close)=>open+app+close);
 html=html.replace(/<script src="\.\/DRACOLoader\.js"><\/script>/g,'').replace(/<script src="\.\/GLTFLoader\.js"><\/script>/g,'');
 html=html.replace(/<script id="lift-anatomy-data">[\s\S]*?<\/script>/g,'');
 const modelRe=/<script id="lift-muscle3d">[\s\S]*?<\/script>/;
 const embedded=`<script id="lift-muscle3d">${renderer}</script>`;
 if(modelRe.test(html))html=html.replace(modelRe,()=>embedded);else html=html.replace('</body>',embedded+'</body>');
 html=html.replace(/<style id="lift-procedural-3d-style">[\s\S]*?<\/style>/g,'');
 html=html.replace('</head>',modelCSS+'</head>');
 return html;
}
const hosted=inject(fs.readFileSync('index.html','utf8'));
fs.writeFileSync('index.html',hosted);
const threeTag='<script src="./three.min.js"></script>';
if(!hosted.includes(threeTag))throw new Error('Three.js script tag missing from hosted HTML');
const local=hosted.replace(threeTag,`<script id="lift-three-runtime">${three}</script>`);
fs.writeFileSync('lift-local.html',local);
let sw=fs.readFileSync('sw.js','utf8');
sw=sw.replace(/liftlog-v\d+/, 'liftlog-v'+Date.now());
sw=sw.replace(/F=\[[^\]]*\]/,`F=['./','index.html','lift-local.html','app.js','exercises.json','ranks-config.json','muscle3d.js','three.min.js','THREE-LICENSE.txt','manifest.webmanifest','lift-icon-v2.svg','lift-icon-180-v2.png','lift-icon-192-v2.png','lift-icon-512-v2.png']`);
fs.writeFileSync('sw.js',sw);
console.log('build ok: new procedural 3D model; hosted and self-contained standalone HTML generated');
