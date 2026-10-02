import fs from 'node:fs';
const app=fs.readFileSync('app.js','utf8');
const anatomyCss=fs.readFileSync('anatomy-map.css','utf8');
function build(name){let html=fs.readFileSync(name,'utf8');
 html=html.replace(/<script[^>]+src="\.\/(?:three\.min|DRACOLoader|GLTFLoader)\.js"><\/script>/g,'');
 html=html.replace(/<script id="(?:lift-muscle3d|lift-three-runtime|lift-anatomy-data)">[\s\S]*?<\/script>/g,'');
 const appRe=/(<script[^>]*>)[\s\S]*?(<\/script>)/;if(!appRe.test(html))throw new Error(`No inline app script found in ${name}`);html=html.replace(appRe,(_,open,close)=>open+app+close);
 html=html.replace(/<style id="lift-procedural-3d-style">[\s\S]*?<\/style>/g,'');html=html.replace(/<style id="lift-anatomy-style">[\s\S]*?<\/style>/g,'');const legacyComment=html.indexOf('/* Real WebGL muscle model:');const exerciseComment=html.indexOf('/* Exercise library:',legacyComment);if(legacyComment>=0&&exerciseComment>legacyComment)html=html.slice(0,legacyComment)+html.slice(exerciseComment);const bodyCssStart=html.indexOf('.body-stage{height:470px');const muscleGridStart=html.indexOf('.muscle-grid{',bodyCssStart);if(bodyCssStart>=0&&muscleGridStart>bodyCssStart)html=html.slice(0,bodyCssStart)+html.slice(muscleGridStart);
 html=html.replace('</head>',`<style id="lift-anatomy-map-style">${anatomyCss}</style></head>`);
 fs.writeFileSync(name,html)}
fs.writeFileSync('anatomy-map.css',anatomyCss);build('index.html');build('lift-local.html');
let sw=fs.readFileSync('sw.js','utf8');sw=sw.replace(/liftlog-v\d+/, 'liftlog-v'+Date.now());sw=sw.replace(/F=\[[^\]]*\]/,`F=['./','index.html','lift-local.html','app.js','exercises.json','ranks-config.json','anatomy-map.css','manifest.webmanifest','lift-icon-v2.svg','lift-icon-180-v2.png','lift-icon-192-v2.png','lift-icon-512-v2.png']`);fs.writeFileSync('sw.js',sw);
console.log('build ok');
