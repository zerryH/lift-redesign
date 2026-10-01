const V='liftlog-v1790859642251',F=['./','index.html','lift-local.html','app.js','muscle3d.js','body.glb.gz','three.min.js','GLTFLoader.js','DRACOLoader.js','THREE-LICENSE.txt','draco/draco_decoder.js','draco/draco_wasm_wrapper.js','draco/draco_decoder.wasm','ANATOMY-ATTRIBUTION.md','manifest.webmanifest','lift-icon-v2.svg','lift-icon-180-v2.png','lift-icon-192-v2.png','lift-icon-512-v2.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request))));
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
