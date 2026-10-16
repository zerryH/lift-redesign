import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lifecycle=fs.readFileSync(new URL('../dialog-view.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const show='function showStorageConflict(){'+app.split('function showStorageConflict(){')[1].split('\n}\n')[0]+'\n}';
for(const kind of ['action-card','sb','rank-list-card','none']){
 let active,reloads=0,reports=0;const events={},downloads=[],children=[];
 class Node{
  constructor(id='',className=''){this.id=id;this.className=className;this.tagName='SECTION';this.inert=false;this.isConnected=true;this.attrs={};this.listeners={};this.buttons=[];}
  contains(el){return el===this||this.buttons.includes(el)||this.dialog===el||!!this.dialog?.contains(el);}
  querySelectorAll(){return this.buttons;}
  querySelector(s){return s.includes('button')?this.buttons[0]:null;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k]??null;}
  getClientRects(){return [{}];}
  focus(){active=this;}
  addEventListener(t,fn){(this.listeners[t]??=[]).push(fn);}
  append(el){this.buttons.push(el);}
 }
 const nav=new Node('n'),main=new Node('v'),retained=new Node('retained');retained.inert=true;
 const launch=new Node('launch');active=launch;children.push(nav,main,retained);
 const modal=new Node('old-dialog',kind),wrapper=new Node('wrapper'),oldClose=new Node('old-close');modal.buttons=[oldClose];wrapper.dialog=modal;
 if(kind!=='none')children.push(wrapper);
 let panel;const exportButton=new Node('conflict-export'),reloadButton=new Node('conflict-reload');
 const document={body:{children,append(el){panel=el;el.buttons=[exportButton,reloadButton];children.push(el);},classList:{toggle(){}}},
  querySelectorAll(selector){const list=kind==='none'?[]:[modal];if(panel&&selector.includes('#storage-conflict'))list.push(panel);return list;},
  querySelector(selector){return {'#storage-conflict':panel,'#conflict-export':panel&&exportButton,'#conflict-reload':panel&&reloadButton}[selector]||null;},
  getElementById:id=>children.find(el=>el.id===id),createElement:()=>new Node(),get activeElement(){return active;},
  addEventListener(t,fn){(events[t]??=[]).push(fn);}};
 const state={cur:{name:'Unsaved local draft'},workouts:[{id:7}],set:{unit:'kg'}},before=JSON.stringify(state);
 const ctx=vm.createContext({document,window:{},queueMicrotask,S:state,JSON,downloadRecovery:(raw,name)=>downloads.push({raw,name}),openDiagnosticsReport(){reports++;},location:{reload(){reloads++;}}});
 vm.runInContext(lifecycle+'\n'+show+'\nmanageDialogs();showStorageConflict();manageDialogs();',ctx);
 assert.equal(panel.inert,false,kind+': recovery controls must not become inert behind the previous dialog');
 assert.equal(panel.getAttribute('role'),'alertdialog');assert.equal(panel.getAttribute('aria-modal'),'true');
 assert.equal(panel.getAttribute('aria-labelledby'),'storage-conflict-title');assert.equal(panel.getAttribute('aria-describedby'),'storage-conflict-help');
 assert.equal(active,exportButton,'recovery receives focus immediately');assert.equal(main.inert,true);assert.equal(nav.inert,true);
 if(kind!=='none'){assert.equal(wrapper.inert,true);assert.equal(modal.getAttribute('aria-modal'),'false');}
 vm.runInContext('showStorageConflict();manageDialogs();',ctx);assert.equal(children.filter(el=>el.id==='storage-conflict').length,1,'repeated conflict signals retain a single panel');
 const key=(key,shiftKey=false)=>{let prevented=false;for(const fn of events.keydown||[])fn({key,shiftKey,preventDefault(){prevented=true;}});return prevented;};
 const reportButton=panel.buttons.at(-1);assert.equal(reportButton.id,'conflict-diagnostics');active=reportButton;assert(key('Tab'));assert.equal(active,exportButton);assert(key('Tab',true));assert.equal(active,reportButton);
 key('Escape');assert.equal(panel.isConnected,true);assert.equal(active,reportButton,'Escape cannot dismiss the protective recovery UI');
 for(const fn of reportButton.listeners.click)fn();assert.equal(reports,1,'diagnostics can be reached without releasing the paused writer');
 for(const fn of exportButton.listeners.click)fn();assert.equal(downloads.length,1);assert.equal(downloads[0].name,'slat-conflict-recovery.json');
 const exported=JSON.parse(downloads[0].raw);assert.deepEqual(exported.cur,state.cur);assert.deepEqual(exported.workouts,state.workouts);assert.deepEqual(exported.settings,state.set);assert.equal(exported.version,4);
 for(const fn of reloadButton.listeners.click)fn();assert.equal(reloads,1);assert.equal(JSON.stringify(state),before,'recovery does not mutate either saved data or the in-memory copy');
}
console.log('Storage conflicts take dialog priority, retain accessible export/reload controls and preserve the local recovery copy');
