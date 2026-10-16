/* Slat state contract. Pure validation runs before any backup replacement. */
var SlatData=globalThis.SlatData= (() => {
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const number = v => typeof v==='number'?v:typeof v==='string'&&/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(v.trim())?Number(v.trim().replace(',','.')):NaN;
  const finite = v => Number.isFinite(number(v))&&Number.isFinite(Number(v));
  const fail = path => { throw new Error('Invalid backup: ' + path); };
  const name = v => typeof v==='string'&&!!v.trim()&&v.length<=80&&!/[\u0000-\u001f]/.test(v)&&!['__proto__','constructor','prototype'].includes(v.trim());
  const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number(v.slice(0,4))>=1900 && !isNaN(Date.parse(v+'T00:00:00Z')) && new Date(v+'T00:00:00Z').toISOString().slice(0,10) === v;
  const IMPORT_TEXT_BUDGETS={note:16384,band:1024};
  // Ordinary tab/newline formatting is valid legacy text, not a corrupt record.
  const importText = (value,field) => typeof value==='string'&&value.length<=IMPORT_TEXT_BUDGETS[field]&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
  function validateBackup(data,catalogue={},options={}) {
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
    for(const [n,c] of Object.entries({...Object.fromEntries(Object.entries(data.rk||{}).filter(([,r])=>r?.auto!==1)),...(data.checks||{})})){
      if(!name(n)||!object(c)||!finite(c.w)||Number(c.w)<-60||Number(c.w)>2000||!finite(c.r)||!Number.isInteger(Number(c.r))||Number(c.r)<1||Number(c.r)>12||!finite(c.b)||Number(c.b)<=0||Number(c.b)>500||(c.h!=null&&c.h!==''&&(!finite(c.h)||(Number(c.h)!==0&&(Number(c.h)<120||Number(c.h)>230))))||(c.f!=null&&!['M','F'].includes(c.f))||(c.d!=null&&!date(c.d)))fail('saved check '+n);
    }
    if (data.custom!=null && !Array.isArray(data.custom)) fail('custom must be a list');
    for(const settings of [data.settings,data.set])if(settings){if(settings.table!=null&&!['M','F'].includes(settings.table))fail('settings.table');if(settings.unit!=null&&!['kg','lb'].includes(settings.unit))fail('settings.unit');}
    for(const k of ['routines'])if(data[k]!=null&&!Array.isArray(data[k]))fail(k+' must be a list');
    const routineIds=new Set();
    for(const [i,r] of (data.routines||[]).entries()){if(!object(r)||!name(r.name)||typeof r.id!=='string'||!r.id||r.id.length>160||routineIds.has(r.id)||!Array.isArray(r.ex)||!r.ex.length||r.ex.length>200)fail('routine '+i);routineIds.add(r.id);for(const x of r.ex){if(!object(x)||!name(x.n)||(typeof x.exerciseId!=='string'||!x.exerciseId||x.exerciseId.length>160))fail('routine exercise');for(const [k,max] of Object.entries({sets:100,reps:10000,seconds:86400,meters:100000,rest:600}))if(x[k]==null||(!finite(x[k])||Number(x[k])<0||Number(x[k])>max))fail('routine '+k);if(!Number.isInteger(Number(x.sets))||Number(x.sets)<1||!Number.isInteger(Number(x.reps))||Number(x.reps)<1||Number(x.seconds)<=0||Number(x.meters)<=0||!Number.isInteger(Number(x.rest))||(Number(x.rest)!==0&&Number(x.rest)<15))fail('routine targets');}}
    if(data.exercisePreferences!=null&&!object(data.exercisePreferences))fail('exercisePreferences');
    for(const p of Object.values(data.exercisePreferences||{})){if(!object(p)||(p.rest!=null&&(!finite(p.rest)||!Number.isInteger(Number(p.rest))||Number(p.rest)<0||Number(p.rest)>600||(Number(p.rest)!==0&&Number(p.rest)<15)))||(p.equipmentLabel!=null&&(typeof p.equipmentLabel!=='string'||p.equipmentLabel.length>80||/[\u0000-\u001f]/.test(p.equipmentLabel))))fail('exercise preference');}
    const workout = (w, path) => {
      if (!object(w) || !Array.isArray(w.ex) || !date(w.d)) fail(path);
      if(w.name!=null&&w.name!==''&&!name(w.name))fail(path+'.name');
      if(w.corrections!=null&&(!Array.isArray(w.corrections)||w.corrections.some(c=>!object(c)||!date(c.date)||(c.name!=null&&c.name!==''&&!name(c.name))||(c.correctedAt!=null&&(!finite(c.correctedAt)||Number(c.correctedAt)<0)))))fail(path+'.corrections');
      if(w.drafts!=null){if(!object(w.drafts))fail(path+'.drafts');for(const draft of Object.values(w.drafts)){if(!object(draft))fail(path+'.draft');for(const key of ['kg','reps','seconds','meters','note','rpe','band'])if(draft[key]!=null&&!['number','string'].includes(typeof draft[key]))fail(path+'.draft.'+key);for(const field of ['weightText','repsText'])if(draft[field]!=null&&typeof draft[field]!=='string')fail(path+'.draft.'+field);if(draft.weightUnit!=null&&!['kg','lb'].includes(draft.weightUnit))fail(path+'.draft.weightUnit');if(options.importText===true)for(const field of ['note','band'])if(draft[field]!=null&&!importText(draft[field],field))fail(path+'.draft.'+field+' exceeds the restore text budget');}}
      for (const [i,x] of w.ex.entries()) {
        if (!object(x) || !name(x.n) || !Array.isArray(x.sets)) fail(path+'.ex['+i+']');
        if(x.exerciseId!=null&&(typeof x.exerciseId!=='string'||!x.exerciseId||x.exerciseId.length>160))fail(path+'.exerciseId');
        if(x.target!=null){if(!object(x.target))fail(path+'.target');for(const [key,max] of Object.entries({sets:100,reps:10000,seconds:86400,meters:100000,rest:600})){const value=x.target[key];if(value!=null&&(!finite(value)||Number(value)<0||Number(value)>max||(['sets','reps','rest'].includes(key)&&!Number.isInteger(Number(value)))||(['sets','reps','seconds','meters'].includes(key)&&Number(value)<=0)||(key==='rest'&&Number(value)!==0&&Number(value)<15)))fail(path+'.target.'+key);}}
        for (const [j,s] of x.sets.entries()) {
          const p=path+'.ex['+i+'].sets['+j+']';
          if (!object(s) || !finite(s.kg) || Number(s.kg)<-60 || Number(s.kg)>2000) fail(p+'.kg');
          if (!finite(s.reps) || !Number.isInteger(Number(s.reps)) || Number(s.reps)<0 || Number(s.reps)>10000) fail(p+'.reps');
          for (const field of ['seconds','meters','bw','height','rpe']) if (s[field]!=null && (!finite(s[field]) || Number(s[field])<0)) fail(p+'.'+field);
          for(const [field,max] of Object.entries({seconds:86400,meters:100000,bw:500,height:230}))if(s[field]!=null&&Number(s[field])>max)fail(p+'.'+field);
          if(s.equipmentContext!=null&&(!object(s.equipmentContext)||typeof s.equipmentContext.label!=='string'||!s.equipmentContext.label.trim()||s.equipmentContext.label.length>80||/[\u0000-\u001f]/.test(s.equipmentContext.label)))fail(p+'.equipmentContext');
          for(const field of ['note','band'])if(s[field]!=null&&typeof s[field]!=='string')fail(p+'.'+field);
          if(options.importText===true)for(const field of ['note','band'])if(s[field]!=null&&!importText(s[field],field))fail(p+'.'+field+' exceeds the restore text budget');
          if(s.rpe!=null&&Number(s.rpe)>10)fail(p+'.rpe');
          if(s.protocolVersion!=null&&(!finite(s.protocolVersion)||!Number.isInteger(Number(s.protocolVersion))||Number(s.protocolVersion)<1))fail(p+'.protocolVersion');
          if(s.exerciseId!=null&&(typeof s.exerciseId!=='string'||!s.exerciseId||s.exerciseId.length>160))fail(p+'.exerciseId');
          if(s.trackingMode!=null&&!['load_reps','reps','duration','load_distance','band_reps','legacy_reps'].includes(s.trackingMode))fail(p+'.trackingMode');
          if(s.trackingMode==='duration'&&(!finite(s.seconds)||Number(s.seconds)<=0||Number(s.reps)!==0||Number(s.meters||0)!==0))fail(p+'.duration measurements');
          if(s.trackingMode==='load_distance'&&(!finite(s.meters)||Number(s.meters)<=0||Number(s.reps)!==0||Number(s.seconds||0)!==0))fail(p+'.distance measurements');
          if(['load_reps','reps','band_reps'].includes(s.trackingMode)&&(Number(s.reps)<1||Number(s.seconds||0)!==0||Number(s.meters||0)!==0||(s.trackingMode!=='load_reps'&&Number(s.kg)!==0)))fail(p+'.repetition measurements');
          if(s.sourceUnit!=null&&!['kg','lb'].includes(s.sourceUnit))fail(p+'.sourceUnit');
          if(s.measurementUnits!=null&&(!object(s.measurementUnits)||Object.entries(s.measurementUnits).some(([k,v])=>({load:'kg',repetitions:'reps',duration:'s',distance:'m'})[k]!==v)))fail(p+'.measurementUnits');
          if(s.loadProtocol!=null&&(!object(s.loadProtocol)||!['normal','bodyweight','assisted'].includes(s.loadProtocol.mode)||!finite(s.loadProtocol.multiplier)||Number(s.loadProtocol.multiplier)<=0))fail(p+'.loadProtocol');
          if(s.performanceContext!=null&&(!object(s.performanceContext)||!['M','F'].includes(s.performanceContext.reference)||!date(s.performanceContext.workoutDate)))fail(p+'.performanceContext');
        }
      }
    };
    const workoutIds=new Set();data.workouts.forEach((w,i)=>{workout(w,'workouts['+i+']');if(w.id!=null){if(!Number.isSafeInteger(w.id)||w.id<=0||workoutIds.has(w.id))fail('duplicate or invalid workout identity');workoutIds.add(w.id);}});
    if (data.cur!=null) workout(data.cur,'cur');
    if(data.editingId!=null&&(!data.cur||!Number.isSafeInteger(data.editingId)||!workoutIds.has(data.editingId)||data.cur.id!==data.editingId))fail('ambiguous editing identity');
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
    const customIds=new Set(),customNames=new Set(),catalogueNames=new Set(Object.keys(catalogue).map(n=>n.toLowerCase()));
(data.custom||[]).forEach((c,i)=>{if(!object(c)||!name(c.n)||(c.t!=null&&!['B','D','M','W','U'].includes(c.t)))fail('custom['+i+']');const normalized=c.n.trim().replace(/\s+/g,' ').toLowerCase();if(customNames.has(normalized)||catalogueNames.has(normalized))fail('custom name collision');customNames.add(normalized);if(c.protocol!=null&&(!object(c.protocol)||!['load_reps','reps','duration','load_distance','band_reps'].includes(c.protocol.tracking)||![1,2].includes(c.protocol.implementCount)||!['normal','bodyweight','assisted'].includes(c.protocol.loadMode)||typeof c.protocol.hasLoad!=='boolean'||!finite(c.protocol.bodyweightFactor)||Number(c.protocol.bodyweightFactor)<0||Number(c.protocol.bodyweightFactor)>1))fail('custom protocol');if(c.id!=null){if(typeof c.id!=='string'||!c.id.startsWith('custom:')||c.id.length>160||customIds.has(c.id))fail('custom identity');customIds.add(c.id);}});
    if(Object.keys(catalogue).length)for(const routine of data.routines||[])for(const x of routine.ex){const record=Object.hasOwn(catalogue,x.n)?catalogue[x.n]:(data.custom||[]).find(c=>c.n===x.n);const id=record&&(record.id||'custom:'+record.n);if(!id||id!==x.exerciseId)fail('unresolved routine exercise identity');}
    return JSON.parse(JSON.stringify(data));
  }
  const canonicalName = (name,catalogue) => catalogue?.[name]?.canonicalName || name;
  function backupSummary(data) {
    const workouts=data.workouts||[],sets=workouts.reduce((n,w)=>n+w.ex.reduce((m,x)=>m+x.sets.length,0),0);
    const activityDays=new Set(workouts.filter(w=>w.ex.some(x=>x.sets.length)).map(w=>w.d)).size;
    return {version:data.version||'Legacy',workouts:workouts.length,activityDays,sets,bodyweights:(data.bw||[]).length,custom:(data.custom||[]).length,routines:(data.routines||[]).length,exercisePreferences:Object.keys(data.exercisePreferences||{}).length,checks:Object.keys(data.checks||{}).length,hasDraft:!!data.cur};
  }
  // Review counts follow restore's legacy/manual merge, not the frozen snapshot wire counts.
  function restoreSummary(data,catalogue={}) {
    const checks={...Object.fromEntries(Object.entries(data.rk||{}).filter(([,r])=>r&&r.auto!==1)),...(data.checks||{})};
    return {...backupSummary(data),checks:new Set(Object.keys(checks).map(n=>canonicalName(n,catalogue))).size};
  }
  return {validateBackup,canonicalName,date,backupSummary,restoreSummary,number,IMPORT_TEXT_BUDGETS};
})();
