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

assert(s.includes("if(location.protocol==='file:')return localOk;if(epoch!==saveEpoch)return false;try{await dbWrite(snapshot);if(!localOk)toast('Saved to browser storage; local cache is full');return true"));
assert(s.includes('tutorial-eyebrow\">'));
assert(!s.includes('tutorial-eyebrowr>'));
assert(s.includes('const scorePerE=Number.isFinite(e)&&e>0&&Number.isFinite(x)?x/e:0'));
assert(s.includes("S.rk=S.rk&&typeof S.rk==='object'&&!Array.isArray(S.rk)?S.rk:{}"));
assert(s.includes("('custom' in d&&!Array.isArray(d.custom))"));
assert(s.includes('cur:S.cur,editingId:S.editingId,rankingVersion:S.rankingVersion'));
assert(s.includes("next.cur=d.cur&&typeof d.cur==='object'?JSON.parse(JSON.stringify(d.cur)):null"));
console.log('full-audit fix regression guards passed');
