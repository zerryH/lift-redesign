import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8');
assert.ok(app.includes('S.rk={...manual,...rebuilt};'),'workout-derived ranks must override manual Get Rank records');
assert.ok(!app.includes('S.rk={...rebuilt,...manual};'),'manual Get Rank records must not override logged lifts');
assert.ok(app.includes("refreshRanks();gr.res=S.rk[n];render();sheet();"),'Get Rank UI must reflect the authoritative rank after refresh');
console.log('get-rank/logged-lift precedence regression passed');
