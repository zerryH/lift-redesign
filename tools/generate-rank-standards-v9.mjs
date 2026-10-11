// Slat ranking standards v9: assisted movements use exercise-specific effective-load anchors.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const R=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const roundEven=x=>{const f=Math.floor(x),d=x-f;if(d<.5)return f;if(d>.5)return f+1;return f%2===0?f:f+1};
const roundStep=v=>v<10?roundEven(v/.25)*.25:v<50?roundEven(v/.5)*.5:roundEven(v/.75)*.75;
const round2=v=>roundEven(v*100)/100;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const tierCurve=(wood,blue,i)=>wood+(blue-wood)*Math.pow(i/45,1.45);
const family=(name,m)=>{const a=m.standardAnchors;assert(a&&Number.isFinite(a.minimumRatio)&&Number.isFinite(a.maximumRatio)&&a.maximumRatio>a.minimumRatio,'Missing explicit standard anchors: '+name);return[a.minimumRatio,a.maximumRatio];};
const romFactor={high:.97,medium:1,low:1.03};
const generate=(name,m)=>{
 const [wood,blue]=family(name,m);
 const ref=75;
 const rom=romFactor[m.rom]??1;
 const unilateral=m.unilateral?1.02:1;
  const out=[[],[]];
 for(const [arr,refBW,sexFactor] of [[out[0],75,1],[out[1],60,.68]]){
   for(let i=0;i<46;i++){
     const effective=refBW*tierCurve(wood,blue,i)*rom*unilateral*sexFactor;
     arr.push(roundStep(effective));
   }
   for(let i=1;i<46;i++)if(arr[i]<=arr[i-1])arr[i]=arr[i-1]+(arr[i-1]<10?.25:arr[i-1]<50?.5:.75);
 }
 return out;
};
const expected=Object.fromEntries(Object.entries(R.exerciseMeta).map(([n,m])=>[n,generate(n,m)]));
if(process.argv.includes('--check')){assert.deepEqual(expected,R.t,'rank v10 thresholds do not match the documented generator');console.log(`rank v10 generator check passed · ${Object.keys(expected).length} exercises`);}
else{R.t=expected;R.rankingVersion=10;R.ranking={...R.ranking,ageCurve:[[13,1.08],[15,1.06],[18,1.03],[20,1],[40,1],[45,1.03],[50,1.06],[60,1.10],[70,1.12],[100,1.12]],ageCap:1.12,height:{...(R.ranking.height||{}),kByRom:{high:.08,medium:.06,low:.04},capMin:.94,capMax:1.06}};fs.writeFileSync('ranks-config.json',JSON.stringify(R,null,2)+'\n');console.log(`wrote ${Object.keys(expected).length} rank v10 ladders`);}
