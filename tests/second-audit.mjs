import fs from 'node:fs';
import assert from 'node:assert/strict';
const s=fs.readFileSync('app.js','utf8');
assert(!s.includes('Max.max('));
assert(s.includes('tutorialIndex=Math.max(0,tutorialIndex-1)'));
assert(s.includes("if(t.id==='age'||t.id==='heightCm'){S.set[t.id==='age'?'age':'heightCm']=t.value;save()}"));
assert(s.includes("if(a==='ageAdjust'){Object.values(S.rk).forEach(r=>r.age=S.set.age||r.age);setRankingControl({ageAdjust:S.set.ageAdjust===false});"));
assert(s.includes('const url=URL.createObjectURL(f);'));
assert(s.includes('URL.revokeObjectURL(url)'));
console.log('second audit regression guards passed');

const app=fs.readFileSync('app.js','utf8');
assert(!app.includes("/^\\\\d{4}-\\\\d{2}-\\\\d{2}$/.test"),'date validator must not double-escape digit classes');
assert.match(app,/S\.set\.ageAdjust!==false\?athleteAge\(\):null/);
assert.match(app,/S\.set\.heightAdjust!==false\?h:null/);
assert(!/0\.20x normalized bodyweight|3\.00x/.test(fs.readFileSync('ranks-config.json','utf8')));
console.log('date validation + ranking toggle regressions passed');
