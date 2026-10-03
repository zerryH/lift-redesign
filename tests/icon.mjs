import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const targetSha = 'fb66a2489c30de42ab1a00bad0cd213f7b0c502e680b2651eecd84cd64333200';
const files = ['lift-icon-ios-v3.png','apple-touch-icon-v3.png'];
for (const file of files) {
  const b = fs.readFileSync(file);
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file+' must be a PNG');
  assert.equal(b.readUInt32BE(16),180,file+' width must be 180px');
  assert.equal(b.readUInt32BE(20),180,file+' height must be 180px');
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),targetSha,file+' must match the supplied app-icon artwork');
}
assert.equal(fs.readFileSync(files[0]).toString('base64'),fs.readFileSync(files[1]).toString('base64'),'iOS touch icon and PWA icon must be identical');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
assert.deepEqual(manifest.icons,[{src:'./lift-icon-ios-v3.png',sizes:'180x180',type:'image/png',purpose:'any maskable'}]);
const buildHashInput = [fs.readFileSync('app.js','utf8'),fs.readFileSync('index.html','utf8'),fs.readFileSync('exercises.json','utf8'),fs.readFileSync('ranks-config.json','utf8'),fs.readFileSync('anatomy-map.css','utf8'),fs.readFileSync('manifest.webmanifest','utf8'),...files.map(f=>fs.readFileSync(f).toString('base64'))].join('\n');
const expectedCache = crypto.createHash('sha256').update(buildHashInput).digest('hex').slice(0,12);
const sw = fs.readFileSync('sw.js','utf8');
assert.match(sw, new RegExp("const V='liftlog-v\\d+\\.\\d+\\.\\d+-"+expectedCache+"'"), 'service-worker cache version must change when the app icon changes');
console.log('icon ok · supplied artwork is wired to iOS home-screen/PWA and included in cache hashing');
