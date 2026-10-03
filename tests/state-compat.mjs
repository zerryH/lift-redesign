import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/old-state.json',import.meta.url),'utf8'));
const snapshotPath=new URL('./fixtures/old-state.snapshot.json',import.meta.url);
const num=v=>parseFloat(String(v).replace(',','.'))||0;
const safeName=v=>String(v??'').replace(/[<>"']/g,'').replace(new RegExp(String.fromCharCode(96),'g'),'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,80);
const iso=()=>new Date(1790960000000).toISOString().slice(0,10);
const safeDate=v=>{const s=String(v??'').slice(0,10),m=/^\d{4}-\d{2}-\d{2}$/.test(s),t=m?Date.parse(s+'T00:00:00Z'):NaN;return m&&Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===s?s:iso()};
function extractConst(name){
  const marker='const '+name+'=()=>{';
  const start=source.indexOf(marker); assert(start>=0,'missing '+marker);
  const brace=source.indexOf('{',start); let depth=0,inS='',esc=false;
  for(let i=brace;i<source.length;i++){
    const ch=source[i];
    if(inS){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch===inS)inS='';continue}
    if(ch==='"'||ch==="'"||ch===String.fromCharCode(96)){inS=ch;continue}
    if(ch==='{')depth++; else if(ch==='}'&&--depth===0)return source.slice(start+6,i+1);
  }
  throw new Error('unbalanced '+name);
}
const helperNames=['defaultSettings','settingFlag','settingBit','settingNumber','normalizeSettings'];const helperDecls=helperNames.map(extractDecl).join('\n');function extractDecl(name){
  const marker='const '+name+'=';
  const start=source.indexOf(marker);assert(start>=0,'missing '+marker);let b=0,p=0,a=0,inS='',esc=false;
  for(let i=start+marker.length;i<source.length;i++){
    const ch=source[i];
    if(inS){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch===inS)inS='';continue}
    if(ch==='"'||ch==="'"||ch===String.fromCharCode(96)){inS=ch;continue}
    if(ch==='{')b++;else if(ch==='}')b--;else if(ch==='(')p++;else if(ch===')')p--;else if(ch==='[')a++;else if(ch===']')a--;
    if(ch===';'&&b===0&&p===0&&a===0)return source.slice(start,i+1);
  }
  throw new Error('unbalanced '+name);
}
const repairFactory=Function('S','num','safeName','safeDate','TUTORIAL_VERSION',helperDecls+'\nreturn ('+extractConst('repairState')+');');
function run(){const S=JSON.parse(JSON.stringify(fixture));const repairState=repairFactory(S,num,safeName,safeDate,3);const old=Date.now;Date.now=()=>1790960000000;try{repairState()}finally{Date.now=old}return S}
const output=run();
if(!fs.existsSync(snapshotPath)){fs.writeFileSync(snapshotPath,JSON.stringify(output,null,2)+'\n');console.log('state-compat snapshot created')}else{const expected=JSON.parse(fs.readFileSync(snapshotPath,'utf8'));assert.deepEqual(output,expected,'repairState output changed from compatibility snapshot');console.log('state-compat ok')}
