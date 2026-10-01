import fs from 'node:fs';
const app=fs.readFileSync('app.js','utf8');
const renderer=fs.readFileSync('muscle3d.js','utf8');
for (const name of ['index.html','lift-local.html']) {
  let html=fs.readFileSync(name,'utf8');
  const appRe=/(<script[^>]*>)[\s\S]*?(<\/script>)/;
  if (!appRe.test(html)) throw new Error(`No inline app script found in ${name}`);
  html=html.replace(appRe,(_,open,close)=>open+app+close);
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
