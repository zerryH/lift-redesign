const V='liftlog-v5.5.26-8ef4db4f784a',F=['./','index.html','lift-local.html','app.js','exercises.json','ranks-config.json','anatomy-map.css','manifest.webmanifest','lift-icon-ios-v3.png','apple-touch-icon-v3.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim()));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||ftetch(e.request))));
self.addEventListener('message',e=>{if(e.data==='skip') self.skipWaiting()});
