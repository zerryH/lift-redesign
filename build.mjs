import fs from 'node:fs';
const app=fs.readFileSync('app.js','utf8');
const renderer=fs.readFileSync('muscle3d.js','utf8');
const exerciseData=JSON.parse(fs.readFileSync('exercises.json','utf8'));
const rankData=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const anatomy=fs.readFileSync('body.glb.gz').toString('base64');
for (const name of ['index.html','lift-local.html']) {
  let html=fs.readFileSync(name,'utf8');

  const appRe=/(<script[^>]*>)[\s\S]*?(<\/script>)/;
  if (!appRe.test(html)) throw new Error(`No inline app script found in ${name}`);
  html=html.replace(appRe,(_,open,close)=>open+app+close);
  if (name === 'lift-local.html') {
    const dataTag=`<script id="lift-anatomy-data">window.LIFT_ANATOMY_GZ_BASE64='${anatomy}';</script>`;
    const dataRe=/<script id="lift-anatomy-data">[\s\S]*?<\/script>/;
    if (dataRe.test(html)) html=html.replace(dataRe,()=>dataTag);
    else html=html.replace('<script id="lift-muscle3d">',dataTag+'<script id="lift-muscle3d">');
  }
  const modelRe=/<script id="lift-muscle3d">[\s\S]*?<\/script>/;
  const embedded=`<script id="lift-muscle3d">${renderer}</script>`;
  if (modelRe.test(html)) html=html.replace(modelRe,()=>embedded);
  else html=html.replace('</body>',embedded+'</body>');
  fs.writeFileSync(name,html);
}
let sw=fs.readFileSync('sw.js','utf8');
sw=sw.replace(/liftlog-v\d+/, 'liftlog-v'+Date.now());
fs.writeFileSync('sw.js',sw);
console.log('build ok');
