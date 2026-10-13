import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';

const normal={workouts:[workout()],bw:[]};
const z=await boot({...base(),workouts:[workout('Cable Curl',25,8)]});
const limits=z.h.SlatData.IMPORT_TEXT_BUDGETS;
const withSet=(field,value)=>{const data=structuredClone(normal);data.workouts[0].ex[0].sets[0][field]=value;return data;};

z.h.SlatData.validateBackup(withSet('note','n'.repeat(limits.note)),{}, {importText:true});
z.h.SlatData.validateBackup(withSet('band','b'.repeat(limits.band)),{}, {importText:true});
assert.throws(()=>z.h.SlatData.validateBackup(withSet('note','n'.repeat(limits.note+1)),{}, {importText:true}),/restore text budget/);
assert.throws(()=>z.h.SlatData.validateBackup(withSet('band','b'.repeat(limits.band+1)),{}, {importText:true}),/restore text budget/);
assert.throws(()=>z.h.SlatData.validateBackup(withSet('note','unsafe\u0000text'),{}, {importText:true}),/restore text budget/);
for(const field of ['note','band'])for(const formatting of ['\n','\r\n','\t']){
 const text='Older'+formatting+'text',data=withSet(field,text);
 await z.h.importBackup(data);
 assert.equal(z.h.S.workouts[0].ex[0].sets[0][field],text,'ordinary whitespace survives restore');
}
assert.throws(()=>z.h.SlatData.validateBackup(withSet('note',{})),/sets\[0\]\.note/);

const before=z.store.get('liftlog-state');
await assert.rejects(()=>z.h.importBackup(withSet('note','n'.repeat(limits.note+1))),/restore text budget/);
assert.equal(z.store.get('liftlog-state'),before,'an excessive import cannot replace durable state');
const draft=workout();draft.drafts={draft:{note:'n'.repeat(limits.note+1),band:''}};
await assert.rejects(()=>z.h.importBackup({workouts:[],bw:[],cur:draft}),/draft\.note/);

const legacyNote='L'.repeat(700)+'\r\nKeep this line\ttoo',legacyBand='B'.repeat(100)+'\nOld label',legacy=workout('Resistance Band Curl',0,8);
Object.assign(legacy.ex[0].sets[0],{trackingMode:'band_reps',note:legacyNote,band:legacyBand});
const existing=await boot({...base(),cur:legacy});
assert.equal(existing.h.S.cur.ex[0].sets[0].note,legacyNote,'startup keeps historical note text');
assert.equal(existing.h.S.cur.ex[0].sets[0].band,legacyBand,'startup keeps historical band text');
assert.equal(existing.store.has('liftlog-startup-recovery'),false,'valid legacy text does not trigger repair recovery');

const create=existing.ctx.document.createElement;
existing.ctx.document.createElement=()=>{const el=create();el.querySelector=s=>existing.get(s);return el;};
existing.h.A.editSet({i:0,j:0});
for(const [,id,value] of existing.h.qolState.modal.innerHTML.matchAll(/<input id="?([\w-]+)"?[^>]*value="([^"]*)"/g))existing.get('#'+id).value=value.replace(/[\r\n]/g,'');
assert.match(existing.h.qolState.modal.innerHTML,/kept unchanged unless you shorten/);
existing.get('#edit-amount').value='9';
existing.get('#save-set-edit').listeners.click.at(-1)();
await existing.h.flush();
assert.equal(existing.h.S.cur.ex[0].sets[0].note,legacyNote,'editing another field does not truncate a legacy note');
assert.equal(existing.h.S.cur.ex[0].sets[0].band,legacyBand,'editing another field does not truncate a legacy band label');

existing.h.dr={n:'Resistance Band Curl',kg:0,reps:8,note:legacyNote,band:'Light'};
assert.equal(existing.h.makeDraftSet(),null,'an over-limit draft must be shortened explicitly before logging');
assert.equal(existing.h.dr.note,legacyNote,'failed logging keeps the full draft for correction');
assert.match(existing.h.V.today(),/id="log-band" maxlength="80"/);
existing.h.A.editSet({i:0,j:0});
existing.get('#edit-weight').value='0';existing.get('#edit-amount').value='9';existing.get('#edit-rpe').value='';
existing.get('#edit-note').value='A deliberately changed note';
existing.get('#edit-note').listeners.input.at(-1)();
existing.get('#edit-band').value='Light';existing.get('#edit-band').listeners.input.at(-1)();
existing.get('#save-set-edit').listeners.click.at(-1)();await existing.h.flush();
assert.equal(existing.h.S.cur.ex[0].sets[0].note,'A deliberately changed note');
assert.equal(existing.h.S.cur.ex[0].sets[0].band,'Light');
assert.deepEqual([...z.errors,...existing.errors],[]);
console.log('Imported text budgets reject abusive values; historical notes and bands remain intact until explicitly shortened');
