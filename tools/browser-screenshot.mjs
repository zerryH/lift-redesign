// Capture a complete section without depending on animation-frame callbacks.
// Hosted WebKit can suspend those callbacks after a viewport resize.
export async function screenshotSection(page,locator,filename,timeout=12000){
 const original=page.viewportSize(),deadline=Date.now()+timeout;
 if(!original)throw new Error('Section capture requires a fixed viewport');
 try{
  await locator.waitFor({state:'visible',timeout});
  const height=await locator.evaluate(el=>el.getBoundingClientRect().height);
  if(height>original.height-160)await page.setViewportSize({...original,height:Math.ceil(height)+160});
  await locator.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
  let previous='',stable=0,clip;
  while(Date.now()<deadline){
   const box=await locator.evaluate(el=>{
    const r=el.getBoundingClientRect();let visible=r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;
    // A page clip must not silently crop the target inside an overflow container.
    for(let p=el.parentElement;p&&visible;p=p.parentElement){
     const s=getComputedStyle(p),b=p.getBoundingClientRect();
     if(/auto|scroll|hidden|clip/.test(s.overflowY))visible=r.top>=b.top&&r.bottom<=b.bottom;
     if(/auto|scroll|hidden|clip/.test(s.overflowX))visible=visible&&r.left>=b.left&&r.right<=b.right;
    }
    return {x:r.x,y:r.y,width:r.width,height:r.height,visible};
   });
   const key=JSON.stringify(box);
   stable=box.visible&&key===previous?stable+1:0;previous=key;
   if(stable>=2){const {visible,...rect}=box;clip=rect;break;}
   await page.waitForTimeout(100);
  }
  if(!clip)throw new Error('Section was not fully visible and stable within '+timeout+'ms');
  const remaining=deadline-Date.now();
  if(remaining<=0)throw new Error('Section capture exceeded '+timeout+'ms');
  await page.screenshot({path:filename,clip,timeout:remaining});
 }finally{
  const current=page.viewportSize();
  if(current&&(current.width!==original.width||current.height!==original.height))await page.setViewportSize(original);
 }
}
