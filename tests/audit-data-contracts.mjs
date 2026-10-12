import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

const z=await boot({...base(),workouts:[workout()]});
const rejected=async data=>{const before=z.store.get('liftlog-state');await assert.rejects(()=>z.h.importBackup(data),/Invalid backup/);assert.equal(z.store.get('liftlog-state'),before);};
await rejected({workouts:[workout(),{...workout('Dumbbell Curl'),id:1}],bw:[],cur:workout('Dumbbell Curl'),editingId:1});
await rejected({workouts:[workout()],bw:[],cur:{...workout(),id:2},editingId:1});
await z.h.importBackup({workouts:[workout()],bw:[],cur:workout(),editingId:1});
assert.equal(z.h.S.editingId,1);
const existing=await boot({...base(),workouts:[workout(),workout('Dumbbell Curl')],cur:workout('Dumbbell Curl'),editingId:1});assert.equal(existing.h.S.editingId,null,'an ambiguous preexisting draft must not overwrite either saved record');assert.notEqual(existing.h.S.cur.id,1);assert.equal(existing.h.S.workouts.length,2);
for(const trackingMode of ['duration','load_distance','band_reps']){const w=workout();w.ex[0].sets[0].trackingMode=trackingMode;await rejected({workouts:[w],bw:[]});assert.equal(z.h.rankSetEst('Bench Press',w.ex[0].sets[0],80),0);}
for(const [n,mode,set] of [['Plank','duration',{kg:0,reps:0,seconds:45}],['Farmer Carry','load_distance',{kg:25,reps:0,meters:20}],['Band Curl','band_reps',{kg:0,reps:8,band:'Light'}]]){const w=workout(n);w.ex[0].sets=[{...set,trackingMode:mode}];z.h.SlatData.validateBackup({workouts:[w],bw:[]});}
for(const value of [1.5,0,13,'invalid'])await rejected({workouts:[],bw:[],checks:{'Bench Press':{w:50,r:value,b:80,h:178,f:'M',d:'2026-09-20'}}});
await rejected({workouts:[{...workout(),d:'0001-01-01'}],bw:[]});
assert.throws(()=>z.h.SlatWorkout.correct(workout(),'0001-01-01','',Date.UTC(2026,9,12)),/real date/);assert(z.h.SlatData.date('1900-01-01'));assert(z.h.SlatData.date('9999-12-31'));assert(!z.h.SlatData.date('1900-02-29'));assert(z.h.SlatData.date('2000-02-29'));
const routine={id:'routine:test',name:'Plan',ex:[{n:'Does not exist',exerciseId:'ex001',sets:3,reps:8,seconds:30,meters:20,rest:90}]};
await rejected({workouts:[],bw:[],routines:[routine]});assert.throws(()=>z.h.routineSession(routine),/Repair/);routine.ex[0].n='Bench Press';await z.h.importBackup({workouts:[],bw:[],routines:[routine]});
const provenance=vm.createContext({});vm.runInContext(fs.readFileSync('performance-contract.js','utf8'),provenance);
for(const factor of [0,.5,1])assert.equal(provenance.SlatPerformance.provenance({id:'custom:test',tracking:'load_reps',rankable:false},{loadMode:'bodyweight',bodyweightFactor:factor},{}).loadProtocol.bodyweightFactor,factor);
const custom=await boot({...base(),custom:[{n:'Cable Curl Test',t:'M',c:'Biceps',equipment:'Cable / rope',rank:'Leg Press'}],workouts:[workout('Cable Curl Test',25,8)]});assert.equal(custom.h.rankThresholds('Cable Curl Test'),null);custom.h.S.custom[0].rank='Cable Curl';custom.h.rebuildRegistry();assert(custom.h.rankThresholds('Cable Curl Test'));

// Isolate persistence with genuinely stalled requests and an interleaved fallback writer.
const source=fs.readFileSync('persistence.js','utf8');
function storage(overrides={}){const timers=new Map(),store=new Map([['liftlog-state',JSON.stringify({savedAt:1,revision:1})]]);let next=0;const ctx={location:{protocol:'https:'},navigator:{},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},sessionStorage:{getItem:()=>null,removeItem(){}},setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id),S:{savedAt:1,revision:1,workouts:[],set:{}},setPersistenceStatus(){},showStorageConflict(){},toast(){},Date,JSON,Number,Promise,Error,...overrides};vm.createContext(ctx);vm.runInContext(source+'\nglobalThis.api={idb,dbRead,dbGet,save,clearStoredState,setRevision(){storageRevision=1;durableRevision=1;}};',ctx);ctx.api.setRevision();return {ctx,store,timers};}
let openRequest;const stalled=storage({indexedDB:{open(){return openRequest={};}}});const opening=stalled.ctx.api.dbGet();await Promise.resolve();for(const fn of [...stalled.timers.values()])fn();assert.equal((await opening).savedAt,1,'startup falls back to the intact local copy');let closed=0;openRequest.result={close(){closed++;}};openRequest.onsuccess();assert.equal(closed,1,'late abandoned database connections are closed');
let blockedRequest;const blocked=storage({indexedDB:{open(){return blockedRequest={};}}});const blockedOpen=blocked.ctx.api.idb();blockedRequest.onblocked();await assert.rejects(blockedOpen,/blocked/);
let aborts=0;const read=storage({indexedDB:{open(){const q={result:{transaction(){return {objectStore(){return {get(){return {};}};},abort(){aborts++;}};},close(){}}};queueMicrotask(()=>q.onsuccess());return q;}}});const reading=read.ctx.api.dbRead();for(let i=0;i<5;i++)await Promise.resolve();for(const fn of [...read.timers.values()])fn();await assert.rejects(reading,/timed out/);assert.equal(aborts,1);
const shared=new Map([['liftlog-state',JSON.stringify({savedAt:1,revision:1})]]),writes=[];const failingDB={open(){const q={};queueMicrotask(()=>q.onerror());return q;}};
const make=()=>storage({indexedDB:failingDB,localStorage:{getItem:k=>shared.get(k)??null,setItem:(k,v)=>{writes.push(v);shared.set(k,v);},removeItem:k=>shared.delete(k)}});
const a=make(),b=make();a.ctx.S.workouts=['A'];b.ctx.S.workouts=['B'];assert.deepEqual(await Promise.all([a.ctx.api.save(),b.ctx.api.save()]),[false,false]);assert.equal(writes.length,0,'an unsafe unlocked fallback never acknowledges or overwrites either writer');
const safe=make();safe.ctx.navigator.locks={request(_name,job){return job();}};assert.equal(await safe.ctx.api.save(),true,'a coordinated local fallback remains available');
const reset=storage({location:{protocol:'file:'}});for(const key of ['liftlog-import-recovery','liftlog-ranking-migration-backup','liftlog-startup-recovery'])reset.store.set(key,'private');reset.store.set('unrelated-origin-data','keep');assert.equal(await reset.ctx.api.clearStoredState(),true);assert.equal(reset.store.size,1);assert.equal(reset.store.get('unrelated-origin-data'),'keep');
assert.deepEqual([...z.errors,...custom.errors],[]);
console.log('Ambiguous IDs, typed sets, saved checks, routine identities, zero factors, storage deadlines, unlocked fallbacks and complete reset are covered');
