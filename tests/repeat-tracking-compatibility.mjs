import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const repeat=z=>{for(const fn of z.listeners.click)fn({target:{closest:s=>s==='[data-qol]'?{dataset:{qol:'repeatLast'}}:null,classList:{contains:()=>false}}});};
const setup=async(n,set)=>boot({...base(),workouts:[{...workout(n),id:1,d:'2026-09-19',ex:[{n,sets:[{t:'',...set}]}]}],cur:{...workout(n),id:2,d:'2026-09-20',ex:[{n,sets:[]}]}});

for(const n of ['Plank','Farmer’s Carry','Resistance Band Curl']){
 const z=await setup(n,{kg:20,reps:12});
 Object.assign(z.h.dr,{seconds:75,meters:42.25,band:'My typed band',note:'Keep my note',rpe:'8',weightText:'invalid',weightUnit:'kg',invalidWeight:true});
 const before=JSON.stringify(z.h.dr),history=JSON.stringify(z.h.S.workouts),stored=z.store.get('liftlog-state');
 repeat(z);assert.equal(JSON.stringify(z.h.dr),before,n+': incompatible legacy measurements must not overwrite a typed draft');
 assert(!z.h.V.today().includes('data-qol="repeatLast"'),n+': do not offer Repeat for an entry without current measurements');
 assert.equal(JSON.stringify(z.h.S.workouts),history);assert.equal(z.store.get('liftlog-state'),stored);assert.deepEqual(z.errors,[]);
 if(n==='Resistance Band Curl')assert.match(z.h.setSummary(n,z.h.qolPrevSet(n)),/band resistance not recorded/);
}

const modern=[
 ['Bench Press',{kg:67.25,reps:9,trackingMode:'load_reps'},'kg',67.25],
 ['Assisted Pull-Up Machine',{kg:-25,reps:8,trackingMode:'load_reps'},'kg',25],
 ['Push-Up',{kg:0,reps:17,trackingMode:'reps'},'reps',17],
 ['Plank',{kg:0,reps:0,seconds:77.5,trackingMode:'duration'},'seconds',77.5],
 ['Weighted Plank',{kg:12.5,reps:0,seconds:45,trackingMode:'duration'},'kg',12.5],
 ['Farmer’s Carry',{kg:32.5,reps:0,meters:33.25,trackingMode:'load_distance'},'meters',33.25],
 ['Resistance Band Curl',{kg:0,reps:15,band:'red',trackingMode:'band_reps'},'band','red'],
];
for(const [n,set,field,value] of modern){
 const z=await setup(n,{...set,protocolVersion:2}),history=JSON.stringify(z.h.S.workouts);
 assert(z.h.V.today().includes('data-qol="repeatLast"'),n+': compatible measurements remain repeatable');
 Object.assign(z.h.dr,{seconds:5,meters:5,reps:3,band:'old',note:'Keep note',rpe:'8',invalidWeight:true,invalidReps:true,weightText:'bad',repsText:'bad'});
 repeat(z);assert.equal(z.h.dr[field],value,n);assert.equal(z.h.dr.note,'Keep note');assert.equal(z.h.dr.rpe,'8');assert.equal(z.h.dr.invalidWeight,false);assert.equal(z.h.dr.invalidReps,false);
 assert(z.h.makeDraftSet(),n+': repeated modern data remains loggable');await z.h.flush();
 assert.equal(JSON.stringify(z.h.S.workouts),history);assert.deepEqual(z.errors,[]);
}

// Reject incomplete/mismatched explicit protocols too, not just migrated legacy records.
for(const [n,set] of [
 ['Plank',{kg:0,reps:8,trackingMode:'load_reps'}],
 ['Plank',{kg:0,reps:0,trackingMode:'duration'}],
 ['Farmer’s Carry',{kg:20,reps:0,meters:0,trackingMode:'load_distance'}],
 ['Bench Press',{kg:-1,reps:8,trackingMode:'load_reps'}],
]){
 const z=await setup(n,{kg:0,reps:8});z.h.S.workouts[0].ex[0].sets[0]={t:'',...set};
 const before=JSON.stringify(z.h.dr);repeat(z);assert.equal(JSON.stringify(z.h.dr),before,n+': incomplete or incompatible measurements cannot be guessed');assert.deepEqual(z.errors,[]);
}
console.log('Repeat preserves drafts for legacy/incompatible/incomplete records, while every supported tracking mode retains exact modern measurements');
