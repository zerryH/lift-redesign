/* Real-browser release journeys. A missing browser is a failure, never a skipped pass. */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {base,workout} from '../tests/support/runtime.mjs';
const playwright=await import(process.env.SLAT_PLAYWRIGHT_PATH||'playwright');
let workerTag='';
const root=process.cwd(),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname)==='/'?'index.html':decodeURIComponent(url.pathname).slice(1),file=path.resolve(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}let body=await fs.readFile(file);if(name==='sw.js'&&workerTag)body=Buffer.from(body.toString().replace(/const V='[^']+'/,'const V=\"liftlog-'+workerTag+'\"'));res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
const report={browser:[],checks:[],errors:[]},out=path.resolve(process.env.SLAT_BROWSER_OUTPUT||'test-results/browser');await fs.mkdir(out,{recursive:true});
const options=process.env.SLAT_CHROMIUM_PATH?{executablePath:process.env.SLAT_CHROMIUM_PATH,args:['--disable-gpu']}:{},names=(process.env.SLAT_BROWSERS||'chromium').split(',');
let browser,context,page;
async function open(state=base(),viewport={width:390,height:844},ready='[data-a=start]'){
 if(context)await context.close();context=await browser.newContext({viewport});page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.addInitScript(s=>{if(!sessionStorage.getItem('slat-seeded')){localStorage.setItem('liftlog-state',typeof s==='string'?s:JSON.stringify(s));sessionStorage.setItem('slat-seeded','1');}},state);
 await page.goto(url);await page.bringToFront();await page.locator(ready).first().waitFor();
}
async function check(name,fn){await fn();report.checks.push(name);console.log('PASS '+name);}
const clickTab=name=>page.locator('[data-a=tab][data-v="'+name+'"]').click();
const saved=()=>page.evaluate(async()=>{await saveTail;return JSON.parse(localStorage.getItem('liftlog-state'));});
try{
 for(const name of names){
  browser=await playwright[name].launch(name==='chromium'?options:{});report.browser.push({name,version:browser.version()});
  await check(name+': log, edit, finish and reload a workout',async()=>{
   await open();await page.getByRole('button',{name:'Free workout',exact:true}).click();await page.getByRole('button',{name:'+ Add exercise',exact:true}).click();
   await page.locator('#ex-search').fill('Cable Curl');await page.locator('.exercise-option[data-v="Cable Curl"]').click();
   await page.locator('#qol-weight').fill('25');await page.locator('#qol-reps').fill('8');await page.locator('#qol-note').fill('Controlled tempo');await page.locator('#qol-rpe').fill('8');
   await page.locator('[data-a=log]').click();await page.getByRole('button',{name:'Add 30 seconds',exact:true}).focus();const clock=await page.locator('[data-rest-clock]').textContent();await page.waitForFunction(c=>document.querySelector('[data-rest-clock]')?.textContent!==c,clock);assert.equal(await page.evaluate(()=>document.activeElement.dataset.qol),'restPlus');await page.getByRole('button',{name:'Stop rest timer',exact:true}).click();await page.getByRole('button',{name:'Edit set 1',exact:true}).click();await page.locator('#edit-weight').fill('27.5');await page.locator('#save-set-edit').click();
   await page.locator('[data-a=fin]').click();await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].ex[0].sets[0].kg,27.5);
   await page.reload();await page.locator('[data-a=start]').first().waitFor();assert.equal((await saved()).workouts[0].ex[0].sets[0].note,'Controlled tempo');await clickTab('history');assert.equal(await page.locator('[data-a=he]').count(),1);
  });
  await check(name+': all filters and hidden-details focus containment',async()=>{
   await open();await page.locator('[data-a=start][data-v=Empty]').click();await page.locator('[data-a=openx]').click();assert.equal(await page.locator('.exercise-option').count(),447);
   await page.locator('#ex-muscle').selectOption('Biceps');await page.locator('#ex-equipment').selectOption('Cable / rope');assert((await page.locator('.exercise-option').count())>0);
   for(const text of await page.locator('.exercise-option small').allTextContents())assert(text.includes('Biceps')&&text.includes('Cable / rope'));
   await page.locator('.exercise-custom summary').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'exercise-library-close');await page.keyboard.press('Escape');assert.equal(await page.locator('.exercise-library').count(),0);
   assert.equal(await page.locator('#v').evaluate(el=>el.inert),false);
  });
  await check(name+': rank preview and saved check keep earned results separate',async()=>{
   await open({...base(),workouts:[workout()]});const before=await saved();await clickTab('ranks');await page.locator('[data-a=gr]').first().click();await page.locator('[data-g=n]').fill('Bench Press');await page.locator('[data-g=w]').fill('180');await page.locator('[data-g=r]').fill('5');await page.locator('[data-g=b]').fill('80');await page.locator('[data-a=calc]').click();assert((await page.locator('.res').textContent()).includes('est. 1RM'));
   await page.locator('[data-a=saveCheck]').click();const after=await saved();assert.equal(after.checks['Bench Press'].w,180);assert.deepEqual(after.workouts,before.workouts);assert.equal(after.set.table,'M');await page.keyboard.press('Escape');
   await page.locator('[data-a=rankList]').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#rank-list-modal').count(),0);
  });
  await check(name+': backup preview cancels safely and confirms atomic replacement',async()=>{
   await open({...base(),workouts:[workout()]});await clickTab('settings');const raw=await page.evaluate(()=>localStorage.getItem('liftlog-state'));
   await page.locator('#imp').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({workouts:[{d:'2026-10-10',ex:{}}],bw:[]}))});assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);
   const backup={version:4,workouts:[{...workout('Cable Curl',30),id:9}],bw:base().bw,settings:base().set};const file={name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))};
   await page.locator('#imp').setInputFiles(file);await page.bringToFront();await page.locator('#confirm-import').waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),raw);
   await page.locator('#imp').setInputFiles(file);await page.locator('#confirm-import').click();await page.locator('#confirm-import').waitFor({state:'detached'});assert.equal((await saved()).workouts[0].ex[0].n,'Cable Curl');assert(await page.evaluate(()=>localStorage.getItem('liftlog-import-recovery')));
  });
  await check(name+': two real tabs block the stale writer',async()=>{
   await open();const second=await context.newPage();await second.goto(url);await second.locator('[data-a=start]').first().waitFor();await page.locator('[data-a=start][data-v=Empty]').click();await second.locator('#storage-conflict').waitFor();assert.equal(await second.locator('#storage-conflict').getAttribute('role'),'alert');await second.close();
  });
  await check(name+': narrow/light/dark/reduced-motion layouts and anatomy',async()=>{
   await open({...base(),workouts:[workout()]});await page.emulateMedia({reducedMotion:'reduce'});
   for(const width of [320,390,768])for(const dark of [0,1]){
    await page.setViewportSize({width,height:844});await clickTab('settings');await page.locator('[data-a=theme][data-v='+ (dark?'dark':'light')+']').click();
    for(const tab of ['today','history','ranks','settings']){await clickTab(tab);assert(await page.locator('#v').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'horizontal overflow '+tab+' '+width);}
   }
   await clickTab('ranks');assert.equal(await page.locator('.anatomy-svg').count(),2);assert.equal(await page.locator('.anatomy-svg [data-muscles=tibialis]').count(),1);assert.equal(await page.locator('.anatomy-svg [data-muscles=adductors]').count(),1);
   const parsed=await page.evaluate(()=>[...document.querySelectorAll('.anatomy-svg')].every(svg=>!new DOMParser().parseFromString(svg.outerHTML,'image/svg+xml').querySelector('parsererror')));assert(parsed);
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,name+'-ranks.png')});await clickTab('today');await page.screenshot({path:path.join(out,name+'-today.png')});
  });
  await check(name+': removals undo after reload and custom labels retain identity',async()=>{
   const custom={n:'My Cable Curl',t:'M',c:'Biceps',g:'Pull',rank:'Cable Curl'};await open({...base(),custom:[custom],cur:{...workout('My Cable Curl',25),id:88}},undefined,'[data-a=log]');
   await page.locator('[data-a=ds]').click();await page.locator('[data-action-confirm]').click();await page.locator('[data-a=undo]').waitFor();await page.evaluate(()=>saveTail);await page.reload();await page.locator('[data-a=undo]').click();assert.equal(await page.locator('.srow').count(),1);
   const old=(await saved()).cur.ex[0].exerciseId;await clickTab('settings');await page.locator('[data-a=manageCustom]').click();await page.locator('#custom-rename').fill('My Consistent Curl');await page.locator('#save-custom-name').click();await page.evaluate(()=>saveTail);const state=await saved();assert.equal(state.cur.ex[0].n,'My Consistent Curl');assert.equal(state.cur.ex[0].exerciseId,old);assert.equal(state.cur.ex[0].sets[0].kg,25);
   await page.locator('[data-a=manageCustom]').click();await page.locator('#custom-retire').click();await clickTab('today');await page.locator('[data-a=openx]').click();assert.equal(await page.locator('.exercise-option[data-v="My Consistent Curl"]').count(),0);await page.keyboard.press('Escape');assert.equal((await saved()).cur.ex[0].sets.length,1);
   await page.locator('[data-a=fin]').click();await page.locator('[data-a=start]').first().waitFor();await clickTab('history');await page.locator('[data-a=hd]').click();await page.locator('[data-action-confirm]').click();assert.equal(await page.locator('[data-a=he]').count(),0);await page.locator('[data-a=undo]').click();assert.equal(await page.locator('[data-a=he]').count(),1);
  });
  await check(name+': muscle detail identifies earned contributing lifts',async()=>{
   await open({...base(),workouts:[workout()]});await clickTab('ranks');await page.locator('[data-a=muscleInfo][data-v=chest]').click();assert((await page.locator('.action-card').textContent()).includes('Bench Press'));assert((await page.locator('.action-card').textContent()).includes('Relative weight'));await page.keyboard.press('Escape');
  });
  await check(name+': corrupt startup exports the untouched raw recovery copy',async()=>{
   await open('{broken',undefined,'#boot-export');assert.equal(await page.evaluate(()=>localStorage.getItem('liftlog-state')),'{broken');const download=page.waitForEvent('download');await page.locator('#boot-export').click();const file=await download;assert.equal(await fs.readFile(await file.path(),'utf8'),'{broken');
  });
  await check(name+': offline reopening and waiting-worker activation preserve a draft',async()=>{
   workerTag='old-test';const draft={...workout('Cable Curl',25),id:77,drafts:{'Cable Curl':{kg:30,reps:8,note:'Unsaved set draft',rpe:8}},restEndAt:Date.now()+120000};
   await open({...base(),cur:draft},undefined,'[data-a=log]');await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   assert(!(await page.locator('.toast').allTextContents()).some(t=>t.includes('Update available')),'first installation must not offer a spurious update');
   await context.setOffline(true);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-note').inputValue(),'Unsaved set draft');await context.setOffline(false);
   await page.evaluate(()=>caches.open('unrelated-cache'));workerTag='upgrade-test';await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting);
   await clickTab('settings');await page.locator('[data-a=update]').click();await page.locator('[data-a=log]').waitFor();assert.equal(await page.locator('#qol-note').inputValue(),'Unsaved set draft');assert.equal((await saved()).cur.id,77);assert((await page.evaluate(()=>caches.keys())).includes('unrelated-cache'));workerTag='';
  });
  if(name==='chromium')await check(name+': every canonical exercise logs through its real rendered form',async()=>{
   const entries=Object.values(JSON.parse(await fs.readFile('exercises.json','utf8')).catalogue).filter(c=>!c.canonicalName);await open();await page.locator('[data-a=start][data-v=Empty]').click();
   const started=Date.now();
   for(const [i,c] of entries.entries()){
    // Each record uses the same application action as a picker choice; form input and logging use real DOM events.
    await page.evaluate(n=>A.pickx({v:n}),c.name);
    if(await page.locator('#qol-weight').count())await page.locator('#qol-weight').fill('20');
    if(await page.locator('#qol-reps').count())await page.locator('#qol-reps').fill('8');
    if(await page.locator('#log-seconds').count())await page.locator('#log-seconds').fill('45');
    if(await page.locator('#log-meters').count())await page.locator('#log-meters').fill('25');
    if(await page.locator('#log-band').count())await page.locator('#log-band').fill('red band');
    await page.locator('[data-a=log]').click();assert.equal(await page.locator('.srow').count(),1,c.name);
    if((i+1)%100===0)console.log('Catalogue forms '+(i+1)+'/'+entries.length);
   }
   await page.evaluate(()=>saveTail);assert.equal((await saved()).cur.ex.length,447);await page.reload();await page.locator('[data-a=log]').waitFor();assert.equal((await saved()).cur.ex.flatMap(x=>x.sets).length,447);await page.locator('[data-a=fin]').click();await page.locator('[data-a=start]').first().waitFor();assert.equal(await page.evaluate(()=>Object.keys(S.rk).length),400);report.catalogueFormMs=Date.now()-started;
  });
  await check(name+': 100, 1000 and 10000 sessions preserve records with bounded history rendering',async()=>{
   report.historyPerformance??=[];
   for(const count of [100,1000,10000]){const state={...base(),workouts:Array.from({length:count},(_,i)=>({...workout(),id:i+1}))},start=Date.now();await open(state);await clickTab('history');assert.equal(await page.locator('[data-a=he]').count(),50);await page.locator('[data-a=moreHistory]').click();assert.equal(await page.locator('[data-a=he]').count(),100);assert.equal((await saved()).workouts.length,count);report.historyPerformance.push({name,count,startAndHistoryMs:Date.now()-start});}
  });
  await context.close();context=null;await browser.close();browser=null;
 }
 assert.deepEqual(report.errors,[],'uncaught browser errors');
}catch(error){report.failure=error.stack;console.error(error);if(page){report.diagnostics=await page.evaluate(()=>({hidden:document.hidden,focused:document.hasFocus(),active:document.activeElement?.outerHTML,dialogs:[...document.querySelectorAll('[role=dialog]')].map(el=>({label:el.getAttribute('aria-label'),rect:el.getBoundingClientRect().toJSON(),inert:el.inert,buttons:[...el.querySelectorAll('button')].map(b=>({text:b.textContent,disabled:b.disabled,rect:b.getBoundingClientRect().toJSON(),visible:b.checkVisibility?.(),inertAncestor:!!b.closest('[inert]'),animation:getComputedStyle(b).animation,transform:getComputedStyle(b).transform}))}))})).catch(e=>({error:e.message}));console.error('Browser diagnostics:',JSON.stringify(report.diagnostics));}if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});process.exitCode=1;}
finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));if(context)await context.close();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
