/* Slat state contract. Pure validation runs before any backup replacement. */
globalThis.SlatData = (() => {
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const finite = v => v !== '' && v !== null && Number.isFinite(Number(v));
  const fail = path => { throw new Error('Invalid backup: ' + path); };
  const name = v => typeof v==='string'&&!!v.trim()&&v.length<=80&&!/[\u0000-\u001f]/.test(v)&&!['__proto__','constructor','prototype'].includes(v.trim());
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
        if (!object(x) || !name(x.n) || !Array.isArray(x.sets)) fail(path+'.ex['+i+']');
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
    if (data.undo!=null) {
      const u=data.undo;
      if(!object(u)||!['set','exercise','workout','draft'].includes(u.type)||!object(u.record))fail('undo');
      if(u.type==='workout'||u.type==='draft')workout(u.record,'undo.record');
      else {
        if(!Number.isSafeInteger(u.workoutId)||u.workoutId<=0||!Number.isInteger(u.index)||u.index<0||(u.type==='set'&&typeof u.entryId!=='string'))fail('undo target');
        const ex=u.type==='exercise'?u.record:{n:'Recovered set',sets:[u.record]};
        workout({d:'2000-01-01',ex:[ex]},'undo.record');
      }
    }
    data.bw.forEach((b,i)=>{if(!object(b)||!date(b.d)||!finite(b.kg)||Number(b.kg)<=0||Number(b.kg)>500)fail('bw['+i+']');});
    const customIds=new Set();
    (data.custom||[]).forEach((c,i)=>{if(!object(c)||!name(c.n)||(c.t!=null&&!['B','D','M','W','U'].includes(c.t)))fail('custom['+i+']');if(c.id!=null){if(typeof c.id!=='string'||!c.id.startsWith('custom:')||customIds.has(c.id))fail('custom identity');customIds.add(c.id);}});
    return JSON.parse(JSON.stringify(data));
  }
  const canonicalName = (name,catalogue) => catalogue?.[name]?.canonicalName || name;
  function backupSummary(data) {
    const workouts=data.workouts||[],sets=workouts.reduce((n,w)=>n+w.ex.reduce((m,x)=>m+x.sets.length,0),0);
    return {version:data.version||'Legacy',workouts:workouts.length,sets,bodyweights:(data.bw||[]).length,custom:(data.custom||[]).length,checks:Object.keys(data.checks||{}).length,hasDraft:!!data.cur};
  }
  return {validateBackup,canonicalName,date,backupSummary};
})();
