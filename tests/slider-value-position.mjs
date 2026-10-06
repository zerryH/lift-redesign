import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8'); const css=fs.readFileSync('styles.css','utf8'); const html=fs.readFileSync('index.html','utf8');
for(const x of ['const sliderMarkup=','value-picker-ticks','value-picker-center','const bindValuePickers=','sliderPxPerStep']) assert.ok(app.includes(x),x);
assert.ok(!app.includes('PX_PER_STEP')); assert.ok(!app.includes('const bindRulers=')); assert.ok(!app.includes('ruler-tick'));
for(const x of ['.value-picker-center','.value-picker-tick','touch-action:pan-y','pointer-events:none']) assert.ok(css.includes(x),x);
assert.ok(html.includes('class=\"value-slider\"')); console.log('centered wheel slider contract: ok');
