/* Optional training tools. Source records remain authoritative; no performance cache. */
let exercisePickerMode='All',quickInputRevision=0,quickLastAction=null;
const favouriteIds=()=>Array.isArray(S.favourites)?S.favourites:[];
function recentExerciseIds(){
 const ids=[];for(const w of [...rankWorkouts()].sort((a,b)=>b.d.localeCompare(a.d)||b.id-a.id))for(const x of [...w.ex].reverse())if(x.sets.length){const id=x.exerciseId||catalogueRecord(x.n)?.id;if(id&&!ids.includes(id))ids.push(id);}
 return ids.slice(0,40);
}
function quickExerciseNames(names){
 const ids=exercisePickerMode==='Pinned'?favouriteIds():exercisePickerMode==='Recent'?recentExerciseIds():null;
 return ids?names.filter(n=>ids.includes(catalogueRecord(n)?.id)).sort((a,b)=>ids.indexOf(catalogueRecord(a)?.id)-ids.indexOf(catalogueRecord(b)?.id)):names;
}
function quickPickerMarkup(){return `<div class="chips quick-picker-tabs" aria-label="Exercise list">${['All','Pinned','Recent'].map(mode=>`<button class=pill data-a=pickerMode data-v="${mode}" aria-pressed="${exercisePickerMode===mode}">${mode}</button>`).join('')}<button class=pill data-a=pinOrder>Pin order</button></div>`;}
function quickPinMarkup(n){const id=catalogueRecord(n)?.id,pinned=favouriteIds().includes(id);return `<button class="pill pin-exercise" data-a=pinExercise data-v="${esc(id||'')}" aria-pressed="${pinned}" aria-label="${pinned?'Unpin':'Pin'} ${esc(displayExercise(n))}">${pinned?'Pinned':'Pin'}</button>`;}
async function saveFavourites(next){
 if(!stateMutationAllowed())return false;const before=S.favourites,owner=S;S.favourites=[...next];importing=true;
 try{if(await save())return true;if(S===owner)S.favourites=before;toast('Pins could not be saved. Try again.');return false;}finally{importing=false;}
}
A.pickerMode=d=>{if(!['All','Pinned','Recent'].includes(d.v))return;exercisePickerMode=d.v;exercisePicker();};
A.pinExercise=async d=>{if(!d.v)return;const ids=favouriteIds(),next=ids.includes(d.v)?ids.filter(id=>id!==d.v):[...ids,d.v];if(next.length>500)return toast('You can pin up to 500 exercises');if(await saveFavourites(next))exercisePicker();};
function showPinOrder(){
 const ids=favouriteIds();qolOpenModal('Pinned exercise order',`<p class=support-copy>Pins use stable exercise IDs, so renaming a custom exercise keeps its place. Archived exercises remain here until you unpin them.</p>${ids.map((id,i)=>{const n=Object.keys(EX).find(n=>canonicalExercise(n)===n&&catalogueRecord(n)?.id===id);return `<div class="row pin-order-row"><b>${esc(n?displayExercise(n):'Unavailable exercise')}</b><div class=chips><button class=pill data-a=pinMove data-v="${esc(id)}" data-step=-1 ${i===0?'disabled':''} aria-label="Move ${esc(n||id)} earlier">Earlier</button><button class=pill data-a=pinMove data-v="${esc(id)}" data-step=1 ${i===ids.length-1?'disabled':''} aria-label="Move ${esc(n||id)} later">Later</button><button class=pill data-a=pinRemove data-v="${esc(id)}">Unpin</button></div></div>`;}).join('')||'<p>No pins yet. Use Pin beside an exercise in the picker.</p>'}`);
}
A.pinOrder=()=>showPinOrder();
A.pinMove=async d=>{const ids=[...favouriteIds()],i=ids.indexOf(d.v),j=i+Number(d.step);if(i<0||![-1,1].includes(Number(d.step))||j<0||j>=ids.length)return;[ids[i],ids[j]]=[ids[j],ids[i]];if(await saveFavourites(ids))showPinOrder();};
A.pinRemove=async d=>{if(await saveFavourites(favouriteIds().filter(id=>id!==d.v)))showPinOrder();};
function quickLogAttempt(event,action){
 const x=S.cur?.ex?.[ci],key=JSON.stringify([S.cur?.id,x?.entryId,dr.kg,dr.reps,dr.seconds,dr.meters,dr.band,quickInputRevision]),at=Number(event.timeStamp);
 if(Number.isFinite(at)&&quickLastAction?.key===key&&at>=quickLastAction.at&&at-quickLastAction.at<350)return false;
 const logged=action();if(logged&&Number.isFinite(at))quickLastAction={key,at};return logged;
}
document.addEventListener('input',e=>{if(['qol-weight','qol-reps','log-seconds','log-meters','log-band','qol-note','qol-rpe','ws','rs','rp'].includes(/** @type {HTMLElement} */(e.target).id))quickInputRevision++;});
// An intervening control action starts a new intent (for example Stop rest, then Log).
document.addEventListener('click',e=>{const control=/** @type {HTMLElement} */(e.target).closest?.('[data-a],[data-qol]');if(control&&control.dataset.a!=='log')quickInputRevision++;});
function loggedUndoTarget(){const u=S.logUndo;if(!u||S.cur?.id!==u.workoutId)return null;const x=S.cur.ex.find(x=>x.entryId===u.entryId),index=x?.sets.findIndex(z=>z.id===u.setId);return x&&index>=0?{u,x,index}:null;}
function loggedUndoMarkup(){const target=loggedUndoTarget();return target?`<section class="note logged-undo" role=status><span>Set logged · ${esc(displayExercise(target.x.n))}</span><button class=pill data-a=undoLog>Undo log</button></section>`:'';}
A.undoLog=async()=>{
 if(!stateMutationAllowed())return;const target=loggedUndoTarget();if(!target)return;const previous=JSON.parse(JSON.stringify(S));finishing=true;
 target.x.sets.splice(target.index,1);S.logUndo=null;
 try{if(!await save()){S=previous;rebuildRegistry();toast('Undo was not saved. The set is still present.');return;}qolStopRest();toast('Logged set undone');}finally{finishing=false;render();}
};
const trainingToday=V.today;V.today=function(){return trainingToday()+loggedUndoMarkup();};
const trainingSettings=V.settings;V.settings=function(){return trainingSettings()+`<section class=note><b>Comparison settings</b><p class=support-copy>Changing reference table, age, height or adjustment settings recalculates comparisons using current standards. It never rewrites your original set loads or recorded context. Tiers are product heuristics, not population percentiles.</p></section>`;};

