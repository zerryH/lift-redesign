import fs from 'node:fs';
import assert from 'node:assert/strict';

const sw=fs.readFileSync('sw.js','utf8');
const install=sw.match(/self\.addEventListener\(['"]install['"][\s\S]*?\nself\.addEventListener\(['"]activate['"]/);
assert(install,'service-worker install handler is missing');
assert.match(install[0],/self\.skipWaiting\(\)/,'service-worker install must call skipWaiting so stale clients do not keep the old worker active');

console.log('force-update ok · service worker install calls skipWaiting');
