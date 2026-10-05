import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync('styles.css','utf8');
const app=fs.readFileSync('app.js','utf8');

assert.match(css,/\#v \.pill\{[^}]*min-width:0/);
assert.match(css,/\#v \.add\{[^}]*align-items:flex-end/);
assert.match(css,/\#v \.toggle\{[^}]*width:auto!important/);
assert.match(css,/\#v \.range-wrap\{[^}]*height:68px/);
assert.match(app,/const PX_PER_STEP=28/);
assert.match(app,/credits-card/);
assert.match(app,/credits-link/);
assert.match(css,/text-decoration:none!important/);
console.log('ui polish source check ok');
