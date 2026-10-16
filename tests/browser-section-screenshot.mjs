import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source=fs.readFileSync('tools/browser-screenshot.mjs','utf8').replace('export async function','async function');
async function fixture({moving=false,clipped=false,captureError=false}={}){
 let time=0,viewport={width:320,height:720},reads=0,scrolls=0,capture=null;
 const parent={parentElement:null,getBoundingClientRect:()=>({left:0,right:320,top:0,bottom:viewport.height-58})};
 const el={parentElement:parent,scrollIntoView:()=>scrolls++,getBoundingClientRect:()=>({x:14,y:moving?++reads:20,left:14,right:306,top:20,bottom:clipped?viewport.height:799,width:292,height:779})};
 const page={viewportSize:()=>({...viewport}),setViewportSize:async v=>viewport={...v},waitForTimeout:async ms=>time+=ms,screenshot:async options=>{capture=options;if(captureError)throw Error('capture failed');}};
 const locator={waitFor:async()=>{},evaluate:fn=>fn(el)};
 const ctx=vm.createContext({Date:{now:()=>time},Error,JSON,Math,getComputedStyle:()=>({overflowY:'auto',overflowX:'hidden'}),get innerWidth(){return viewport.width},get innerHeight(){return viewport.height}});
 vm.runInContext(source+'\nglobalThis.capture=screenshotSection;',ctx);
 // Evaluate the browser callback in its own DOM scope; no animation frames run.
 locator.evaluate=fn=>vm.runInContext('('+fn.toString()+')(el)',Object.assign(ctx,{el}));
 let error;try{await ctx.capture(page,locator,'summary.png',500);}catch(e){error=e;}
 return {viewport,scrolls,capture,error,time};
}
const valid=await fixture();assert.equal(valid.error,undefined);assert.equal(valid.scrolls,1);assert.deepEqual(valid.viewport,{width:320,height:720});assert.deepEqual(JSON.parse(JSON.stringify(valid.capture.clip)),{x:14,y:20,width:292,height:779});assert(valid.capture.timeout<=500);assert.equal(valid.time,200,'two timer-backed stable samples are required without animation frames');
for(const scenario of [{moving:true},{clipped:true}]){const f=await fixture(scenario);assert.match(f.error.message,/fully visible and stable within 500ms/);assert.equal(f.capture,null);assert.equal(f.time,500);assert.deepEqual(f.viewport,{width:320,height:720});}
const failure=await fixture({captureError:true});assert.match(failure.error.message,/capture failed/);assert.deepEqual(failure.viewport,{width:320,height:720});
console.log('Section screenshots retain complete tall content, reject moving/clipped geometry, propagate capture failures and restore the original narrow viewport without animation frames');
