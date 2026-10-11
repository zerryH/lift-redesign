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
 await page.addInitScript(s=>{if(!sessionStorage.getItem('slat-seeded')){localStorage.setItem('liftlog-state',typeof s==='string'?s:JSON.stringify(s));sessionStorage.setItem('slat-seeded','1');}},state);
 await page.goto(target);await page.bringToFront();await page.locator(ready).first().waitFor();
}
async function check(name,fn){await fn();report.checks.push(name);console.log('PASS '+name);}
async function clickControl(locator){
 if(engineName!=='webkit')return locator.click();
 // The WebKit runner stalled before pointer dispatch despite visible, enabled, inert-free controls.
 // Native pointer input keeps browser hit testing; it does not dispatch a synthetic DOM click.
 await locator.waitFor({state:'visible'});assert(await locator.isEnabled());
 const deadline=Date.now()+12000;let point;
 while(Date.now()<deadline){
  await locator.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
  // Startup and tab changes reset scroll over two frames. Reacquire the locator after that work.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  point=await locator.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return {x,y,hit:el.isConnected&&(hit===el||el.contains(hit)),inert:!!el.closest('[inert]'),disabled:!!el.disabled};});
  if(point.hit&&!point.inert&&!point.disabled){await page.mouse.click(point.x,point.y);return;}
  await page.waitForTimeout(100);
 }
 assert(point?.hit&&!point?.inert&&!point?.disabled,'control must receive native pointer input after scrolling');
}
const clickTab=name=>clickControl(page.locator('[data-a=tab][data-v="'+name+'"]'));
const saved=()=>page.evaluate(async()=>{await saveTail;return JSON.parse(localStorage.getItem('liftlog-state'));});
try{
 for(const name of names){engineName=name;
  browser=await playwright[name].launch(name==='chromium'?options:{});report.browser.push({name,version:browser.version()});
  await check(name+': log, edit, finish and reload a workout',async()=>{
   await open();await clickControl(page.getByRole('button',{name:'Free workout',exact:true}));await clickControl(page.getByRole('button',{name:'+ Add exercise',exact:true}));
   await page.locator('#ex-search').fill('Cable Curl');await clickControl(page.locator('.exercise-option[data-v="Cable Curl"]'));
   await page.locator('#qol-weight').fill('25');await page.locator('#qol-reps').fill('8');await page.locator('#qol-note').fill('Controlled tempo');await page.locator('#qol-rpe').fill('8');
   await clickControl(page.locator('[data-a=log]'));await page.getByRole('button',{name:'Add 30 seconds',exact:true}).focus();const clock=await page.locator('[data-rest-clock]').textContent();await page.waitForFunction(c=>document.querySelector('[data-rest-clock]')?.textContent!==c,clock);assert.equal(await page.evaluate(()=>document.activeElement.dataset.qol),'restPlus');await clickControl(page.getByRole('button',{name:'Stop rest timer',exact:true}));await clickControl(page.getByRole('button',{name:'Edit set 1',exact:true}));await page.locator('#edit-weight').fill('27.5');await clickControl(page.locator('#save-set-edit'));
   await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].ex[0].sets[0].kg,27.5);
   await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].ex[0].sets[0].note,'Controlled tempo');await clickTab('history');assert.equal(await page.locator('[data-a=he]').count(),1);
  });
  await check(name+': all filters and hidden-details focus containment',async()=>{
   await open();await clickControl(page.locator('[data-a=start][data-v=Empty]'));await clickControl(page.locator('[data-a=openx]'));assert.equal(await page.locator('.exercise-option').count(),447);
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
    await page.setViewportSize({width,height:844});await clickTab('settings');await clickControl(page.locator('[data-a=theme][data-v='+ (dark?'dark':'light')+']'));assert.equal(await page.locator('html').getAttribute('data-d'),String(dark),'selected theme is actually applied');
    for(const tab of ['today','history','ranks','settings']){await clickTab(tab);assert(await page.locator('#v').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'horizontal overflow '+tab+' '+width);}
   }
   await clickTab('ranks');assert.equal(await page.locator('.anatomy-svg').count(),2);assert.equal(await page.locator('.anatomy-svg [data-muscles=tibialis]').count(),1);assert.equal(await page.locator('.anatomy-svg [data-muscles=adductors]').count(),1);
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
   await open({...base(),workouts:[workout()]});await clickTab('ranks');await clickControl(page.locator('[data-a=muscleInfo][data-v=chest]'));assert((await page.locator('.action-card').textContent()).includes('Bench Press'));assert((await page.locator('.action-card').textContent()).includes('Relative weight'));await page.keyboard.press('Escape');
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
   await open(state,undefined,'[data-a=start]',url,true);await page.waitForFunction(()=>typeof S!=='undefined'&&S.workouts.length===3);const before=await page.evaluate(()=>S.workouts.flatMap(w=>w.ex.flatMap(x=>x.sets.map(s=>({kg:s.kg,reps:s.reps})))));legacyHtml=false;await page.goto(url);await page.locator('[data-a=start]').first().waitFor();const after=await saved();assert.deepEqual(after.workouts.flatMap(w=>w.ex.flatMap(x=>x.sets.map(s=>({kg:s.kg,reps:s.reps})))),before);assert.equal(after.workouts[0].ex[0].sets[0].trackingMode,'legacy_reps');assert.equal(after.workouts[2].ex[0].n,'Dumbbell Curl');assert.equal(after.rankingVersion,10);report.legacySourceWarnings=legacyErrors;
  });
  await check(name+': local-file distribution logs, reloads and keeps its draft',async()=>{
   await open({...base(),cur:workout('Cable Curl',25)},undefined,'[data-a=log]',new URL('file://'+path.join(root,'lift-local.html')).href);await page.locator('#qol-note').fill('Local file draft');await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-note').inputValue(),'Local file draft');await clickControl(page.locator('[data-a=log]'));await page.evaluate(()=>saveTail);assert.equal((await saved()).cur.ex[0].sets.length,2);await clickTab('settings');assert((await page.locator('[data-a=update]').textContent()).includes('Reload'));await clickControl(page.locator('[data-a=update]'));await page.locator('[data-a=log]').waitFor();assert.equal((await saved()).cur.ex[0].sets.length,2);
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
   await page.evaluate(()=>saveTail);assert.equal((await saved()).cur.ex.length,447);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal((await saved()).cur.ex.flatMap(x=>x.sets).length,447);await clickControl(page.locator('[data-a=fin]'));await page.locator('[data-a=start]').first().waitFor();assert.equal(await page.evaluate(()=>Object.keys(S.rk).length),400);report.catalogueFormMs=Date.now()-started;
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
