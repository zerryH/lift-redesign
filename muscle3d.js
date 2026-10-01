(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const activeStages=new Set();
const defaults={frontDelts:'#9aa8c0',sideDelts:'#9aa8c0',chest:'#9aa8c0',biceps:'#9aa8c0',triceps:'#9aa8c0',abs:'#9aa8c0',quads:'#9aa8c0',calves:'#9aa8c0',rearDelts:'#9aa8c0',upperBack:'#9aa8c0',lats:'#9aa8c0',glutes:'#9aa8c0',hamstrings:'#9aa8c0'};
function init(stage){if(stage.dataset.procedural3d==='1')return;const old=$('.body-spin',stage);if(!old)return;stage.dataset.procedural3d='1';activeStages.add(stage);old.style.display='none';
 const mount=document.createElement('div');mount.className='muscle3d-root';mount.setAttribute('aria-label','Interactive 3D muscle anatomy. Drag to rotate. Muscle colours reflect your ranks.');stage.appendChild(mount);
 if(!window.THREE){mount.innerHTML='<div class="muscle3d-error">3D graphics could not start. Please reload Lift.</div>';return}
 const T=window.THREE,scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,100);camera.position.set(0,.24,5.5);camera.lookAt(0,.24,0);
 let renderer;try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(err){mount.innerHTML='<div class="muscle3d-error">This browser could not start 3D graphics. Try reopening Lift in Safari.</div>';return}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.setClearColor(0x000000,0);if('outputColorSpace'in renderer)renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.domElement.className='muscle3d-canvas';renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Rotatable three dimensional muscle model');mount.appendChild(renderer.domElement);
 scene.add(new T.HemisphereLight(0xdceaff,0x182036,2.05));const key=new T.DirectionalLight(0xffffff,3.1);key.position.set(-3,4,5);scene.add(key);const rim=new T.DirectionalLight(0x7c8fff,2.4);rim.position.set(3,1,-4);scene.add(rim);const fill=new T.DirectionalLight(0xffffff,.8);fill.position.set(2,-2,4);scene.add(fill);
 const body=new T.Group();scene.add(body);const spheres=new T.SphereGeometry(1,32,24);const materials=new Map();let rankMap={};
 function getRank(id){return rankMap[id]||rankMap[id==='sideDelts'?'frontDelts':id]||null}
 function makeMaterial(id,base=false){const mat=new T.MeshStandardMaterial({color:base?'#9ba9c0':'#929eb4',roughness:.43,metalness:.12,transparent:true,opacity:base?.28:.52,depthWrite:false,side:T.DoubleSide,emissive:base?'#27344b':'#1a273e',emissiveIntensity:.28});mat.userData={id,base};return mat}
 function add(id,x,y,z,sx,sy,sz,rot=0,base=false){const mat=makeMaterial(id,base),mesh=new T.Mesh(spheres,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.z=rot;mesh.userData.muscleId=id;mesh.userData.base=base;body.add(mesh);
  const outline=new T.Mesh(spheres,new T.MeshBasicMaterial({color:0xe7f1ff,side:T.BackSide,transparent:true,opacity:base?.15:.27,depthWrite:false}));outline.position.copy(mesh.position);outline.rotation.copy(mesh.rotation);outline.scale.set(sx*1.035,sy*1.035,sz*1.035);outline.userData.outline=true;body.add(outline);mesh.userData.outline=outline;materials.set(mesh,mat);return mesh}
 // Neutral holographic muscle masses: no skeleton, no skin shell.
 add('base',0,1.68,0,.125,.17,.12,0,true);add('base',0,1.43,0,.105,.20,.10,0,true);
 add('base',0,.91,0,.405,.46,.205,0,true);add('base',0,.52,0,.285,.31,.17,0,true);add('base',0,.25,0,.31,.20,.18,0,true);
 for(const s of [-1,1]){const rot=s*.14;
  add('base',s*.48,1.08,0,.155,.22,.145,rot,true);add('base',s*.57,.83,0,.12,.30,.12,rot,true);add('base',s*.65,.48,0,.09,.27,.09,s*.08,true);add('base',s*.68,.19,.015,.09,.105,.075,0,true);
  add('base',s*.20,-.17,0,.155,.40,.145,s*.025,true);add('base',s*.155,-.66,0,.11,.36,.11,s*-.025,true);add('base',s*.16,-1.02,.035,.095,.085,.17,s*.02,true);
 }
 // Front anatomy: rounded, separate muscle bellies with translucent surfaces.
 for(const s of [-1,1]){
  add('frontDelts',s*.435,1.14,.105,.17,.18,.145,s*-.18);add('sideDelts',s*.49,1.12,0,.105,.17,.13,s*-.14);
  add('chest',s*.205,.99,.205,.225,.165,.075,s*.055);
  add('biceps',s*.545,.84,.105,.093,.235,.09,s*.13);
  add('triceps',s*.565,.84,-.105,.095,.235,.09,s*.13);
  add('abs',s*.095,.70,.178,.083,.075,.045,s*.025);add('abs',s*.095,.565,.174,.081,.068,.043,s*.025);add('abs',s*.09,.435,.16,.075,.06,.04,s*.025);
  add('abs',s*.255,.53,.13,.065,.16,.045,s*.16);
  add('quads',s*.19,-.17,.12,.132,.34,.078,s*.025);
  add('calves',s*.16,-.68,.095,.09,.265,.075,s*-.025);
  add('rearDelts',s*.445,1.14,-.105,.16,.17,.13,s*-.18);
  add('upperBack',s*.155,.98,-.19,.155,.245,.07,s*-.1);
  add('lats',s*.245,.70,-.155,.145,.29,.065,s*-.12);
  add('glutes',s*.15,.255,-.145,.15,.145,.065,s*-.035);
  add('hamstrings',s*.19,-.19,-.115,.12,.32,.07,s*-.025);
  add('calves',s*.16,-.68,-.095,.088,.25,.07,s*-.025);
 }
 // Subtle anatomical separation lines on the front torso, built as curves rather than bones.
 function seam(points,opacity=.32){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const l=new T.Line(g,new T.LineBasicMaterial({color:0xe5efff,transparent:true,opacity,depthWrite:false}));body.add(l);return l}
 seam([[0,1.12,.276],[0,1.00,.282],[0,.89,.25]],.24);
 for(const y of [.635,.50,.375])seam([[-.02,y,.224],[0,y-.008,.23],[.02,y,.224]],.30);
 const rankStyle=()=>{const next={};$$('.muscle-zone').forEach(el=>{const id=el.dataset.muscle,c=getComputedStyle(el).getPropertyValue('--mc').trim(),a=getComputedStyle(el).getPropertyValue('--ma').trim();if(id&&c)next[id]={color:c,locked:el.classList.contains('locked'),alpha:Number(a)||.78}});rankMap=next;
  materials.forEach((mat,mesh)=>{const id=mesh.userData.muscleId,r=getRank(id);if(mesh.userData.base){mat.color.set('#a5b2c7');mat.opacity=.24;mat.emissive.set('#26354d');return}if(r&&!r.locked){mat.color.set(r.color);mat.opacity=.86;mat.emissive.set(r.color);mat.emissiveIntensity=.19;mesh.userData.outline.material.opacity=.40}else{mat.color.set('#a3afc3');mat.opacity=.52;mat.emissive.set('#243149');mat.emissiveIntensity=.22;mesh.userData.outline.material.opacity=.31}}
  )};
 let yaw=0,targetYaw=0,pitch=0,targetPitch=0,drag=null,raf=0,disposed=false;
 function resize(){const r=mount.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 function frame(){raf=0;if(disposed)return;yaw+=(targetYaw-yaw)*.18;pitch+=(targetPitch-pitch)*.18;body.rotation.y=yaw;body.rotation.x=pitch;renderer.render(scene,camera);if(Math.abs(targetYaw-yaw)>.001||Math.abs(targetPitch-pitch)>.001)raf=requestAnimationFrame(frame)}
 function wake(){if(!raf)raf=requestAnimationFrame(frame)}
 const onDown=e=>{drag={x:e.clientX,y:e.clientY,yaw:targetYaw,pitch:targetPitch};renderer.domElement.setPointerCapture?.(e.pointerId);renderer.domElement.classList.add('dragging');e.preventDefault()};const onMove=e=>{if(!drag)return;targetYaw=drag.yaw+(e.clientX-drag.x)*.012;targetPitch=Math.max(-.22,Math.min(.22,drag.pitch+(e.clientY-drag.y)*.004));wake()};const onUp=()=>{drag=null;renderer.domElement.classList.remove('dragging')};renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointermove',onMove);renderer.domElement.addEventListener('pointerup',onUp);renderer.domElement.addEventListener('pointercancel',onUp);
 const onTurn=e=>{const b=e.target.closest('[data-muscle-turn]');if(!b||!stage.contains(b))return;targetYaw=(Number(b.dataset.muscleTurn)||0)<0?0:Math.PI;targetPitch=0;wake()};document.addEventListener('click',onTurn);
 rankStyle();const mo=new MutationObserver(()=>{rankStyle();wake()});mo.observe(stage,{subtree:true,attributes:true,attributeFilter:['style','class']});const ro=window.ResizeObserver?new ResizeObserver(()=>{resize();wake()}):null;if(ro)ro.observe(stage);else window.addEventListener('resize',resize);resize();wake();
 stage._lift3dCleanup=()=>{disposed=true;cancelAnimationFrame(raf);mo.disconnect();ro?.disconnect();document.removeEventListener('click',onTurn);renderer.dispose();spheres.dispose();materials.forEach(m=>m.dispose());mount.remove()};
 }
 const scan=()=>{for(const st of activeStages){if(!st.isConnected){st._lift3dCleanup?.();activeStages.delete(st)}}$$('.body-stage').forEach(init)};const observer=new MutationObserver(scan);observer.observe(document.documentElement,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
})();
