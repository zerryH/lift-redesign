import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8'); const css=fs.readFileSync('styles.css','utf8');
for(const x of ['const bindValuePickers=','drag.axis','Math.abs(dy)>Math.abs(dx)','e.preventDefault()','const resetViewScroll=']) assert.ok(app.includes(x),x);
assert.ok(css.includes('touch-action:pan-y')); console.log('mobile wheel interactions: ok');

assert.match(css,/\.exercise-library input,\.exercise-library select\{font-size:16px!important;-webkit-text-size-adjust:100%\}/);
assert.ok(!/\.exercise-library button,\.exercise-library input,\.exercise-library select\{font:inherit;appearance:none;-webkit-appearance:none\}[^]*?\.exercise-library input,\.exercise-library select\{font-size:15px/.test(css),'exercise form must not use sub-16px control text');
console.log('iOS form zoom guard: ok');
