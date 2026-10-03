const V='liftlog-v5.5.27-5b8d1c1c4177',F=['./','index.html','lift-local.html','app.js','exercises.json','ranks-config.json','anatomy-map.css','manifest.webmanifest','lift-icon-photo.png','apple-touch-icon-photo.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request))));
self.addEventListener('message',e=>{if(e.data==='skip') self.skipWaiting()});
