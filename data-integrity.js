/* Slat state contract. Pure validation runs before any backup replacement. */
globalThis.SlatData = (() => {
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const finite = v => v !== '' && v !== null && Number.isFinite(Number(v));
  const fail = path => { throw new Error('Invalid backup: ' + path); };
  const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v+'T00:00:00Z')) && new Date(v+'T00:00:00Z').toISOString().slice(0,10) === v;
  function validateBackup(data) {
    if (!object(data)) fail('expected an object');
    if (data.version != null && (!Number.isInteger(Number(data.version)) || Number(data.version)>4)) fail('unsupported backup version');
    for (const k of ['workouts','bw']) if (!Array.isArray(data[k])) fail(k+' must be a list');
    for (const k of ['settings','set','rk','checks','profile']) if (data[k]!=null && !object(data[k])) fail(k+' must be an object');
    if (data.custom!=null && !Array.isArray(data.custom)) fail('custom must be a list');
    const workout = (w, path) => {
      if (!object(w) || !Array.isArray(w.ex) || !date(w.d)) fail(path);
      for (const [i,x] of w.ex.entries()) {
        if (!object(x) || typeof x.n!=='string' || !x.n.trim() || !Array.isArray(x.sets)) fail(path+'.ex['+i+']');
        for (const [j,s] of x.sets.entries()) {
          const p=path+'.ex['+i+'].sets['+j+']';
          if (!object(s) || !finite(s.kg) || Number(s.kg)<-60 || Number(s.kg)>2000) fail(p+'.kg');
          if (!finite(s.reps) || !Number.isInteger(Number(s.reps)) || Number(s.reps)<0 || Number(s.reps)>10000) fail(p+'.reps');
          for (const field of ['seconds','meters','bw','height','rpe']) if (s[field]!=null && (!finite(s[field]) || Number(s[field])<0)) fail(p+'.'+field);
        }
      }
    };
    data.workouts.forEach((w,i)=>workout(w,'workouts['+i+']'));
    if (data.cur!=null) workout(data.cur,'cur');
    data.bw.forEach((b,i)=>{if(!object(b)||!date(b.d)||!finite(b.kg)||Number(b.kg)<=0||Number(b.kg)>500)fail('bw['+i+']');});
    (data.custom||[]).forEach((c,i)=>{if(!object(c)||typeof c.n!=='string'||!c.n.trim())fail('custom['+i+']');});
    return JSON.parse(JSON.stringify(data));
  }
  const canonicalName = (name,catalogue) => catalogue?.[name]?.canonicalName || name;
  return {validateBackup,canonicalName,date};
})();
