/* System rest cards use a fixed deadline, never a countdown that can freeze when a phone sleeps. */
globalThis.SlatRestNotifications = (() => {
  const tag = 'slat-rest-timer';
  function card(endAt, complete, scope) {
    const ready = new Date(endAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    return {
      title: complete ? 'Rest complete' : 'Rest timer',
      options: {
        body: complete ? 'Ready for your next set. Tap to return to Slat.' : `Next set at ${ready}. Tap to open your timer in Slat.`,
        tag, icon: new URL('apple-touch-icon-photo-fit.png', scope).href,
        timestamp:endAt, silent:!complete, renotify:complete, requireInteraction:!complete,
        data:{type:'SLAT_REST', endAt},
        actions:[{action:'open-rest', title:'Open timer'}]
      }
    };
  }
  function create({registration, allowed, now=()=>Date.now(), onError=()=>{}}) {
    let tail=Promise.resolve(), revision=0, key='';
    const enqueue = job => {
      const version=++revision;
      tail=tail.then(async()=>{
        if(version!==revision)return;
        const reg=await registration();
        if(!reg||version!==revision)return;
        await job(reg,()=>version===revision);
      }).catch(()=>onError());
      return tail;
    };
    const close=()=>{
      key='';
      return enqueue(async reg=>{for(const n of await reg.getNotifications({tag}))n.close();});
    };
    const show=(endAt,complete=false)=>{
      if(!allowed()||!Number.isFinite(endAt)||endAt<=0)return close();
      // A suspended page must not wake hours later and announce an old rest as just completed.
      if(complete&&(now()<endAt||now()-endAt>15000))return close();
      const next=String(endAt)+':'+complete;
      if(key===next)return tail;
      key=next;
      return enqueue(async(reg,current)=>{
        if(!current()||!allowed())return;
        if(!complete&&endAt<=now())return;
        const {title,options}=card(endAt,complete,reg.scope);
        await reg.showNotification(title,options);
      });
    };
    return {show,close,flush:()=>tail};
  }
  return {tag,card,create};
})();
