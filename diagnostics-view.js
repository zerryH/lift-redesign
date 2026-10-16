/* Explicit preview/copy only. Reports are never sent automatically. */
const openDiagnosticsReport=(exerciseId='')=>{
 const m=qolOpenModal('Private diagnostics',`<div class="qol-form diagnostics-form"><p class=support-copy>Review the exact report below before copying. It includes device support and fixed error codes, without reading workouts, names, notes, age, bodyweight or backups. Nothing is uploaded. Custom exercise names and identifiers are omitted.</p><label>Reproduction steps (optional)<textarea id=diagnostic-steps maxlength=2000 rows=3 placeholder="What did you tap, what happened, and what did you expect?"></textarea></label><small>Your own text can contain personal information. Check it before copying. No attachment is included.</small><label>Exact report preview<textarea id=diagnostic-preview rows=12 readonly spellcheck=false></textarea></label><div class=chips><button class=pill id=diagnostic-copy>Copy diagnostic report</button><button class=pill id=diagnostic-clear>Clear local events</button></div><p id=diagnostic-status role=status aria-live=polite></p></div>`);
 m.querySelector('.action-card').id='diagnostics-card';
 m.querySelectorAll('[data-qol=closeModal]').forEach(control=>control.addEventListener('click',()=>{qolCloseModal();manageDialogs();}));
 const steps=m.querySelector('#diagnostic-steps'),preview=m.querySelector('#diagnostic-preview'),copy=m.querySelector('#diagnostic-copy'),clear=m.querySelector('#diagnostic-clear'),status=m.querySelector('#diagnostic-status');
 const refresh=()=>{preview.value=SlatDiagnostics.report({build:BUILD_VERSION,steps:steps.value,exerciseId,catalogueVersion:X?.catalogueVersion,saveStatus:persistenceStatus});};
 refresh();steps.addEventListener('input',refresh);
 copy.addEventListener('click',async()=>{
  if(copy.disabled)return;const exact=preview.value;copy.disabled=true;steps.disabled=true;clear.disabled=true;
  try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(exact);status.textContent='Report copied. Share it only with someone you choose.';}
  catch{preview.focus();preview.select();status.textContent='Automatic copy is unavailable. Select and copy the preview manually.';}
  finally{copy.disabled=false;steps.disabled=false;clear.disabled=false;}
 });
 clear.addEventListener('click',()=>{if(clear.disabled)return;status.textContent=SlatDiagnostics.clear()?'Local events cleared. Workout data was not changed.':'Local events could not be cleared. Current records were not changed.';refresh();});
 manageDialogs();return m;
};
A.diagnostics=()=>openDiagnosticsReport();
const diagnosticsSettings=V.settings;V.settings=()=>diagnosticsSettings()+`<section class=note><b>Private device diagnostics</b><p class=support-copy>Preview device support and redacted error codes before you explicitly copy a report.</p><button class=pill data-a=diagnostics>Diagnostics</button></section>`;
const diagnosticExerciseOptions=A.exerciseOptions;A.exerciseOptions=()=>{
 if(!S.cur?.ex?.[ci])return;const id=catalogueRecord(S.cur.ex[ci].n)?.id||'';diagnosticExerciseOptions();
 const button=document.createElement('button');button.type='button';button.className='pill';button.id='diagnostic-exercise';button.textContent='Report an exercise problem';button.addEventListener('click',()=>openDiagnosticsReport(id));qolState.modal?.querySelector('.action-card')?.append(button);
};
