/* Slat state contract. Pure validation runs before any backup replacement. */
globalThis.SlatData = (() => {
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const number = v => typeof v==='number'?v:typeof v==='string'&&/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(v.trim())?Number(v.trim().replace(',','.')):NaN;
  const finite = v => Number.isFinite(number(v))&&Number.isFinite(Number(v));
  const fail = path => { throw new Error('Invalid backup: ' + path); };
  const name = v => typeof v==='string'&&!!v.trim()&&v.length<=80&&!/[\u0000-\u001f]/.test(v)&&!['__proto__','constructor','prototype'].includes(v.trim());
  const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v+'T00:00:00Z')) && new Date(v+'T00:00:00Z').toISOString().slice(0,10) === v;
  function validateBackup(data) {
    if (!object(data)) fail('expected an object');
    const visiting=new Set();
    const serializable=(value,path,depth=0)=>{
      if(depth>64)fail(path+' is nested too deeply');
      if(value===null||typeof value!=='object'){if(typeof value==='function'||typeof value==='symbol'||typeof value==='bigint'||(typeof value==='number'&&!Number.isFinite(value)))fail(path+' is not JSON data');return;}
      if(visiting.has(value))fail(path+' contains a cycle');
      visiting.add(value);for(const [key,child] of Object.entries(value))serializable(child,path+'.'+key,depth+1);visiting.delete(value);
    };
    serializable(data,'backup');
    if (data.version != null && (!finite(data.version) || !Number.isInteger(Number(data.version)) || Number(data.version)<1 || Number(data.version)>4)) fail('unsupported backup version');
    for (const k of ['workouts','bw']) if (!Array.isArray(data[k])) fail(k+' must be a list');
    for (const k of ['settings','set','rk','checks','profile']) if (data[k]!=null && !object(data[k])) fail(k+' must be an object');
    if (data.custom!=null && !Array.isArray(data.custom)) fail('custom must be a list');
    for(const settings of [data.settings,data.set])if(settings){if(settings.table!=null&&!['M','F'].includes(settings.table))fail('settings.table');if(settings.unit!=null&&!['kg','lb'].includes(settings.unit))fail('settings.unit');}
    for(const k of ['routines'])if(data[k]!=null&&!Array.isArray(data[k]))fail(k+' must be a list');
    for(const [i,r] of (data.routines||[]).entries()){if(!object(r)||!name(r.name)||typeof r.id!=='string'||!Array.isArray(r.ex)||r.ex.length>200)fail('routine '+i);for(const x of r.ex){if(!object(x)||!name(x.n)||typeof x.exerciseId!=='string')fail('routine exercise');for(const [k,max] of Object.entries({sets:100,reps:10000,seconds:86400,meters:100000,rest:600}))if(x[k]==null||(!finite(x[k])||Number(x[k])<0||Number(x[k])>max))fail('routine '+k);}}
    if(data.exercisePreferences!=null&&!object(data.exercisePreferences))fail('exercisePreferences');
    for(const p of Object.values(data.exercisePreferences||{})){if(!object(p)||(p.rest!=null&&(!finite(p.rest)||Number(p.rest)<0||Number(p.rest)>600))||(p.equipmentLabel!=null&&(typeof p.equipmentLabel!=='string'||p.equipmentLabel.length>80)))fail('exercise preference');}
    const workout = (w, path) => {
      if (!object(w) || !Array.isArray(w.ex) || !date(w.d)) fail(path);
      if(w.name!=null&&w.name!==''&&!name(w.name))fail(path+'.name');
      for (const [i,x] of w.ex.entries()) {
        if (!object(x) || !name(x.n) || !Array.isArray(x.sets)) fail(path+'.ex['+i+']');
        for (const [j,s] of x.sets.entries()) {
          const p=path+'.ex['+i+'].sets['+j+']';
          if (!object(s) || !finite(s.kg) || Number(s.kg)<-60 || Number(s.kg)>2000) fail(p+'.kg');
          if (!finite(s.reps) || !Number.isInteger(Number(s.reps)) || Number(s.reps)<0 || Number(s.reps)>10000) fail(p+'.reps');
          for (const field of ['seconds','meters','bw','height','rpe']) if (s[field]!=null && (!finite(s[field]) || Number(s[field])<0)) fail(p+'.'+field);
          for(const [field,max] of Object.entries({seconds:86400,meters:100000,bw:500,height:230}))if(s[field]!=null&&Number(s[field])>max)fail(p+'.'+field);
          if(s.equipmentContext!=null&&(!object(s.equipmentContext)||!name(s.equipmentContext.label)))fail(p+'.equipmentContext');
          if(s.rpe!=null&&Number(s.rpe)>10)fail(p+'.rpe');
          if(s.protocolVersion!=null&&(!finite(s.protocolVersion)||!Number.isInteger(Number(s.protocolVersion))||Number(s.protocolVersion)<1))fail(p+'.protocolVersion');
          if(s.exerciseId!=null&&(typeof s.exerciseId!=='string'||!s.exerciseId||s.exerciseId.length>160))fail(p+'.exerciseId');
          if(s.trackingMode!=null&&!['load_reps','reps','duration','load_distance','band_reps','legacy_reps'].includes(s.trackingMode))fail(p+'.trackingMode');
          if(s.sourceUnit!=null&&!['kg','lb'].includes(s.sourceUnit))fail(p+'.sourceUnit');
          if(s.measurementUnits!=null&&(!object(s.measurementUnits)||Object.entries(s.measurementUnits).some(([k,v])=>({load:'kg',repetitions:'reps',duration:'s',distance:'m'})[k]!==v)))fail(p+'.measurementUnits');
          if(s.loadProtocol!=null&&(!object(s.loadProtocol)||!['normal','bodyweight','assisted'].includes(s.loadProtocol.mode)||!finite(s.loadProtocol.multiplier)||Number(s.loadProtocol.multiplier)<=0))fail(p+'.loadProtocol');
          if(s.performanceContext!=null&&(!object(s.performanceContext)||!['M','F'].includes(s.performanceContext.reference)||!date(s.performanceContext.workoutDate)))fail(p+'.performanceContext');
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
    (data.custom||[]).forEach((c,i)=>{if(!object(c)||!name(c.n)||(c.t!=null&&!['B','D','M','W','U'].includes(c.t)))fail('custom['+i+']');if(c.protocol!=null&&(!object(c.protocol)||!['load_reps','reps','duration','load_distance','band_reps'].includes(c.protocol.tracking)||![1,2].includes(c.protocol.implementCount)||!['normal','bodyweight','assisted'].includes(c.protocol.loadMode)||typeof c.protocol.hasLoad!=='boolean'||!finite(c.protocol.bodyweightFactor)||Number(c.protocol.bodyweightFactor)<0||Number(c.protocol.bodyweightFactor)>1))fail('custom protocol');if(c.id!=null){if(typeof c.id!=='string'||!c.id.startsWith('custom:')||customIds.has(c.id))fail('custom identity');customIds.add(c.id);}});
    return JSON.parse(JSON.stringify(data));
  }
  const canonicalName = (name,catalogue) => catalogue?.[name]?.canonicalName || name;
  function backupSummary(data) {
    const workouts=data.workouts||[],sets=workouts.reduce((n,w)=>n+w.ex.reduce((m,x)=>m+x.sets.length,0),0);
    return {version:data.version||'Legacy',workouts:workouts.length,sets,bodyweights:(data.bw||[]).length,custom:(data.custom||[]).length,checks:Object.keys(data.checks||{}).length,hasDraft:!!data.cur};
  }
  return {validateBackup,canonicalName,date,backupSummary,number};
})();
