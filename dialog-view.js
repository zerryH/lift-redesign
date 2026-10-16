let dialogReturnFocus=null,activeDialog=null;
const dialogFocus=new WeakMap(),inertBeforeDialog=new Map();
const dialogSelector='.sheet .sb,.exercise-library-panel,.action-card,.reset-card,.tutorial-shell,.install-guide-card,.rank-list-card,#storage-conflict';
const visibleDialog=el=>{
 if(el.hidden||el.checkVisibility?.()===false)return false;
 for(let parent=el.parentElement;parent;parent=parent.parentElement){if(parent.tagName==='DETAILS'&&!parent.open&&el!==parent.querySelector('summary'))return false;}
 return !el.getClientRects||el.getClientRects().length>0;
};
const focusableDialog=top=>[...top.querySelectorAll('button:not([disabled]),input:not([hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,a[href],[tabindex="0"]')].filter(visibleDialog);
const topDialog=()=>{const dialogs=[.../** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll(dialogSelector))].filter(visibleDialog);return dialogs.find(el=>el.id==='diagnostics-card')||dialogs.find(el=>el.id==='storage-conflict')||dialogs.at(-1);};
function manageDialogs(){
 const all=[...document.querySelectorAll(dialogSelector)],top=topDialog();
 for(const el of [.../** @type {HTMLCollectionOf<HTMLElement>} */(document.body.children||[])]){if(['SCRIPT','STYLE'].includes(el.tagName))continue;if(top){if(!inertBeforeDialog.has(el))inertBeforeDialog.set(el,!!el.inert);el.inert=!el.contains(top)&&el!==top;}else if(inertBeforeDialog.has(el)){el.inert=inertBeforeDialog.get(el);inertBeforeDialog.delete(el);}}
 for(const id of ['v','n']){const el=document.getElementById?.(id);if(el)el.inert=!!top;}
 if(top){top.setAttribute('role',top.id==='storage-conflict'?'alertdialog':'dialog');top.setAttribute('aria-modal','true');top.setAttribute('tabindex','-1');if(!top.getAttribute?.('aria-label')&&!top.getAttribute?.('aria-labelledby'))top.setAttribute('aria-label',top.querySelector('h2,b')?.textContent||'Slat dialog');
  if(top!==activeDialog){if(!activeDialog)dialogReturnFocus=document.activeElement;if(!dialogFocus.has(top))dialogFocus.set(top,document.activeElement);const previous=activeDialog;activeDialog=top;const back=previous&&!previous.isConnected?dialogFocus.get(previous):null;const el=back&&top.contains(back)&&visibleDialog(back)?back:focusableDialog(top)[0]||top;el?.focus?.({preventScroll:true});}
 }else if(activeDialog){activeDialog=null;const target=dialogReturnFocus;if(target?.isConnected)target.focus?.({preventScroll:true});else document.querySelector('#n [aria-current="page"]')?.focus?.({preventScroll:true});dialogReturnFocus=null;}
 for(const dialog of all)if(dialog!==top)dialog.setAttribute('aria-modal','false');
 document.body.classList.toggle?.('dialog-open',!!top);
}
document.addEventListener('keydown',/** @param {KeyboardEvent & {target: HTMLElement}} e */ e=>{
 const top=topDialog();if(!top)return;
 if(e.key==='Escape'){e.preventDefault();const close=top.querySelector('[data-a=gx],[data-a=closex],[data-a=legalClose],[data-qol=closeModal],[data-rank-guide-close],[data-action-cancel],[data-reset-cancel],[data-ig=close],[data-tut=skip]');close?.click();queueMicrotask(()=>manageDialogs());return;}
 if(e.key==='Tab'){const nodes=focusableDialog(top),first=nodes[0],last=nodes.at(-1);if(!nodes.length){e.preventDefault();top.focus();return;}if(e.shiftKey&&(document.activeElement===first||!top.contains(document.activeElement))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!top.contains(document.activeElement))){e.preventDefault();first.focus()}}
});
document.addEventListener('click',()=>queueMicrotask(()=>manageDialogs()));
