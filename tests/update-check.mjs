import fs from 'node:fs';
import assert from 'node:assert/strict';
const s=fs.readFileSync('app.js','utf8');
assert.match(s,/const BUILD_VERSION='[^']+';/);
assert(s.includes("const SW_SCRIPT='sw.js'"));
assert(s.includes("navigator.serviceWorker.getRegistration(SW_SCOPE)"));
assert(s.includes("navigator.serviceWorker.register(SW_SCRIPT,{scope:SW_SCOPE,updateViaCache:'none'})"));
assert(s.includes("navigator.onLine===false"));
assert(s.includes("Offline — update check skipped; your current app is still available"));
assert(s.includes("w.postMessage({type:'SKIP_WAITING'})"));
assert(s.includes("Update available — tap to reload"));
assert(s.includes("if(f){t.onclick=()=>{try{f()}finally{t.remove()}") || s.includes("if(f){t.onclick=()=>{try{f()}finally{t.remove()}}"));
assert(!s.includes("reg.unregister()"));
assert(!s.includes("sw.js?force="));
assert(!s.includes("sw.js?v='+BUILD_VERSION"));
assert(!s.includes("setTimeout(()=>location.reload(),250"));
console.log('update privacy/offline/staged-activation regression test passed');

assert(!s.includes('const found=await new Promise(resolve=>'));
assert(s.includes('await reg.update();if(reg.waiting)promptSWUpdate(reg.waiting);'));
assert(s.includes("reg.addEventListener('updatefound',()=>watchInstalling(),{once:true})"));
console.log('fast event-driven update check regression passed');

const a=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'); assert.ok(a.includes("cache:'no-store'")); assert.ok(a.includes("SW_SCRIPT+'?check='+stamp")); console.log('cache-busted SW check regression passed');
