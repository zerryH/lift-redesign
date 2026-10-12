/* Pure session transitions; persistence is acknowledged by the caller. */
globalThis.SlatWorkout=(()=>{
 const phase=(state,saving=false)=>saving?'saving':!state.cur?'idle':state.editingId!=null?'editing':'active';
 function complete(current){
  if(!current?.ex?.some(x=>x.sets?.length))throw new Error('Log at least one set before finishing');
  const done=JSON.parse(JSON.stringify(current));delete done.drafts;delete done.restEndAt;delete done.restStartedAt;return done;
 }
 function replace(workouts,done,editingId){
  const next=workouts.slice();
  if(editingId!=null){const i=next.findIndex(w=>w.id===editingId);if(i<0)throw new Error('This workout was removed. Export your draft before continuing.');next[i]=done;}
  else if(!next.some(w=>w.id===done.id))next.push(done);
  return next;
 }
 const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
 const localDate=now=>{const d=new Date(now),pad=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
 function activity(workouts,year){
  if(!Number.isInteger(year)||year<1900||year>9999)throw new Error('Invalid activity year');
  const counts=new Map();
  for(const w of workouts||[])if(validDate(w?.d)&&w.d.startsWith(year+'-')&&w.ex?.some(x=>x.sets?.length))counts.set(w.d,(counts.get(w.d)||0)+1);
  const first=Date.UTC(year,0,1,12),last=Date.UTC(year,11,31,12),offset=(new Date(first).getUTCDay()+6)%7,days=[];
  for(let t=first;t<=last;t+=86400000){const d=new Date(t),date=d.toISOString().slice(0,10);days.push({date,month:d.getUTCMonth(),weekday:(d.getUTCDay()+6)%7,count:counts.get(date)||0});}
  const cells=Array(offset).fill(null).concat(days);while(cells.length%7)cells.push(null);
  return {year,days,cells,weeks:cells.length/7,offset,total:[...counts.values()].reduce((a,b)=>a+b,0),activeDays:counts.size};
 }
 function correct(current,date,name,now=Date.now()){
  if(!validDate(date)||date>localDate(now))throw new Error('Choose a real date that is not in the future');
  if(typeof name!=='string'||name.length>80||/[\u0000-\u001f]/.test(name)||['__proto__','constructor','prototype'].includes(name.trim()))throw new Error('Use a name of up to 80 characters');
  const next=JSON.parse(JSON.stringify(current));
  if(next.d!==date||String(next.name||'')!==name)next.corrections=[...(next.corrections||[]),{date:next.d,name:next.name||'',correctedAt:now}];
  next.d=date;next.name=name;
  for(const x of next.ex)for(const set of x.sets)if(set.performanceContext&&set.performanceContext.workoutDate!==date){set.originalPerformanceContext??=JSON.parse(JSON.stringify(set.performanceContext));set.performanceContext.workoutDate=date;}
  return next;
 }
 function summary(workouts,start,end,catalogue){
  const selected=(workouts||[]).filter(w=>w.d>=start&&w.d<=end&&w.ex?.some(x=>x.sets?.length)),muscles={};let sets=0;
  for(const w of selected)for(const x of w.ex)for(const set of x.sets||[])if(set.t!=='w'){sets++;const c=typeof catalogue==='function'?catalogue(x.n):catalogue?.[x.n],zone=c?.primaryMuscleId;if(zone)muscles[zone]=(muscles[zone]||0)+1;}
  return {sessions:selected.length,activeDays:new Set(selected.map(w=>w.d)).size,sets,muscles};
 }
 return {phase,complete,replace,activity,correct,summary};
})();
