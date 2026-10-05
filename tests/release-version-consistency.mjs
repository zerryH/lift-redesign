import fs from 'node:fs';
import assert from 'node:assert/strict';

const build=fs.readFileSync('build.mjs','utf8');
const app=fs.readFileSync('app.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const local=fs.readFileSync('lift-local.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const version=build.match(/const BUILD_VERSION = '([^']+)'/)?.[1];
assert(version,'build version missing');
for(const [name,source] of [['app.js',app],['index.html',index],['lift-local.html',local]]) assert.equal(source.match(/const BUILD_VERSION='([^']+)'/)?.[1],version,`${name} has stale build version`);
assert.match(sw,new RegExp(`const V='liftlog-v${version}-[0-9a-f]{12}'`),'service worker has stale build version');
console.log(`release version consistency ok · v${version}`);
