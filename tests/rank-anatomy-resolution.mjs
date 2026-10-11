import assert from 'node:assert/strict';
import {boot,base,workout} from './support/runtime.mjs';
for(const [name,zone,forbidden] of [['Cable Calf Raise','calves','quads'],['Cable Crunch','abs','lats'],['Cable Shoulder Press','frontDelts','rearDelts'],['Dumbbell Bicep Curl','biceps','calves']]){
 const z=await boot({...base(),workouts:[workout(name,60)]});const states=z.h.muscleStates(z.h.bests(),80);assert(states.find(x=>x.id===zone).i>=0,name);assert.equal(states.find(x=>x.id===forbidden).i,-1,name);assert.deepEqual(z.errors,[]);
}
console.log('anatomy uses explicit muscle contributions, not benchmark alias equality');
