import fs from 'node:fs';
import assert from 'node:assert/strict';
const css=fs.readFileSync('styles.css','utf8'); const app=fs.readFileSync('app.js','utf8'); const html=fs.readFileSync('index.html','utf8'); const local=fs.readFileSync('lift-local.html','utf8');
for(const x of ['.value-slider-wrap','.value-picker-center','.value-picker-tick']) assert.ok(css.includes(x),x); assert.ok(!app.includes('PX_PER_STEP')); assert.ok(html.includes('class=\"value-slider\"')); assert.equal(html,local); console.log('ui wheel polish: ok');
