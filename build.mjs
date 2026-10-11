/* SLAT COPYRIGHT CANARY — OR146 / ZERRYH — proprietary source marker */
import fs from 'node:fs';
import crypto from 'node:crypto';
const BUILD_VERSION = '5.6.0';
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
    const record=ex.catalogue?.[name],meta=ranks.exerciseMeta?.[name];
    if(!record?.id || !meta || record.name!==name) throw new Error('Missing exercise protocol: '+name);
    if(!['load_reps','reps','duration','load_distance','band_reps'].includes(record.tracking)) throw new Error('Invalid tracking: '+name);
    if(record.rankable!==meta.rankable || record.tracking!==meta.tracking) throw new Error('Protocol mismatch: '+name);
    if(!Object.keys(record.muscles||{}).length || Object.values(record.muscles).some(w=>!Number.isFinite(w)||w<=0||w>1)) throw new Error('Invalid muscle routing: '+name);
    if(record.canonicalName && ex.catalogue[record.canonicalName]?.id!==record.id) throw new Error('Invalid synonym: '+name);
    if(!record.rankable && !record.rankingExclusion) throw new Error('Missing ranking exclusion: '+name);

  }
  const tierCount = ranks.tiers.length;
  for (const [name, sexes] of Object.entries(ranks.t)) {
    if (!Array.isArray(sexes) || sexes.length !== 2 || sexes.some(v => !Array.isArray(v) || v.length !== tierCount || v.some(n => !Number.isFinite(n)))) throw new Error('Malformed rank standard: ' + name);
  }
  for (const [alias, target] of Object.entries(ranks.alias || {})) if (!ranks.t[target]) throw new Error('Alias target missing: ' + alias + ' -> ' + target);
}
function injectData(appSource, ex, ranks, engineSource) {
  const exRe = /\/\*BEGIN:EXERCISES\*\/[\s\S]*?\/\*END:EXERCISES\*\//;
  const rankRe = /\/\*BEGIN:RANKS\*\/[\s\S]*?\/\*END:RANKS\*\//;
  if (!exRe.test(appSource) || !rankRe.test(appSource)) throw new Error('Missing required data markers in app.js');
  appSource = appSource.replace(/\/\*BEGIN:DATA_INTEGRITY\*\/[\s\S]*?\/\*END:DATA_INTEGRITY\*\//, '/*BEGIN:DATA_INTEGRITY*/'+read('data-integrity.js')+'/*END:DATA_INTEGRITY*/');
  appSource = appSource.replace(exRe, '/*BEGIN:EXERCISES*/' + JSON.stringify(ex) + '/*END:EXERCISES*/');
  appSource = appSource.replace(rankRe, '/*BEGIN:RANKS*/' + JSON.stringify(ranks) + '/*END:RANKS*/');
  appSource = appSource.replace(/\/\*BEGIN:RANKING_ENGINE\*\/[\s\S]*?\/\*END:RANKING_ENGINE\*\//, '/*BEGIN:RANKING_ENGINE*/' + engineSource + '/*END:RANKING_ENGINE*/');
  return appSource;
}
function buildHtml(name, appSource, anatomyCss, stylesCss) {
  let html = read(name);
  html = html.replace(/<style id="lift-anatomy-map-style">[\s\S]*?<\/style>\s*/g, '');
  html = html.replace(/<style>[\s\S]*?<\/style>/, '<style>' + stylesCss + '</style>');
const appRe = /(<script[^>]*>)[\s\S]*?const BUILD_VERSION='[^']+';[\s\S]*?(<\/script>)/;
  if (!appRe.test(html)) throw new Error('No inline app script found in ' + name);
  html = html.replace(appRe, (_, open, close) => open + appSource + close);
  html = html.replace('</head>', '<style id="lift-anatomy-map-style">' + anatomyCss + '</style></head>');
  return html;
}
const engine = read('ranking-engine.js');
const ex = JSON.parse(read('exercises.json'));
const ranks = JSON.parse(read('ranks-config.json'));
validateData(ex, ranks);
let app = injectData(read('app.js').replace(/const BUILD_VERSION='[^']+';/, "const BUILD_VERSION='" + BUILD_VERSION + "';"), ex, ranks, engine);
write('app.js', app);
const anatomyCss = read('anatomy-map.css');
const stylesCss = read('styles.css');
for (const name of ['index.html', 'lift-local.html']) write(name, buildHtml(name, app, anatomyCss, stylesCss));
if (read('index.html') !== read('lift-local.html')) throw new Error('index.html and lift-local.html diverged');
const hashInput = [app, stylesCss, read('index.html'), read('exercises.json'), read('ranks-config.json'), read('ranking-engine.js'), read('data-integrity.js'), anatomyCss, read('manifest.webmanifest'), fs.readFileSync('lift-icon-photo-fit.png').toString('base64'), fs.readFileSync('apple-touch-icon-photo-fit.png').toString('base64')].join('\n');
const shortHash = crypto.createHash('sha256').update(hashInput).digest('hex').slice(0, 12);
const cacheVersion = 'liftlog-v' + BUILD_VERSION + '-' + shortHash;
let sw = read('sw.js');
sw = sw.replace(/const V='[^']+',F=/, "const V='" + cacheVersion + "',F=");
sw = sw.replace(/F=\[[^\]]*\]/, "F=['./','index.html','lift-local.html','app.js','exercises.json','ranks-config.json','ranking-engine.js','data-integrity.js','anatomy-map.css','manifest.webmanifest','lift-icon-photo-fit.png','apple-touch-icon-photo-fit.png']");
write('sw.js', sw);
write('version.json', JSON.stringify({version:BUILD_VERSION,cache:cacheVersion}));
console.log('build ok · ' + BUILD_VERSION + ' · ' + cacheVersion);
