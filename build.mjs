import fs from 'node:fs';
import crypto from 'node:crypto';
const BUILD_VERSION = '5.5.25';
const read = p => fs.readFileSync(p, 'utf8');
const write = (p, s) => fs.writeFileSync(p, s);
function validateData(ex, ranks) {
  if (!Array.isArray(ex.ex) || ex.ex.length === 0 || !Array.isArray(ranks.tiers) || ranks.tiers.length === 0 || !ranks.t || typeof ranks.t !== 'object') throw new Error('Invalid JSON shape');
  const names = new Set();
  for (const row of ex.ex) {
    if (typeof row !== 'string' || row.split('|').length !== 4) throw new Error('Malformed exercise row: ' + row);
    const name = row.split('|')[0];
    if (names.has(name)) throw new Error('Duplicate exercise name: ' + name);
    names.add(name);
  }
  const tierCount = ranks.tiers.length;
  for (const [name, sexes] of Object.entries(ranks.t)) {
    if (!Array.isArray(sexes) || sexes.length !== 2 || sexes.some(v => !Array.isArray(v) || v.length !== tierCount || v.some(n => !Number.isFinite(n)))) throw new Error('Malformed rank standard: ' + name);
  }
  for (const [alias, target] of Object.entries(ranks.alias || {})) if (!ranks.t[target]) throw new Error('Alias target missing: ' + alias + ' -> ' + target);
}
function injectData(appSource, ex, ranks) {
  const exRe = /\/\*BEGIN:EXERCISES\*\/[\s\S]*?\/\*END:EXERCISES\*\//;
  const rankRe = /\/\*BEGIN:RANKS\*\/[\s\S]*?\/\*END:RANKS\*\//;
  if (!exRe.test(appSource) || !rankRe.test(appSource)) throw new Error('Missing required data markers in app.js');
  appSource = appSource.replace(exRe, '/*BEGIN:EXERCISES*/' + JSON.stringify(ex) + '/*END:EXERCISES*/');
  appSource = appSource.replace(rankRe, '/*BEGIN:RANKS*/' + JSON.stringify(ranks) + '/*END:RANKS*/');
  return appSource;
}
function buildHtml(name, appSource, anatomyCss) {
  let html = read(name);
  html = html.replace(/<style id="lift-anatomy-map-style">[\s\S]*?<\/style>\s*/g, '');
  const appRe = /(<script[^>]*>)[\s\S]*?(<\/script>)/;
  if (!appRe.test(html)) throw new Error('No inline app script found in ' + name);
  html = html.replace(appRe, (_, open, close) => open + appSource + close);
  html = html.replace('</head>', '<style id="lift-anatomy-map-style">' + anatomyCss + '</style></head>');
  return html;
}
const ex = JSON.parse(read('exercises.json'));
const ranks = JSON.parse(read('ranks-config.json'));
validateData(ex, ranks);
let app = injectData(read('app.js').replace(/const BUILD_VERSION='[^']+';/, "const BUILD_VERSION='" + BUILD_VERSION + "';"), ex, ranks);
write('app.js', app);
const anatomyCss = read('anatomy-map.css');
for (const name of ['index.html', 'lift-local.html']) write(name, buildHtml(name, app, anatomyCss));
if (read('index.html') !== read('lift-local.html')) throw new Error('index.html and lift-local.html diverged');
const hashInput = [app, read('index.html'), read('exercises.json'), read('ranks-config.json'), anatomyCss, read('manifest.webmanifest'), fs.readFileSync('lift-icon-180-v2.png').toString('base64'), fs.readFileSync('apple-touch-icon.png').toString('base64')].join('\n');
const shortHash = crypto.createHash('sha256').update(hashInput).digest('hex').slice(0, 12);
const cacheVersion = 'liftlog-v' + BUILD_VERSION + '-' + shortHash;
let sw = read('sw.js');
sw = sw.replace(/const V='[^']+',F=/, "const V='" + cacheVersion + "',F=");
sw = sw.replace(/F=\[[^\]]*\]/, "F=['./','index.html','lift-local.html','app.js','exercises.json','ranks-config.json','anatomy-map.css','manifest.webmanifest','lift-icon-180-v2.png','apple-touch-icon.png']");
write('sw.js', sw);
console.log('build ok · ' + BUILD_VERSION + ' · ' + cacheVersion);
