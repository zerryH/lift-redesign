/* Pure catalogue identity and protocol validation. */
globalThis.SlatCatalogue=(()=>{
 const zones=['chest','frontDelts','rearDelts','sideDelts','biceps','triceps','lats','upperBack','abs','glutes','quads','hamstrings','calves','forearms','adductors','tibialis'];
 const splits=['Push','Pull','Legs','Core','Full Body'];
 const tracking=['load_reps','reps','duration','load_distance','band_reps'];
 const equipment=['Assisted machine','Barbell','Battle ropes','Bodyweight','Cable / rope','Dumbbell','EZ-bar','Kettlebell','Machine','Plate-loaded machine','Resistance band','Sled','Smith machine','Weight plate'];
 const fail=m=>{throw new Error('Invalid catalogue: '+m);};
 const resolve=(name,catalogue)=>catalogue?.[name]?.canonicalName||name;
 const acyclic=(links,label)=>{for(const start of Object.keys(links)){const seen=new Set();let key=start;while(links[key]){if(seen.has(key))fail(label+' cycle: '+start);seen.add(key);key=links[key];}}};
 function validate(ex,ranks){
  if(!Number.isInteger(ex.catalogueVersion)||ex.catalogueVersion<1)fail('catalogue version');
  if(!Array.isArray(ex.ex)||!ex.ex.length||!ex.catalogue)fail('missing records');
  const names=new Set(),ids=new Map(),synonyms={};
  for(const row of ex.ex){
   if(typeof row!=='string'||row.split('|').length!==4)fail('row');
   const [name,split,type,muscle]=row.split('|'),c=ex.catalogue[name],m=ranks.exerciseMeta?.[name];
   if(names.has(name)||!c||!m||c.name!==name)fail('record '+name);names.add(name);
   if(typeof c.id!=='string'||!/^ex\d+$/.test(c.id))fail('identity '+name);
   if(!splits.includes(split)||c.split!==split||m.group!==split||!Array.isArray(c.splitMemberships)||!c.splitMemberships.includes(split)||c.splitMemberships.some(s=>!splits.includes(s)))fail('split '+name);
   if(!equipment.includes(c.equipment)||!['B','D','M','U','W'].includes(type)||m.type!==type)fail('equipment '+name);
   if(c.primaryMuscle!==muscle||m.muscle!==muscle||!zones.includes(c.primaryMuscleId))fail('muscle '+name);
   if(!tracking.includes(c.tracking)||m.tracking!==c.tracking||typeof c.rankable!=='boolean'||m.rankable!==c.rankable)fail('tracking '+name);
   if(!['normal','bodyweight','assisted'].includes(m.loadMode)||!['low','medium','high'].includes(m.rom)||typeof m.unilateral!=='boolean'||!Number.isFinite(m.loadMultiplier)||m.loadMultiplier<=0||!Number.isInteger(c.implementCount)||c.implementCount<1||c.implementCount>2)fail('load protocol '+name);
   const p=c.loadProtocol;if(!p||p.mode!==m.loadMode||p.multiplier!==m.loadMultiplier||p.unilateral!==m.unilateral||p.bodyweightFactor!==m.bodyweightFactor)fail('protocol mismatch '+name);
   if(!Object.keys(c.muscles||{}).length||Object.entries(c.muscles).some(([z,w])=>!zones.includes(z)||!Number.isFinite(w)||w<=0||w>1))fail('map zone '+name);
   if(!Array.isArray(c.secondaryMuscleIds)||c.secondaryMuscleIds.some(z=>!zones.includes(z)||z===c.primaryMuscleId||!c.muscles[z]))fail('secondary muscles '+name);
   if(c.canonicalName){synonyms[name]=c.canonicalName;const target=ex.catalogue[c.canonicalName];if(!target||target.canonicalName||target.id!==c.id)fail('synonym '+name);}
   else{if(ids.has(c.id))fail('duplicate ID '+c.id);ids.set(c.id,name);}
   if(c.catalogueVersion!==ex.catalogueVersion||!c.standardEvidence?.note||c.standardEvidence.status!=='provisional')fail('evidence '+name);
   if(c.rankable&&(!c.benchmarkId||c.benchmarkId!==m.benchmarkId||!ranks.t[name]||!m.standardAnchors||!Number.isFinite(m.standardAnchors.minimumRatio)||!Number.isFinite(m.standardAnchors.maximumRatio)||m.standardAnchors.maximumRatio<=m.standardAnchors.minimumRatio))fail('standard '+name);
   if(!c.rankable&&(!c.rankingExclusion||c.benchmarkId!==null))fail('ranking exclusion '+name);
  }
  if(Object.keys(ex.catalogue).length!==names.size)fail('orphan catalogue rows');
  acyclic(synonyms,'synonym');acyclic(ex.synonyms||{},'search alias');acyclic(ranks.alias||{},'benchmark alias');
  for(const [alias,target] of Object.entries(ex.synonyms||{}))if(ex.catalogue[alias]?.canonicalName!==target||!ex.catalogue[target])fail('search alias '+alias);
  for(const [alias,target] of Object.entries(ranks.alias||{}))if(!ranks.t[target])fail('benchmark target '+alias);
  for(const [name,standards] of Object.entries(ranks.t||{}))if(!Array.isArray(standards)||standards.length!==2||standards.some(a=>!Array.isArray(a)||a.length!==ranks.tiers.length||a.some((v,i)=>!Number.isFinite(v)||v<=0||(i&&v<=a[i-1]))))fail('ladder '+name);
  return {rows:names.size,identities:ids.size,ranked:[...ids.values()].filter(n=>ex.catalogue[n].rankable).length};
 }
 return {validate,resolve,zones,splits,tracking,equipment};
})();
