import assert from 'node:assert/strict';
import {installFixture,seedFixture} from '../tools/browser-fixture.mjs';
import {boot,base,workout} from './support/runtime.mjs';

const calls=[],page={addInitScript(fn,state){calls.push({fn,state});return Promise.resolve('installed');}},initial={...base(),cur:workout('Cable Curl',25)};
assert.equal(await installFixture(page,null),undefined);assert.deepEqual(calls,[],'unseeded startup must not register any fixture script for this page or future reloads');
assert.equal(await installFixture(page,initial),'installed');assert.equal(calls.length,1);assert.equal(calls[0].fn,seedFixture);assert.equal(calls[0].state,initial,'ordinary HTTP fixtures retain their existing guard');

const run=await boot(undefined,{store:new Map()});assert.equal(run.ctx.location.protocol,'file:');
await run.h.importBackup({...initial,version:4,settings:initial.set});await run.h.flush();
assert.equal(run.store.has('slat-test-seeded'),false);assert.equal(run.h.S.cur.ex[0].sets.length,1);
run.h.dr.note='Imported file draft';run.h.persistDraft();await run.h.flush();
const before=JSON.parse(run.store.get('liftlog-state')),reload=await boot(undefined,{store:run.store});
assert.equal(reload.h.dr.note,'Imported file draft');assert.equal(reload.h.S.cur.ex[0].entryId,before.cur.ex[0].entryId);
assert.equal(reload.h.A.log(),true);await reload.h.flush();
const logged=JSON.parse(run.store.get('liftlog-state'));assert.equal(logged.cur.ex[0].sets.length,2);assert.equal(logged.cur.ex[0].sets[1].note,'Imported file draft');
const after=await boot(undefined,{store:run.store});assert.deepEqual(JSON.parse(JSON.stringify(after.h.S.cur.ex[0].sets)),logged.cur.ex[0].sets);assert.equal(after.store.has('slat-test-seeded'),false);
assert.deepEqual([...run.errors,...reload.errors,...after.errors],[]);
console.log('Unseeded browser pages install no fixture hook; file fixtures import, save and reload exact draft/set identities without test metadata');
