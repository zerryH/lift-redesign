import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const ctx=vm.createContext({URL,Date,Promise});
vm.runInContext(fs.readFileSync('rest-notifications.js','utf8'),ctx);
const api=ctx.SlatRestNotifications;
let time=Date.now(),allowed=true,errors=0;
const cards=new Map(),calls=[];
const reg={scope:'https://example.test/lift/',active:{},async showNotification(title,options){calls.push({title,options});cards.set(options.tag,{title,...options,close(){cards.delete(options.tag);}});},async getNotifications({tag}){return cards.has(tag)?[cards.get(tag)]:[];}};
const manager=api.create({registration:async()=>reg,allowed:()=>allowed,now:()=>time,onError:()=>errors++});
const end=time+90000;
await manager.show(end);await manager.show(end);
assert.equal(calls.length,1,'ticks do not flood the notification tray');
assert.equal(calls[0].options.timestamp,end);
assert.match(calls[0].options.body,/Next set at/,'a fixed deadline remains meaningful when the page is suspended');
assert.equal(calls[0].options.silent,true);
assert.equal(calls[0].options.icon,'https://example.test/lift/apple-touch-icon-photo-fit.png');
await manager.show(end+30000);assert.equal(cards.size,1);assert.equal(cards.get(api.tag).data.endAt,end+30000);
await manager.close();assert.equal(cards.size,0);

// Stop wins against a permission/registration request still in flight.
let resolveReg;
const delayed=api.create({registration:()=>new Promise(resolve=>{resolveReg=resolve;}),allowed:()=>true,now:()=>time});
delayed.show(end);await Promise.resolve();const stop=delayed.close();resolveReg(reg);
await Promise.resolve();await Promise.resolve();
// close has its own registration request, after the cancelled show resolves.
await new Promise(resolve=>setImmediate(resolve));resolveReg(reg);await stop;
assert.equal(cards.size,0);
const latest=api.create({registration:async()=>reg,allowed:()=>true,now:()=>time});
latest.show(end);latest.show(end+30000);await latest.flush();
assert.equal(cards.size,1);assert.equal(cards.get(api.tag).data.endAt,end+30000);
time=end+31000;await latest.show(end+30000,true);
assert.equal(cards.get(api.tag).title,'Rest complete');assert.equal(cards.get(api.tag).silent,false);
await latest.show(end,true);assert.equal(cards.size,0,'no late finish alert after a long suspension');
allowed=false;await manager.show(time+90000);assert.equal(cards.size,0);
const broken=api.create({registration:async()=>reg,allowed:()=>true,now:()=>time,onError:()=>errors++});
const show=reg.showNotification;reg.showNotification=async()=>{throw new Error('OS unavailable');};
await broken.show(time+90000);assert.equal(errors,1);reg.showNotification=show;
await broken.close();await broken.show(time+120000);assert.equal(cards.size,1,'an explicit retry recovers');await broken.close();

// App integration: only the explicit preference gesture asks permission.
let requests=0;
const app=await boot({...base(),cur:{...workout(),ex:[{n:'Bench Press',sets:[]}]} });
app.ctx.URL=URL;app.ctx.location.protocol='https:';app.ctx.window.isSecureContext=true;
app.ctx.navigator.serviceWorker={getRegistration:async()=>reg,ready:Promise.resolve(reg)};
app.ctx.Notification={permission:'default',async requestPermission(){requests++;this.permission='granted';return this.permission;}};
app.h.qolRestStart();assert.equal(requests,0);assert.equal(cards.size,0);
await app.h.qolToggleRestNotifications();assert.equal(requests,1);assert.equal(app.h.S.set.restNotifications,true);
assert.equal(cards.get(api.tag).data.endAt,app.h.qolState.endAt);
const startedAt=app.h.S.cur.restStartedAt,deadline=app.h.qolState.endAt;
const target={classList:{contains:()=>false},closest:s=>s==='[data-qol]'?{dataset:{qol:'restPlus'}}:null};
for(const fn of app.listeners.click||[])fn({target});
await app.h.qolState.notifications.flush();
assert.equal(cards.get(api.tag).data.endAt,deadline+30000);assert.equal(app.h.S.cur.restStartedAt,startedAt);
await app.h.qolToggleRestNotifications();assert.equal(cards.size,0);assert.equal(requests,1);
app.ctx.Notification.permission='denied';app.ctx.Notification.requestPermission=async()=>{requests++;return 'denied';};
await app.h.qolToggleRestNotifications();assert.equal(app.h.S.set.restNotifications,false);assert.match(app.h.qolNotificationStatus(),/blocked/);
app.ctx.navigator.userAgent='iPhone';app.ctx.Notification.permission='default';const before=requests;
await app.h.qolToggleRestNotifications();assert.equal(requests,before);assert.match(app.h.qolNotificationStatus(),/Home Screen/);
app.h.qolStopRest();assert.equal(app.h.S.cur.restStartedAt,undefined);assert.equal(app.h.S.cur.restEndAt,undefined);
const done=app.h.SlatWorkout.complete({...workout(),restStartedAt:startedAt,restEndAt:deadline});
assert.equal(done.restStartedAt,undefined);assert.equal(done.restEndAt,undefined);assert.deepEqual(app.errors,[]);

// The worker focuses an existing app window; otherwise it opens only its own scope.
const listeners={},events=[];let focused=0,opened='';
const self={addEventListener(type,fn){listeners[type]=fn;},registration:{scope:reg.scope},clients:{async matchAll(){return [{url:'https://example.test/other/',focus(){throw new Error('wrong app');}},{url:reg.scope+'index.html',async focus(){focused++;},postMessage(m){events.push(m.type);}}];},async openWindow(url){opened=url;}}};
vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{self,URL});
let handled;
const notification={tag:api.tag,data:{type:'SLAT_REST',url:'https://untrusted.test/'},close(){}};
listeners.notificationclick({notification,waitUntil(p){handled=p;}});await handled;
assert.equal(focused,1);assert.equal(events[0],'SLAT_REST_OPEN');assert.equal(opened,'');
self.clients.matchAll=async()=>[];
listeners.notificationclick({notification,waitUntil(p){handled=p;}});await handled;assert.equal(opened,reg.scope);
console.log('Rest notification deadlines, replacement, permission, cancellation races, cleanup and worker return paths passed');
