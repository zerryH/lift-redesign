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
    if(data.favourites!=null&&(!Array.isArray(data.favourites)||data.favourites.length>500||data.favourites.some(id=>typeof id!=='string'||!id||id.length>160)||new Set(data.favourites).size!==data.favourites.length))fail('favourites');
    if(data.logUndo!=null&&(!object(data.logUndo)||!Number.isSafeInteger(data.logUndo.workoutId)||data.logUndo.workoutId<=0||['entryId','setId'].some(k=>typeof data.logUndo[k]!=='string'||!data.logUndo[k]||data.logUndo[k].length>160)))fail('logged set Undo');
    const stable=v=>typeof v==='string'&&!!v&&v.length<=160;
    const lists=['programmesV1','planSlots','progressionRules','progressionDecisions','warmupPresets','goalsV1'];
    for(const key of lists)if(data[key]!=null&&(!Array.isArray(data[key])||data[key].length>100000))fail(key);
    const unique=(values,path)=>{const ids=new Set();for(const value of values||[]){if(!object(value)||!stable(value.id)||ids.has(value.id))fail(path+' identity');ids.add(value.id);}};
    for(const key of lists)unique(data[key],key);
    const protocol=p=>object(p)&&['load_reps','reps','duration','load_distance','band_reps'].includes(p.trackingMode)&&['normal','bodyweight','assisted'].includes(p.mode)&&[1,2].includes(p.multiplier)&&typeof p.unilateral==='boolean'&&Number.isFinite(p.bodyweightFactor)&&p.bodyweightFactor>=0&&p.bodyweightFactor<=1;
    const setup=s=>typeof s==='string'&&s.length<=80&&!/[\u0000-\u001f]/.test(s);
    const warmSteps=(steps,p)=>Array.isArray(steps)&&steps.length>0&&steps.length<=20&&steps.every(s=>object(s)&&Number.isFinite(s.kg)&&s.kg>=0&&s.kg<=2000&&Number.isInteger(s.reps)&&s.reps>0&&s.reps<=10000&&Number.isFinite(s.seconds)&&s.seconds>0&&s.seconds<=86400&&Number.isFinite(s.meters)&&s.meters>0&&s.meters<=100000&&setup(s.band)&&(!['reps','band_reps'].includes(p.trackingMode)||s.kg===0));
    const warmQueue=q=>object(q)&&stable(q.presetId)&&protocol(q.protocol)&&setup(q.setupLabel)&&warmSteps(q.steps,q.protocol)&&Number.isInteger(q.index)&&q.index>=0&&q.index<q.steps.length;
    if(data.logUndo?.warmupBefore!=null&&!warmQueue(data.logUndo.warmupBefore))fail('warm-up Undo');
    const groups=(value,entries,path)=>{if(value==null){if(entries.some(x=>x.trainingGroupId!=null))fail(path+' unresolved group');return;}if(!Array.isArray(value)||value.length>100)fail(path+' groups');unique(value,path+' groups');for(const g of value)if(g.version!==1||typeof g.label!=='string'||!g.label.trim()||g.label.length>12||/[\u0000-\u001f]/.test(g.label)||!['round','exercise'].includes(g.restMode)||!Number.isInteger(g.restSeconds)||(g.restSeconds!==0&&(g.restSeconds<15||g.restSeconds>600)))fail(path+' group');for(const x of entries)if(x.trainingGroupId!=null&&(!stable(x.trainingGroupId)||!value.some(g=>g.id===x.trainingGroupId)))fail(path+' unresolved group');};
    for(const p of data.warmupPresets||[])if(p.version!==1||!name(p.name)||!stable(p.exerciseId)||!setup(p.setupLabel)||!protocol(p.protocol)||!warmSteps(p.steps,p.protocol))fail('warm-up preset');
    for(const g of data.goalsV1||[]){
      if(g.version!==1||!name(g.name)||typeof g.paused!=='boolean'||!['sessions','exercise'].includes(g.kind))fail('goal');
      if(g.kind==='sessions'){if(!Number.isInteger(g.targetSessions)||g.targetSessions<1||g.targetSessions>31)fail('weekly goal');continue;}
      const units={strength:'kg',load:'kg',reps:'reps',seconds:'s',meters:'m'};
      if(!stable(g.exerciseId)||!setup(g.setupLabel)||!protocol(g.protocol)||!setup(g.band)||!Object.hasOwn(units,g.metric)||g.unit!==units[g.metric]||!Number.isFinite(g.baseline)||g.baseline<0||!Number.isFinite(g.target)||g.target<0||g.baseline>100000||g.target>100000||!date(g.baselineDate)||!date(g.date)||g.baselineDate>g.date||(g.metric==='load'&&g.protocol.mode==='assisted'?g.target>=g.baseline:g.target<=g.baseline))fail('exercise goal');
      const metrics={load_reps:['strength','load','reps'],reps:['reps'],band_reps:['reps'],duration:['seconds'],load_distance:['load','meters']};
      if(!metrics[g.protocol.trackingMode].includes(g.metric))fail('exercise goal metric');
    }
    for(const p of data.programmesV1||[])if(!name(p.name)||!['rotation','weekdays'].includes(p.mode)||!Array.isArray(p.routineIds)||!p.routineIds.length||p.routineIds.length>100||p.routineIds.some(id=>!stable(id))||!Array.isArray(p.weekdays)||new Set(p.weekdays).size!==p.weekdays.length||p.weekdays.some(n=>!Number.isInteger(n)||n<0||n>6)||(p.mode==='weekdays'&&!p.weekdays.length)||!Number.isSafeInteger(p.cursor)||p.cursor<0||typeof p.paused!=='boolean')fail('programme');
    for(const s of data.planSlots||[])if(!stable(s.programmeId)||!stable(s.routineId)||!date(s.scheduledDate)||!Number.isSafeInteger(s.rotationIndex)||s.rotationIndex<0||!['planned','skipped','advanced'].includes(s.status)||!name(s.routineName))fail('plan slot');
    const rule=r=>object(r)&&stable(r.id)&&r.version===1&&stable(r.exerciseId)&&typeof r.setupLabel==='string'&&r.setupLabel.length<=80&&!/[\u0000-\u001f]/.test(r.setupLabel)&&object(r.protocol)&&['load_reps','reps','band_reps'].includes(r.protocol.trackingMode)&&['normal','bodyweight','assisted'].includes(r.protocol.mode)&&[1,2].includes(r.protocol.multiplier)&&typeof r.protocol.unilateral==='boolean'&&Number.isFinite(r.protocol.bodyweightFactor)&&r.protocol.bodyweightFactor>=0&&r.protocol.bodyweightFactor<=1&&Number.isInteger(r.minReps)&&r.minReps>0&&Number.isInteger(r.maxReps)&&r.maxReps>=r.minReps&&r.maxReps<=10000&&Number.isInteger(r.targetSets)&&r.targetSets>0&&r.targetSets<=100&&Number.isFinite(r.incrementKg)&&r.incrementKg>=0&&r.incrementKg<=200&&(r.protocol.trackingMode==='load_reps'||r.incrementKg===0)&&Number.isInteger(r.incrementReps)&&r.incrementReps>0&&r.incrementReps<=100&&['kg','lb'].includes(r.sourceUnit)&&typeof r.enabled==='boolean'&&typeof r.band==='string'&&r.band.length<=80&&!/[\u0000-\u001f]/.test(r.band);
    for(const r of data.progressionRules||[])if(!rule(r))fail('progression rule');
    for(const d of data.progressionDecisions||[])if(!stable(d.ruleId)||d.ruleVersion!==1||!rule(d.ruleSnapshot)||d.ruleSnapshot.id!==d.ruleId||!Number.isSafeInteger(d.workoutId)||d.workoutId<=0||!Array.isArray(d.sourceSetIds)||!d.sourceSetIds.length||d.sourceSetIds.some(id=>!stable(id))||!['accepted','edited','ignored'].includes(d.action)||!Number.isFinite(d.at)||d.at<0||!object(d.target)||!Number.isFinite(d.target.kg)||d.target.kg<0||d.target.kg>2000||!Number.isInteger(d.target.reps)||d.target.reps<1||d.target.reps>10000||typeof d.target.band!=='string'||d.target.band.length>80||typeof d.why!=='string'||d.why.length>2000)fail('progression decision');
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
    for(const r of data.routines||[])groups(r.trainingGroups,r.ex,'routine');
    if(data.exercisePreferences!=null&&!object(data.exercisePreferences))fail('exercisePreferences');
    for(const p of Object.values(data.exercisePreferences||{})){if(!object(p)||(p.rest!=null&&(!finite(p.rest)||!Number.isInteger(Number(p.rest))||Number(p.rest)<0||Number(p.rest)>600||(Number(p.rest)!==0&&Number(p.rest)<15)))||(p.equipmentLabel!=null&&(typeof p.equipmentLabel!=='string'||p.equipmentLabel.length>80||/[\u0000-\u001f]/.test(p.equipmentLabel))))fail('exercise preference');}
    const workout = (w, path) => {
      if (!object(w) || !Array.isArray(w.ex) || !date(w.d)) fail(path);
      if(w.name!=null&&w.name!==''&&!name(w.name))fail(path+'.name');
      if(w.planLink!=null&&(!object(w.planLink)||!stable(w.planLink.programmeId)||!stable(w.planLink.slotId)||!stable(w.planLink.routineId)||!date(w.planLink.scheduledDate)||!Number.isSafeInteger(w.planLink.rotationIndex)||w.planLink.rotationIndex<0))fail(path+'.planLink');
      groups(w.trainingGroups,w.ex,path);
      if(w.corrections!=null&&(!Array.isArray(w.corrections)||w.corrections.some(c=>!object(c)||!date(c.date)||(c.name!=null&&c.name!==''&&!name(c.name))||(c.correctedAt!=null&&(!finite(c.correctedAt)||Number(c.correctedAt)<0)))))fail(path+'.corrections');
      if(w.drafts!=null){if(!object(w.drafts))fail(path+'.drafts');for(const draft of Object.values(w.drafts)){if(!object(draft))fail(path+'.draft');for(const key of ['kg','reps','seconds','meters','note','rpe','band'])if(draft[key]!=null&&!['number','string'].includes(typeof draft[key]))fail(path+'.draft.'+key);for(const field of ['weightText','repsText'])if(draft[field]!=null&&typeof draft[field]!=='string')fail(path+'.draft.'+field);if(draft.warmup!=null&&typeof draft.warmup!=='boolean')fail(path+'.draft.warmup');if(draft.weightUnit!=null&&!['kg','lb'].includes(draft.weightUnit))fail(path+'.draft.weightUnit');if(options.importText===true)for(const field of ['note','band'])if(draft[field]!=null&&!importText(draft[field],field))fail(path+'.draft.'+field+' exceeds the restore text budget');}}
      for (const [i,x] of w.ex.entries()) {
        if (!object(x) || !name(x.n) || !Array.isArray(x.sets)) fail(path+'.ex['+i+']');
        if(x.exerciseId!=null&&(typeof x.exerciseId!=='string'||!x.exerciseId||x.exerciseId.length>160))fail(path+'.exerciseId');
        if(x.warmupQueue!=null&&!warmQueue(x.warmupQueue))fail(path+'.warmupQueue');
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
    const workoutIds=new Set(),completedSlots=new Set();data.workouts.forEach((w,i)=>{workout(w,'workouts['+i+']');if(w.id!=null){if(!Number.isSafeInteger(w.id)||w.id<=0||workoutIds.has(w.id))fail('duplicate or invalid workout identity');workoutIds.add(w.id);}if(w.planLink){if(completedSlots.has(w.planLink.slotId))fail('duplicate completed plan slot');completedSlots.add(w.planLink.slotId);}});
    if (data.cur!=null) workout(data.cur,'cur');
    if(data.editingId!=null&&(!data.cur||!Number.isSafeInteger(data.editingId)||!workoutIds.has(data.editingId)||data.cur.id!==data.editingId))fail('ambiguous editing identity');
    if (data.undo!=null) {
      const u=data.undo;
      if(!object(u)||!['set','exercise','workout','draft'].includes(u.type)||!object(u.record))fail('undo');
      if(u.type==='workout'||u.type==='draft')workout(u.record,'undo.record');
      else {
        if(!Number.isSafeInteger(u.workoutId)||u.workoutId<=0||!Number.isInteger(u.index)||u.index<0||(u.type==='set'&&typeof u.entryId!=='string'))fail('undo target');
        const ex=u.type==='exercise'?u.record:{n:'Recovered set',sets:[u.record]};
        workout({d:'2000-01-01',ex:[ex],...(u.type==='exercise'&&u.trainingGroups?{trainingGroups:u.trainingGroups}:{})},'undo.record');
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
    return {...backupSummary(data),checks:new Set(Object.keys(checks).map(n=>canonicalName(n,catalogue))).size,favourites:(data.favourites||[]).length,programmes:(data.programmesV1||[]).length,planSlots:(data.planSlots||[]).length,progressionRules:(data.progressionRules||[]).length,progressionDecisions:(data.progressionDecisions||[]).length,warmupPresets:(data.warmupPresets||[]).length,goals:(data.goalsV1||[]).length,groups:[...(data.workouts||[]),...(data.cur?[data.cur]:[]),...(data.routines||[])].reduce((n,w)=>n+(w.trainingGroups||[]).length,0)};
  }
  return {validateBackup,canonicalName,date,backupSummary,restoreSummary,number,IMPORT_TEXT_BUDGETS};
})();
