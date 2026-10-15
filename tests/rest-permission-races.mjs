import assert from 'node:assert/strict';
import vm from 'node:vm';
import {boot,base,workout} from './support/runtime.mjs';

async function pendingPermission(){
 const z=await boot({...base(),cur:workout()}),cards=[];let resolvePermission,rejectPermission,requests=0;
 z.ctx.URL=URL;z.ctx.location.protocol='https:';z.ctx.window.isSecureContext=true;
 const reg={scope:'https://example.test/slat/',active:{},async showNotification(title,options){cards.push({title,options});},async getNotifications(){return [];}};
 z.ctx.navigator.serviceWorker={getRegistration:async()=>reg,ready:Promise.resolve(reg)};
 z.ctx.Notification={permission:'default',requestPermission(){requests++;return new Promise((resolve,reject)=>{resolvePermission=permission=>{this.permission=permission;resolve(permission);};rejectPermission=reject;});}};
 z.h.qolRestStart(90);await z.h.flush();
 const pending=z.h.qolToggleRestNotifications();assert.equal(requests,1);
 return {z,cards,pending,resolve:permission=>resolvePermission(permission),reject:()=>rejectPermission(new Error('Permission unavailable')),requests:()=>requests};
}

for(const guard of ['storageConflict','importing','finishing']){
 const {z,cards,pending,resolve,requests}=await pendingPermission();
 vm.runInContext(guard+'=true',z.ctx);
 const before=JSON.stringify(z.h.S),stored=JSON.stringify([...z.store]);
 resolve('granted');await pending;await z.h.flush();
 assert.equal(JSON.stringify(z.h.S),before,guard+': a late permission result cannot change a paused state');
 assert.equal(JSON.stringify([...z.store]),stored,guard+': no late preference write');
 assert.equal(cards.length,0,guard+': no reminder is published from the stale gesture');
 assert.equal(z.h.qolState.notificationBusy,false);
 vm.runInContext(guard+'=false',z.ctx);await z.h.qolToggleRestNotifications();await z.h.flush();
 assert.equal(z.h.S.set.restNotifications,true,'a fresh gesture can use the device permission');
 assert.equal(requests(),1,'already-granted permission is not requested twice');
 assert.equal(cards.length,1);assert.equal(cards[0].options.data.endAt,z.h.qolState.endAt);assert.match(cards[0].options.body,/Static reminder/);
 assert.deepEqual(z.errors,[]);
}

// Import completes before permission does, so no guard remains set: identity must also be checked.
const replacement=await pendingPermission(),z=replacement.z;
await z.h.importBackup({version:4,workouts:[workout('Push-Up',0,17)],bw:[],settings:{...base().set,restNotifications:false},cur:null});
const afterImport=JSON.stringify(z.h.S),stored=JSON.stringify([...z.store]);
replacement.resolve('granted');await replacement.pending;await z.h.flush();
assert.equal(JSON.stringify(z.h.S),afterImport,'an old gesture cannot enable reminders in a replacement backup');
assert.equal(JSON.stringify([...z.store]),stored);assert.equal(replacement.cards.length,0);assert.equal(z.h.S.workouts[0].ex[0].sets[0].reps,17);
assert.equal(z.h.qolState.notificationBusy,false);assert.deepEqual(z.errors,[]);

// Denied/rejected stale requests must not attach their result to the replacement profile either.
for(const outcome of ['denied','error']){
 const rejected=await pendingPermission();await rejected.z.h.importBackup({version:4,workouts:[],bw:[],settings:{...base().set,restNotifications:false}});
 if(outcome==='error')rejected.reject();else rejected.resolve(outcome);
 await rejected.pending;assert.equal(rejected.z.h.qolState.notificationError,false);assert.equal(rejected.z.h.S.set.restNotifications,false);
 assert.deepEqual(rejected.z.errors,[]);
}
console.log('Late notification permission cannot change paused or replaced state; fresh gestures retain static reminders without duplicate permission prompts');
