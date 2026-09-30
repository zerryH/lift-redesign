import fs from 'node:fs';
const app=fs.readFileSync('app.js','utf8');
for (const name of ['index.html','lift-local.html']) {
  const html=fs.readFileSync(name,'utf8');
  const re=/(<script[^>]*>)[\s\S]*?(<\/script>)/;
  if (!re.test(html)) throw new Error(`No inline script found in ${name}`);
  const next=html.replace(re,(_,a,b)=>a+app+b);
  fs.writeFileSync(name,next);
}
const sw=fs.readFileSync('sw.js','utf8').replace(/liftlog-v\d+/, 'liftlog-v'+Date.now());
fs.writeFileSync('sw.js',sw);
console.log('build ok');
