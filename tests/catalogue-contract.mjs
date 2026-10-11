import fs from 'node:fs';
import assert from 'node:assert/strict';
const x=JSON.parse(fs.readFileSync('exercises.json','utf8')),r=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const ids=new Map();
for(const row of x.ex){const [n,g,t,m]=row.split('|'),c=x.catalogue[n],a=r.exerciseMeta[n];assert.equal(c.split,g,n);assert.equal(c.primaryMuscle,m,n);assert.equal(a.group,g,n);assert.equal(a.type,t,n);assert.equal(a.muscle,m,n);assert(c.equipment&&c.loadNote,n);assert.equal(c.rankable,a.rankable,n);assert.equal(c.tracking,a.tracking,n);if(c.canonicalName){assert.equal(c.id,x.catalogue[c.canonicalName].id,n);}else{assert(!ids.has(c.id),n);ids.set(c.id,n);}if(['duration','load_distance','band_reps'].includes(c.tracking))assert.equal(c.rankable,false,n);for(const w of Object.values(c.muscles))assert(w>0&&w<=1,n);}
assert.equal(ids.size,447);assert.equal([...ids.values()].filter(n=>x.catalogue[n].rankable).length,400);
console.log('all 472 exercise protocols agree with catalogue, IDs and ranking metadata');
