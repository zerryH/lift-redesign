import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const recorded=(kg,loggedAt,name='Cable Curl')=>({n:name,sets:[{kg,reps:8,t:'',loggedAt}]});
const history={...workout('Cable Curl'),id:2,d:'2026-09-19',ex:[
 recorded(50,20),
 recorded(40,10,'Cable Bicep Curl'),
]};
const current={...workout('Cable Curl'),id:3,d:'2026-09-20',ex:[{n:'Cable Curl',sets:[]}]};
const app=await boot({...base(),workouts:[history],cur:current});
const before=JSON.stringify(app.h.S.workouts[0]);

assert.equal(app.h.qolPrevSet('Cable Curl').kg,50,'Last Time follows recorded chronology across aliases');
assert.equal(app.h.dr.kg,50,'the draft repeats the chronologically latest set');
assert.equal(JSON.stringify(app.h.S.workouts[0]),before,'reading history cannot rewrite saved sets');

// Legacy workouts without timestamps retain deterministic session/array order.
app.h.S.workouts=[{...history,ex:[recorded(60,0),recorded(70,0,'Cable Bicep Curl')]}];
assert.equal(app.h.qolPrevSet('Cable Curl').kg,70);
assert.deepEqual(app.errors,[]);
console.log('Previous-set suggestions respect recorded chronology, aliases and legacy order');
