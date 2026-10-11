/* Slat ranking engine — v9 exercise-specific scoring; no UI/state side effects. */
globalThis.LiftRankingEngine=(()=>{
const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const lerp=(a,b,t)=>a+(b-a)*t;
const interp=(p,x)=>{if(!p?.length)return 1;if(x<=p[0][0])return p[0][1];for(let i=1;i<p.length;i++){if(x<=p[i][0]){const[x0,y0]=p[i-1],[x1,y1]=p[i];return lerp(y0,y1,(x-x0)/(x1-x0))}}return p[p.length-1][1]};
const ageMultiplier=(age,c)=>{if(age===null||age===undefined||age==='')return 1;const a=finite(age,NaN);return Number.isFinite(a)&&a>=13?Math.min(c.ageCap??1.2,interp(c.ageCurve,a)):1};
const heightMultiplier=(h,sex,rom,c)=>{const n=finite(h,NaN),ref=finite(c.referenceHeightCm?.[sex],NaN);if(!Number.isFinite(n)||!Number.isFinite(ref)||n<=0)return 1;const k=finite(c.height?.kByRom?.[rom],0);return Math.max(c.height?.capMin??.9,Math.min(c.height?.capMax??1.1,Math.pow(ref/n,k)))};
const repReliability=(r,c)=>interp(c.repReliability,finite(r,1));
const effectiveLoad=(s,e,b)=>{const bw=finite(b),w=finite(s?.kg),mode=e?.loadMode||'normal';if(mode==='assisted')return Math.max(0,bw-w);if(mode==='bodyweight')return Math.max(0,bw*finite(e?.bodyweightFactor,1)+w);const m=e?.unilateral?1:finite(e?.loadMultiplier,1);return Math.max(0,w*m)};
const estimate1RM=(s,e,b,c)=>{const r=Math.round(finite(s?.reps));if(e?.rankable===false||s?.seconds>0||s?.meters>0||s?.t==='w'||r<1||r>finite(c.epleyMaxReps,12))return 0;const load=effectiveLoad(s,e,b);if(load<=0)return 0;const x=r===1?load:load*(1+r/30);return x*repReliability(r,c)};
const adjustedScore=(e,b,sex,h,age,ex,c)=>{const bw=finite(b),ref=finite(c.referenceBodyweightKg?.[sex]);if(e<=0||bw<=0||ref<=0)return 0;let score=e*Math.pow(ref/bw,finite(c.allometricExponent,.67));if(c.ageAdjust!==false)score*=ageMultiplier(age,c);if(c.heightAdjust!==false)score*=heightMultiplier(h,sex,ex?.rom,c);return score};
const rankIndex=(score,t)=>{if(!Array.isArray(t)||!Number.isFinite(score)||score<=0)return -1;let i=-1;for(let j=0;j<t.length;j++)if(score+Math.max(1e-9,Math.abs(t[j])*1e-12)>=t[j])i=j;return i};
const percentileScore=(score,t,c)=>{if(!Array.isArray(t)||!t.length||!Number.isFinite(score)||score<=0)return 0;const p=c?.rankPercentiles||[];if(score<t[0])return 0;for(let i=1;i<t.length;i++){if(score<t[i]){const p0=Number(p[i-1]??i-1),p1=Number(p[i]??i);return p0+(p1-p0)*(score-t[i-1])/Math.max(1e-9,t[i]-t[i-1])}}return Number(p[t.length-1]??99)};
const percentileToRankIndex=(p,c)=>{const q=Math.max(0,Math.min(99.9,finite(p,0))),a=c?.rankPercentiles||[];if(!a.length)return -1;let i=-1;for(let j=0;j<a.length;j++)if(q>=a[j])i=j;return i};
const thresholds=(c,n,sex)=>c.t?.[n]?.[sex==='F'?1:0]||null;
return{interp,ageMultiplier,heightMultiplier,repReliability,effectiveLoad,estimate1RM,adjustedScore,rankIndex,percentileScore,percentileToRankIndex,thresholds}
})();
