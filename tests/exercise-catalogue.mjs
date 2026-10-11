import fs from 'node:fs';
import assert from 'node:assert/strict';
const ex=JSON.parse(fs.readFileSync('exercises.json','utf8'));
const app=fs.readFileSync('app.js','utf8');
const rows=ex.ex;
assert.equal(rows.length,472,'expected canonical 472 exercise catalogue');
const parts=rows.map(x=>x.split('|'));
assert(parts.every(p=>p.length===4),'every exercise needs name, split, load type and muscle group');
assert.equal(new Set(parts.map(p=>p[0])).size,rows.length,'exercise names must be unique');
for(const g of ['Push','Pull','Legs','Core','Full Body']) assert(parts.some(p=>p[1]===g),`missing split ${g}`);
assert.match(app,/const EXERCISE_SPLITS=\['Push','Pull','Legs','Core','Full Body'\]/);
assert.match(app,/split===exercisePickerCategory/);
assert.match(app,/const ensureExerciseCatalogue=\(\)=>/);
assert.match(app,/const exerciseMuscleOptions=\(\)=>/);
console.log('exercise catalogue categorization ok · 472 exercises · split filters + muscle metadata');

assert.match(app,/exerciseEquipmentLabel/);
