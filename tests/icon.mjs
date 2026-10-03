import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const targetSha = '24d23434c526adf629b8785592ca1033b0ff6e25ddd14340ffb258f92c570856';
const files = ['lift-icon-photo.png','apple-touch-icon-photo.png'];
for (const file of files) {
  const b=fs.readFileSync(file);
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(b.readUInt32BE(16),180); assert.equal(b.readUInt32BE(20),180);
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),targetSha);
}
assert.equal(fs.readFileSync(files[0]).toString('base64'),fs.readFileSync(files[1]).toString('base64'));
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
assert.deepEqual(manifest.icons,[{src:'./lift-icon-photo.png',sizes:'180x180',type:'image/png',purpose:'any maskable'}]);
const sw=fs.readFileSync('sw.js','utf8');
assert.match(sw,/const V='liftlog-v5\.5\.27-[0-9a-f]{12}'/);
assert.match(sw,/lift-icon-photo\.png/); assert.match(sw,/apple-touch-icon-photo\.png/);
assert.match(fs.readFileSync('index.html','utf8'),/rel="apple-touch-icon"[^>]*href="\.\/lift-icon-photo\.png"/);
console.log('icon ok · supplied photo is wired and service worker is valid');
