import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const targetSha = crypto.createHash('sha256').update(fs.readFileSync('lift-icon-photo-fit.png')).digest('hex');
const files = ['lift-icon-photo-fit.png','apple-touch-icon-photo-fit.png'];
for (const file of files) {
  const b=fs.readFileSync(file);
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(b.readUInt32BE(16),180); assert.equal(b.readUInt32BE(20),180);
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),targetSha);
}
assert.equal(fs.readFileSync(files[0]).toString('base64'),fs.readFileSync(files[1]).toString('base64'));
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
assert.deepEqual(manifest.icons,[{src:'./lift-icon-photo-fit.png',sizes:'180x180',type:'image/png',purpose:'any maskable'}]);
const sw=fs.readFileSync('sw.js','utf8');
assert.match(sw,/const V='liftlog-v5\.5\.28-[0-9a-f]{12}'/);
assert.match(sw,/lift-icon-photo-fit\.png/); assert.match(sw,/apple-touch-icon-photo-fit\.png/);
assert.ok(fs.readFileSync('index.html','utf8').includes('lift-icon-photo-fit.png'))
console.log('icon ok · supplied photo is wired and service worker is valid');
