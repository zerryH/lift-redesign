import fs from 'node:fs';
import assert from 'node:assert/strict';

const R=JSON.parse(fs.readFileSync('ranks-config.json','utf8'));
const roundEven=x=>{const f=Math.floor(x),d=x-f;if(d<.5)return f;if(d>.5)return f+1;return f%2===0?f:f+1};
const roundStep=v=>v<10?roundEven(v/.25)*.25:v<50?roundEven(v/.5)*.5:roundEven(v/.75)*.75;
const round2=v=>roundEven(v*100)/100;
const tierMult=i=>1+2.4*Math.pow(i/45,1.45);
const baseRatio=(name,m)=>{const k=m.kind,n=name.toLowerCase(),muscle=m.muscle||'';
 if(k==='deadlift')return .90;if(k==='squat')return .70;if(k==='hackSquat')return .65;if(k==='legPress')return 1.25;if(k==='rdl')return .60;if(k==='hipThrust')return .80;if(k==='legExt')return .40;if(k==='legCurl')return .32;if(k==='calf')return .45;if(k==='olympic')return .55;if(k==='bench')return .50;if(k==='ohp')return .35;if(k==='row')return .45;if(k==='pulldown')return .45;if(k==='chestMachine')return .48;if(k==='chestFly')return .22;if(k==='triceps')return .24;if(k==='curl'||k==='dbCurl')return .24;if(k==='lateral')return .08;if(k==='rearDelt')return .10;if(k==='carry')return .60;if(k==='assisted')return .18;
 if(k==='bodyweight'){if(n.includes('pull-up')||n.includes('chin-up')||n.includes('muscle-up'))return .65;if(n.includes('dip'))return .80;if(n.includes('push-up')||n.includes('pushup'))return .35;return .22;}
 if(k==='core'||muscle==='Core'||muscle==='Abs')return .20;if(muscle==='Legs'||muscle==='Glutes')return .55;if(muscle==='Back')return .42;if(muscle==='Chest')return .42;if(muscle==='Shoulders')return .25;if(muscle==='Biceps'||muscle==='Triceps')return .22;if(muscle==='Calves')return .35;return .35;};
const generate=(name,m)=>{let b=baseRatio(name,m)*(m.unilateral?.78:1)*({high:1,medium:1.05,low:1.15}[m.rom]??1.05);const male=round2(75*b),female=round2(60*b*.68),out=[[],[]];for(const [arr,ref] of [[out[0],male],[out[1],female]]){for(let i=0;i<46;i++)arr.push(roundStep(ref*tierMult(i)));for(let i=1;i<46;i++)if(arr[i]<=arr[i-1])arr[i]=arr[i-1]+(arr[i-1]<10?.25:arr[i-1]<50?.5:.75);}return out;};
const expected=Object.fromEntries(Object.entries(R.exerciseMeta).map(([n,m])=>[n,generate(n,m)]));
if(process.argv.includes('--check')){assert.deepEqual(expected,R.t,'rank v7 thresholds do not match the documented generator');console.log(`rank v7 generator check passed · ${Object.keys(expected).length} exercises`);}else{R.t=expected;R.rankingVersion=7;fs.writeFileSync('ranks-config.json',JSON.stringify(R,null,2)+'\n');console.log(`wrote ${Object.keys(expected).length} rank v7 ladders`);}
