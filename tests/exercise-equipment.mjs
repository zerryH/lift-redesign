import fs from 'node:fs';
import assert from 'node:assert/strict';
const rows=JSON.parse(fs.readFileSync('exercises.json','utf8')).ex;
const map=new Map(rows.map(r=>{const [n,g,t,c]=r.split('|');return[n,{g,t,c,row:r}]}));
assert.equal(rows.length,472,'catalogue should remove the duplicate rope hammer entry');
assert.equal(new Set(rows.map(r=>r.split('|')[0])).size,rows.length,'exercise names must be unique');
for(const [name,type] of [['Rope Hammer Curl','M'],['Resistance Band Curl','B'],['Banded Glute Bridge','B'],['Assisted Dip','M'],['Assisted Chest Dip','M'],['Hammer Strength Chest Press','M'],['Meadows Row','B'],['Seal Row','B'],['Renegade Row','D'],['Rack Pull','B'],['45-Degree Back Extension','U'],['Svend Press','B'],['Reverse Lunge','U'],['Sissy Squat','U'],['Single-Leg Hip Thrust','U'],['Wall Sit','U'],['Frog Pump','U'],['Single-Leg Calf Raise','U'],['Tibialis Raise','U'],['Pallof Press','M']]) assert.equal(map.get(name)?.t,type,`${name} equipment type`);
assert.equal(map.has('Rope Hammer Cable Curl'),false,'duplicate rope hammer curl must be removed');
for(const r of rows){const [n,,t]=r.split('|');const low=n.toLowerCase();if(/dumbbell/.test(low))assert.equal(t,'D',`${n} must be dumbbell`);if(/cable|rope/.test(low)&&!/battle ropes?|ez-bar cable/.test(low))assert.equal(t,'M',`${n} must be cable/machine`);if(/machine|smith machine|hammer strength/.test(low))assert.equal(t,'M',`${n} must be machine`);if(/weighted/.test(low))assert.equal(t,'W',`${n} must be weighted-bodyweight`);if(/assisted/.test(low))assert.equal(t,'M',`${n} must be assisted-machine`);}
const app=fs.readFileSync('app.js','utf8');assert.match(app,/exerciseEquipmentLabel/);assert.match(app,/load=exerciseEquipmentLabel\(n,x\.t\)/);
console.log('exercise equipment audit passed · 472 unique exercises');
