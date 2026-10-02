import fs from 'node:fs';

const app=fs.readFileSync('app.js','utf8');

const rankCSS='<style id="lift-anatomy-style">.body-stage{height:445px;display:grid;place-items:center;overflow:hidden;position:relative;background:radial-gradient(circle at 50% 45%,rgba(110,130,175,.08),transparent 68%)}.anatomy-switch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 6px}.anatomy-switch .pill{width:100%;justify-content:center}.anatomy-single{margin:0;display:grid;place-items:center;align-content:center;width:100%;height:100%;min-height:0}.anatomy-single .anatomy-svg{width:min(320px,88vw);height:410px;display:block;overflow:visible}.anatomy-single figcaption{margin-top:-4px;font-size:11px;letter-spacing:1.7px;text-transform:uppercase;font-weight:800;color:var(--mu);opacity:.8}.anatomy-svg .body-base{opacity:.94}.anatomy-svg{shape-rendering:geometricPrecision}.anatomy-muscle{transition:opacity .2s ease,filter .2s ease}.anatomy-forearm{opacity:.72;fill:#8f98a6}.anatomy-back .anatomy-underlayer{opacity:.9}.posterior-body-detail{fill:none;stroke:#697181;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.42}.posterior-body-detail path{vector-effect:non-scaling-stroke}.overall-rank-title{display:flex;align-items:center;justify-content:center;gap:10px}.rank-icon{display:inline-grid;place-items:center;position:relative;width:46px;height:46px;color:var(--c);flex:0 0 auto;filter:drop-shadow(0 5px 12px color-mix(in srgb,var(--c) 28%,transparent))}.rank-icon svg{position:absolute;inset:0;width:100%;height:100%;fill:color-mix(in srgb,var(--c) 18%,transparent);stroke:var(--c);stroke-width:1.6}.rank-icon b{position:relative;font-size:11px;line-height:1;color:var(--c);font-weight:900}.rank-result-title{display:flex;align-items:center;justify-content:center;gap:10px}.rank-result-title .rank-icon{width:40px;height:40px}.rank-badge{display:flex;align-items:center;gap:7px}@media(max-width:500px){.body-stage{height:430px}.anatomy-single .anatomy-svg{height:395px;width:min(300px,88vw)}}</style>';

function build(html){
 const appRe=/<script>[\s\S]*?<\/script>/;
 if(!appRe.test(html)) throw new Error('Inline app script not found');
 html=html.replace(appRe,()=>'<script>'+app+'</script>');
 html=html.replace(/<style id="lift-anatomy-style">[\s\S]*?<\/style>/g,'');
 if(html.includes('.body-stage{height:470px')) html=html.replace(/\.body-stage\{height:470px;[\s\S]*?\.muscle-grid\{display:grid/,rankCSS+'\n.muscle-grid{display:grid');
 else if(!html.includes('lift-anatomy-style')) html=html.replace('</head>',rankCSS+'</head>');
 return html;
}

const hosted=build(fs.readFileSync('index.html','utf8'));
fs.writeFileSync('index.html',hosted);
fs.writeFileSync('lift-local.html',hosted);

let sw=fs.readFileSync('sw.js','utf8');
sw=sw.replace(/liftlog-v\d+/,'liftlog-v'+Date.now());
sw=sw.replace(/F=\[[^\]]*\]/,"F=['./','index.html','lift-local.html','app.js','exercises.json','ranks-config.json','manifest.webmanifest','lift-icon-v2.svg','lift-icon-180-v2.png','lift-icon-192-v2.png','lift-icon-512-v2.png']");
fs.writeFileSync('sw.js',sw);
console.log('build ok: 2D front/back anatomy, no 3D runtime');