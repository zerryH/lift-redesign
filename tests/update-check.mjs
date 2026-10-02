import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync('app.js', 'utf8');
const start = app.indexOf('const updateApp=');
assert(start >= 0, 'updateApp handler is missing');
const end = app.indexOf('\nconst A=', start);
assert(end > start, 'updateApp handler boundary is missing');
const updateApp = app.slice(start, end);

assert.match(updateApp, /const checkUrl='sw\.js\?check='\+Date\.now\(\)/,
  'Check for updates must build a cache-busting service-worker URL');
assert.match(updateApp, /serviceWorker\.register\(checkUrl,/,
  'Check for updates must register the cache-busted service-worker URL');
assert.match(updateApp, /updateViaCache:\s*['"]none['"]/, 
  'Update check must bypass HTTP cache for the service-worker script');
assert.match(updateApp, /registration|reg\./,
  'Update check must operate on the resulting service-worker registration');

console.log('update-check ok · cache-busted service-worker check path is present');
