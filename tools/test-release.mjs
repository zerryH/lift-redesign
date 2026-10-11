/* Independent workspaces prevent build tests from hiding stale committed output. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),tests=fs.readdirSync('tests').filter(n=>n.endsWith('.mjs')).sort();
let failed=0;
for(const test of tests){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'slat-release-'));
 try{
  fs.cpSync(root,dir,{recursive:true,filter:p=>!p.split(path.sep).some(x=>x==='.git'||x==='node_modules')});
  const r=spawnSync(process.execPath,['tests/'+test],{cwd:dir,encoding:'utf8',timeout:45000,maxBuffer:8*1024*1024});
  if(r.status!==0){failed++;console.error('FAIL '+test+'\n'+(r.stderr||r.error||r.stdout).toString().slice(-1800));}else console.log('PASS '+test);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
console.log(`${tests.length-failed}/${tests.length} scripts passed`);process.exitCode=failed?1:0;
