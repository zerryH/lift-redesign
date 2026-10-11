/* Real-browser release journeys. A missing browser is a failure, never a skipped pass. */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {base,workout} from '../tests/support/runtime.mjs';
const playwright=await import(process.env.SLAT_PLAYWRIGHT_PATH||'playwright');
let workerTag='',legacyHtml=false;const legacyErrors=[];
const root=process.cwd(),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname)==='/'?'index.html':decodeURIComponent(url.pathname).slice(1),file=path.resolve(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}let body=await fs.readFile(legacyHtml&&name==='index.html'?path.join(root,'tests/fixtures/release-5.5.106/index.html'):file);if(name==='sw.js'&&workerTag)body=Buffer.from(body.toString().replace(/const V='[^']+'/,'const V=\"liftlog-'+workerTag+'\"'));res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
const report={browser:[],checks:[],errors:[]},out=path.resolve(process.env.SLAT_BROWSER_OUTPUT||'test-results/browser');await fs.mkdir(out,{recursive:true});
const options=process.env.SLAT_CHROMIUM_PATH?{executablePath:process.env.SLAT_CHROMIUM_PATH,args:['--disable-gpu']}:{},names=(process.env.SLAT_BROWSERS||'chromium').split(',');
let browser,context,page,engineName;
async function open(state=base(),viewport={width:390,height:844},ready='[data-a=start]',target=url,blockWorkers=false){
 if(context){if(page)await page.evaluate(async()=>{for(const reg of await navigator.serviceWorker.getRegistrations())await reg.unregister();}).catch(()=>{});await context.close();}context=await browser.newContext({viewport,...(blockWorkers?{serviceWorkers:'block'}:{})});page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',e=>(legacyHtml?legacyErrors:report.errors).push(e.message));
 // File URL reloads can recreate sessionStorage; seed once in the same durable store as the fixture.
 await page.addInitScript(s=>{if(!localStorage.getItem('slat-test-seeded')){localStorage.setItem('liftlog-state',typeof s==='string'?s:JSON.stringify(s));localStorage.setItem('slat-test-seeded','1');}},state);
 await page.goto(target);await page.bringToFront();await page.locator(ready).first().waitFor();
}
async function check(name,fn){await fn();report.checks.push(name);console.log('PASS '+name);}
async function clickControl(locator){
 if(engineName!=='webkit')return locator.click();
 // The WebKit runner stalled before pointer dispatch despite visible, enabled, inert-free controls.
 // Native pointer input keeps browser hit testing; it does not dispatch a synthetic DOM click.
 await page.bringToFront();await locator.waitFor({state:'visible'});assert(await locator.isEnabled());
 const deadline=Date.now()+12000;let point;
 while(Date.now()<deadline){
  await locator.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
  // Startup and tab changes reset scroll over two frames. Reacquire the locator after that work.
  await page.evaluate(()=>Promise.race([new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))),new Promise(resolve=>setTimeout(resolve,100))]));
  point=await locator.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return {x,y,hit:el.isConnected&&(hit===el||el.contains(hit)),inert:!!el.closest('[inert]'),disabled:!!el.disabled};});
  if(point.hit&&!point.inert&&!point.disabled){await page.mouse.click(point.x,point.y);return;}
  await page.waitForTimeout(100);
 }
 assert(point?.hit&&!point?.inert&&!point?.disabled,'control must receive native pointer input after scrolling');
}
async function stableScreenshot(filename){
 for(const b of await page.locator('.toast-action [aria-label="Dismiss notification"]').all())await clickControl(b);
 // Let the app's 2.7s transient notifications fade before visual capture.
 await page.waitForTimeout(3000);
 if(filename.includes('-history-summary'))await page.locator('.training-summary').screenshot({path:path.join(out,filename)});else await page.screenshot({path:path.join(out,filename)});
}
const clickTab=name=>clickControl(page.locator('[data-a=tab][data-v="'+name+'"]'));
const saved=()=>page.evaluate(async()=>{await saveTail;return JSON.parse(localStorage.getItem('liftlog-state'));});
try{
 for(const name of names){engineName=name;
  browser=await playwright[name].launch(name==='chromium'?options:{});report.browser.push({name,version:browser.version()});
  await check(name+': activity calendar counts completed sessions, dates, edits, deletion and undo',async()=>{
   const day='2024-07-01',one={...workout(),id:101,d:day},draft={...workout(),id:102,d:day},other={...workout(),id:103,d:'2024-07-03'};
   await open({...base(),workouts:[one,other,{...workout(),id:104,d:'2023-12-31'}],cur:draft},undefined,'[data-a=fin]');
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();await clickTab('history');
   await clickControl(page.getByRole('button',{name:'Previous year',exact:true}));await page.waitForFunction(()=>document.querySelector('#activity-year')?.textContent==='2025');
   await clickControl(page.getByRole('button',{name:'Previous year',exact:true}));await page.waitForFunction(()=>document.querySelector('#activity-year')?.textContent==='2024');
   const square=page.locator('.activity-day[data-v="'+day+'"]'),single=page.locator('.activity-day[data-v="2024-07-03"]'),rest=page.locator('.activity-day[data-v="2024-07-02"]');
   assert.equal(await square.getAttribute('data-count'),'2');assert.equal(await square.locator('.activity-count').textContent(),'2');assert.equal(await single.locator('.activity-count').count(),0);assert.equal(await rest.locator('.activity-count').count(),0);
   const palette=await page.evaluate(()=>({active:getComputedStyle(document.querySelector('.activity-day.trained')).backgroundColor,grey:getComputedStyle(document.querySelector('.activity-day.rest-day')).backgroundColor,accent:getComputedStyle(document.documentElement).getPropertyValue('--ac')}));assert.notEqual(palette.active,palette.grey);
   await clickControl(square);assert((await page.locator('#activity-detail').textContent()).includes('2 workouts'));await page.screenshot({path:path.join(out,name+'-activity-year-dark.png')});
   await clickControl(page.locator('[data-a=activityMode][data-v=month]'));await page.locator('#activity-month').selectOption('6');assert.equal(await page.locator('.activity-day').count(),31);
   assert.equal(await page.locator('.activity-day').first().getAttribute('data-v'),day);await clickControl(square);await page.screenshot({path:path.join(out,name+'-activity-month-dark.png')});
   await clickControl(page.locator('[data-a=activityHistory]'));assert.equal(await page.locator('[data-a=he]').count(),2);
   await clickControl(page.locator('[data-a=he]').first());await page.locator('[data-a=fin]').waitFor();await clickControl(page.locator('[data-a=fin]'));await clickTab('history');assert.equal(await square.getAttribute('data-count'),'2','editing does not add a session');
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
  await check(name+': log, edit, finish and reload a workout',async()=>{
   await open();await clickControl(page.getByRole('button',{name:'Free workout',exact:true}));await clickControl(page.getByRole('button',{name:'+ Add exercise',exact:true}));
   await page.locator('#ex-search').fill('Cable Curl');await clickControl(page.locator('.exercise-option[data-v="Cable Curl"]'));
   await page.locator('#qol-weight').fill('25');await page.locator('#qol-reps').fill('8');await page.locator('#qol-note').fill('Controlled tempo');await page.locator('#qol-rpe').fill('8');
   await clickControl(page.locator('[data-a=log]'));await page.getByRole('button',{name:'Add 30 seconds',exact:true}).focus();const clock=await page.locator('[data-rest-clock]').textContent();await page.waitForFunction(c=>document.querySelector('[data-rest-clock]')?.textContent!==c,clock);assert.equal(await page.evaluate(()=>document.activeElement.dataset.qol),'restPlus');await clickControl(page.getByRole('button',{name:'Stop rest timer',exact:true}));await clickControl(page.getByRole('button',{name:'Edit set 1',exact:true}));await page.locator('#edit-weight').fill('27.5');await clickControl(page.locator('#save-set-edit'));
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].ex[0].sets[0].kg,27.5);
   await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].ex[0].sets[0].note,'Controlled tempo');await clickTab('history');assert.equal(await page.locator('[data-a=he]').count(),1);
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
  await check(name+': backup preview cancels safely and confirms atomic replacement',async()=>{
   await open({...base(),workouts:[workout()]});await clickTab('settings');const raw=await page.evaluate(()=>localStorage.getItem('liftlog-state'));
   await page.locator('#imp').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({workouts:[{d:'2026-10-10',ex:{}}],bw:[]}))});assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);
   const backup={version:4,workouts:[{...workout('Cable Curl',30),id:9}],bw:base().bw,settings:base().set};const file={name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))};
   await page.locator('#imp').setInputFiles(file);await page.bringToFront();await page.locator('#confirm-import').waitFor();assert(await page.locator('.action-card').evaluate(el=>el.getBoundingClientRect().right<=innerWidth&&el.getBoundingClientRect().left>=0),'backup dialog fits viewport');assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);await clickControl(page.getByRole('button',{name:'Cancel',exact:true}));await page.locator('#confirm-import').waitFor({state:'detached'});assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);
   await page.locator('#imp').setInputFiles(file);await clickControl(page.locator('#confirm-import'));await page.locator('#confirm-import').waitFor({state:'detached'});assert.equal((await saved()).workouts[0].ex[0].n,'Cable Curl');assert(await page.evaluate(()=>localStorage.getItem('liftlog-import-recovery')));
  });
  await check(name+': two real tabs block the stale writer',async()=>{
   await open();const second=await context.newPage();await second.goto(url);await second.locator('[data-a=start]').first().waitFor();await clickControl(page.locator('[data-a=start][data-v=Empty]'));await second.locator('#storage-conflict').waitFor();assert.equal(await second.locator('#storage-conflict').getAttribute('role'),'alert');await second.close();
  });
  await check(name+': narrow/light/dark/reduced-motion layouts and anatomy',async()=>{
   await open({...base(),workouts:[workout()]});await page.emulateMedia({reducedMotion:'reduce'});
   for(const width of [320,390,768])for(const dark of [0,1]){
    await page.setViewportSize({width,height:844});await clickTab('settings');await clickControl(page.locator('[data-a=theme][data-v='+ (dark?'dark':'light')+']'));await page.waitForFunction(d=>document.documentElement.dataset.d===d,String(dark));assert.equal(await page.locator('html').getAttribute('data-d'),String(dark),'selected theme is actually applied');
    for(const tab of ['today','history','ranks','settings']){await clickTab(tab);assert(await page.locator('#v').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'horizontal overflow '+tab+' '+width);}
   }
   await clickTab('ranks');assert(await page.locator('.overall-rank-title .rank-icon').evaluate(el=>{const r=el.getBoundingClientRect();return r.width>=24&&r.width<=40&&r.height<=40;}),'overall rank icon must keep its compact dimensions');assert.equal(await page.locator('.anatomy-svg').count(),2);assert.equal(await page.locator('.anatomy-svg [data-muscles=tibialis]').count(),1);assert.equal(await page.locator('.anatomy-svg [data-muscles=adductors]').count(),1);
   const parsed=await page.evaluate(()=>[...document.querySelectorAll('.anatomy-svg')].every(svg=>!new DOMParser().parseFromString(svg.outerHTML,'image/svg+xml').querySelector('parsererror')));assert(parsed);
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,name+'-ranks.png')});await clickTab('today');await page.screenshot({path:path.join(out,name+'-today.png')});
  });
  await check(name+': removals undo after reload and custom labels retain identity',async()=>{
   const custom={n:'My Cable Curl',t:'M',c:'Biceps',g:'Pull',rank:'Cable Curl'};await open({...base(),custom:[custom],cur:{...workout('My Cable Curl',25),id:88}},undefined,'[data-a=log]');
   await clickControl(page.locator('[data-a=ds]'));await clickControl(page.locator('[data-action-confirm]'));await page.locator('[data-a=undo]').waitFor();await page.evaluate(()=>saveTail);await page.reload();await clickControl(page.locator('[data-a=undo]'));assert.equal(await page.locator('.srow').count(),1);
   const old=(await saved()).cur.ex[0].exerciseId;await clickTab('settings');await clickControl(page.locator('[data-a=manageCustom]'));await page.locator('#custom-rename').fill('My Consistent Curl');await clickControl(page.locator('#save-custom-name'));await page.evaluate(()=>saveTail);const state=await saved();assert.equal(state.cur.ex[0].n,'My Consistent Curl');assert.equal(state.cur.ex[0].exerciseId,old);assert.equal(state.cur.ex[0].sets[0].kg,25);
   await clickControl(page.locator('[data-a=manageCustom]'));await clickControl(page.locator('#custom-retire'));await clickTab('today');await clickControl(page.locator('[data-a=openx]'));assert.equal(await page.locator('.exercise-option[data-v="My Consistent Curl"]').count(),0);await page.keyboard.press('Escape');assert.equal((await saved()).cur.ex[0].sets.length,1);
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();await clickTab('history');await clickControl(page.locator('[data-a=hd]'));await clickControl(page.locator('[data-action-confirm]'));assert.equal(await page.locator('[data-a=he]').count(),0);await clickControl(page.locator('[data-a=undo]'));assert.equal(await page.locator('[data-a=he]').count(),1);
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
    await clickControl(page.locator('[data-a=theme][data-v='+ (dark?'dark':'light')+']'));await page.waitForFunction(d=>document.documentElement.dataset.d===d,String(dark));
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
  await check(name+': imported rest timer ticks and zero-rest override stops it',async()=>{
   await open();await clickTab('settings');
   const backup={version:4,workouts:[],bw:base().bw,settings:base().set,cur:{...workout('Bench Press',60,8),restEndAt:Date.now()+60000}};
   await page.locator('#imp').setInputFiles({name:'timer.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await clickControl(page.locator('#confirm-import'));await page.locator('#confirm-import').waitFor({state:'detached'});
   await page.locator('[data-rest-clock]').waitFor();const first=await page.locator('[data-rest-clock]').textContent();await page.waitForFunction(value=>document.querySelector('[data-rest-clock]')?.textContent!==value,first,{timeout:5000});
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
   const routines=[{id:'routine:qol',name:'Routine progress',ex:[{n:'Bench Press',exerciseId:'ex001',sets:1,reps:12,seconds:30,meters:20,rest:0},{n:'Plank',exerciseId:'ex382',sets:1,reps:8,seconds:45,meters:20,rest:0}]}];
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
  await check(name+': saved routines reorder, copy targets, disable timers and label new sets',async()=>{
   await open();await clickControl(page.locator('[data-a=routineEdit]'));await page.locator('#routine-name').fill('My full body');await page.locator('#routine-exercise').selectOption('Bench Press');await clickControl(page.locator('#routine-add'));await page.locator('#routine-exercise').selectOption('Plank');await clickControl(page.locator('#routine-add'));await clickControl(page.locator('[data-routine-move="-1"][data-i="1"]'));await page.locator('[data-target=seconds][data-i="0"]').fill('45');await page.locator('[data-target=rest][data-i="0"]').fill('0');await clickControl(page.locator('#routine-save'));await page.locator('[data-a=routineStart]').waitFor();await clickControl(page.locator('[data-a=routineStart]'));assert.equal((await saved()).cur.ex[0].n,'Plank');assert.equal((await saved()).cur.ex[0].sets.length,0);assert.equal((await saved()).cur.ex[0].target.seconds,45);await page.locator('#log-seconds').fill('45abc');await clickControl(page.locator('[data-a=log]'));assert.equal((await saved()).cur.ex[0].sets.length,0);await page.locator('#log-seconds').fill('45');await clickControl(page.locator('[data-a=log]'));assert(!(await saved()).cur.restEndAt);await clickTab('settings');await clickControl(page.locator('[data-a=timerToggle]'));await clickTab('today');await clickControl(page.locator('[data-a=selectExercise][data-i="1"]'));await clickControl(page.locator('[data-a=exerciseOptions]'));await page.locator('#exercise-rest').fill('120');await page.locator('#equipment-label').fill('Gym A bench');await clickControl(page.locator('#exercise-options-save'));await page.locator('#qol-weight').fill('65');await page.locator('#qol-reps').fill('8');await clickControl(page.locator('[data-a=log]'));assert(!(await saved()).cur.restEndAt);assert.equal((await saved()).cur.ex[1].sets[0].equipmentContext.label,'Gym A bench');await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();await stableScreenshot(name+'-routines.png');await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).routines[0].ex[0].n,'Plank');await clickTab('history');await clickControl(page.locator('[data-a=sessionView]'));await clickControl(page.locator('#session-repeat'));assert.equal((await saved()).cur.ex[1].sets.length,0);
  });
  await check(name+': timed and band charts compare like equipment and retain exact units',async()=>{
   const date='2026-10-01',timed={...workout('Plank',0,0),id:1,d:date};timed.ex[0].sets=[{kg:0,reps:0,seconds:45,trackingMode:'duration',t:'',equipmentContext:{label:'A'}},{kg:0,reps:0,seconds:70,trackingMode:'duration',t:'',equipmentContext:{label:'B'}}];const band={...workout('Resistance Band Curl',0,10),id:2,d:date};band.ex[0].sets=[{kg:0,reps:10,band:'red',trackingMode:'band_reps',t:''},{kg:0,reps:15,band:'blue',trackingMode:'band_reps',t:''}];const assisted={...workout('Assisted Dip',-20,8),id:3,d:date};assisted.ex[0].sets.push({kg:0,reps:8,t:'',trackingMode:'load_reps'});await open({...base(),workouts:[timed,band,assisted]},{width:320,height:720});await clickTab('settings');await clickControl(page.getByRole('button',{name:'Progress charts',exact:true}));await page.locator('#qol-progress-lift').selectOption('Plank');await page.locator('#qol-progress-window').selectOption('all');await page.locator('#progress-profile').selectOption('profile:A');await clickControl(page.locator('#qol-progress-data summary'));assert((await page.locator('#qol-progress-data').textContent()).includes('45'));assert(!(await page.locator('#qol-progress-data').textContent()).includes('70'));await page.locator('#progress-profile').selectOption('profile:B');assert((await page.locator('#qol-progress-data').textContent()).includes('70'));assert.equal(await page.locator('#progress-metric option[value=strength]').count(),0);assert(await page.locator('.action-card').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await stableScreenshot(name+'-duration-progress.png');await page.locator('#qol-progress-lift').selectOption('Resistance Band Curl');await page.locator('#progress-band').selectOption('blue');assert((await page.locator('#qol-progress-data').textContent()).includes('15'));assert((await page.locator('#progress-help').textContent()).includes('not a kilogram'));await page.locator('#qol-progress-lift').selectOption('Assisted Dip');await page.locator('#progress-metric').selectOption('load');assert((await page.locator('#progress-legend').textContent()).includes('Lowest assistance'));assert.equal(await page.locator('#qol-progress-data tbody td').last().textContent(),'0');await page.keyboard.press('Escape');
  });
  await check(name+': history filters and training totals remain separate from calendar counts',async()=>{
   const a={...workout('Bench Press',60,8),id:1,d:'2026-10-01'},b={...workout('Dumbbell Curl',20,10),id:2,d:'2026-10-02'};a.name='Push Monday';b.split='Pull';b.ex[0].sets[0].t='w';await open({...base(),workouts:[a,b]});await clickTab('history');await clickControl(page.locator('.history-filters summary'));await page.locator('#history-query').fill('Monday');await clickControl(page.locator('[data-a=historyApply]'));assert.equal(await page.locator('[data-a=he]').count(),1);assert.equal(await page.locator('.activity-stats').first().locator('b').first().textContent(),'2');await clickControl(page.locator('[data-a=historyReset]'));await clickControl(page.locator('.training-summary summary'));await page.locator('#summary-date').fill('2026-10-01');await clickControl(page.locator('[data-a=summaryApply]'));await page.setViewportSize({width:320,height:720});for(const selector of ['#summary-mode','#summary-date'])assert(await page.locator(selector).evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect(),p=el.closest('.training-summary').getBoundingClientRect();return s.color===getComputedStyle(document.body).color&&s.fontFamily===getComputedStyle(document.body).fontFamily&&s.fontSize==='16px'&&r.left>=p.left&&r.right<=p.right&&r.height>=44;}),'summary field themed and fits: '+selector);const summary=await page.locator('.training-summary').textContent();assert(summary.includes('working sets'));const stats=await page.locator('.training-summary .activity-stats b').allTextContents();assert.deepEqual(stats,['2','1','2']);await stableScreenshot(name+'-history-summary.png');await clickControl(page.locator('.history-filters summary'));await page.locator('#history-exercise').selectOption('Dumbbell Curl');await clickControl(page.locator('[data-a=historyApply]'));assert.equal(await page.locator('[data-a=he]').count(),1);
  });
  await check(name+': corrupt startup exports the untouched raw recovery copy',async()=>{
   await open('{broken',undefined,'#boot-export');assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),'{broken');const download=page.waitForEvent('download');await clickControl(page.locator('#boot-export'));const file=await download;assert.equal(await fs.readFile(await file.path(),'utf8'),'{broken');
  });
  await check(name+': offline reopening and waiting-worker activation preserve a draft',async()=>{
   workerTag='old-test';const draft={...workout('Cable Curl',25),id:77,drafts:{'Cable Curl':{kg:30,reps:8,note:'Unsaved set draft',rpe:8}},restEndAt:Date.now()+120000};
   await open({...base(),cur:draft},undefined,'[data-a=log]');await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   assert(!(await page.locator('.toast').allTextContents()).some(t=>t.includes('Update available')),'first installation must not offer a spurious update');
   await context.setOffline(true);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-note').inputValue(),'Unsaved set draft');await context.setOffline(false);
   await page.evaluate(()=>caches.open('unrelated-cache'));workerTag='upgrade-test';await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting);await page.waitForFunction(()=>!!document.querySelector('.toast-action'));await clickControl(page.locator('.toast-action').getByRole('button',{name:'Dismiss notification'}));assert.equal(await page.locator('.toast-action').count(),0,'update notification dismisses without activating the worker');assert.equal((await saved()).cur.id,77);
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
   await open(state,undefined,'[data-a=start]',url,true);await page.waitForFunction(()=>typeof S!=='undefined'&&S.workouts.length===3);const before=await page.evaluate(()=>S.workouts.flatMap(w=>w.ex.flatMap(x=>x.sets.map(s=>({kg:s.kg,reps:s.reps})))));legacyHtml=false;await page.goto(url);await page.locator('[data-a=start]').first().waitFor();const after=await saved();assert.deepEqual(after.workouts.flatMap(w=>w.ex.flatMap(x=>x.sets.map(s=>({kg:s.kg,reps:s.reps})))),before);assert.equal(after.workouts[0].ex[0].sets[0].trackingMode,'legacy_reps');assert.equal(after.workouts[2].ex[0].n,'Dumbbell Curl');assert.equal(after.rankingVersion,11);report.legacySourceWarnings=legacyErrors;
  });
  // Native keyboard activation keeps the local-file journey independent of WebKit startup scroll timing.
  await check(name+': local-file distribution logs, reloads and keeps its draft',async()=>{
   await open({...base(),cur:workout('Cable Curl',25)},undefined,'[data-a=log]',new URL('file://'+path.join(root,'lift-local.html')).href);await page.locator('#qol-note').fill('Local file draft');await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-note').inputValue(),'Local file draft');await page.locator('[data-a=log]').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>S.cur?.ex[0]?.sets.length===2);await page.evaluate(()=>saveTail);assert.equal((await saved()).cur.ex[0].sets.length,2);await clickTab('settings');assert((await page.locator('[data-a=update]').textContent()).includes('Reload'));await page.locator('[data-a=update]').focus();await page.keyboard.press('Enter');await page.locator('[data-a=log]').waitFor();assert.equal((await saved()).cur.ex[0].sets.length,2);
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
}catch(error){report.failure=error.stack;console.error(error);if(page){report.diagnostics=await page.evaluate(()=>({hidden:document.hidden,focused:document.hasFocus(),active:{tag:document.activeElement?.tagName,id:document.activeElement?.id,role:document.activeElement?.getAttribute('role'),text:document.activeElement?.textContent?.slice(0,120)},dialogs:[...document.querySelectorAll('[role=dialog]')].map(el=>({label:el.getAttribute('aria-label'),rect:el.getBoundingClientRect().toJSON(),inert:el.inert,buttons:[...el.querySelectorAll('button')].map(b=>({text:b.textContent,disabled:b.disabled,rect:b.getBoundingClientRect().toJSON(),visible:b.checkVisibility?.(),inertAncestor:!!b.closest('[inert]'),animation:getComputedStyle(b).animation,transform:getComputedStyle(b).transform}))}))})).catch(e=>({error:e.message}));console.error('Browser diagnostics:',JSON.stringify(report.diagnostics));}if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});process.exitCode=1;}
finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));if(context)await context.close();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
