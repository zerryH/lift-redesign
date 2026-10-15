/* Real-browser release journeys. A missing browser is a failure, never a skipped pass. */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {base,workout} from '../tests/support/runtime.mjs';
const playwright=await import(process.env.SLAT_PLAYWRIGHT_PATH||'playwright');
let workerTag='',legacyHtml=false,stalePage=false;const legacyErrors=[];
const root=process.cwd(),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname)==='/'?'index.html':decodeURIComponent(url.pathname).slice(1),file=path.resolve(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}let body=await fs.readFile(legacyHtml&&name==='index.html'?path.join(root,'tests/fixtures/release-5.5.106/index.html'):file);if(stalePage&&name==='index.html'){body=Buffer.from(body.toString().replace(/const BUILD_VERSION='[^']+';/,"const BUILD_VERSION='5.7.10';"));stalePage=false;}if(name==='sw.js'&&workerTag)body=Buffer.from(body.toString().replace(/const V='[^']+'/,'const V=\"liftlog-'+workerTag+'\"'));res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
const report={browser:[],checks:[],errors:[]},out=path.resolve(process.env.SLAT_BROWSER_OUTPUT||'test-results/browser');await fs.mkdir(out,{recursive:true});
// Full Chromium's new headless mode implements notification permissions; the default shell denies them.
const options=process.env.SLAT_CHROMIUM_PATH?{executablePath:process.env.SLAT_CHROMIUM_PATH,args:['--disable-gpu']}:{channel:'chromium'},names=(process.env.SLAT_BROWSERS||'chromium').split(',');
let browser,context,page,engineName;
async function open(state=base(),viewport={width:390,height:844},ready='[data-a=start]',target=url,blockWorkers=false,nativeBridge=false){
 // Closing the isolated context tears down its workers. Unregistering through an old
 // WebKit page can remain pending and prevent the next journey from starting.
 if(context)await context.close();context=await browser.newContext({viewport,...(blockWorkers?{serviceWorkers:'block'}:{})});page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',e=>(legacyHtml?legacyErrors:report.errors).push(e.message));
 await page.addInitScript(()=>{window.slatTestClicks=[];document.addEventListener('click',e=>{const b=e.target.closest?.('[data-a],[data-qol]');let flags;try{flags={finishing,importing,storageConflict};}catch{}window.slatTestClicks.push({id:e.target.id,a:b?.dataset?.a,qol:b?.dataset?.qol,x:e.clientX,y:e.clientY,flags});if(window.slatTestClicks.length>15)window.slatTestClicks.shift();},true);});
 // File URL reloads can recreate sessionStorage; seed once in the same durable store as the fixture.
 await page.addInitScript(s=>{if(!localStorage.getItem('slat-test-seeded')){localStorage.setItem('liftlog-state',typeof s==='string'?s:JSON.stringify(s));localStorage.setItem('slat-test-seeded','1');}},state);
 if(nativeBridge)await page.addInitScript(()=>{
  window.slatNativeMessages=[];
  window.webkit={messageHandlers:{slatRestTimer:{postMessage(message){window.slatNativeMessages.push(JSON.parse(JSON.stringify(message)));if(message.action==='status')setTimeout(()=>window.dispatchEvent(new CustomEvent('slat-native-rest-status',{detail:{allowed:true,error:''}})),0);}}}};
 });
 await page.goto(target);await page.bringToFront();await page.locator(ready).first().waitFor();
}
async function check(name,fn){await fn();report.checks.push(name);console.log('PASS '+name);}
async function clickControl(locator){
 if(engineName!=='webkit')return locator.click();
 // WebKit's hosted runner drops pointer input; its journeys use genuine keyboard activation.
 // Chromium covers pointer hit testing. Keep actual control focus and all app outcome assertions.
 await page.bringToFront();await locator.waitFor({state:'visible'});assert(await locator.isEnabled());
 const control=await locator.evaluate(el=>{const target=el.closest('button,a[href],summary,input,select,textarea,[role=button],[tabindex]')||el;const inert=!!target.closest('[inert]');if(!inert)target.focus();return {inert,focused:document.activeElement===target,key:target.matches('input[type=checkbox],input[type=radio],[role=checkbox],[role=radio]')?'Space':'Enter'};});
 assert(!control.inert&&control.focused,'keyboard control must be active and focusable');
 await page.keyboard.press(control.key);
}
async function stableScreenshot(filename){
 // Background toast actions cannot receive focus while a modal is open.
 if(!(await page.locator('body.dialog-open').count())){
  for(const b of await page.locator('.toast-action [aria-label="Dismiss notification"]').all()){
   if(await b.isVisible()&&await b.isEnabled()&&await b.evaluate(el=>!el.closest('[inert]')))await clickControl(b);
  }
 }
 // Let the app's 2.7s transient notifications fade before visual capture.
 await page.waitForTimeout(3000);
 if(filename.includes('-history-summary'))await page.locator('.training-summary').screenshot({path:path.join(out,filename)});else await page.screenshot({path:path.join(out,filename)});
}
// WebKit can stop animation-frame polling while timers and DOM updates keep running.
// Keep the predicate and deadline; poll it independently of animation frames.
const waitCondition=(predicate,arg,options={})=>page.waitForFunction(predicate,arg,{polling:engineName==='webkit'?100:'raf',...options});
const clickTab=name=>clickControl(page.locator('[data-a=tab][data-v="'+name+'"]'));
const saved=()=>page.evaluate(async()=>{await saveTail;return JSON.parse(localStorage.getItem('liftlog-state'));});
try{
 for(const name of names){engineName=name;
  browser=await playwright[name].launch(name==='chromium'?options:{});report.browser.push({name,version:browser.version()});
  await check(name+': already-active update reloads a stale screen and preserves workouts',async()=>{
   const state={...base(),workouts:[workout('Bench Press',40)]};stalePage=true;
   await open(state);await waitCondition(()=>!!navigator.serviceWorker.controller);
   assert.equal(await page.evaluate(()=>BUILD_VERSION),'5.7.10');
   await clickTab('settings');await clickControl(page.locator('[data-a=update]'));
   const version=JSON.parse(await fs.readFile('version.json','utf8')).version;
   await waitCondition(v=>BUILD_VERSION===v,version);
   assert.equal((await saved()).workouts.length,1);
   assert.equal((await saved()).workouts[0].ex[0].sets[0].kg,40);
  });
  await check(name+': imported text targets, blank RPE and late wake locks',async()=>{
   const routine={id:'routine:text-targets',name:'Imported plan',split:'Push',ex:[{n:'Bench Press',exerciseId:'ex001',sets:'3',reps:'12',seconds:'45',meters:'20',rest:'0'}]};
   await open({...base(),routines:[routine]});await clickControl(page.locator('[data-a=routineStart]'));
   assert.equal(await page.locator('#qol-reps').inputValue(),'12');assert((await page.locator('.routine-progress').textContent()).includes('0 / 3'));
   // A restored draft may contain spaces although the number input displays them as empty.
   await page.evaluate(async()=>{dr.rpe='   ';persistDraft();await saveTail;});await page.reload();await page.locator('[data-a=log]').waitFor();
   assert.equal(await page.locator('#qol-rpe').inputValue(),'');await clickControl(page.locator('[data-a=log]'));
   let state=await saved();assert.equal(state.cur.ex[0].sets.length,1);assert.equal(state.cur.ex[0].sets[0].rpe,undefined);assert.equal(state.cur.ex[0].target.rest,0);
   await page.reload();await page.locator('[data-a=log]').waitFor();assert((await page.locator('.routine-progress').textContent()).includes('1 / 3'));
   await clickControl(page.locator('[data-a=routineSave]'));await page.locator('#routine-name').fill('Numeric copy');await clickControl(page.locator('#routine-save'));await page.locator('.qol-modal').waitFor({state:'hidden'});
   assert.equal((await saved()).routines[1].ex[0].sets,3);
   await open({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]}},undefined,'[data-a=log]');
   await page.evaluate(()=>{window.wakeRequests=[];window.wakeSentinels=[];Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:()=>new Promise(resolve=>window.wakeRequests.push(resolve))}});});
   await clickControl(page.locator('[data-a=log]'));await waitCondition(()=>wakeRequests.length===1);
   await clickControl(page.getByRole('button',{name:'Stop rest timer',exact:true}));
   await page.evaluate(()=>{const lock={released:false,releases:0,async release(){this.released=true;this.releases++;}};wakeSentinels.push(lock);wakeRequests[0](lock);});
   await waitCondition(()=>wakeSentinels[0].releases===1);assert(await page.evaluate(()=>qolState.wake===null));
   await clickControl(page.locator('[data-a=log]'));await waitCondition(()=>wakeRequests.length===2);
   await page.evaluate(()=>{const lock={released:false,releases:0,async release(){this.released=true;this.releases++;}};wakeSentinels.push(lock);wakeRequests[1](lock);});
   await waitCondition(()=>qolState.wake===wakeSentinels[1]);await clickControl(page.getByRole('button',{name:'Stop rest timer',exact:true}));
   await waitCondition(()=>wakeSentinels[1].releases===1);assert(await page.evaluate(()=>wakeSentinels.every(s=>s.releases===1)));
  });
  await check(name+': open set editor cannot mutate a tab paused by another writer',async()=>{
   await open({...base(),cur:workout('Bench Press',60,8)},undefined,'[data-a=log]');
   const second=await context.newPage();await second.goto(url);await second.locator('[data-a=log]').waitFor();
   await clickControl(page.locator('[data-a=editSet]').first());await page.locator('#edit-note').fill('Unconfirmed edit');
   const before=await page.evaluate(()=>JSON.stringify(S));
   await second.evaluate(async()=>{S.cur.name='Saved by second tab';await save();});await page.locator('#storage-conflict').waitFor();
   // The warning covers this button on mobile; the still-open editor is keyboard reachable.
   await page.bringToFront();await page.locator('#edit-note').press('Tab');
   assert(await page.locator('#save-set-edit').evaluate(el=>document.activeElement===el));
   await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>JSON.stringify(S)),before,'paused editor must not change its in-memory recovery copy');
   assert.equal((await saved()).cur.name,'Saved by second tab','latest stored copy remains untouched');
   assert.equal((await saved()).cur.ex[0].sets[0].note,undefined);
   await second.close();
  });
  await check(name+': activity calendar counts completed sessions, dates, edits, deletion and undo',async()=>{
   const day='2024-07-01',one={...workout(),id:101,d:day},draft={...workout(),id:102,d:day},other={...workout(),id:103,d:'2024-07-03'};
   await open({...base(),workouts:[one,other,{...workout(),id:104,d:'2023-12-31'}],cur:draft},undefined,'[data-a=fin]');
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();await clickTab('history');
   await clickControl(page.getByRole('button',{name:'Previous year',exact:true}));await waitCondition(()=>document.querySelector('#activity-year')?.textContent==='2025');
   await clickControl(page.getByRole('button',{name:'Previous year',exact:true}));await waitCondition(()=>document.querySelector('#activity-year')?.textContent==='2024');
   const square=page.locator('.activity-day[data-v="'+day+'"]'),single=page.locator('.activity-day[data-v="2024-07-03"]'),rest=page.locator('.activity-day[data-v="2024-07-02"]');
   assert.equal(await square.getAttribute('data-count'),'2');assert.equal(await square.locator('.activity-count').textContent(),'2');assert.equal(await single.locator('.activity-count').count(),0);assert.equal(await rest.locator('.activity-count').count(),0);
   const palette=await page.evaluate(()=>({active:getComputedStyle(document.querySelector('.activity-day.trained')).backgroundColor,grey:getComputedStyle(document.querySelector('.activity-day.rest-day')).backgroundColor,accent:getComputedStyle(document.documentElement).getPropertyValue('--ac')}));assert.notEqual(palette.active,palette.grey);
   await clickControl(square);assert((await page.locator('#activity-detail').textContent()).includes('2 workouts'));await page.screenshot({path:path.join(out,name+'-activity-year-dark.png')});
   await clickControl(page.locator('[data-a=activityMode][data-v=month]'));await page.locator('#activity-month').selectOption('6');assert.equal(await page.locator('.activity-day').count(),31);
   assert.equal(await page.locator('.activity-day').first().getAttribute('data-v'),day);await clickControl(square);await page.screenshot({path:path.join(out,name+'-activity-month-dark.png')});
   await clickControl(page.locator('[data-a=activityHistory]'));assert.equal(await page.locator('[data-a=he]').count(),2);
   await clickControl(page.locator('[data-a=he]').first());await page.locator('[data-a=fin]').waitFor();await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();await clickTab('history');assert.equal(await square.getAttribute('data-count'),'2','editing does not add a session');
   await clickControl(square);await clickControl(page.locator('[data-a=activityHistory]'));await clickControl(page.locator('[data-a=hd]').first());await clickControl(page.locator('[data-action-confirm]'));assert.equal(await square.getAttribute('data-count'),'1');assert.equal(await square.locator('.activity-count').count(),0);
   await clickControl(page.locator('[data-a=undo]'));assert.equal(await square.getAttribute('data-count'),'2');
   await clickTab('settings');await clickControl(page.locator('[data-a=theme][data-v=light]'));await clickTab('history');await page.screenshot({path:path.join(out,name+'-activity-month-light.png')});
   await page.reload();await page.locator('[data-a=start]').first().waitFor();await clickTab('history');assert.equal((await saved()).workouts.filter(w=>w.d===day).length,2);
   await page.setViewportSize({width:320,height:720});await clickControl(page.getByRole('button',{name:'Previous year',exact:true}));await clickControl(page.getByRole('button',{name:'Previous year',exact:true}));
   await clickControl(page.locator('[data-a=activityMode][data-v=month]'));await page.locator('#activity-month').selectOption('6');assert(await square.boundingBox());assert(await page.evaluate(()=>document.querySelector('#v').scrollWidth<=document.querySelector('#v').clientWidth+1));
   await square.focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.dataset.v),'2024-07-02');await page.keyboard.press('Enter');assert((await page.locator('#activity-detail').textContent()).includes('No completed workouts'));
   await open({...base(),workouts:[]});await clickTab('history');assert.equal(await page.locator('.activity-day.trained').count(),0);assert((await page.locator('.activity-card .activity-stats').textContent()).includes('0'));
  });
  await check(name+': last typed draft weight and reps survive immediate reload and aliases search',async()=>{
   await open({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]}},undefined,'[data-a=log]');
   await page.locator('#qol-weight').fill('67.5');await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-weight').inputValue(),'67.5');
   await page.locator('#qol-reps').fill('11');await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-reps').inputValue(),'11');
   await clickControl(page.locator('[data-a=openx]'));await page.locator('#ex-search').fill('Dumbbell Bicep Curl');assert(await page.locator('.exercise-option[data-v="Dumbbell Curl"]').count());
  });
  await check(name+': malformed and precise typed drafts remain editable across navigation and reload',async()=>{
   await open({...base(),cur:{...workout(),split:'Empty',ex:[{n:'Bench Press',sets:[]},{n:'Plank',sets:[]}]}},undefined,'[data-a=log]');
   await page.locator('#qol-weight').fill('oops');await page.locator('#qol-reps').fill('8abc');
   await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));await clickControl(page.locator('[data-a=selectExercise][data-i="0"]'));
   assert.equal(await page.locator('#qol-weight').inputValue(),'oops');assert.equal(await page.locator('#qol-reps').inputValue(),'8abc');
   assert.equal(await page.locator('#qol-weight').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#ws').getAttribute('aria-valuetext'),'Enter a valid weight');assert.equal(await page.locator('#ws').inputValue(),'0');
   await clickControl(page.locator('[data-a=log]'));assert.equal((await saved()).cur.ex[0].sets.length,0);
   await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-weight').inputValue(),'oops');assert.equal(await page.locator('#qol-reps').inputValue(),'8abc');
   await page.locator('#qol-weight').fill('67.25');await page.locator('#qol-reps').fill('10');await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=log]').waitFor();
   assert.equal(await page.locator('#qol-weight').inputValue(),'67.25');assert.equal(await page.locator('#ws').getAttribute('aria-valuetext'),'67.25 kg');
   await clickTab('settings');assert.equal(await page.getByRole('textbox',{name:'Bodyweight (kg)',exact:true}).count(),1);assert.equal(await page.getByRole('button',{name:'Age adjustment',exact:true}).count(),1);
   await clickControl(page.locator('[data-qol=unit][data-v=lb]'));await clickTab('today');assert.equal(await page.locator('#qol-weight').inputValue(),'148.260695');assert.equal(await page.locator('#ws').getAttribute('aria-valuetext'),'148.260695 lb');
   await clickControl(page.locator('[data-a=log]'));assert.equal((await saved()).cur.ex[0].sets[0].kg,67.25);
   await clickControl(page.locator('[data-a=openx]'));assert.equal(await page.getByRole('searchbox',{name:'Search exercises',exact:true}).count(),1);await clickControl(page.locator('.exercise-library-close'));
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();await clickTab('history');assert((await page.locator('.history-session').textContent()).includes('Free workout'));assert.equal((await saved()).workouts[0].split,'Empty');
   await clickControl(page.locator('[data-a=sessionView]'));assert.equal(await page.getByRole('dialog',{name:'Free workout',exact:true}).count(),1);await clickControl(page.locator('#session-routine'));assert.equal(await page.locator('#routine-name').inputValue(),'Free workout');await clickControl(page.locator('button[data-qol=closeModal]'));
   assert.equal(await page.locator('#n').getAttribute('inert'),null);assert.equal(await page.locator('#v').getAttribute('inert'),null);await clickTab('settings');assert.equal(await page.getByRole('heading',{name:'Your profile',exact:true}).count(),1);
  });
  await check(name+': closing feature dialogs leaves the next control ready immediately',async()=>{
   await open({...base(),workouts:[workout()]});await clickTab('history');
   for(const action of ['progress','plate']){
    await clickControl(page.locator('[data-qol='+action+']'));await page.locator('.qol-modal [role=dialog]').waitFor();await clickControl(page.locator('button[data-qol=closeModal]'));
    assert.equal(await page.locator('#n').getAttribute('inert'),null);assert.equal(await page.locator('#v').getAttribute('inert'),null);
    await clickTab('settings');assert.equal(await page.getByRole('heading',{name:'Your profile',exact:true}).count(),1);await clickTab('history');
   }
   await clickControl(page.locator('[data-a=sessionView]'));await clickControl(page.locator('button[data-qol=closeModal]'));assert.equal(await page.locator('#n').getAttribute('inert'),null);await clickTab('ranks');assert.equal(await page.getByRole('heading',{name:'Your rank',exact:true}).count(),1);
  });
  await check(name+': log, edit, finish and reload a workout',async()=>{
   await open();await clickControl(page.getByRole('button',{name:'Free workout',exact:true}));await clickControl(page.getByRole('button',{name:'+ Add exercise',exact:true}));
   await page.locator('#ex-search').fill('Cable Curl');await clickControl(page.locator('.exercise-option[data-v="Cable Curl"]'));
   await page.locator('#qol-weight').fill('25');await page.locator('#qol-reps').fill('8');await page.locator('#qol-note').fill('Controlled tempo');await page.locator('#qol-rpe').fill('8');
   await clickControl(page.locator('[data-a=log]'));await page.getByRole('button',{name:'Add 30 seconds',exact:true}).focus();const clock=await page.locator('[data-rest-clock]').textContent();await waitCondition(c=>document.querySelector('[data-rest-clock]')?.textContent!==c,clock);assert.equal(await page.evaluate(()=>document.activeElement.dataset.qol),'restPlus');await clickControl(page.getByRole('button',{name:'Stop rest timer',exact:true}));await clickControl(page.getByRole('button',{name:'Edit set 1',exact:true}));await page.locator('#edit-weight').fill('27.5');await clickControl(page.locator('#save-set-edit'));
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].ex[0].sets[0].kg,27.5);
   await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].ex[0].sets[0].note,'Controlled tempo');await clickTab('history');assert.equal(await page.locator('[data-a=he]').count(),1);
  });
  await check(name+': active rest survives timer ticks during a failed workout finish',async()=>{
   await open({...base(),cur:{...workout('Bench Press',60,8),ex:[{n:'Bench Press',sets:[]}]}},undefined,'[data-a=log]',url,false,true);
   await clickControl(page.locator('[data-a=log]'));await page.evaluate(()=>saveTail);
   const before=await page.evaluate(()=>({cur:JSON.stringify(S.cur),stored:localStorage.getItem('liftlog-state'),end:qolState.endAt,start:qolState.startedAt,stops:slatNativeMessages.filter(m=>m.action==='stop').length}));
   await page.evaluate(()=>{
    window.slatOriginalSetItem=Storage.prototype.setItem;window.slatOriginalTransaction=IDBDatabase.prototype.transaction;
    Storage.prototype.setItem=function(key,value){if(key==='liftlog-state')throw new DOMException('Synthetic quota','QuotaExceededError');return slatOriginalSetItem.call(this,key,value);};
    IDBDatabase.prototype.transaction=function(...args){if(args[1]==='readwrite')throw new DOMException('Synthetic write failure','UnknownError');return slatOriginalTransaction.apply(this,args);};
    saveTail=new Promise(resolve=>window.slatReleaseFinish=resolve);
   });
   await clickControl(page.locator('[data-a=fin]'));await waitCondition(()=>finishing&&S.cur===null);
   await page.waitForTimeout(650);await page.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('slat-native-rest-resume'));});
   assert.equal(await page.evaluate(()=>qolState.endAt),before.end);
   assert.equal(await page.evaluate(()=>slatNativeMessages.filter(m=>m.action==='stop').length),before.stops);
   await page.evaluate(()=>slatReleaseFinish(true));await waitCondition(()=>!finishing&&!!S.cur);
   const after=await page.evaluate(()=>({cur:JSON.stringify(S.cur),stored:localStorage.getItem('liftlog-state'),end:qolState.endAt,start:qolState.startedAt,workouts:S.workouts.length}));
   assert.equal(after.cur,before.cur);assert.equal(after.stored,before.stored);assert.equal(after.end,before.end);assert.equal(after.start,before.start);assert.equal(after.workouts,0);
   assert.equal(await page.locator('#qol-rest').count(),1);
   await page.evaluate(()=>{Storage.prototype.setItem=slatOriginalSetItem;IDBDatabase.prototype.transaction=slatOriginalTransaction;});
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();
   assert.equal((await saved()).workouts.length,1);assert.equal(await page.locator('#qol-rest').count(),0);assert.equal(await page.evaluate(()=>slatNativeMessages.at(-1).action),'stop');
  });
  await check(name+': personal records isolate equipment and ignore future or later duplicate sets',async()=>{
   const s=(kg,label,loggedAt)=>({kg,reps:8,t:'',equipmentContext:{label},loggedAt}),older={...workout('Cable Curl'),id:10,d:'2026-09-19',ex:[{n:'Cable Curl',sets:[s(40,'A',1),s(100,'B',2)]}]},future={...workout('Cable Curl'),id:11,d:'2026-09-21',ex:[{n:'Cable Curl',sets:[s(500,'A',3)]}]},cur={...workout('Cable Curl'),id:12,d:'2026-09-20',ex:[{n:'Cable Curl',sets:[s(45,'A',20)]},{n:'Cable Bicep Curl',sets:[s(50,'A',10)]}]};
   await open({...base(),workouts:[older,future],cur},undefined,'[data-a=fin]');
   assert.equal(await page.locator('.srow em').textContent(),'');
   await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));assert.equal(await page.locator('.srow em').textContent(),'PR');
   await page.reload();await page.locator('[data-a=fin]').waitFor();assert.equal(await page.locator('.srow em').textContent(),'');
   await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));assert.equal(await page.locator('.srow em').textContent(),'PR');
   const state=await saved();assert.equal(state.workouts[0].ex[0].sets[1].kg,100);assert.equal(state.workouts[1].ex[0].sets[0].kg,500);assert.equal(state.cur.ex[0].sets[0].kg,45);
  });
  await check(name+': note and RPE edits retain exact recorded weight in kg and lb',async()=>{
   for(const unit of ['kg','lb']){
    const initial=base();initial.set.unit=unit;initial.cur=workout('Bench Press',60.123456,8);
    await open(initial,undefined,'[data-a=fin]');await clickControl(page.getByRole('button',{name:'Edit set 1',exact:true}));
    await page.locator('#edit-note').fill('Keep exact weight');await page.locator('#edit-rpe').fill('8.5');await clickControl(page.locator('#save-set-edit'));
    await waitCondition(()=>S.cur.ex[0].sets[0].note==='Keep exact weight');await page.evaluate(()=>saveTail);
    assert.equal((await saved()).cur.ex[0].sets[0].kg,60.123456);assert.equal((await saved()).cur.ex[0].sets[0].rpe,8.5);
    await page.reload();await page.locator('[data-a=fin]').waitFor();assert.equal((await saved()).cur.ex[0].sets[0].kg,60.123456);
    await clickControl(page.getByRole('button',{name:'Edit set 1',exact:true}));await page.locator('#edit-weight').fill(unit==='kg'?'65.5':'144.4');await clickControl(page.locator('#save-set-edit'));
    await waitCondition(()=>S.cur.ex[0].sets[0].kg!==60.123456);await page.evaluate(()=>saveTail);assert.equal((await saved()).cur.ex[0].sets[0].kg,unit==='kg'?65.5:144.4/2.20462);
   }
  });
  await check(name+': formatted legacy notes restore and survive unrelated set edits',async()=>{
   const note='First line\r\nSecond line\tcontext',band='Light\nold band label',cur=workout('Resistance Band Curl',0,8);
   Object.assign(cur.ex[0].sets[0],{trackingMode:'band_reps',note,band});
   await open();await clickTab('settings');
   await page.locator('#imp').setInputFiles({name:'formatted-notes.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({workouts:[],bw:[],cur,settings:base().set}))});
   await clickControl(page.locator('#confirm-import'));await page.locator('#confirm-import').waitFor({state:'detached'});
   await clickTab('today');await clickControl(page.getByRole('button',{name:'Edit set 1',exact:true}));
   assert.equal(await page.locator('#edit-note').inputValue(),note.replace(/[\r\n]/g,''));
   await page.locator('#edit-amount').fill('9');await clickControl(page.locator('#save-set-edit'));
   let state=await saved();assert.equal(state.cur.ex[0].sets[0].reps,9);assert.equal(state.cur.ex[0].sets[0].note,note);assert.equal(state.cur.ex[0].sets[0].band,band);
   await page.reload();await page.locator('[data-a=fin]').waitFor();
   assert.equal((await saved()).cur.ex[0].sets[0].note,note);
   await clickControl(page.getByRole('button',{name:'Edit set 1',exact:true}));
   await page.locator('#edit-note').fill('Changed intentionally');await page.locator('#edit-band').fill('Medium');await clickControl(page.locator('#save-set-edit'));
   state=await saved();assert.equal(state.cur.ex[0].sets[0].note,'Changed intentionally');assert.equal(state.cur.ex[0].sets[0].band,'Medium');
  });
  await check(name+': compact rest dock reserves space and preserves its clock across reload',async()=>{
   await open({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]}},undefined,'[data-a=log]');
   await page.locator('#qol-weight').fill('60');await page.locator('#qol-reps').fill('8');await clickControl(page.locator('[data-a=log]'));
   await page.locator('#qol-rest').waitFor();assert.equal(await page.locator('#qol-rest.toast').count(),0);
   assert.equal(await page.locator('[data-rest-clock]').getAttribute('role'),'timer');assert.equal(await page.locator('[data-rest-clock]').getAttribute('aria-live'),'off');
   const start=(await saved()).cur.restStartedAt,deadline=(await saved()).cur.restEndAt;
   await clickControl(page.getByRole('button',{name:'Subtract 30 seconds',exact:true}));assert.equal((await saved()).cur.restEndAt,deadline-30000);
   await clickControl(page.getByRole('button',{name:'Add 30 seconds',exact:true}));assert.equal((await saved()).cur.restEndAt,deadline);
   for(const viewport of [{width:320,height:720},{width:390,height:844},{width:767,height:390},{width:1024,height:900}]){
    await page.setViewportSize(viewport);await page.waitForTimeout(100);
    const layout=await page.evaluate(()=>{const dock=document.querySelector('#qol-rest'),v=document.querySelector('#v'),nav=document.querySelector('nav'),r=dock.getBoundingClientRect(),c=v.getBoundingClientRect(),n=nav.getBoundingClientRect();return {position:getComputedStyle(dock).position,vBottom:c.bottom,vTop:c.top,dockTop:r.top,dockBottom:r.bottom,navTop:n.top,navBottom:n.bottom,width:r.width,overflow:document.body.scrollWidth>innerWidth+1,controls:[...dock.querySelectorAll('button')].map(b=>{const x=b.getBoundingClientRect(),hit=document.elementFromPoint(x.x+x.width/2,x.y+x.height/2);return {height:x.height,hit:hit===b||b.contains(hit)};})};});
    assert.equal(layout.position,'relative');assert(!layout.overflow);assert(layout.vBottom<=layout.dockTop+1,'timer has its own row below the scroller');
    if(viewport.width<800)assert(layout.dockBottom<=layout.navTop+1,'timer cannot overlap bottom navigation');else assert(layout.navBottom<=layout.vTop+1);
    assert(layout.controls.every(b=>b.height>=44&&b.hit),'timer controls have touch targets and receive pointer input');
   }
   await page.setViewportSize({width:390,height:844});await page.locator('[data-a=log]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await stableScreenshot(name+'-rest-dock-dark.png');
   await clickTab('settings');assert((await page.locator('#rest-notification-status').textContent()).length>0);await clickControl(page.locator('[data-a=theme][data-v=light]'));await clickTab('today');await page.locator('[data-a=log]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await stableScreenshot(name+'-rest-dock-light.png');
   await page.reload();await page.locator('[data-a=log]').waitFor();await page.locator('#qol-rest').waitFor();assert.equal((await saved()).cur.restStartedAt,start);assert.equal((await saved()).cur.restEndAt,deadline);
   const before=await page.locator('#v').evaluate(el=>el.clientHeight);await clickControl(page.getByRole('button',{name:'Stop rest timer',exact:true}));assert.equal(await page.locator('#qol-rest').count(),0);assert((await page.locator('#v').evaluate(el=>el.clientHeight))>before+40);
   assert.equal((await saved()).cur.restEndAt,undefined);assert.equal((await saved()).cur.restStartedAt,undefined);
  });
  if(name==='chromium')await check(name+': static service-worker rest reminder replaces, restores and clears without a finish alert',async()=>{
   await open({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]}},undefined,'[data-a=log]');
   await context.grantPermissions(['notifications'],{origin:url});await waitCondition(()=>Notification.permission==='granted'&&!!navigator.serviceWorker.controller);
   await clickTab('settings');await clickControl(page.locator('[data-a=restNotifyToggle]'));await waitCondition(()=>S.set.restNotifications===true);assert.equal((await saved()).set.restNotifications,true);
   await clickTab('today');await page.locator('#qol-weight').fill('60');await page.locator('#qol-reps').fill('8');await clickControl(page.locator('[data-a=log]'));
   const notifications=()=>page.evaluate(async()=>{await qolState.notifications?.flush();const reg=await navigator.serviceWorker.getRegistration();return (await reg.getNotifications({tag:'slat-rest-timer'})).map(n=>({title:n.title,body:n.body,data:n.data}));});
   let cards=await notifications();assert.equal(cards.length,1);assert.equal(cards[0].data.endAt,(await saved()).cur.restEndAt);assert.match(cards[0].body,/Next set at/);assert.match(cards[0].body,/Static reminder/);assert.equal(cards[0].title,'Rest reminder');
   await clickControl(page.getByRole('button',{name:'Add 30 seconds',exact:true}));cards=await notifications();assert.equal(cards.length,1);assert.equal(cards[0].data.endAt,(await saved()).cur.restEndAt);
   await page.reload();await page.locator('[data-a=log]').waitFor();cards=await notifications();assert.equal(cards.length,1);assert.equal(cards[0].data.endAt,(await saved()).cur.restEndAt);
   await page.evaluate(()=>{window.slatNotificationCalls=[];const regMethod=ServiceWorkerRegistration.prototype.showNotification;ServiceWorkerRegistration.prototype.showNotification=function(title,options){window.slatNotificationCalls.push(title);return regMethod.call(this,title,options);};const end=Date.now()+1000;qolState.endAt=end;S.cur.restEndAt=end;qolNotifyRest(end);});
   cards=await notifications();assert.equal(cards.length,1);assert.equal(cards[0].title,'Rest reminder');
   await waitCondition(()=>qolState.endAt===0);assert.equal((await notifications()).length,0);assert.deepEqual(await page.evaluate(()=>window.slatNotificationCalls),['Rest reminder']);
   await clickControl(page.locator('[data-a=log]'));await clickControl(page.getByRole('button',{name:'Stop rest timer',exact:true}));assert.equal((await notifications()).length,0);
   await clickControl(page.locator('[data-a=log]'));assert.equal((await notifications()).length,1);await clickTab('settings');await clickControl(page.locator('[data-a=restNotifyToggle]'));await waitCondition(()=>S.set.restNotifications===false);assert.equal((await notifications()).length,0);assert.equal((await saved()).set.restNotifications,false);
  });
  if(name==='chromium')await check(name+': native host bridge syncs real logging, extension, reload, disable and finish',async()=>{
   await open({...base(),set:{...base().set,installGuideSeen:false},cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]}},undefined,'[data-a=log]',url,false,true);
   await page.waitForTimeout(500);assert.equal(await page.locator('.install-guide-layer').count(),0,'native host must not display a Safari installation guide');
   const messages=()=>page.evaluate(()=>window.slatNativeMessages),syncs=async()=>((await messages()).filter(m=>m.action==='sync'));
   await page.locator('#qol-weight').fill('60');await page.locator('#qol-reps').fill('8');await clickControl(page.locator('[data-a=log]'));
   assert.equal((await syncs()).at(-1).endAt,(await saved()).cur.restEndAt);const count=(await syncs()).length;
   await page.waitForTimeout(1200);assert.equal((await syncs()).length,count,'display ticks do not post native heartbeats');
   await clickControl(page.getByRole('button',{name:'Add 30 seconds',exact:true}));const deadline=(await saved()).cur.restEndAt;assert.equal((await syncs()).at(-1).endAt,deadline);
   await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal((await syncs()).at(-1).endAt,deadline);
   await clickTab('settings');assert.equal(await page.locator('#native-rest-status').count(),1);assert.equal(await page.locator('#rest-notification-status').count(),0);
   await clickControl(page.locator('[data-a=nativeRestToggle]'));assert.equal((await saved()).set.nativeRestLiveActivity,false);assert.equal((await messages()).at(-1).action,'stop');
   await clickControl(page.locator('[data-a=nativeRestToggle]'));assert.equal((await saved()).set.nativeRestLiveActivity,true);assert.equal((await syncs()).at(-1).endAt,deadline);
   await clickTab('today');await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();assert.equal((await messages()).at(-1).action,'stop');assert.equal((await saved()).cur,null);
  });
  await check(name+': all filters and hidden-details focus containment',async()=>{
   await open();await clickControl(page.locator('[data-a=start][data-v=Empty]'));await clickControl(page.locator('[data-a=openx]'));assert.equal(await page.locator('.exercise-option').count(),450);
   await page.locator('#ex-muscle').selectOption('Biceps');await page.locator('#ex-equipment').selectOption('Cable / rope');assert((await page.locator('.exercise-option').count())>0);
   for(const text of await page.locator('.exercise-option small').allTextContents())assert(text.includes('Biceps')&&text.includes('Cable / rope'));
   await page.locator('.exercise-custom summary').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'exercise-library-close');await page.keyboard.press('Escape');assert.equal(await page.locator('.exercise-library').count(),0);
   assert.equal(await page.locator('#v').evaluate(el=>el.inert),false);
  });
  await check(name+': rank preview and saved check keep earned results separate',async()=>{
   await open({...base(),workouts:[workout()]});const before=await saved();await clickTab('ranks');await clickControl(page.locator('[data-a=gr]').first());await page.locator('[data-g=n]').fill('Bench Press');await page.locator('[data-g=w]').fill('180');await page.locator('[data-g=r]').fill('5');await page.locator('[data-g=b]').fill('80');await clickControl(page.locator('[data-a=calc]'));assert((await page.locator('.res').textContent()).includes('est. 1RM'));
   await clickControl(page.locator('[data-a=saveCheck]'));const after=await saved();assert.equal(after.checks['Bench Press'].w,180);assert.deepEqual(after.workouts,before.workouts);assert.equal(after.set.table,'M');await page.keyboard.press('Escape');
   await clickControl(page.locator('[data-a=rankList]'));await page.keyboard.press('Escape');assert.equal(await page.locator('#rank-list-modal').count(),0);
  });
  await check(name+': local date rollover refreshes earned exercise and muscle ranks together',async()=>{
   const today={...workout('Bench Press',60,8),d:'2026-10-14'},future={...workout('Bench Press',300,8),id:2,d:'2026-10-15'};
   await open({...base(),workouts:[today,future]});
   await page.evaluate(()=>{const NativeDate=Date;window.slatClock=NativeDate.UTC(2026,9,14,12);window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[window.slatClock]))}static now(){return window.slatClock}};refreshRanks();});
   await clickTab('ranks');
   const before=await page.evaluate(()=>({rank:S.rk['Bench Press'].e,chest:muscleStates({},80).find(x=>x.id==='chest').i,history:JSON.stringify(S.workouts),revision:S.revision}));
   await page.evaluate(()=>{slatClock=Date.UTC(2026,9,15,12);document.dispatchEvent(new Event('visibilitychange'));});
   await waitCondition(()=>S.rk['Bench Press'].d==='2026-10-15');
   assert.equal(await page.locator('.rank-note + .note').count(),0);
   const after=await page.evaluate(()=>({rank:S.rk['Bench Press'].e,chest:muscleStates({},80).find(x=>x.id==='chest').i,history:JSON.stringify(S.workouts),revision:S.revision}));
   assert(after.rank>before.rank);assert(after.chest>before.chest);assert.equal(after.history,before.history);assert.equal(after.revision,before.revision);
   await page.evaluate(()=>{slatClock=Date.UTC(2026,9,14,12);window.dispatchEvent(new Event('focus'));});
   await waitCondition(()=>S.rk['Bench Press'].d==='2026-10-14');
   assert.equal(await page.evaluate(()=>S.rk['Bench Press'].e),before.rank);
   assert((await page.locator('#v').textContent()).includes('1 future-dated workout'));
  });
  await check(name+': backup preview cancels safely and confirms atomic replacement',async()=>{
   await open({...base(),workouts:[workout()]});await clickTab('settings');const raw=await page.evaluate(()=>localStorage.getItem('liftlog-state'));
   await page.locator('#imp').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({workouts:[{d:'2026-10-10',ex:{}}],bw:[]}))});assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);
   const backup={version:4,workouts:[{...workout('Cable Curl',30),id:9}],bw:base().bw,settings:base().set};const file={name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))};
   await page.locator('#imp').setInputFiles(file);await page.bringToFront();await page.locator('#confirm-import').waitFor();assert(await page.locator('.action-card').evaluate(el=>el.getBoundingClientRect().right<=innerWidth&&el.getBoundingClientRect().left>=0),'backup dialog fits viewport');assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);await clickControl(page.getByRole('button',{name:'Cancel',exact:true}));await page.locator('#confirm-import').waitFor({state:'detached'});assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);
   await page.locator('#imp').setInputFiles(file);await clickControl(page.locator('#confirm-import'));await page.locator('#confirm-import').waitFor({state:'detached'});assert.equal((await saved()).workouts[0].ex[0].n,'Cable Curl');assert(await page.evaluate(()=>localStorage.getItem('liftlog-import-recovery')));
  });
  if(name==='chromium')await check(name+': a valid backup over 25 MiB reaches review',async()=>{
   await open();await clickTab('settings');
   const note='n'.repeat(16384),workouts=Array.from({length:1650},(_,i)=>({id:i+1,d:'2026-10-13',ex:[{n:'Cable Curl',sets:[{kg:25,reps:8,note}]}]}));
   const buffer=Buffer.from(JSON.stringify({app:'slat',version:4,date:'2026-10-13',workouts,bw:[],settings:base().set}));assert(buffer.length>25*1024*1024);
   await page.locator('#imp').setInputFiles({name:'slat-large-backup.json',mimeType:'application/json',buffer});
   await page.locator('#confirm-import').waitFor();assert((await page.locator('.backup-summary').textContent()).includes('1650'));await clickControl(page.getByRole('button',{name:'Cancel',exact:true}));
  });
  await check(name+': latest backup selection keeps its review when an older read finishes',async()=>{
   await open({...base(),workouts:[workout()]});await clickTab('settings');const before=await page.evaluate(()=>localStorage.getItem('liftlog-state'));
   await page.evaluate(()=>{const read=File.prototype.text;File.prototype.text=function(...args){const raw=read.apply(this,args);if(this.name==='slow-first.json')return new Promise(resolve=>window.releaseOldBackupRead=()=>raw.then(resolve));return raw;};});
   const file=(name,label)=>({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:4,workouts:[{...workout(),name:label}],bw:[]}))});
   await page.locator('#imp').setInputFiles(file('slow-first.json','Obsolete selection'));await waitCondition(()=>typeof releaseOldBackupRead==='function');assert.equal(await page.locator('#imp').inputValue(),'');
   await page.locator('#imp').setInputFiles(file('latest-second.json','Latest selection'));await page.getByRole('dialog',{name:'Review backup',exact:true}).filter({hasText:'latest-second.json'}).waitFor();
   await page.evaluate(()=>releaseOldBackupRead());assert((await page.getByRole('dialog',{name:'Review backup',exact:true}).textContent()).includes('latest-second.json'));
   assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),before);await clickControl(page.getByRole('button',{name:'Cancel',exact:true}));
  });
  await check(name+': refused cross-tab channel preserves startup and workout logging',async()=>{
   await open({...base(),workouts:[workout('Bench Press',75,5)],cur:{...workout('Bench Press',60,8),id:2}},undefined,'[data-a=log]');
   await page.addInitScript(()=>{window.BroadcastChannel=class{constructor(){throw new DOMException('Channel denied','SecurityError');}};});
   await page.reload();await page.locator('[data-a=log]').waitFor();
   assert.equal((await saved()).workouts[0].ex[0].sets[0].kg,75);assert.equal((await saved()).cur.ex[0].sets[0].kg,60);
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();
   assert.equal((await saved()).workouts.length,2);assert.equal((await saved()).cur,null);
  });
  await check(name+': closed cross-tab channel cannot interrupt reset or resurrect old workouts',async()=>{
   await open({...base(),workouts:[workout()],cur:{...workout('Bench Press',60,8),id:2}},undefined,'[data-a=log]');await saved();
   await page.evaluate(()=>stateChannel.close());await clickTab('settings');
   await clickControl(page.getByRole('button',{name:'Reset all data',exact:true}));await waitCondition(()=>document.querySelector('[data-reset-confirm]')?.disabled===false);
   const origin=await page.evaluate(()=>performance.timeOrigin);await clickControl(page.locator('[data-reset-confirm]'));
   await waitCondition(previous=>performance.timeOrigin!==previous&&typeof S!=='undefined'&&S?.workouts?.length===0&&S?.cur==null,origin);
   const cleared=await saved();assert(!cleared||cleared.workouts.length===0&&cleared.cur==null);
   await page.reload();await waitCondition(()=>typeof S!=='undefined'&&S?.workouts?.length===0&&S?.cur==null);
   const reloaded=await saved();assert(!reloaded||reloaded.workouts.length===0&&reloaded.cur==null);
  });
  await check(name+': pending reset stays protected and safely failed cleanup resumes the workout',async()=>{
   await open({...base(),cur:workout('Bench Press',60,8)},undefined,'[data-a=log]');await clickTab('settings');const before=await page.evaluate(()=>localStorage.getItem('liftlog-state'));
   await clickControl(page.getByRole('button',{name:'Reset all data',exact:true}));await waitCondition(()=>document.querySelector('[data-reset-confirm]')?.disabled===false);
   await page.evaluate(()=>{saveTail=new Promise(resolve=>window.releaseResetSave=resolve);const remove=Storage.prototype.removeItem;Storage.prototype.removeItem=function(key){if(key==='liftlog-state')throw new Error('Test cleanup denied');return remove.call(this,key);};});
   await clickControl(page.locator('[data-reset-confirm]'));assert.equal(await page.locator('[data-reset-confirm]').isEnabled(),false);assert.equal(await page.locator('[data-reset-cancel]').isEnabled(),false);assert.equal(await page.locator('.reset-card').count(),1);
   await page.keyboard.press('Escape');assert.equal(await page.locator('.reset-card').count(),1);assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),before);
   await page.evaluate(()=>releaseResetSave(true));await waitCondition(()=>document.querySelector('[data-reset-confirm]')?.textContent==='Retry reset'&&!document.querySelector('[data-reset-confirm]').disabled);
   assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),before);await clickControl(page.locator('[data-reset-cancel]'));await clickTab('today');await clickControl(page.locator('[data-a=log]'));assert.equal((await saved()).cur.ex[0].sets.length,2);
  });
  await check(name+': audit backup fields cannot create elements or event attributes',async()=>{
   const payload='8" autofocus onfocus="this.dataset.audit=1',initial={...base(),cur:workout()};initial.cur.drafts={'Bench Press':{kg:payload,reps:payload,n:'spoofed',entryId:'spoofed'}};initial.cur.ex[0].target={sets:'<img src=x onerror="this.dataset.audit=1">',reps:8,seconds:30,meters:20,rest:90};
   await open(initial,undefined,'[data-a=log]');assert.equal(await page.locator('.routine-target img').count(),0);assert.equal(await page.locator('#qol-reps[onfocus],#ws[onfocus],#ws[onpointerdown]').count(),0);assert.equal(await page.evaluate(()=>dr.n),'Bench Press');
   await open({...base(),workouts:[workout()]});await clickTab('settings');const raw=await page.evaluate(()=>localStorage.getItem('liftlog-state'));
   const correction=workout();correction.corrections='invalid';const target=workout();target.ex[0].target={sets:'<img src=x>'};
   for(const [index,backup] of [{workouts:[correction],bw:[]},{workouts:[],bw:[],cur:target},{workouts:[],bw:[],custom:[{id:'custom:shadow',n:'Bench Press',t:'D'}]}].entries()){
    const error=['Invalid backup: workouts[0].corrections','Invalid backup: cur.target.sets','Invalid backup: custom name collision'][index];
    await page.locator('#imp').setInputFiles({name:'invalid-audit-'+index+'.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.getByRole('status').filter({hasText:error}).waitFor();assert.equal(await page.locator('#imp').inputValue(),'');assert.equal(await page.locator('#confirm-import').count(),0);assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);
   }
  });
  await check(name+': import cannot release the old screen while replacement is saving',async()=>{
   await open({...base(),cur:workout('Bench Press',75,8)},undefined,'[data-a=log]');await clickTab('settings');
   await page.locator('#imp').setInputFiles({name:'replacement-audit.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({workouts:[],bw:[],settings:base().set,cur:workout('Cable Curl',35,8)}))});await page.locator('#confirm-import').waitFor();
   await page.evaluate(()=>{saveTail=new Promise(resolve=>window.finishAuditImport=resolve);});await clickControl(page.locator('#confirm-import'));await waitCondition(()=>importing);
   assert(await page.evaluate(()=>document.elementFromPoint(2,2)?.classList.contains('action-backdrop')));await page.mouse.click(2,2);assert.equal(await page.locator('#confirm-import').count(),1);await page.keyboard.press('Control+z');assert.equal(await page.evaluate(()=>S.cur.ex[0].sets.length),1);
   await page.evaluate(()=>window.finishAuditImport());await page.locator('#confirm-import').waitFor({state:'detached'});await clickTab('today');await page.locator('[data-a=log]').waitFor();const state=await saved();assert.equal(state.cur.ex[0].n,'Cable Curl');assert.equal(state.cur.ex[0].sets.length,1);assert.equal(state.cur.ex[0].sets[0].kg,35);
  });
  await check(name+': calculator units retain exact measurements and legal sheets close with Escape',async()=>{
   await open();await clickTab('ranks');await clickControl(page.locator('[data-a=gr]').first());
   for(const [key,value] of [['n','Bench Press'],['w','60.123456'],['r','8'],['b','80.234567'],['h','178']])await page.locator('[data-g='+key+']').fill(value);
   await clickControl(page.locator('[data-a=calc]'));const original=await page.evaluate(()=>({w:gr.res.w,b:gr.res.b,x:gr.res.x}));
   for(const unit of ['lb','kg','lb']){await clickControl(page.locator('[data-a=gu][data-v='+unit+']'));await clickControl(page.locator('[data-a=calc]'));assert.deepEqual(await page.evaluate(()=>({w:gr.res.w,b:gr.res.b,x:gr.res.x})),original);}
   await clickControl(page.locator('[data-a=saveCheck]'));assert.equal((await saved()).checks['Bench Press'].w,60.123456);await page.keyboard.press('Escape');await clickTab('settings');await clickControl(page.locator('[data-a=privacy]'));await page.locator('#legal-sheet').waitFor();await page.keyboard.press('Escape');await page.locator('#legal-sheet').waitFor({state:'detached'});
  });
  await check(name+': two real tabs block the stale writer',async()=>{
   await open();const second=await context.newPage();await second.goto(url);await second.locator('[data-a=start]').first().waitFor();await clickControl(page.locator('[data-a=start][data-v=Empty]'));await second.locator('#storage-conflict').waitFor();assert.equal(await second.locator('#storage-conflict').getAttribute('role'),'alert');await second.close();
  });
  await check(name+': narrow/light/dark/reduced-motion layouts and anatomy',async()=>{
   await open({...base(),workouts:[workout()]});await page.emulateMedia({reducedMotion:'reduce'});
   for(const width of [320,390,768])for(const dark of [0,1]){
    await page.setViewportSize({width,height:844});await clickTab('settings');await clickControl(page.locator('[data-a=theme][data-v='+ (dark?'dark':'light')+']'));await waitCondition(d=>document.documentElement.dataset.d===d,String(dark));assert.equal(await page.locator('html').getAttribute('data-d'),String(dark),'selected theme is actually applied');
    for(const tab of ['today','history','ranks','settings']){await clickTab(tab);assert(await page.locator('#v').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'horizontal overflow '+tab+' '+width);}
   }
   await clickTab('ranks');assert(await page.locator('.overall-rank-title .rank-icon').evaluate(el=>{const r=el.getBoundingClientRect();return r.width>=24&&r.width<=40&&r.height<=40;}),'overall rank icon must keep its compact dimensions');assert.equal(await page.locator('.anatomy-svg').count(),2);assert.equal(await page.locator('.anatomy-svg [data-muscles=tibialis]').count(),1);assert.equal(await page.locator('.anatomy-svg [data-muscles=adductors]').count(),1);
   const parsed=await page.evaluate(()=>[...document.querySelectorAll('.anatomy-svg')].every(svg=>!new DOMParser().parseFromString(svg.outerHTML,'image/svg+xml').querySelector('parsererror')));assert(parsed);
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,name+'-ranks.png')});await clickTab('today');await page.screenshot({path:path.join(out,name+'-today.png')});
  });
  await check(name+': unchanged custom names retain checks and alias-free menus use canonical identities',async()=>{
   const custom={id:'custom:name-check',n:'My Cable Curl',t:'M',c:'Biceps',g:'Pull',rank:'Cable Curl'};
   await open({...base(),custom:[custom],workouts:[workout(custom.n,25,8)]});
   await page.evaluate(async n=>{S.checks[n]=calculateRank(n,40,8,80,178,'M');await save();},custom.n);
   const before=(await saved()).checks[custom.n];await clickTab('settings');await clickControl(page.locator('[data-a=manageCustom]'));await clickControl(page.locator('#save-custom-name'));
   assert.deepEqual((await saved()).checks[custom.n],before);await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.deepEqual((await saved()).checks[custom.n],before);
   await clickTab('settings');await clickControl(page.locator('[data-a=manageCustom]'));await page.locator('#custom-rename').fill('My Renamed Curl');await clickControl(page.locator('#save-custom-name'));assert.equal((await saved()).checks['My Renamed Curl'].w,before.w);assert.equal((await saved()).workouts[0].ex[0].sets[0].kg,25);
   await clickControl(page.getByRole('button',{name:'Progress charts',exact:true}));assert.equal(await page.locator('#qol-progress-lift option[value="Dumbbell Bicep Curl"]').count(),0);assert.equal(await page.locator('#qol-progress-lift option[value="Dumbbell Curl"]').count(),1);await page.keyboard.press('Escape');
   await clickTab('today');await clickControl(page.locator('[data-a=routineEdit]'));assert.equal(await page.locator('#routine-exercise option[value="Dumbbell Bicep Curl"]').count(),0);assert.equal(await page.locator('#routine-exercise option[value="Dumbbell Curl"]').count(),1);await page.locator('#routine-exercise').selectOption('Dumbbell Curl');await clickControl(page.locator('#routine-add'));await clickControl(page.locator('#routine-save'));assert.equal((await saved()).routines[0].ex[0].n,'Dumbbell Curl');
  });
  await check(name+': removals undo after reload and custom labels retain identity',async()=>{
   const custom={n:'My Cable Curl',t:'M',c:'Biceps',g:'Pull',rank:'Cable Curl'};await open({...base(),custom:[custom],cur:{...workout('My Cable Curl',25),id:88}},undefined,'[data-a=log]');
   await clickControl(page.locator('[data-a=ds]'));await clickControl(page.locator('[data-action-confirm]'));await page.locator('[data-a=undo]').waitFor();await page.evaluate(()=>saveTail);await page.reload();await clickControl(page.locator('[data-a=undo]'));await waitCondition(()=>S.cur?.ex[0]?.sets.length===1&&S.undo===null);assert.equal(await page.locator('.srow').count(),1);
   const old=(await saved()).cur.ex[0].exerciseId;await clickTab('settings');await clickControl(page.locator('[data-a=manageCustom]'));await page.locator('#custom-rename').fill('My Consistent Curl');await clickControl(page.locator('#save-custom-name'));await page.evaluate(()=>saveTail);const state=await saved();assert.equal(state.cur.ex[0].n,'My Consistent Curl');assert.equal(state.cur.ex[0].exerciseId,old);assert.equal(state.cur.ex[0].sets[0].kg,25);
   await clickControl(page.locator('[data-a=manageCustom]'));await clickControl(page.locator('#custom-retire'));await clickTab('today');await clickControl(page.locator('[data-a=openx]'));assert.equal(await page.locator('.exercise-option[data-v="My Consistent Curl"]').count(),0);await page.keyboard.press('Escape');assert.equal((await saved()).cur.ex[0].sets.length,1);
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();await clickTab('history');await clickControl(page.locator('[data-a=hd]'));await clickControl(page.locator('[data-action-confirm]'));await page.locator('[data-a=he]').waitFor({state:'detached'});assert.equal(await page.locator('[data-a=he]').count(),0);await clickControl(page.locator('[data-a=undo]'));await waitCondition(()=>S.workouts.length===1&&S.undo===null);assert.equal(await page.locator('[data-a=he]').count(),1);
  });
  await check(name+': custom duration and total-load protocols retain their details',async()=>{
   await open();await clickControl(page.locator('[data-a=start][data-v=Empty]'));await clickControl(page.locator('[data-a=openx]'));await clickControl(page.locator('.exercise-custom summary'));await page.locator('#custom-ex-name').fill('My timed carry');await page.locator('#custom-ex-tracking').selectOption('duration');await page.locator('#custom-ex-equipment').selectOption('Dumbbell');await page.locator('#custom-ex-count').selectOption('1');await clickControl(page.locator('[data-a=addcustom]'));await page.locator('#log-seconds').fill('45');await clickControl(page.locator('[data-a=log]'));const state=await saved(),custom=state.custom[0],set=state.cur.ex[0].sets[0];assert.equal(custom.equipment,'Dumbbell');assert.equal(custom.protocol.implementCount,1);assert.equal(set.seconds,45);assert.equal(set.trackingMode,'duration');assert.equal(set.benchmarkId,null);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal((await saved()).cur.ex[0].sets[0].seconds,45);
  });
  await check(name+': muscle detail identifies earned contributing lifts',async()=>{
   await open({...base(),workouts:[workout()]});await clickTab('ranks');await clickControl(page.locator('button.muscle-pill[data-v=chest]'));assert((await page.locator('.action-card').textContent()).includes('Bench Press'));assert((await page.locator('.action-card').textContent()).includes('Relative weight'));await page.keyboard.press('Escape');
  });
  await check(name+': themed mobile tools and direct anatomy selection',async()=>{
   await open({...base(),workouts:[workout()]},{width:320,height:720});await clickTab('settings');
   for(const dark of [0,1]){
    await clickControl(page.locator('[data-a=theme][data-v='+ (dark?'dark':'light')+']'));await waitCondition(d=>document.documentElement.dataset.d===d,String(dark));
    await clickControl(page.getByRole('button',{name:'Plate calculator',exact:true}));
    for(const selector of ['#qol-plate-target','#qol-plate-bar','#qol-bar-preset'])assert(await page.locator(selector).evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect(),card=el.closest('.action-card').getBoundingClientRect();return s.color===getComputedStyle(document.body).color&&s.fontFamily===getComputedStyle(document.body).fontFamily&&r.left>=card.left&&r.right<=card.right&&r.height>=44;}),'themed control fits: '+selector);
    assert(await page.locator('.action-card').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await page.screenshot({path:path.join(out,name+'-plate-'+dark+'.png')});await page.keyboard.press('Escape');
    await clickControl(page.getByRole('button',{name:'Progress charts',exact:true}));await page.locator('#qol-progress-window').selectOption('all');
    assert(await page.locator('#qol-chart').evaluate(el=>{const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return r.left>=p.left&&r.right<=p.right;}));assert(await page.locator('.action-card').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await page.screenshot({path:path.join(out,name+'-progress-'+dark+'.png')});await page.keyboard.press('Escape');
   }
   await clickTab('ranks');await clickControl(page.locator('[data-a=anatomyView][data-v=front]'));assert.equal(await page.locator('.anatomy-figure:visible').count(),1);
   await clickControl(page.locator('#front-pectoralis_major_r'));assert((await page.locator('.action-card').textContent()).includes('Bench Press'));await page.keyboard.press('Escape');
   await page.locator('.front [data-muscles=chest]').focus();await page.keyboard.press('Enter');assert((await page.locator('.action-card').textContent()).includes('Bench Press'));await page.keyboard.press('Escape');
   await clickControl(page.locator('[data-a=anatomyView][data-v=back]'));assert.equal(await page.locator('.anatomy-figure:visible').count(),1);await page.screenshot({path:path.join(out,name+'-back-detail.png')});
  });
  await check(name+': Last time recovers invalid draft inputs and permits logging',async()=>{
   await open({...base(),workouts:[workout('Bench Press',60,8)],cur:{...workout('Bench Press',20,5),id:2}},undefined,'[data-a=log]');
   await page.locator('#qol-weight').fill('invalid');await page.locator('#qol-reps').fill('invalid');
   await clickControl(page.locator('[data-qol=repeatLast]'));assert.equal(await page.locator('#qol-weight').inputValue(),'60');assert.equal(await page.locator('#qol-reps').inputValue(),'8');
   await clickControl(page.locator('[data-a=log]'));assert.equal((await saved()).cur.ex[0].sets.length,2);assert.equal((await saved()).cur.ex[0].sets[1].kg,60);
  });
  await check(name+': Last time follows recorded chronology across aliases',async()=>{
   const set=(kg,loggedAt)=>({kg,reps:8,t:'',loggedAt}),history={...workout('Cable Curl'),id:20,d:'2026-09-19',ex:[{n:'Cable Curl',sets:[set(50,20)]},{n:'Cable Bicep Curl',sets:[set(40,10)]}]},cur={...workout('Cable Curl'),id:21,d:'2026-09-20',ex:[{n:'Cable Curl',sets:[]}]};
   await open({...base(),workouts:[history],cur},undefined,'[data-a=log]');
   assert((await page.locator('.qol-last').textContent()).includes('50 kg'));
   await page.locator('#qol-weight').fill('invalid');await clickControl(page.locator('[data-qol=repeatLast]'));assert.equal(await page.locator('#qol-weight').inputValue(),'50');
   const before=(await saved()).workouts[0].ex.flatMap(x=>x.sets.map(s=>s.kg));assert.deepEqual(before,[50,40]);
   await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-weight').inputValue(),'50');
  });
  await check(name+': imported rest timer ticks and zero-rest override stops it',async()=>{
   await open();await clickTab('settings');
   const backup={version:4,workouts:[],bw:base().bw,settings:base().set,cur:{...workout('Bench Press',60,8),restEndAt:Date.now()+60000}};
   await page.locator('#imp').setInputFiles({name:'timer.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await clickControl(page.locator('#confirm-import'));await page.locator('#confirm-import').waitFor({state:'detached'});
   await page.locator('[data-rest-clock]').waitFor();const first=await page.locator('[data-rest-clock]').textContent();await waitCondition(value=>document.querySelector('[data-rest-clock]')?.textContent!==value,first,{timeout:5000});
   await clickTab('today');await clickControl(page.locator('[data-a=exerciseOptions]'));await page.locator('#exercise-rest').fill('0');await clickControl(page.locator('#exercise-options-save'));await clickControl(page.locator('[data-a=log]'));
   assert.equal((await saved()).cur.ex[0].sets.length,2);assert.equal((await saved()).cur.restEndAt,undefined);assert.equal(await page.locator('#qol-rest').count(),0);
  });
  await check(name+': corrected dates and read-only details preserve original context',async()=>{
   const w={...workout('Bench Press',60,8),id:51,d:'2026-10-01'};w.ex[0].sets[0].performanceContext={reference:'M',workoutDate:w.d};await open({...base(),workouts:[w]});await clickTab('history');await clickControl(page.locator('[data-a=sessionView]'));assert((await page.locator('.action-card').textContent()).includes('read-only session'));assert.equal((await saved()).cur,null);await page.keyboard.press('Escape');await clickControl(page.locator('[data-a=he]'));await clickControl(page.locator('[data-a=sessionInfo]'));await page.locator('#session-name').fill('Backfilled Monday');await page.locator('#session-date').fill('2024-07-01');await clickControl(page.locator('#session-info-save'));await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();const done=(await saved()).workouts[0];assert.equal(done.d,'2024-07-01');assert.equal(done.name,'Backfilled Monday');assert.equal(done.ex[0].sets[0].kg,60);assert.equal(done.ex[0].sets[0].originalPerformanceContext.workoutDate,'2026-10-01');await clickTab('history');await clickControl(page.locator('[aria-label="Previous year"]'));await clickControl(page.locator('[aria-label="Previous year"]'));assert.equal(await page.locator(' .activity-day[data-v="2024-07-01"]').getAttribute('data-count'),'1');await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].name,'Backfilled Monday');
  });
  await check(name+': repeated exercise drafts survive navigation, reordering and reload',async()=>{
   await open({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]},{n:'Bench Press',sets:[]}]}},undefined,'[data-a=log]');
   await page.locator('#qol-weight').fill('67.5');await page.locator('#qol-note').fill('First entry');
   await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));assert.equal(await page.locator('#qol-note').inputValue(),'');
   await page.locator('#qol-weight').fill('42.5');await page.locator('#qol-note').fill('Second entry');
   await clickControl(page.locator('[data-a=moveExercise][data-v="-1"]'));assert.equal(await page.locator('#qol-weight').inputValue(),'42.5');
   await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));assert.equal(await page.locator('#qol-weight').inputValue(),'67.5');assert.equal(await page.locator('#qol-note').inputValue(),'First entry');
   await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-weight').inputValue(),'42.5');assert.equal(await page.locator('#qol-note').inputValue(),'Second entry');
   await clickControl(page.locator('[data-a=log]'));assert.equal((await saved()).cur.ex[0].sets[0].kg,42.5);await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));assert.equal(await page.locator('#qol-note').inputValue(),'First entry');
  });
  await check(name+': routine targets prefill, show progress and navigate to unfinished exercises',async()=>{
   const routines=[{id:'routine:qol',name:'Routine progress',ex:[{n:'Bench Press',exerciseId:'ex001',sets:1,reps:12,seconds:30,meters:20,rest:0},{n:'Plank',exerciseId:JSON.parse(await fs.readFile('exercises.json','utf8')).catalogue.Plank.id,sets:1,reps:8,seconds:45,meters:20,rest:0}]}];
   await open({...base(),routines});await clickControl(page.locator('[data-a=routineStart]'));assert.equal(await page.locator('#qol-reps').inputValue(),'12');
   assert.equal(await page.locator('.routine-progress progress').getAttribute('value'),'0');await page.locator('#qol-weight').fill('50');await clickControl(page.locator('[data-a=log]'));assert.equal(await page.locator('.routine-progress progress').getAttribute('value'),'1');
   await clickControl(page.locator('[data-a=nextUnfinished]'));assert.equal(await page.locator('#log-seconds').inputValue(),'45');await clickControl(page.locator('[data-a=log]'));assert.equal(await page.locator('.routine-progress progress').getAttribute('value'),'2');assert.equal(await page.locator('[data-a=nextUnfinished]').count(),0);
   assert((await page.locator('.routine-progress').textContent()).includes('All targets reached'));assert(await page.locator('#v').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   await page.screenshot({path:path.join(out,name+'-routine-progress.png')});
  });
  await check(name+': retired movement charts and reserved setup labels retain separate data',async()=>{
   const old={...workout('Retired curl',25,8),ex:[{n:'Retired curl',sets:[{kg:25,reps:8,t:'',equipmentContext:{label:'__all'}},{kg:100,reps:8,t:'',equipmentContext:{label:'Gym B'}}]}]};
   await open({...base(),custom:[{id:'custom:retired',n:'Retired curl',t:'M',c:'Biceps',archived:true}],workouts:[old]});await clickTab('settings');await clickControl(page.getByRole('button',{name:'Progress charts',exact:true}));
   assert.equal(await page.locator('#qol-progress-lift').inputValue(),'Retired curl');await page.locator('#qol-progress-window').selectOption('all');await page.locator('#progress-profile').selectOption('profile:__all');
   assert((await page.locator('#qol-progress-data').textContent()).includes('25'));assert(!(await page.locator('#qol-progress-data').textContent()).includes('100'));await page.locator('#progress-profile').selectOption({value:'__all'});assert((await page.locator('#qol-progress-data').textContent()).includes('100'));
  });
  await check(name+': routine copies preserve plans and duplication leaves the original intact',async()=>{
   const routine={id:'routine:copy-proof',name:'Original plan',split:'Push',ex:[{n:'Bench Press',exerciseId:'ex001',sets:3,reps:12,seconds:45,meters:25,rest:0}]};
   await open({...base(),routines:[routine]},{width:320,height:720});
   await clickControl(page.locator('[data-a=routineDuplicate]'));assert.equal(await page.locator('#routine-name').inputValue(),'Original plan (copy)');
   await page.locator('#routine-name').fill('Heavy variation');await page.locator('[data-target=reps]').fill('6');await clickControl(page.locator('#routine-save'));
   const copies=(await saved()).routines;assert.equal(copies.length,2);assert.equal(copies[0].ex[0].reps,12);assert.equal(copies[1].ex[0].reps,6);assert.notEqual(copies[0].id,copies[1].id);
   assert(await page.locator('.routine-card').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   await clickControl(page.locator('[data-a=routineStart]').first());await clickControl(page.locator('[data-a=routineSave]'));
   assert.equal(await page.locator('[data-target=sets]').inputValue(),'3');assert.equal(await page.locator('[data-target=reps]').inputValue(),'12');assert.equal(await page.locator('[data-target=rest]').inputValue(),'0');
   await page.locator('#routine-name').fill('Preserved plan');await clickControl(page.locator('#routine-save'));await page.locator('.qol-modal').waitFor({state:'hidden'});assert.equal((await saved()).routines.length,3);await page.reload();await page.locator('[data-a=log]').waitFor();
   assert.equal((await saved()).routines[2].ex[0].sets,3);assert.equal((await saved()).routines[2].ex[0].rest,0);assert.equal((await saved()).cur.ex[0].sets.length,0);
  });
  await check(name+': switching equipment setup refreshes matching measurements and preserves notes',async()=>{
   const state={...base(),exercisePreferences:{ex001:{equipmentLabel:'A'}},cur:{...workout(),ex:[{n:'Bench Press',sets:[]},{n:'Bench Press',sets:[]}]},workouts:[{...workout(),ex:[{n:'Bench Press',sets:[{kg:80,reps:8,t:'',equipmentContext:{label:'A'}},{kg:40,reps:12,t:'',equipmentContext:{label:'B'}}]}]}]};
   await open(state,undefined,'[data-a=log]');assert.equal(await page.locator('#qol-weight').inputValue(),'80');
   await page.locator('#qol-weight').fill('85');await page.locator('#qol-note').fill('Keep this note');await page.locator('#qol-rpe').fill('8');
   await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));await page.locator('#qol-weight').fill('90');await clickControl(page.locator('[data-a=selectExercise][data-i="0"]'));
   await clickControl(page.locator('[data-a=exerciseOptions]'));await page.locator('#equipment-label').fill('B');await clickControl(page.locator('#exercise-options-save'));
   assert.equal(await page.locator('#qol-weight').inputValue(),'40');assert.equal(await page.locator('#qol-reps').inputValue(),'12');assert.equal(await page.locator('#qol-note').inputValue(),'Keep this note');assert.equal(await page.locator('#qol-rpe').inputValue(),'8');
   await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));assert.equal(await page.locator('#qol-weight').inputValue(),'40');await saved();
   await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-weight').inputValue(),'40');assert.equal(await page.locator('#qol-note').inputValue(),'Keep this note');
   await clickControl(page.locator('[data-a=log]'));assert.equal((await saved()).cur.ex[0].sets[0].kg,40);assert.equal((await saved()).cur.ex[0].sets[0].equipmentContext.label,'B');
  });
  await check(name+': unknown archival routine references are repaired without rewriting history',async()=>{
   const cur=workout('Archive Press',42.5,8);cur.ex[0].target={sets:4,reps:12,seconds:45,meters:25,rest:120};
   await open({...base(),cur},undefined,'[data-a=log]');const before=JSON.stringify((await saved()).cur);
   await clickControl(page.locator('[data-a=routineSave]'));await page.locator('#routine-name').fill('Repaired plan');
   assert.equal(await page.locator('#routine-exercise option[value="Archive Press"]').count(),0);
   await clickControl(page.locator('#routine-save'));assert.equal((await saved()).routines.length,0);
   assert((await page.locator('#routine-error').textContent()).includes('Replace exercise'));
   await clickControl(page.locator('[data-routine-replace="0"]'));await page.locator('#routine-replacement').selectOption('Bench Press');
   await clickControl(page.locator('#routine-replace-save'));assert.equal(await page.locator('[data-target=sets]').inputValue(),'4');
   assert.equal(await page.locator('[data-target=reps]').inputValue(),'12');assert.equal(await page.locator('[data-target=rest]').inputValue(),'120');
   await clickControl(page.locator('#routine-save'));await page.locator('.qol-modal').waitFor({state:'hidden'});
   assert.equal((await saved()).routines[0].ex[0].exerciseId,'ex001');assert.equal(JSON.stringify((await saved()).cur),before);
   await page.evaluate(()=>SlatData.validateBackup({...S,settings:S.set,version:4},X.catalogue));
   await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal((await saved()).cur.ex[0].n,'Archive Press');
   assert.equal((await saved()).cur.ex[0].sets[0].kg,42.5);assert.equal((await saved()).routines[0].ex[0].n,'Bench Press');
  });
  await check(name+': pending routine saves reject duplicate taps and keep failed drafts retryable',async()=>{
   const routine={id:'routine:atomic',name:'Original plan',split:'Push',ex:[{n:'Bench Press',exerciseId:'ex001',sets:3,reps:8,seconds:30,meters:20,rest:90}]};
   await open({...base(),routines:[routine],workouts:[workout('Bench Press',60,8)]});await saved();
   const before=await page.evaluate(()=>localStorage.getItem('liftlog-state')),history=JSON.stringify((await saved()).workouts);
   await clickControl(page.locator('[data-a=routineEdit][data-v="routine:atomic"]'));await page.locator('#routine-name').fill('Submitted plan');
   await page.evaluate(()=>{
    const request=navigator.locks.request.bind(navigator.locks);window.routineSaveRequests=0;
    Object.defineProperty(navigator,'locks',{configurable:true,value:{request:(name,job)=>{
     window.routineSaveRequests++;if(window.routineSaveRequests===1)return new Promise((_resolve,reject)=>window.rejectRoutineSave=()=>reject(new Error('Interrupted routine lock')));
     return request(name,job);
    }}});
   });
   await clickControl(page.locator('#routine-save'));await waitCondition(()=>window.routineSaveRequests===1);
   assert.equal(await page.locator('#routine-save').textContent(),'Saving…');assert.equal(await page.locator('.qol-modal').getAttribute('aria-busy'),'true');
   assert(await page.locator('.qol-modal').evaluate(el=>[...el.querySelectorAll('button,input,select')].every(c=>c.disabled)));
   await page.locator('#routine-save').dispatchEvent('click');await page.keyboard.press('Escape');
   assert.equal(await page.locator('.qol-modal').count(),1);assert.equal(await page.locator('#routine-name').inputValue(),'Submitted plan');
   assert.equal(await page.evaluate(()=>window.routineSaveRequests),1);assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),before);
   await page.evaluate(()=>window.rejectRoutineSave());await waitCondition(()=>document.querySelector('#routine-error')?.textContent.includes('Could not save'));
   assert.equal(await page.locator('#routine-save').isEnabled(),true);assert.equal(await page.locator('#routine-name').inputValue(),'Submitted plan');
   assert.equal(await page.locator('[data-routine-move="-1"]').isDisabled(),true);assert.equal(await page.locator('#routine-add').isEnabled(),true);
   assert.equal(await page.evaluate(()=>S.routines[0].name),'Original plan');assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),before);
   await page.locator('#routine-name').fill('Retried plan');await clickControl(page.locator('#routine-save'));await page.locator('.qol-modal').waitFor({state:'hidden'});
   const after=await saved();assert.equal(after.routines.length,1);assert.equal(after.routines[0].name,'Retried plan');assert.equal(JSON.stringify(after.workouts),history);
   assert.equal(await page.evaluate(()=>window.routineSaveRequests),2);await page.reload();await page.locator('[data-a=routineStart]').waitFor();
   assert.equal((await saved()).routines[0].name,'Retried plan');assert.equal(JSON.stringify((await saved()).workouts),history);
  });
  await check(name+': saved routines reorder, copy targets, disable timers and label new sets',async()=>{
   await open();await clickControl(page.locator('[data-a=routineEdit]'));await page.locator('#routine-name').fill('My full body');await page.locator('#routine-exercise').selectOption('Bench Press');await clickControl(page.locator('#routine-add'));await page.locator('#routine-exercise').selectOption('Plank');await clickControl(page.locator('#routine-add'));await clickControl(page.locator('[data-routine-move="-1"][data-i="1"]'));await page.locator('[data-target=seconds][data-i="0"]').fill('45');await page.locator('[data-target=rest][data-i="0"]').fill('0');await clickControl(page.locator('#routine-save'));await page.locator('[data-a=routineStart]').waitFor();await clickControl(page.locator('[data-a=routineStart]'));assert.equal((await saved()).cur.ex[0].n,'Plank');assert.equal((await saved()).cur.ex[0].sets.length,0);assert.equal((await saved()).cur.ex[0].target.seconds,45);await page.locator('#log-seconds').fill('45abc');await clickControl(page.locator('[data-a=log]'));assert.equal((await saved()).cur.ex[0].sets.length,0);await page.locator('#log-seconds').fill('45');await clickControl(page.locator('[data-a=log]'));assert(!(await saved()).cur.restEndAt);await clickTab('settings');await clickControl(page.locator('[data-a=timerToggle]'));await clickTab('today');await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));await clickControl(page.locator('[data-a=exerciseOptions]'));await page.locator('#exercise-rest').fill('120');await page.locator('#equipment-label').fill('Gym A bench');await clickControl(page.locator('#exercise-options-save'));await page.locator('#qol-weight').fill('65');await page.locator('#qol-reps').fill('8');await clickControl(page.locator('[data-a=log]'));assert(!(await saved()).cur.restEndAt);assert.equal((await saved()).cur.ex[1].sets[0].equipmentContext.label,'Gym A bench');await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();await stableScreenshot(name+'-routines.png');await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).routines[0].ex[0].n,'Plank');await clickTab('history');await clickControl(page.locator('[data-a=sessionView]'));await clickControl(page.locator('#session-repeat'));assert.equal((await saved()).cur.ex[1].sets.length,0);
  });
  await check(name+': chart windows end today and All time retains older and future records',async()=>{
   await open();const today=await page.evaluate(()=>iso()),next=new Date(today+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);const tomorrow=next.toISOString().slice(0,10),dates=['1900-01-01',today,tomorrow];
   await open({...base(),workouts:dates.map((d,i)=>({...workout('Bench Press',40+i*20,8),id:i+1,d})),bw:dates.map((d,i)=>({d,kg:70+i*10}))});await saved();
   const stored=await page.evaluate(()=>localStorage.getItem('liftlog-state')),labels=await page.evaluate(ds=>ds.map(d=>new Date(d+'T12:00:00').toLocaleDateString()),dates);
   await clickTab('settings');await clickControl(page.getByRole('button',{name:'Progress charts',exact:true}));await clickControl(page.locator('#qol-progress-data summary'));
   const shown=await page.locator('#qol-progress-data tbody tr td:first-child').allTextContents();assert.deepEqual(shown,[labels[1],labels[1]],'finite windows apply the same upper limit to strength and bodyweight');
   assert((await page.locator('#progress-help').textContent()).includes('window ends today'));
   await page.locator('#qol-progress-window').selectOption('all');await clickControl(page.locator('#qol-progress-data summary'));
   const all=await page.locator('#qol-progress-data tbody tr td:first-child').allTextContents();assert.equal(all.length,6);for(const label of labels)assert.equal(all.filter(v=>v===label).length,2);
   assert((await page.locator('#progress-help').textContent()).includes('All time includes future-dated records'));
   await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),stored,'chart filters must preserve the original stored history');
  });
  await check(name+': legacy band reps remain chartable without mixing modern band data',async()=>{
   const legacy=workout('Resistance Band Curl',25,12);legacy.d='2026-10-01';
   const modern={...workout('Resistance Band Curl',0,15),id:2,d:'2026-10-02',ex:[{n:'Resistance Band Curl',sets:[{kg:0,reps:15,t:'',band:'Red',trackingMode:'band_reps',protocolVersion:2}]}]};
   const legacyOnly={...workout('Banded Glute Bridge',0,8),id:3,d:'2026-10-01'};
   await open({...base(),workouts:[legacy,modern,legacyOnly]});const before=JSON.stringify((await saved()).workouts);
   await clickTab('settings');await clickControl(page.getByRole('button',{name:'Progress charts',exact:true}));
   assert.equal(await page.locator('#progress-metric').inputValue(),'reps','mixed history starts on modern band reps');
   await page.locator('#qol-progress-window').selectOption('all');await page.locator('#progress-metric').selectOption('legacyReps');await page.locator('#progress-band').selectOption('');
   await clickControl(page.locator('#qol-progress-data summary'));assert.deepEqual(await page.locator('#qol-progress-data tbody tr td:last-child').allTextContents(),['12']);
   assert((await page.locator('#progress-help').textContent()).includes('not band resistance'));
   assert.equal(await page.locator('#progress-metric option[value=load],#progress-metric option[value=strength]').count(),0);
   await page.locator('#progress-metric').selectOption('reps');await page.locator('#progress-band').selectOption('Red');
   await clickControl(page.locator('#qol-progress-data summary'));assert.deepEqual(await page.locator('#qol-progress-data tbody tr td:last-child').allTextContents(),['15']);
   await page.locator('#qol-progress-lift').selectOption('Banded Glute Bridge');assert.equal(await page.locator('#progress-metric').inputValue(),'legacyReps','legacy-only history selects its usable metric');
   await clickControl(page.locator('#qol-progress-data summary'));assert.deepEqual(await page.locator('#qol-progress-data tbody tr td:last-child').allTextContents(),['8']);
   await page.keyboard.press('Escape');assert.equal(JSON.stringify((await saved()).workouts),before);
   await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.equal(JSON.stringify((await saved()).workouts),before);
  });
  await check(name+': timed and band charts compare like equipment and retain exact units',async()=>{
   const date='2026-10-01',timed={...workout('Plank',0,0),id:1,d:date};timed.ex[0].sets=[{kg:0,reps:0,seconds:45,trackingMode:'duration',t:'',equipmentContext:{label:'A'}},{kg:0,reps:0,seconds:70,trackingMode:'duration',t:'',equipmentContext:{label:'B'}}];const band={...workout('Resistance Band Curl',0,10),id:2,d:date};band.ex[0].sets=[{kg:0,reps:10,band:'red',trackingMode:'band_reps',t:''},{kg:0,reps:15,band:'blue',trackingMode:'band_reps',t:''}];const assisted={...workout('Assisted Dip',-20,8),id:3,d:date};assisted.ex[0].sets.push({kg:0,reps:8,t:'',trackingMode:'load_reps'});await open({...base(),workouts:[timed,band,assisted]},{width:320,height:720});await clickTab('settings');await clickControl(page.getByRole('button',{name:'Progress charts',exact:true}));await page.locator('#qol-progress-lift').selectOption('Plank');await page.locator('#qol-progress-window').selectOption('all');await page.locator('#progress-profile').selectOption('profile:A');await clickControl(page.locator('#qol-progress-data summary'));assert((await page.locator('#qol-progress-data').textContent()).includes('45'));assert(!(await page.locator('#qol-progress-data').textContent()).includes('70'));await page.locator('#progress-profile').selectOption('profile:B');assert((await page.locator('#qol-progress-data').textContent()).includes('70'));assert.equal(await page.locator('#progress-metric option[value=strength]').count(),0);assert(await page.locator('.action-card').evaluate(el=>el.scrollWidth<=el.clientWidth+1));assert.equal(await page.locator('.toast-action:visible').count(),0,'modal must not display inert notification actions');await stableScreenshot(name+'-duration-progress.png');await page.locator('#qol-progress-lift').selectOption('Resistance Band Curl');await page.locator('#progress-band').selectOption('blue');assert((await page.locator('#qol-progress-data').textContent()).includes('15'));assert((await page.locator('#progress-help').textContent()).includes('not a kilogram'));await page.locator('#qol-progress-lift').selectOption('Assisted Dip');await page.locator('#progress-metric').selectOption('load');assert((await page.locator('#progress-legend').textContent()).includes('Lowest assistance'));assert.equal(await page.locator('#qol-progress-data tbody td').last().textContent(),'0');await page.keyboard.press('Escape');
  });
  await check(name+': history filters and training totals remain separate from calendar counts',async()=>{
   const a={...workout('Bench Press',60,8),id:1,d:'2026-10-01'},b={...workout('Dumbbell Curl',20,10),id:2,d:'2026-10-02'};a.name='Push Monday';b.split='Pull';b.ex[0].sets[0].t='w';await open({...base(),workouts:[a,b]});await clickTab('history');await clickControl(page.locator('.history-filters summary'));await page.locator('#history-query').fill('Monday');await clickControl(page.locator('[data-a=historyApply]'));assert.equal(await page.locator('[data-a=he]').count(),1);assert.equal(await page.locator('.activity-stats').first().locator('b').first().textContent(),'2');await clickControl(page.locator('[data-a=historyReset]'));await clickControl(page.locator('.training-summary summary'));await page.locator('#summary-date').fill('2026-10-01');await clickControl(page.locator('[data-a=summaryApply]'));await page.setViewportSize({width:320,height:720});for(const selector of ['#summary-mode','#summary-date'])assert(await page.locator(selector).evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect(),p=el.closest('.training-summary').getBoundingClientRect();return s.color===getComputedStyle(document.body).color&&s.fontFamily===getComputedStyle(document.body).fontFamily&&s.fontSize==='16px'&&r.left>=p.left&&r.right<=p.right&&r.height>=44;}),'summary field themed and fits: '+selector);const summary=await page.locator('.training-summary').textContent();assert(summary.includes('working sets'));const stats=await page.locator('.training-summary .activity-stats b').allTextContents();assert.deepEqual(stats,['2','1','2']);await stableScreenshot(name+'-history-summary.png');await clickControl(page.locator('.history-filters summary'));await page.locator('#history-exercise').selectOption('Dumbbell Curl');await clickControl(page.locator('[data-a=historyApply]'));assert.equal(await page.locator('[data-a=he]').count(),1);
  });
  await check(name+': corrupt startup exports the untouched raw recovery copy',async()=>{
   await open('{broken',undefined,'#boot-export');assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),'{broken');const download=page.waitForEvent('download');await clickControl(page.locator('#boot-export'));const file=await download;assert.equal(await fs.readFile(await file.path(),'utf8'),'{broken');
  });
  await check(name+': offline reopening and waiting-worker activation preserve a draft',async()=>{
   workerTag='old-test';const draft={...workout('Cable Curl',25),id:77,drafts:{'Cable Curl':{kg:30,reps:8,note:'Unsaved set draft',rpe:8}},restEndAt:Date.now()+120000};
   await open({...base(),cur:draft},undefined,'[data-a=log]');await waitCondition(()=>!!navigator.serviceWorker.controller);
   assert(!(await page.locator('.toast').allTextContents()).some(t=>t.includes('Update available')),'first installation must not offer a spurious update');
   await context.setOffline(true);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-note').inputValue(),'Unsaved set draft');await context.setOffline(false);
   await page.evaluate(()=>caches.open('unrelated-cache'));workerTag='upgrade-test';await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});await waitCondition(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting);await waitCondition(()=>!!document.querySelector('.toast-action'));await clickControl(page.locator('.toast-action').getByRole('button',{name:'Dismiss notification'}));assert.equal(await page.locator('.toast-action').count(),0,'update notification dismisses without activating the worker');assert.equal((await saved()).cur.id,77);
   await clickTab('settings');await clickControl(page.locator('[data-a=update]'));await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-note').inputValue(),'Unsaved set draft');assert.equal((await saved()).cur.id,77);assert((await page.evaluate(()=>caches.keys())).includes('unrelated-cache'));workerTag='';
  });
  await check(name+': plate calculator, accessible chart and backup export round-trip',async()=>{
   await open({...base(),workouts:[workout()]});await clickTab('settings');await clickControl(page.getByRole('button',{name:'Plate calculator',exact:true}));
   await page.locator('#qol-plate-target').fill('100');await page.locator('#qol-plate-bar').fill('20');await clickControl(page.locator('[data-qol=calcPlates]'));assert((await page.locator('#qol-plate-result').textContent()).includes('100 kg total'));assert((await page.locator('#qol-plate-result').textContent()).includes('Exact load'));await page.locator('#qol-plate-target').fill('10');await clickControl(page.locator('[data-qol=calcPlates]'));assert((await page.locator('#qol-plate-result').textContent()).includes('below'));await clickControl(page.getByText('Available plate pairs',{exact:true}));for(const input of await page.locator('[data-plate-size]').all())await input.fill('0');await page.locator('[data-plate-size="15"]').fill('1');await page.locator('[data-plate-size="10"]').fill('2');await page.locator('#qol-plate-target').fill('60');await page.locator('#qol-bar-preset').selectOption('20');await clickControl(page.locator('[data-qol=calcPlates]'));assert((await page.locator('#qol-plate-result').textContent()).includes('Exact load'));assert((await page.locator('#qol-plate-result').textContent()).includes('60 kg total'));await page.keyboard.press('Escape');
   await clickControl(page.getByRole('button',{name:'Progress charts',exact:true}));await page.locator('#qol-progress-window').selectOption('all');await page.locator('#qol-progress-data summary').waitFor();await clickControl(page.locator('#qol-progress-data summary'));assert((await page.locator('#qol-progress-data tbody tr').count())>=1);assert((await page.locator('#qol-progress-data').textContent()).includes('Estimated'));await page.keyboard.press('Escape');
   const download=page.waitForEvent('download');await clickControl(page.locator('[data-a=exp]'));const file=await download,backup=JSON.parse(await fs.readFile(await file.path(),'utf8'));assert.equal(backup.workouts[0].ex[0].sets[0].kg,100);assert(backup.workouts[0].ex[0].sets[0].exerciseId);await page.locator('#imp').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await clickControl(page.locator('#confirm-import'));await page.locator('#confirm-import').waitFor({state:'detached'});assert.deepEqual((await saved()).workouts,backup.workouts);
  });
  await check(name+': IndexedDB-only writes survive full localStorage and reject stale tabs',async()=>{
   await open();const second=await context.newPage();await second.goto(url);await second.locator('[data-a=start]').first().waitFor();
   const deny=()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='liftlog-state')throw new DOMException('Simulated quota','QuotaExceededError');return original.call(this,k,v);};};await page.evaluate(deny);await second.evaluate(deny);
   await clickControl(page.locator('[data-a=start][data-v=Empty]'));await page.evaluate(()=>saveTail);await second.locator('#storage-conflict').waitFor();assert.equal(await page.locator('#save-state-label').textContent(),'Saved on this device');assert.equal(await page.locator('#save-retry').isVisible(),false);await clickControl(page.locator('[data-a=openx]'));await page.locator('#ex-search').fill('Cable Curl');await clickControl(page.locator('.exercise-option[data-v="Cable Curl"]'));await page.locator('#qol-weight').fill('25');await page.locator('#qol-reps').fill('8');await clickControl(page.locator('[data-a=log]'));await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.evaluate(()=>S.cur.ex[0].sets[0].kg),25);assert((await page.evaluate(()=>S.revision))>1);await second.close();
  });
  await check(name+': enlarged text and keyboard can complete a workout',async()=>{
   await open();await page.addStyleTag({content:'html{font-size:32px}'});await page.locator('[data-a=start][data-v=Empty]').focus();await page.keyboard.press('Enter');await page.locator('[data-a=openx]').focus();await page.keyboard.press('Enter');await page.locator('#ex-search').fill('Cable Curl');await page.locator('.exercise-option[data-v="Cable Curl"]').focus();await page.keyboard.press('Enter');await page.locator('#qol-weight').fill('25');await page.locator('#qol-reps').fill('8');await page.locator('[data-a=log]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.srow').count(),1);assert(await page.locator('#v').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await page.locator('[data-a=fin]').focus();await page.keyboard.press('Enter');await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts.length,1);
  });
  await check(name+': published 5.5.106 data migrates without changing raw measurements',async()=>{
   const state={...base(),rankingVersion:9,workouts:[workout('Plank',20,30),{...workout('Assisted Pull-Up Machine',-20,5),id:2},{...workout('Dumbbell Bicep Curl',15,8),id:3}]};legacyHtml=true;
   await open(state,undefined,'[data-a=start]',url,true);await waitCondition(()=>typeof S!=='undefined'&&S.workouts.length===3);const before=await page.evaluate(()=>S.workouts.flatMap(w=>w.ex.flatMap(x=>x.sets.map(s=>({kg:s.kg,reps:s.reps})))));legacyHtml=false;await page.goto(url);await page.locator('[data-a=start]').first().waitFor();const after=await saved();assert.deepEqual(after.workouts.flatMap(w=>w.ex.flatMap(x=>x.sets.map(s=>({kg:s.kg,reps:s.reps})))),before);assert.equal(after.workouts[0].ex[0].sets[0].trackingMode,'legacy_reps');assert.equal(after.workouts[2].ex[0].n,'Dumbbell Curl');assert.equal(after.rankingVersion,11);report.legacySourceWarnings=legacyErrors;
  });
  // Native keyboard activation keeps the local-file journey independent of WebKit startup scroll timing.
  await check(name+': local-file distribution logs, reloads and keeps its draft',async()=>{
   await open({...base(),cur:workout('Cable Curl',25)},undefined,'[data-a=log]',new URL('file://'+path.join(root,'lift-local.html')).href);await page.locator('#qol-note').fill('Local file draft');await waitCondition(()=>{const state=JSON.parse(localStorage.getItem('liftlog-state')||'null');return Object.values(state?.cur?.drafts||{}).some(d=>d?.note==='Local file draft')});await page.evaluate(()=>saveTail);
   const draftBefore=await page.evaluate(()=>({entryId:S.cur.ex[0].entryId,drafts:S.cur.drafts,revision:S.revision}));
   await page.reload();await page.locator('[data-a=log]').waitFor();
   try{await waitCondition(()=>document.querySelector('#qol-note')?.value==='Local file draft');}catch(error){report.localFileDraft={before:draftBefore,after:await page.evaluate(()=>({entryId:S.cur.ex[0].entryId,drafts:S.cur.drafts,dr,stored:JSON.parse(localStorage.getItem('liftlog-state')||'null')?.cur,seed:localStorage.getItem('slat-test-seeded')}))};console.error('Local-file draft diagnostics:',JSON.stringify(report.localFileDraft));throw error;}
   assert.equal(await page.locator('#qol-note').inputValue(),'Local file draft');await page.locator('[data-a=log]').focus();await page.keyboard.press('Enter');await waitCondition(()=>S.cur?.ex[0]?.sets.length===2);await page.evaluate(()=>saveTail);assert.equal((await saved()).cur.ex[0].sets.length,2);await clickTab('settings');assert((await page.locator('[data-a=update]').textContent()).includes('Reload'));await page.locator('[data-a=update]').focus();await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.keyboard.press('Enter')]);await page.locator('[data-a=log]').waitFor();assert.equal((await saved()).cur.ex[0].sets.length,2);
  });
  if(name==='chromium')await check(name+': every canonical exercise logs through its real rendered form',async()=>{
   const entries=Object.values(JSON.parse(await fs.readFile('exercises.json','utf8')).catalogue).filter(c=>!c.canonicalName);await open();await clickControl(page.locator('[data-a=start][data-v=Empty]'));
   const started=Date.now();
   for(const [i,c] of entries.entries()){
    // Each record uses the same application action as a picker choice; form input and logging use real DOM events.
    await page.evaluate(n=>A.pickx({v:n}),c.name);
    if(await page.locator('#qol-weight').count())await page.locator('#qol-weight').fill('20');
    if(await page.locator('#qol-reps').count())await page.locator('#qol-reps').fill('8');
    if(await page.locator('#log-seconds').count())await page.locator('#log-seconds').fill('45');
    if(await page.locator('#log-meters').count())await page.locator('#log-meters').fill('25');
    if(await page.locator('#log-band').count())await page.locator('#log-band').fill('red band');
    await clickControl(page.locator('[data-a=log]'));assert.equal(await page.locator('.srow').count(),1,c.name);
    if((i+1)%100===0)console.log('Catalogue forms '+(i+1)+'/'+entries.length);
   }
   await page.evaluate(()=>saveTail);assert.equal((await saved()).cur.ex.length,450);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal((await saved()).cur.ex.flatMap(x=>x.sets).length,450);await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();assert.equal(await page.evaluate(()=>Object.keys(S.rk).length),400);report.catalogueFormMs=Date.now()-started;
  });
  await check(name+': 100, 1000 and 10000 sessions preserve records with bounded history rendering',async()=>{
   report.historyPerformance??=[];
   for(const count of [100,1000,10000]){const state={...base(),workouts:Array.from({length:count},(_,i)=>({...workout(),id:i+1}))},start=Date.now();await open(state);await clickTab('history');assert.equal(await page.locator('[data-a=he]').count(),50);await clickControl(page.locator('[data-a=moreHistory]'));assert.equal(await page.locator('[data-a=he]').count(),100);assert.equal((await saved()).workouts.length,count);report.historyPerformance.push({name,count,startAndHistoryMs:Date.now()-start});}
  });
  await context.close();context=null;await browser.close();browser=null;
 }
 assert.deepEqual(report.errors,[],'uncaught browser errors');
}catch(error){report.failure=error.stack;console.error(error);if(page){report.diagnostics=await page.evaluate(()=>({hidden:document.hidden,focused:document.hasFocus(),clicks:window.slatTestClicks,active:{tag:document.activeElement?.tagName,id:document.activeElement?.id,role:document.activeElement?.getAttribute('role'),text:document.activeElement?.textContent?.slice(0,120)},dialogs:[...document.querySelectorAll('[role=dialog]')].map(el=>({label:el.getAttribute('aria-label'),rect:el.getBoundingClientRect().toJSON(),inert:el.inert,buttons:[...el.querySelectorAll('button')].map(b=>({text:b.textContent,disabled:b.disabled,rect:b.getBoundingClientRect().toJSON(),visible:b.checkVisibility?.(),inertAncestor:!!b.closest('[inert]'),animation:getComputedStyle(b).animation,transform:getComputedStyle(b).transform}))}))})).catch(e=>({error:e.message}));console.error('Browser diagnostics:',JSON.stringify(report.diagnostics));}if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});process.exitCode=1;}
finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));if(context)await context.close();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
