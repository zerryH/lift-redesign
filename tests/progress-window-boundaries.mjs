import assert from 'node:assert/strict';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {boot,base,workout} from './support/runtime.mjs';

if(!process.env.SLAT_CHART_WINDOW_CASE){
 for(const zone of ['UTC','Europe/Helsinki','America/New_York','Etc/GMT-12']){
  const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url)],{env:{...process.env,TZ:zone,SLAT_CHART_WINDOW_CASE:'1'},encoding:'utf8',timeout:20000});
  assert.equal(result.status,0,zone+': '+result.stdout+result.stderr);
 }
 console.log('Chart windows share inclusive local dates for sets/bodyweight, preserve all dates and handle DST/epoch zero');
}else{
 const date=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 for(const [month,day] of [[2,29],[9,25]]){
  let stamp=new Date(2026,month,day,23,30).getTime();
  class Clock extends Date{constructor(...args){super(...(args.length?args:[stamp]))}static now(){return stamp}}
  const today=new Date(stamp),first=new Date(today);first.setHours(0,0,0,0);first.setDate(first.getDate()-89);
  const outside=new Date(first);outside.setDate(outside.getDate()-1);
  const tomorrow=new Date(today);tomorrow.setHours(0,0,0,0);tomorrow.setDate(tomorrow.getDate()+1);
  const dates=['1900-01-01','1970-01-01',date(outside),date(first),date(today),date(tomorrow),'2030-10-15'];
  const initial={...base(),workouts:dates.map((d,i)=>({...workout('Bench Press',20+i*10,8),id:i+1,d})),bw:dates.map((d,i)=>({d,kg:60+i*5}))};
  const z=await boot(initial,{Date:Clock}),h=z.h,before=JSON.stringify(h.S.workouts),weights=JSON.stringify(h.S.bw),stored=z.store.get('liftlog-state');
  const cut=h.progressWindowCut('90'),end=vm.runInContext('progressWindowEnd("90")',z.ctx);
  assert.equal(cut,first.getTime());assert.equal(end,tomorrow.getTime(),'upper bound follows the local calendar through DST');
  const points=h.progressSeries('Bench Press','load','','',cut,false,end);
  assert.deepEqual(Array.from(points,p=>date(new Date(p.t))),[date(first),date(today)]);

  for(const [id,value] of [['#qol-progress-lift','Bench Press'],['#qol-progress-window','90'],['#progress-metric','strength'],['#progress-profile','profile:'],['#progress-band','']])z.get(id).value=value;
  vm.runInContext('qolDrawProgress()',z.ctx);
  let table=z.get('#qol-progress-data').innerHTML;
  assert.equal((table.match(/<tr>/g)||[]).length,5,'header plus two eligible strength/bodyweight pairs');
  for(const d of [date(first),date(today)])assert(table.includes(new Date(d+'T12:00:00').toLocaleDateString()));
  for(const d of ['1900-01-01',date(outside),date(tomorrow),'2030-10-15'])assert(!table.includes(new Date(d+'T12:00:00').toLocaleDateString()));
  assert.match(z.get('#progress-help').textContent,/window ends today/);

  z.get('#qol-progress-window').value='all';vm.runInContext('qolDrawProgress()',z.ctx);
  table=z.get('#qol-progress-data').innerHTML;
  assert.equal((table.match(/<tr>/g)||[]).length,15,'All time retains every strength/bodyweight pair, including pre-epoch records');
  assert.equal(h.progressWindowCut('all'),-Infinity);assert.equal(vm.runInContext('progressWindowEnd("all")',z.ctx),Infinity);
  assert.deepEqual(Array.from(h.progressSeries('Bench Press','load','',''),p=>date(new Date(p.t))),dates);
  if(process.env.TZ==='Etc/GMT-12')assert(h.progressSeries('Bench Press','load','','').some(p=>p.t===0),'a valid epoch-zero noon must not be treated as an invalid date');
  assert.match(z.get('#progress-help').textContent,/All time includes future-dated records/);

  stamp=tomorrow.getTime()+5*60000;
  z.get('#qol-progress-window').value='90';vm.runInContext('qolDrawProgress()',z.ctx);
  table=z.get('#qol-progress-data').innerHTML;
  assert(table.includes(new Date(date(tomorrow)+'T12:00:00').toLocaleDateString()),'the next-day record becomes eligible on its local date');
  assert(!table.includes(new Date(date(first)+'T12:00:00').toLocaleDateString()),'the lower boundary advances at midnight');
  assert.equal(JSON.stringify(h.S.workouts),before);assert.equal(JSON.stringify(h.S.bw),weights);
  await h.flush();assert.equal(z.store.get('liftlog-state'),stored,'chart selection never rewrites durable records');
  assert.deepEqual(z.errors,[]);
 }
}
