/* Versioned, foreground-only bridge to the installed Slat iPhone app. */
globalThis.SlatNativeRest=(()=>{
 const available=()=>typeof globalThis.window?.webkit?.messageHandlers?.slatRestTimer?.postMessage==='function';
 function create(post,now=()=>Date.now()){
  let key='';
  const send=message=>{const next=JSON.stringify(message);if(next===key)return false;post(message);key=next;return true;};
  const stop=()=>send({version:1,action:'stop'});
  const sync=data=>{
   if(!data.enabled||!data.workoutID||!Number.isFinite(data.endAt)||data.endAt<=now())return stop();
   if(data.endAt-now()>86400000)throw new Error('Rest deadline is out of range');
   const start=Number.isFinite(data.startedAt)&&data.startedAt>0&&data.startedAt<data.endAt?data.startedAt:now();
   return send({version:1,action:'sync',workoutID:String(data.workoutID).slice(0,160),startedAt:start,endAt:data.endAt,accent:/^#[0-9a-f]{6}$/i.test(data.accent||'')?data.accent:'#756bff'});
  };
  return {sync,stop,status:()=>post({version:1,action:'status'}),reset:()=>{key='';}};
 }
 return {available,create};
})();
