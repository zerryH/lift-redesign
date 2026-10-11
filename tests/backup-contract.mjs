import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../data-integrity.js',import.meta.url),'utf8'),context);
const validate=context.SlatData.validateBackup;
const backup=()=>({version:4,workouts:[{id:1,d:'2026-09-20',ex:[{n:'Cable Curl',sets:[{kg:25,reps:8,rpe:8}]}]}],bw:[{d:'2026-09-20',kg:80}],settings:{unit:'kg',table:'M'}});
for(const field of ['kg','reps','seconds','meters','bw','height','rpe'])for(const value of [true,false,[],[25],{},'   ']){
 const b=backup();b.workouts[0].ex[0].sets[0][field]=value;
 assert.throws(()=>validate(b),/Invalid backup/,'reject coerced '+field);
}
for(const [field,value] of [['rpe',11],['protocolVersion',-1],['protocolVersion',1.5]]){
 const b=backup();b.workouts[0].ex[0].sets[0][field]=value;assert.throws(()=>validate(b),/Invalid backup/);
}
for(const version of [-1,0,true,[],5]){const b=backup();b.version=version;assert.throws(()=>validate(b),/Invalid backup/);}
for(const [field,value] of [['unit','stones'],['table','Unknown']]){const b=backup();b.settings[field]=value;assert.throws(()=>validate(b),/Invalid backup/);}
const cycle=backup();cycle.extra=cycle;assert.throws(()=>validate(cycle),/contains a cycle/);
const nested=backup();let child=nested;for(let i=0;i<70;i++)child=child.extra={};assert.throws(()=>validate(nested),/nested too deeply/);
const legacy=backup();delete legacy.version;delete legacy.settings;legacy.workouts[0].ex[0].sets[0]={kg:'-30',reps:'8',rpe:'0'};
const before=JSON.stringify(legacy),restored=validate(legacy);assert.equal(JSON.stringify(restored),before);assert.equal(restored.workouts[0].ex[0].sets[0].kg,'-30');
const shared=backup();shared.extra=shared.settings;validate(shared);
console.log('backup scalar measurements, enums, cycles and legacy numeric strings validated');
