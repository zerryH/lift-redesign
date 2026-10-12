import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {MessageChannel} from 'node:worker_threads';

const app=fs.readFileSync('app.js','utf8');
const version=app.match(/const BUILD_VERSION='([^']+)'/)[1];
const code=app.slice(app.indexOf("const SW_SCRIPT='sw.js'"),app.indexOf('const A={',app.indexOf("const SW_SCRIPT='sw.js'")));
const scriptURL='https://example.test/lift/sw.js';
function harness({remote=version,activeVersion=null,installing=null,waiting=null,updateError=false,offline=false,saveTail=Promise.resolve()}={}){
 const notices=[],timers=new Map();let reloads=0,updates=0,sequence=0;
 const serviceWorker=new EventTarget();
 const active={scriptURL,postMessage(data,ports){if(data.type==='GET_BUILD'&&activeVersion)ports[0].postMessage({version:activeVersion})}};
 const reg=Object.assign(new EventTarget(),{active,installing,waiting,update:async()=>{updates++;if(updateError)throw new Error('install failed')}});
 serviceWorker.controller=active;serviceWorker.getRegistration=async()=>reg;
 const context=vm.createContext({URL,MessageChannel,AbortController,Promise,WeakSet,console:{warn(){}},BUILD_VERSION:'5.7.10',persistenceStatus:'saved',storageConflict:false,saveTail,navigator:{serviceWorker,onLine:!offline},location:{href:'https://example.test/lift/',protocol:'https:',reload(){reloads++}},fetch:async()=>({ok:true,json:async()=>({version:remote})}),toast:(...args)=>notices.push(args),setTimeout:(fn,ms)=>{const id=++sequence;timers.set(id,{fn,ms});return id},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(code,context);
 return {context,reg,serviceWorker,notices,timers,run:(text)=>vm.runInContext(text,context),get reloads(){return reloads},get updates(){return updates},expire(ms){for(const [id,t] of [...timers])if(t.ms===ms){timers.delete(id);t.fn()}}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function worker(state){return Object.assign(new EventTarget(),{state,scriptURL,postMessage(){}})}

// A newer active worker with no waiting/installing worker reloads the stale page.
let h=harness({activeVersion:version});
await h.run('updateApp({disabled:false})');assert.equal(h.reloads,1);assert.equal(h.notices.length,0);

// Reload must wait for pending workout persistence.
let finishSave;h=harness({activeVersion:version,saveTail:new Promise(resolve=>finishSave=resolve)});
const saving=h.run('updateApp({disabled:false})');await flush();await flush();assert.equal(h.reloads,0);finishSave();await saving;assert.equal(h.reloads,1);

// A failed save must keep the in-memory workout screen open.
h=harness({activeVersion:version,saveTail:Promise.resolve(false)});await h.run('updateApp({disabled:false})');assert.equal(h.reloads,0);assert.match(h.notices.at(-1)[0],/changes could not be saved/);

// New published metadata with an old active worker is a failed update, never a fake download.
h=harness({activeVersion:'5.7.10'});await h.run('updateApp({disabled:false})');assert.equal(h.reloads,0);assert.match(h.notices.at(-1)[0],/could not be installed/);assert(!h.notices.some(x=>x[0].includes('still downloading')));

// Older workers without GET_BUILD support time out safely rather than hang forever.
h=harness();const legacy=h.run('updateApp({disabled:false})');await flush();h.expire(1500);await legacy;assert.equal(h.reloads,0);assert.match(h.notices.at(-1)[0],/retry/);
h=harness({offline:true});await h.run('updateApp({disabled:false})');assert.equal(h.updates,0);assert.match(h.notices.at(-1)[0],/Offline/);
h=harness({remote:'5.7.10'});await h.run('updateApp({disabled:false})');assert.match(h.notices.at(-1)[0],/Already up to date/);
h=harness({updateError:true});await h.run('updateApp({disabled:false})');assert.match(h.notices.at(-1)[0],/could not be completed/);

// Installation state races, failure and timeout all release listeners.
for(const state of ['installed','activated']){
 const w=worker(state);h=harness({installing:w});assert.equal(await (h.context.reg=h.reg,h.run('waitForSWInstall(reg)')),w);
}
let w=worker('installing');h=harness({installing:w});h.context.reg=h.reg;let pending=h.run('waitForSWInstall(reg)');w.state='redundant';w.dispatchEvent(new Event('statechange'));assert.equal(await pending,null);assert.equal(h.timers.size,0);
w=worker('installing');h=harness({installing:w});h.context.reg=h.reg;pending=h.run('waitForSWInstall(reg)');h.expire(30000);assert.equal(await pending,null);

// Successive updates are watched, including after an earlier failure.
h=harness();h.context.reg=h.reg;h.run('watchSW(reg)');for(let i=0;i<2;i++){w=worker('installing');h.reg.installing=w;h.reg.dispatchEvent(new Event('updatefound'));w.state='installed';w.dispatchEvent(new Event('statechange'))}assert.equal(h.notices.length,2);

// A waiting worker activates once, and synchronous controllerchange leaves no orphan timeout.
w=worker('installed');h=harness({waiting:w});w.postMessage=()=>{w.state='activated';h.serviceWorker.controller=w;h.serviceWorker.dispatchEvent(new Event('controllerchange'))};await h.run('updateApp({disabled:false})');assert.equal(h.reloads,1);assert.equal(h.updates,0);assert.equal(h.timers.size,0);
console.log('update recovery behavior passed · stale page, failed/legacy workers, races, offline, saved drafts');

// Execute the real worker with Cache API mocks: fresh requests, shell validation and isolation.
const sw=fs.readFileSync('sw.js','utf8'),cacheName=sw.match(/const V='([^']+)'/)[1];
function workerHarness({fail=false,stale=false}={}){
 const events={},deleted=[],requests=[],oldCache='liftlog-v5.7.10-old';let claim=0,timer;
 const shell={text:async()=>"const BUILD_VERSION='"+(stale?'5.7.10':version)+"';"};
 const cache={addAll:async list=>{requests.push(...list);if(fail)throw new Error('404')},match:async input=>String(input?.url||input).endsWith('index.html')?shell:null};
 const self={registration:{scope:'https://example.test/lift/'},location:{origin:'https://example.test'},clients:{claim:async()=>claim++},addEventListener:(name,fn)=>events[name]=fn,skipWaiting(){}};
 const context=vm.createContext({self,URL,Request,AbortController,Response,Promise,setTimeout:fn=>{timer=fn;return 1},clearTimeout:()=>timer=null,fetch:async()=>{throw new Error('offline')},caches:{open:async name=>{assert.equal(name,cacheName);return cache},delete:async name=>deleted.push(name),keys:async()=>[oldCache,cacheName,'unrelated-cache']}});
 vm.runInContext(sw,context);
 return {events,deleted,requests,cacheName,oldCache,get claim(){return claim},get timer(){return timer}};
}
let wh=workerHarness();let task;wh.events.install({waitUntil:p=>task=p});await task;assert(wh.requests.length>0);assert(wh.requests.every(r=>r.cache==='no-store'&&r.signal));assert.equal(wh.timer,null);assert.deepEqual(wh.deleted,[]);
let reply;wh.events.message({data:{type:'GET_BUILD'},ports:[{postMessage:data=>reply=data}]});assert.equal(reply.version,version);assert.equal(reply.cache,cacheName);
for(const options of [{fail:true},{stale:true}]){wh=workerHarness(options);wh.events.install({waitUntil:p=>task=p});await assert.rejects(task);assert.deepEqual(wh.deleted,[cacheName]);assert(!wh.deleted.includes(wh.oldCache));assert.equal(wh.timer,null)}
wh=workerHarness();wh.events.activate({waitUntil:p=>task=p});await task;assert.deepEqual(wh.deleted,[wh.oldCache]);assert.equal(wh.claim,1);
wh=workerHarness();wh.events.fetch({request:{method:'GET',url:'https://example.test/lift/index.html',mode:'navigate',cache:'default'},respondWith:p=>task=p});assert(await task,'offline navigation serves the active shell');
console.log('worker recovery behavior passed · fresh bounded staging, rejected stale shell, cache isolation and offline navigation');
