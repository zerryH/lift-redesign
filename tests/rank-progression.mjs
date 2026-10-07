import fs from 'node:fs';
import assert from 'node:assert/strict';
const cfg=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
assert.equal(cfg.tiers.length,46);
assert.equal(Object.keys(cfg.t).length,468);
assert.match(app,/let TN=\[\]; let MAX_RANK=-1;/);
assert.match(app,/TN=Array\.isArray\(R\.tiers\)\?R\.tiers\.slice\(\):\[\];MAX_RANK=TN\.length-1/);
assert.match(app,/rankListOpen=\(\)=>/);
assert.match(app,/data-a=rankList/);
assert.match(app,/class="rank-info-button"/);
assert.match(app,/All ranks/);
assert.ok(app.includes('const rankMetrics=(i,x,adj,b,h,diff=1,e=x,loadDiv=1)=>'));
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
console.log('rank progression ok · 468 standards × 46 tiers');

assert.match(app,/aria-controls="rank-list-modal"/);
console.log('rank guide sheet regression passed');

assert.ok(app.includes("className='sheet rank-guide-sheet'")); 
assert.ok(app.includes('class="rank-guide-list"')); 
assert.ok(css.includes('.rank-guide-list{min-height:0;flex:1 1 auto;overflow-y:auto')); 
console.log('tutorial-style rank guide regression passed');

assert.ok(app.includes('rank-info-glyph'));
assert.ok(css.includes('.rank-info-glyph'));
console.log('rank info control regression passed');

assert.ok(app.includes('class=\"rank-heading\"'));
assert.ok(app.includes('class=\"rank-info-button\"'));
assert.ok(css.includes('.rank-heading{position:relative'));
console.log('rank info placement regression passed');

assert.ok(css.includes('authoritative Safari-safe rank info control'));
assert.ok(css.includes('background:transparent!important'));
assert.ok(css.includes('-webkit-appearance:none!important'));
console.log('rank info Safari styling regression passed');

assert.ok(app.includes('role=\"button\" tabindex=\"0\" data-a=rankList')); assert.ok(app.includes("keydown")); console.log('native-button regression passed');


assert.doesNotMatch(app,/normalized BW/); assert.doesNotMatch(app,/\$\{r\.x\.toFixed\(2\)\}x bodyweight/);
assert.doesNotMatch(app,/rank-guide-intro/);
assert.doesNotMatch(app,/rank-guide-note/);
assert.ok(app.includes('<b>${name}</b></div>'));
console.log('rank guide rows contain only icon + rank name');
