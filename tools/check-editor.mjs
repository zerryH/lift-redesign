/* Check the canonical browser program and its generated copy without emitting code. */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {getCSSLanguageService} from 'vscode-css-languageservice';
import {TextDocument} from 'vscode-languageserver-textdocument';

const configFile=ts.readConfigFile('jsconfig.json',ts.sys.readFile);
if(configFile.error)throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText,'\n'));
const config=ts.parseJsonConfigFileContent(configFile.config,ts.sys,process.cwd());
const diagnostics=[...config.errors];
for(const files of [config.fileNames,[path.resolve('app.js'),path.resolve('types/browser.d.ts')]]){
 const program=ts.createProgram(files,config.options);
 diagnostics.push(...ts.getPreEmitDiagnostics(program));
}
if(diagnostics.length){
 console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:x=>x,getCurrentDirectory:()=>process.cwd(),getNewLine:()=> '\n'}));
 process.exit(1);
}
const css=getCSSLanguageService(),cssProblems=[];
for(const file of ['styles.css','anatomy-map.css','index.html','lift-local.html']){
 const source=fs.readFileSync(file,'utf8');
 const blocks=file.endsWith('.css')?[source]:[...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]);
 blocks.forEach((source,index)=>{
  const document=TextDocument.create('file://'+path.resolve(file)+'.'+index+'.css','css',1,source);
  for(const problem of css.doValidation(document,css.parseStylesheet(document)))cssProblems.push(file+':'+(problem.range.start.line+1)+' '+problem.message);
 });
}
if(cssProblems.length){console.error(cssProblems.join('\n'));process.exit(1);}
console.log('Editor checks passed: canonical JavaScript, generated JavaScript and CSS have zero diagnostics.');
