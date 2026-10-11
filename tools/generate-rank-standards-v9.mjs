// Slat ranking standards v9: assisted movements use exercise-specific effective-load anchors.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const R=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const roundEven=x=>{const f=Math.floor(x),d=x-f;if(d<.5)return f;if(d>.5)return f+1;return f%2===0?f:f+1};
const roundStep=v=>v<10?roundEven(v/.25)*.25:v<50?roundEven(v/.5)*.5:roundEven(v/.75)*.75;
const round2=v=>roundEven(v*100)/100;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const tierCurve=(wood,blue,i)=>wood+(blue-wood)*Math.pow(i/45,1.45);
const family=(name,m)=>{
 const k=m.kind,n=name.toLowerCase(),muscle=m.muscle||'';
 if(k==='explicit'){
   if(/bench press|incline bench/.test(n))return [.20,3.0];
   if(/deadlift$/.test(n))return [.35,3.8];
   if(/^squat$/.test(n))return [.30,3.5];
   if(/leg press/.test(n))return [.65,5.0];
   if(/hack squat/.test(n))return [.32,3.5];
   if(/romanian deadlift/.test(n))return [.30,3.2];
   if(/hip thrust/.test(n))return [.45,4.5];
   if(/leg extension/.test(n))return [.15,2.0];
   if(/leg curl/.test(n))return [.12,1.8];
   if(/overhead press|shoulder press/.test(n))return [.15,2.2];
   if(/lat pulldown/.test(n))return [.16,2.5];
   if(/cable row|barbell row/.test(n))return [.18,2.8];
   if(/barbell curl/.test(n))return [.10,1.5];
   if(/dumbbell curl/.test(n))return [.10,1.5];
   if(/crunch/.test(n))return [.08,1.2];
 }
 if(k==='hipIsolation')return [.10,1.5]; if(k==='shrug')return [.22,3.0]; if(k==='wrist')return [.04,.70];
 if(k==='deadlift')return [.35,3.8]; if(k==='squat')return [.30,3.5]; if(k==='hackSquat')return [.32,3.5]; if(k==='legPress')return [.65,5.0]; if(k==='rdl')return [.30,3.2]; if(k==='hipThrust')return [.45,4.5]; if(k==='legExt')return [.15,2.0]; if(k==='legCurl')return [.12,1.8]; if(k==='calf')return [.18,2.5]; if(k==='olympic')return [.25,3.2]; if(k==='bench')return [.20,3.0]; if(k==='ohp')return [.15,2.2]; if(k==='row')return [.18,2.8]; if(k==='pulldown')return [.16,2.5]; if(k==='chestMachine')return [.22,3.0]; if(k==='chestFly')return [.10,1.5]; if(k==='triceps')return [.10,1.5]; if(k==='curl'||k==='dbCurl')return [.10,1.5]; if(k==='lateral')return [.05,.75]; if(k==='rearDelt')return [.06,.90]; if(k==='carry')return [.25,3.0]; if(k==='assisted'){
   if(/chest dip/.test(n))return [.20,1.60];
   if(/dip/.test(n))return [.22,1.80];
   if(/pull-up|chin-up/.test(n))return [.18,1.55];
   return [.18,1.50];
 }
 if(k==='bodyweight'){
   if(/pull-up|chin-up|muscle-up/.test(n))return [.95,2.5];
   if(/dip/.test(n))return [1.00,3.0];
   if(/push-up|pushup/.test(n))return [.70,2.0];
   return [.45,1.8];
 }
 if(k==='core'||muscle==='Core'||muscle==='Abs')return [.08,1.20];
 if(muscle==='Legs'||muscle==='Glutes')return [.22,3.0];
 if(muscle==='Back')return [.16,2.5];
 if(muscle==='Chest')return [.18,2.7];
 if(muscle==='Shoulders')return [.10,1.8];
 if(muscle==='Biceps'||muscle==='Triceps')return [.10,1.5];
 if(muscle==='Calves')return [.18,2.5];
 return [.15,2.0];
};
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
