import fs from 'node:fs';
import assert from 'node:assert/strict';
const cfg=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const app=fs.readFileSync('app.js','utf8');
assert.equal(cfg.tiers.length,46);
assert.equal(Object.keys(cfg.t).length,460);
assert.match(app,/let TN=\[\]; let MAX_RANK=-1;/);
assert.match(app,/TN=Array\.isArray\(R\.tiers\)\?R\.tiers\.slice\(\):\[\];MAX_RANK=TN\.length-1/);
assert.match(app,/rankListOpen=\(\)=>/);
assert.match(app,/data-a=rankList/);
assert.match(app,/Every rank from Wood I to Blue Gem/);
assert.match(app,/const rankMetrics=\(i,x,adj,b,h,diff=1,e=x\)/);
assert.match(app,/if\(i>=MAX_RANK\)return\{pc:100,need:null,next:null,max:true\}/);
for(const [name,sexes] of Object.entries(cfg.t)){
  for(const sex of sexes){
    assert.equal(sex.length,46,name);
    for(let i=0;i<46;i++){
      const ratio=sex[i];
      let got=0;
      sex.forEach((threshold,j)=>{if(ratio>=threshold)got=j});
      assert.equal(got,i,name+' tier '+i);
      assert(Number.isFinite(got));
    }
    const top=sex[45];
    let got=0;sex.forEach((threshold,j)=>{if(top>=threshold)got=j});
    assert.equal(got,45,name+' max');
  }
}
console.log('rank progression ok · 460 standards × 46 tiers');
