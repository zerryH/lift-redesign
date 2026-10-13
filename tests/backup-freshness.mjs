import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const exported=[];
const lastBackup=Date.now()-15*864e5;
const z=await boot({...base(),revision:8,lastBackup,lastBackupRevision:8,workouts:[{...workout(),id:lastBackup-1000}]},{navigator:{canShare:()=>true,share:async payload=>exported.push(payload.files[0])}});
z.h.S.lastBackupRevision=z.h.S.revision;
assert.equal(z.h.backupChanged(),false);
assert.match(z.h.backupStatus(),/no changes since export/);
assert.equal(z.h.rem(),'');

z.h.S.workouts[0].ex[0].sets[0].kg=102.5;
assert.equal(await z.h.save(),true);
assert.equal(z.h.backupChanged(),true,'editing an older workout makes the backup stale');
assert.match(z.h.backupStatus(),/changes since backup/);
assert.match(z.h.rem(),/Time for a backup/,'an old stale backup is reminded even when no workout ID changed');

await z.h.A.exp();
assert.equal(exported.length,1);
assert.match(exported[0].name,/^slat-backup-\d{4}-\d{2}-\d{2}\.json$/);
assert.equal(z.h.S.lastBackupRevision,z.h.S.revision,'successful export records the exact durable content revision');
assert.equal(z.h.backupChanged(),false);
assert.match(z.h.backupStatus(),/no changes since export/);

const legacy=await boot({...base(),revision:5,lastBackup,workouts:[{...workout(),id:lastBackup-1000}]});
assert.match(legacy.h.backupStatus(),/freshness unknown/,'legacy timestamps are not falsely claimed current');
assert.equal(legacy.h.rem(),'','legacy reminder behavior remains compatible when no newer workout exists');

const future=await boot({...base(),revision:5,lastBackup,lastBackupRevision:99,workouts:[{...workout(),id:lastBackup-1000}]});
assert.match(future.h.backupStatus(),/freshness unknown/,'impossible future markers are discarded');

console.log('Edited-workout backup freshness, durable export markers and legacy status passed');
