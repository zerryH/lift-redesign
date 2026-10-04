import fs from 'node:fs';
import assert from 'node:assert/strict';
const R=JSON.parse(fs.readFileSync(new URL('../ranks-config.json',import.meta.url),'utf8'));
const E=JSON.parse(fs.readFileSync(new URL('../exercises.json',import.meta.url),'utf8'));
assert.equal(R.rankingVersion,5);
assert.equal(R.tiers.length,46);
assert.equal(Object.keys(R.t).length,E.ex.length);
for(const row of E.ex){
 const n=row.split('|')[0],v=R.t[n];
 assert.ok(v,'missing '+n);
 assert.equal(v.length,2);
 assert.equal(v[0].length,46);
 assert.equal(v[1].length,46);
 for(const a of v)for(let i=1;i<a.length;i++)assert.ok(a[i]>a[i-1],n+' thresholds must rise');
}
console.log('ranking config shape passed');
