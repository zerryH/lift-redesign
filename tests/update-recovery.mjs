import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('app.js','utf8'),start=source.indexOf("const SW_SCRIPT='sw.js'"),block=source.slice(start,source.indexOf('const A={',start));
async function update({ready='5.7.12',offline=false,saveFails=false,timeout=false}={}){
 const messages=[],requests=[];let reloads=0,saves=0;
 const reg={active:{scriptURL:'https://example.com/lift/sw.js'},async update(){},addEventListener(){}};
 const ctx={BUILD_VERSION:'5.7.11',location:{protocol:'https:',href:'https://example.com/lift/',reload(){reloads++;}},navigator:{onLine:!offline,serviceWorker:{controller:{},async getRegistration(){return reg;}}},URL,Date,WeakSet,Promise,AbortController,setTimeout:(fn)=>setTimeout(fn,10),clearTimeout,toast:m=>messages.push(m),console:{warn(){}},save:async()=>{saves++;return !saveFails;},fetch:async(url,options)=>{requests.push({url,options});return {ok:true,text:async()=>timeout?new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('Aborted')))):url.includes('version.json')?JSON.stringify({version:'5.7.12'}):"const BUILD_VERSION='"+ready+"';"};}};
 vm.createContext(ctx);vm.runInContext(block+';globalThis.run=updateApp;globalThis.activate=activateSW;',ctx);
 const button={disabled:false,textContent:''};await ctx.run(button);
 assert.equal(button.disabled,false);assert.equal(button.textContent,'Check for updates');
 return {messages,requests,reloads,saves,ctx};
}
const ready=await update();assert.equal(ready.reloads,1,'a ready worker with an older open page must reload');assert.equal(ready.saves,1);assert(!ready.messages.some(m=>m.includes('still downloading')));
assert(ready.requests.every(r=>r.options.cache==='no-store'&&r.options.signal));
const stale=await update({ready:'5.7.11'});assert.equal(stale.reloads,0);assert(stale.messages.some(m=>m.includes('could not finish installing')),'absent installer must not be described as downloading');
const blocked=await update({saveFails:true});assert.equal(blocked.reloads,0);assert(blocked.messages.some(m=>m.includes('changes could not be saved')));
const offline=await update({offline:true});assert.equal(offline.requests.length,0);assert.equal(offline.reloads,0);
const timeout=await update({timeout:true});assert.equal(timeout.reloads,0);assert(timeout.messages.some(m=>m.includes('Could not check')),'hung response bodies must leave the button retryable');
const activated=await update({ready:'5.7.11'});assert.equal(await activated.ctx.activate({state:'activated'}),true,'activation race must reload an already active worker');

const worker=fs.readFileSync('sw.js','utf8');
async function install(stale){
 const handlers={},deleted=[],requests=[];const scope='https://example.com/lift/';let pending;
 const ctx={URL,Error,Request:class{constructor(url,options){this.url=new URL(url,scope).href;this.cache=options.cache;}},self:{location:{origin:'https://example.com'},registration:{scope},addEventListener:(type,fn)=>handlers[type]=fn},caches:{has:async()=>false,open:async()=>({addAll:async r=>requests.push(...r),match:async()=>({text:async()=>"const BUILD_VERSION='"+(stale?'0.0.1':JSON.parse(fs.readFileSync('version.json','utf8')).version)+"';"})}),delete:async name=>deleted.push(name)}};
 ctx.AbortController=AbortController;ctx.setTimeout=setTimeout;ctx.clearTimeout=clearTimeout;vm.createContext(ctx);vm.runInContext(worker,ctx);handlers.install({waitUntil:p=>pending=p});
 if(stale){await assert.rejects(pending,/Published app files are not ready/);assert.equal(deleted.length,1);assert(deleted[0].startsWith('liftlog-v'));}
 else{await pending;assert.equal(deleted.length,0);}
 assert(requests.length>10);assert(requests.every(r=>r.cache==='reload'),'all staged assets bypass stale HTTP cache');
}
await install(false);await install(true);
console.log('Ready-worker reload, absent-installer failure, save protection, bounded requests and fresh version-checked staging passed');
