import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
const z=await boot({...base(),cur:workout('Old Custom Lift',20)});const html=z.h.V.today();assert(html.includes('Old Custom Lift'));assert(html.includes('Log set'));assert(!html.includes('undefined'));assert.deepEqual(z.errors,[]);
console.log('legacy/custom workout still renders with safe metadata');
