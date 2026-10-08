import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8');
assert.match(app,/profile:backupProfile/,'backup must include an explicit profile snapshot');
assert.match(app,/age:athleteAge\(\)/,'backup profile must include age');
assert.match(app,/weight:backupWeight/,'backup profile must include weight');
assert.match(app,/heightCm:S\.set\.heightCm/,'backup profile must include height');
assert.match(app,/version:3/,'backup schema must be version 3');
console.log('backup profile ok · age + weight + height');
