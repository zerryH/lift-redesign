(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const activeStages=new Set();
const MUSCLE_IDS=['frontDelts','sideDelts','chest','biceps','triceps','abs','quads','calves','rearDelts','upperBack','lats','glutes','hamstrings'];
function init(stage){
 if(stage.dataset.procedural3d==='1'||stage.dataset.procedural3d==='failed')return;
 const old=$('.body-spin',stage);if(!old)return;
 stage.dataset.procedural3d='1';activeStages.add(stage);
 const mount=document.createElement('div');mount.className='muscle3d-root';mount.setAttribute('aria-label','Interactive 3D muscle anatomy. Drag to rotate. Muscle colours follow your rank.');stage.appendChild(mount);
 const fallback=()=>{mount.remove();old.style.display='block';stage.dataset.procedural3d='failed';stage.classList.add('muscle3d-fallback')};
 if(!window.THREE){fallback();return}
 const T=window.THREE,scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.22,5.25);camera.lookAt(0,.22,0);
 let renderer;try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(err){fallback();return}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setClearColor(0x000000,0);if('outputColorSpace'in renderer)renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.domElement.className='muscle3d-canvas';renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Rotatable three-dimensional anatomical muscle model');mount.appendChild(renderer.domElement);
 scene.add(new T.HemisphereLight(0xe5edff,0x20283a,2.1));const key=new T.DirectionalLight(0xffffff,3.0);key.position.set(-3.5,4.5,5);scene.add(key);const rim=new T.DirectionalLight(0x8b9dff,2.0);rim.position.set(2.5,2,-4);scene.add(rim);const fill=new T.DirectionalLight(0xffffff,.75);fill.position.set(2,-2,4);scene.add(fill);
 const body=new T.Group();scene.add(body);const sphere=new T.SphereGeometry(1,40,32),geometries=[sphere],materials=[];let rankMap={};
 function material(color,roughness=.56,metalness=.02){const m=new T.MeshStandardMaterial({color,roughness,metalness,transparent:false,opacity:1,depthWrite:true,side:T.FrontSide});materials.push(m);return m}
 const skin=material('#929aaa',.72), skinLight=material('#a5adba',.68), muscleMats=new Map();
 function ellipsoid(parent,mat,x,y,z,sx,sy,sz,rz=0,rx=0){const mesh=new T.Mesh(sphere,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,0,rz);parent.add(mesh);return mesh}
 // Smooth, continuous torso shell built from anatomical cross-section rings (not stacked balls).
 function torsoGeometry(){const rings=[
  [1.28,.12,.105],[1.20,.22,.145],[1.10,.34,.185],[.99,.355,.205],[.86,.315,.185],[.73,.255,.15],[.58,.205,.13],[.43,.20,.13],[.29,.245,.15],[.16,.255,.155],[.08,.19,.12]
 ];const seg=48,verts=[],idx=[];
  for(const [y,rx,rz] of rings)for(let j=0;j<seg;j++){const a=j/seg*Math.PI*2;verts.push(Math.cos(a)*rx,y,Math.sin(a)*rz)}
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<seg;j++){const a=i*seg+j,b=i*seg+(j+1)%seg,c=(i+1)*seg+j,d=(i+1)*seg+(j+1)%seg;idx.push(a,b,c,b,d,c)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(idx);g.computeVertexNormals();geometries.push(g);return g}
 const torso=new T.Mesh(torsoGeometry(),skin);body.add(torso);
 // A solid opaque base body sits behind every muscle and prevents any rear anatomy showing through the front.
 ellipsoid(body,skinLight,0,1.55,0,.135,.205,.13);
 const neck=new T.Mesh(new T.CylinderGeometry(.085,.105,.19,24,1),skinLight);neck.position.set(0,1.34,0);body.add(neck);geometries.push(neck.geometry);
 ellipsoid(body,skinLight,0,1.73,0,.145,.19,.14);
 for(const s of [-1,1]){
  ellipsoid(body,skin,s*.35,1.12,0,.19,.145,.16,s*-.1);
  ellipsoid(body,skin,s*.49,.82,0,.105,.26,.105,s*.11);
  ellipsoid(body,skin,s*.555,.48,0,.078,.235,.078,s*-.07);
  ellipsoid(body,skinLight,s*.575,.22,.005,.067,.095,.065);
  ellipsoid(body,skin,s*.155,-.27,0,.135,.365,.13,s*.025);
  ellipsoid(body,skin,s*.135,-.72,.005,.092,.31,.09,s*-.015);
  ellipsoid(body,skinLight,s*.135,-1.035,.035,.075,.075,.12,s*.08);
 }
 const muscleMeshes=[];
 function muscle(id,x,y,z,sx,sy,sz,rz=0,rx=0){const mat=material('#7e899d',.5,.015);mat.userData.muscleId=id;const mesh=ellipsoid(body,mat,x,y,z,sx,sy,sz,rz,rx);mesh.userData.muscleId=id;muscleMeshes.push(mesh);return mesh}
 // Front: paired pectorals, segmented abs, arm flexors and quadriceps sit just above the opaque skin shell.
 for(const s of [-1,1]){
  muscle('frontDelts',s*.405,1.105,.105,.145,.15,.115,s*-.17);
  muscle('sideDelts',s*.465,1.09,0,.105,.14,.115,s*-.12);
  muscle('chest',s*.177,.965,.188,.185,.132,.055,s*.055);
  muscle('biceps',s*.505,.80,.087,.073,.185,.061,s*.12);
  muscle('triceps',s*.515,.80,-.078,.073,.19,.062,s*.10);
  for(const [y,sy] of [[.755,.061],[.635,.058],[.515,.054],[.405,.047]])muscle('abs',s*.075,y,.147,.064,sy,.031,s*.035);
  muscle('abs',s*.205,.54,.125,.05,.145,.027,s*.20);
  muscle('quads',s*.155,-.285,.105,.105,.285,.057,s*.025);
  muscle('calves',s*.135,-.735,.073,.069,.205,.052,s*-.025);
 }
 // Back muscles live on the rear surface; the solid torso occludes them completely from the front view.
 for(const s of [-1,1]){
  muscle('rearDelts',s*.405,1.105,-.105,.14,.145,.10,s*-.17);
  muscle('triceps',s*.515,.80,-.086,.074,.19,.06,s*.10);
  muscle('upperBack',s*.115,.98,-.172,.105,.205,.045,s*-.07);
  muscle('lats',s*.205,.70,-.142,.115,.235,.045,s*-.15);
  muscle('glutes',s*.13,.16,-.135,.12,.12,.045,s*-.025);
  muscle('hamstrings',s*.15,-.30,-.095,.095,.275,.05,s*-.02);
  muscle('calves',s*.135,-.735,-.07,.067,.20,.05,s*-.025);
 }
 function getRank(id){return rankMap[id]||null}
 const rankStyle=()=>{const next={};$$('.muscle-zone').forEach(el=>{const id=el.dataset.muscle,c=getComputedStyle(el).getPropertyValue('--mc').trim(),a=getComputedStyle(el).getPropertyValue('--ma').trim();if(id&&c)next[id]={color:c,locked:el.classList.contains('locked'),alpha:Number(a)||.78}});rankMap=next;
  muscleMeshes.forEach(mesh=>{const id=mesh.userData.muscleId,r=getRank(id),mat=mesh.material;if(r&&!r.locked){mat.color.set(r.color);mat.emissive.set(r.color);mat.emissiveIntensity=.10}else{mat.color.set('#737f93');mat.emissive.set('#202a3c');mat.emissiveIntensity=.025}mat.needsUpdate=true})};
 let yaw=0,targetYaw=0,pitch=0,targetPitch=0,drag=null,raf=0,disposed=false;
 function resize(){const r=mount.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 function frame(){raf=0;if(disposed)return;yaw+=(targetYaw-yaw)*.2;pitch+=(targetPitch-pitch)*.2;body.rotation.y=yaw;body.rotation.x=pitch;renderer.render(scene,camera);if(Math.abs(targetYaw-yaw)>.001||Math.abs(targetPitch-pitch)>.001)raf=requestAnimationFrame(frame)}
 function wake(){if(!raf)raf=requestAnimationFrame(frame)}
 const onDown=e=>{drag={x:e.clientX,y:e.clientY,yaw:targetYaw,pitch:targetPitch};renderer.domElement.setPointerCapture?.(e.pointerId);renderer.domElement.classList.add('dragging');e.preventDefault()};
 const onMove=e=>{if(!drag)return;targetYaw=drag.yaw+(e.clientX-drag.x)*.012;targetPitch=Math.max(-.18,Math.min(.18,drag.pitch+(e.clientY-drag.y)*.003));wake()};
 const onUp=()=>{drag=null;renderer.domElement.classList.remove('dragging')};
 renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointermove',onMove);renderer.domElement.addEventListener('pointerup',onUp);renderer.domElement.addEventListener('pointercancel',onUp);
 const onTurn=e=>{const b=e.target.closest('[data-muscle-turn]');if(!b||!stage.contains(b))return;targetYaw=(Number(b.dataset.muscleTurn)||0)<0?0:Math.PI;targetPitch=0;$$('[data-muscle-turn]',stage).forEach(x=>{x.classList.toggle('dark',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});wake()};document.addEventListener('click',onTurn);
 old.style.display='none';rankStyle();const mo=new MutationObserver(()=>{rankStyle();wake()});mo.observe(stage,{subtree:true,attributes:true,attributeFilter:['style','class']});const ro=window.ResizeObserver?new ResizeObserver(()=>{resize();wake()}):null;if(ro)ro.observe(stage);else window.addEventListener('resize',resize);resize();wake();
 stage._lift3dCleanup=()=>{disposed=true;cancelAnimationFrame(raf);mo.disconnect();ro?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('click',onTurn);renderer.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());mount.remove()};
}
const scan=()=>{for(const st of activeStages){if(!st.isConnected){st._lift3dCleanup?.();activeStages.delete(st)}}$$('.body-stage').forEach(init)};const observer=new MutationObserver(scan);observer.observe(document.documentElement,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
})();
