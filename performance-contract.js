/* Measurement provenance is retained separately from current ranking comparisons. */
globalThis.SlatPerformance=(()=>{
 const units={load:'kg',repetitions:'reps',duration:'s',distance:'m'};
 function provenance(record,meta,context){
  return {exerciseId:record.id,trackingMode:record.tracking,catalogueVersion:context.catalogueVersion,
   benchmarkId:record.rankable?(record.benchmarkId||meta.benchmarkId||null):null,standardsVersion:record.rankable?(meta.standardsVersion||context.rankingVersion):null,
   sourceUnit:context.sourceUnit,measurementUnits:{...units},loadProtocol:{mode:meta.loadMode||'normal',multiplier:Number(meta.loadMultiplier)||1,unilateral:!!meta.unilateral,bodyweightFactor:meta.bodyweightFactor!=null&&Number.isFinite(Number(meta.bodyweightFactor))?Number(meta.bodyweightFactor):1},
   performanceContext:{reference:context.reference,age:context.age??null,ageAdjust:context.ageAdjust,heightAdjust:context.heightAdjust,workoutDate:context.date,timeZone:context.timeZone||null}};
 }
 function repair(set,record,catalogueVersion){
  const out={...set};
  if(!out.exerciseId)out.exerciseId=record.id;
  if(!out.trackingMode){
   out.trackingMode=out.seconds!=null?'duration':out.meters!=null?'load_distance':record.tracking==='duration'||record.tracking==='load_distance'||record.tracking==='band_reps'?'legacy_reps':record.tracking;
   if(!out.migration){const originalMeasurements={};for(const field of ['kg','reps','seconds','meters','band','bw','height'])if(Object.hasOwn(set,field))originalMeasurements[field]=set[field];out.migration={source:'legacy',originalMeasurements,identityResolvedWithCatalogue:catalogueVersion};}
  }
  if(!out.measurementUnits)out.measurementUnits={...units};
  return out;
 }
 const mode=(set,record)=>set?.trackingMode||record?.tracking||'load_reps';
 return {provenance,repair,mode};
})();
