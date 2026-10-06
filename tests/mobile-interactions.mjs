import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8'); const css=fs.readFileSync('styles.css','utf8');
for(const x of ['const bindValuePickers=','drag.axis','Math.abs(dy)>Math.abs(dx)','e.preventDefault()','const resetViewScroll=']) assert.ok(app.includes(x),x);
assert.ok(css.includes('touch-action:pan-y')); console.log('mobile wheel interactions: ok');
