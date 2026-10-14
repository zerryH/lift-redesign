import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Use the real lifecycle and close function, without another document click or observer.
let attached=true,active;const events={};
const focusable={isConnected:true,focus(){active=this;}};
const close={isConnected:true,focus(){active=this;}};
const nav={id:'n',tagName:'NAV',inert:false,contains:()=>false};
const main={id:'v',tagName:'MAIN',inert:false,contains:()=>false};
const retained={tagName:'SECTION',inert:true,contains:()=>false};
const dialog={hidden:false,tagName:'DIV',get isConnected(){return attached},querySelectorAll:()=>[close],contains:e=>e===close,setAttribute(){},getAttribute:()=> 'Test dialog',getClientRects:()=>[{}]};
const wrapper={tagName:'DIV',inert:false,contains:e=>e===dialog,remove(){attached=false;}};
const body={children:[nav,main,retained,wrapper],classList:{toggle(){}}};
active=focusable;
const document={body,querySelectorAll:()=>attached?[dialog]:[],getElementById:id=>id==='n'?nav:main,querySelector:()=>focusable,get activeElement(){return active},addEventListener(t,fn){(events[t]??=[]).push(fn)}};
const ctx=vm.createContext({document,window:{removeEventListener(){}},queueMicrotask,importing:false,qolState:{modal:wrapper},qolResizeModal(){},qolModalViewport(){}});
const lifecycle=fs.readFileSync(new URL('../dialog-view.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const closeSource=app.split('\n').find(l=>l.startsWith('const qolCloseModal='));
vm.runInContext(lifecycle+'\n'+closeSource+'\nmanageDialogs();',ctx);
assert.equal(nav.inert,true);assert.equal(main.inert,true);assert.equal(active,close);
vm.runInContext('qolCloseModal();',ctx);
assert.equal(attached,false);assert.equal(nav.inert,false,'navigation ready without an extra click');assert.equal(main.inert,false,'view ready without an extra click');
assert.equal(retained.inert,true,'unrelated preexisting inert state is retained');assert.equal(active,focusable,'return focus restored synchronously');

attached=true;ctx.qolState.modal=wrapper;ctx.importing=true;vm.runInContext('manageDialogs();qolCloseModal();',ctx);
assert.equal(attached,true);assert.equal(nav.inert,true,'pending import retains the protective modal');
ctx.importing=false;vm.runInContext('qolCloseModal();',ctx);assert.equal(nav.inert,false);assert.equal(main.inert,false);
console.log('Closing feature dialogs restores navigation, view readiness and focus synchronously while preserving import protection');
