/* Exercises execute their logging contract and survive a real app state round trip. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {boot,base} from './support/runtime.mjs';
const z=await boot(),h=z.h,entries=Object.values(h.X.catalogue).filter(c=>!c.canonicalName),zones=new Set();
for(const side of ['front','back']){const svg=fs.readFileSync('anatomy-'+side+'.svg','utf8');for(const m of svg.matchAll(/data-muscles="([^"]+)"/g))zones.add(m[1]);const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'unique '+side+' SVG IDs');const stack=[];for(const m of svg.matchAll(/<\/?g\b[^>]*>/g)){if(m[0].startsWith('</'))assert(stack.pop(),'unmatched group close');else stack.push(m[0]);}assert.equal(stack.length,0,'balanced '+side+' SVG groups');}
assert.equal(zones.size,16,'every supported muscle has an illustrated zone');
const sessions=[];
for(const [i,c] of entries.entries()){
 for(const key of Object.keys(c.muscles))assert(zones.has(key),'unrendered muscle '+c.name+' '+key);
 h.S.cur={id:i+1,d:'2026-10-10',split:c.split,ex:[{n:c.name,sets:[]}]};h.ci=0;h.dr={};h.V.today();
 Object.assign(h.dr,{kg:20,reps:8,seconds:45,meters:25,band:'red band',note:'Protocol check',rpe:8});
 const set=h.makeDraftSet();assert(set,c.name);assert(set.id.startsWith('set:'),c.name);assert.equal(set.protocolVersion,2);assert.equal(set.note,'Protocol check');assert.equal(set.rpe,8);
 if(c.tracking==='duration')assert.equal(set.seconds,45);
 if(c.tracking==='load_distance')assert.equal(set.meters,25);
 if(c.tracking==='band_reps')assert.equal(set.band,'red band');
 if(['reps','band_reps'].includes(c.tracking))assert.equal(set.kg,0);
 if(!c.rankable)assert.equal(h.rankSetEst(c.name,set,80),0,c.name+' must remain tracking-only');
 h.S.cur.ex[0].sets.push(set);h.repairState();sessions.push(h.S.cur);h.S.cur=null;
 if(c.rankable)for(const sex of ['M','F']){
  const t=h.rankThresholds(c.name,sex);assert(t?.length===46,c.name);
  for(let k=0;k<t.length;k++){
   const r=h.rankMetrics(k,t[k],t,80,178,1,100,1);assert.equal(r.pc,k===t.length-1?100:0,c.name+' tier '+k);assert.equal(r.max,k===t.length-1);assert(r.max||r.need>0,c.name+' next-tier target');
  }
 }
}
h.S.workouts=sessions;await h.save();const raw=JSON.parse(z.store.get('liftlog-state')),next=await boot(raw);
assert.equal(next.h.S.workouts.length,447);assert.equal(new Set(next.h.S.workouts.flatMap(w=>w.ex.flatMap(x=>x.sets.map(s=>s.id)))).size,447);
for(const [i,w] of next.h.S.workouts.entries()){const c=entries[i],set=w.ex[0].sets[0];assert.equal(w.ex[0].exerciseId,c.id);assert.equal(set.id,sessions[i].ex[0].sets[0].id);assert.equal(set.note,'Protocol check');assert.equal(set.rpe,8);}
assert.deepEqual(next.errors,[]);
console.log('447 canonical logging protocols round-trip; 400 ranked movements × 2 references × 46 progress boundaries; all 16 map zones covered');
