const V='liftlog-v5.7.12-267da6e297bd',F=['./','index.html','lift-local.html','app.js','exercises.json','ranks-config.json','ranking-engine.js','data-integrity.js','catalogue-model.js','performance-contract.js','persistence.js','workout-model.js','dialog-view.js','enhanced-features.js','rest-notifications.js','native-rest.js','anatomy-map.css','manifest.webmanifest','lift-icon-photo-fit.png','apple-touch-icon-photo-fit.png'];const CACHE_PREFIX='liftlog-';
const stageBuild=async()=>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
 try{
  const c=await caches.open(V);
  await c.addAll(F.map(file=>new Request(new URL(file,self.registration.scope),{cache:'no-store',signal:controller.signal})));
  const shell=await c.match(new URL('index.html',self.registration.scope).href);
  const version=V.match(/^liftlog-v(\d+\.\d+\.\d+)-/)?.[1];
  if(version&&(!shell||!(await shell.text()).includes("const BUILD_VERSION='"+version+"';")))throw new Error('Downloaded app build does not match worker');
 }catch(error){await caches.delete(V);throw error}finally{clearTimeout(timer)}
};
self.addEventListener('install',e=>e.waitUntil(stageBuild()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
 const run=async()=>{
  const cache=await caches.open(V);
  // Explicit refreshes and version checks must reach the network; ordinary launches stay offline-capable.
  if(r.cache!=='no-store'&&r.cache!=='reload'){const cached=await cache.match(r,{ignoreSearch:true});if(cached)return cached}
  try{return await fetch(r)}catch{return r.mode==='navigate'?(await cache.match(new URL('./index.html',self.registration.scope).href))||Response.error():Response.error()}
 };e.respondWith(run());
});
self.addEventListener('message',e=>{
 if(e.data==='skip'||e.data?.type==='SKIP_WAITING')self.skipWaiting();
 if(e.data?.type==='GET_BUILD')e.ports?.[0]?.postMessage({version:V.match(/^liftlog-v(\d+\.\d+\.\d+)-/)?.[1],cache:V});
});

// Notification clicks always return to this app's scope, never a notification-supplied URL.
self.addEventListener('notificationclick',event=>{
 if(event.notification.tag!=='slat-rest-timer'||event.notification.data?.type!=='SLAT_REST')return;
 event.notification.close();
 event.waitUntil((async()=>{
  const scope=self.registration.scope;
  const pages=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const client=pages.find(c=>c.url.startsWith(scope));
  if(client){await client.focus();client.postMessage({type:'SLAT_REST_OPEN'});}
  else await self.clients.openWindow(scope);
 })());
});