function trainingSetupKey(n,z){
 const p=z.loadProtocol;return JSON.stringify([z.equipmentContext?.label||'',SlatPerformance.mode(z,catalogueRecord(n)),p?{mode:p.mode,multiplier:p.multiplier,unilateral:!!p.unilateral,bodyweightFactor:p.bodyweightFactor}:null]);
}
function rankInspection(n){
 n=canonicalExercise(n);const groups=new Map(),excluded=[];bests();const earned=bestSet[n];
 for(const w of S.workouts||[])for(const x of w.ex||[])if(canonicalExercise(x.n)===n)for(const z of x.sets||[]){
  const b=num(z.bw)||bwAtDate(w.d),e=rankSetEst(n,z,b),reason=!rankDateEligible(w,iso())?'Future-dated workout':z.t==='w'?'Warm-up':!rankThresholds(n)?'No strength benchmark for this movement':!b?'No bodyweight for this date':!e?'Unsupported measurements, protocol or repetitions (ranked range: 1–12)':'';
  const item={workoutId:w.id,entryId:x.entryId,setId:z.id,date:w.d,set:z,bodyweight:b,estimate:e,score:e?rankScore(n,e,b,num(z.height)||num(S.set.heightCm)||null):0};
  if(reason){excluded.push({...item,reason});continue;}
  const key=trainingSetupKey(n,z),current=groups.get(key);if(!current||item.score>current.score)groups.set(key,item);
 }
 return {name:n,earned,groups:[...groups.values()],excluded};
}
const inspectorRow=(label,value)=>`<div class=inspector-row><dt>${esc(label)}</dt><dd>${esc(String(value??'Not recorded'))}</dd></div>`;
function rankSourceMarkup(item,earned){
 const z=item.set,p=z.loadProtocol,c=z.performanceContext,u=z.sourceUnit;
 const rows=[['Completed workout',item.workoutId+' · '+item.date],['Set ID',z.id||'Legacy set without recorded identity'],['Recorded load',String(z.kg)+' kg (canonical storage)'],['Entered units',u||'Not recorded on this legacy set'],['Repetitions',z.reps],['Current estimated 1RM',String(item.estimate)+' kg · includes the current reliability rule'],['Equipment setup',z.equipmentContext?.label||'Unlabelled setup'],['Load convention',p?(p.unilateral?'One working side':Number(p.multiplier)===2?'Per implement · two implements':'Total / one implement')+' · '+p.mode+' · multiplier '+p.multiplier:'Not recorded · current catalogue comparison'],['Recorded bodyweight / height',(z.bw??'Not recorded')+' kg / '+(z.height??'Not recorded')+' cm'],['Recorded context',c?c.reference+' table · age '+(c.age??'not recorded')+' · age adjustment '+c.ageAdjust+' · height adjustment '+c.heightAdjust+' · '+c.workoutDate+' · '+(c.timeZone||'time zone not recorded'):'Not recorded · comparison uses current context'],['Recorded catalogue / standards',(z.catalogueVersion??'Not recorded')+' / '+(z.standardsVersion??'Not recorded')],['Current standards',rankingVersion()+' · '+rankingSex()+' reference'],['Source identity',(item.entryId||'Legacy entry')+' / '+(z.exerciseId||'Legacy exercise')]];
 return `<section class="note rank-source"><b>${earned?.id===z.id&&earned?.workoutId===item.workoutId?'Contributes the shown earned rank':'Best comparable set for this setup'}</b><dl>${rows.map(([a,b])=>inspectorRow(a,b)).join('')}</dl></section>`;
}
A.inspectRank=d=>{
 const info=rankInspection(d.v);qolOpenModal('Rank & setup · '+displayExercise(info.name),`<p class=support-copy>Only completed history can earn a rank. Drafts and saved calculator checks are separate. These tiers are product heuristics, not population percentiles. Independent catalogue and standards review is still required.</p><p class=support-copy>Estimates below use current comparison settings and standards. Logged loads and their recorded context remain unchanged. Different setup/protocol groups are shown separately.</p>${info.groups.map(item=>rankSourceMarkup(item,info.earned)).join('')||'<p>No eligible completed set for this movement.</p>'}<details><summary>Excluded sets (${info.excluded.length})</summary>${info.excluded.map(item=>`<p>${esc(item.date)} · ${esc(item.setId||'legacy set')} · ${esc(item.reason)}</p>`).join('')||'<p>No excluded sets.</p>'}</details><div class=chips><button class=pill data-a=inspectComparisons>Review comparison settings</button></div>`);
};
A.inspectComparisons=()=>confirmAction('Comparison settings','Changing reference table, age, height or adjustments recalculates ranks with current standards. Original set loads and recorded context are retained.','Open Profile',()=>{qolCloseModal();view='settings';nav();render();queueViewTop();});
