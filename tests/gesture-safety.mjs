import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8'); const css=fs.readFileSync('styles.css','utf8');
for(const x of ['touch-action:pan-y','pointer-events:none']) assert.ok(css.includes(x),x);
assert.ok(!app.includes('const bindRulers=()=>')); assert.ok(app.includes("root.addEventListener('pointerdown'")); console.log('wheel gesture safety: ok');
