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

assert(s.includes("return m&&Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===s?s:''"));
assert(s.includes("const target=String(d||'')") && s.includes("return bw();const a="));
console.log('invalid-date regression guard passed');
