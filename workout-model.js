/* Pure session transitions; persistence is acknowledged by the caller. */
globalThis.SlatWorkout=(()=>{
 const phase=(state,saving=false)=>saving?'saving':!state.cur?'idle':state.editingId!=null?'editing':'active';
 function complete(current){
  if(!current?.ex?.some(x=>x.sets?.length))throw new Error('Log at least one set before finishing');
  const done=JSON.parse(JSON.stringify(current));delete done.drafts;delete done.restEndAt;return done;
 }
 function replace(workouts,done,editingId){
  const next=workouts.slice();
  if(editingId!=null){const i=next.findIndex(w=>w.id===editingId);if(i<0)throw new Error('This workout was removed. Export your draft before continuing.');next[i]=done;}
  else if(!next.some(w=>w.id===done.id))next.push(done);
  return next;
 }
 return {phase,complete,replace};
})();
