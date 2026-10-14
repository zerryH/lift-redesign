/* Web notifications are static next-set reminders. The live countdown stays in the app. */
var SlatRestNotifications=globalThis.SlatRestNotifications= (() => {
  const tag = 'slat-rest-timer';
  function card(endAt, scope) {
    const ready = new Date(endAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    return {
      title: 'Rest reminder',
      options: {
        body: `Next set at ${ready}. Static reminder — open Slat for the live countdown.`,
        tag, icon: new URL('apple-touch-icon-photo-fit.png', scope).href,
        silent:true, renotify:false, requireInteraction:true,
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
      }).catch(()=>{if(version===revision)key='';onError();});
      return tail;
    };
    const close=()=>{
      key='';
      return enqueue(async reg=>{for(const n of await reg.getNotifications({tag}))n.close();});
    };
    const show=endAt=>{
      if(!allowed()||!Number.isFinite(endAt)||endAt<=now())return close();
      const next=String(endAt);
      if(key===next)return tail;
      key=next;
      return enqueue(async(reg,current)=>{
        if(!current()||!allowed())return;
        if(endAt<=now()){key='';for(const n of await reg.getNotifications({tag}))n.close();return;}
        const {title,options}=card(endAt,reg.scope);
        await reg.showNotification(title,options);
      });
    };
    return {show,close,flush:()=>tail};
  }
  return {tag,card,create};
})();
