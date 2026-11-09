import fs from 'node:fs';
import path from 'node:path';
import {root,siteFiles} from './site-files.mjs';
const {files,missing,all}=siteFiles();
if(missing.length)throw Error(JSON.stringify(missing));
const dest=path.join(root,'release','github-ready');
if(!dest.startsWith(path.join(root,'release')+path.sep))throw Error('Unsafe release path');
fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(dest,{recursive:true});
const extras=['README.md','THIRD_PARTY_NOTICES.md','package.json','package-lock.json','preview-server.cjs','START-FAIRYTALE.cmd','.gitignore','.gitattributes','.github/workflows/pages.yml','scripts/site-files.mjs','scripts/build.mjs','scripts/prepare-release.mjs'];
const selected=[...new Set([...files,...extras])];
for(const file of selected){const target=path.join(dest,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
fs.writeFileSync(path.join(dest,'.nojekyll'),'');
const total=list=>list.reduce((sum,file)=>sum+fs.statSync(path.join(root,file)).size,0);
const report={files:selected.length,sourceBytes:total(selected),originalWorkingFiles:all.length,excludedFiles:all.filter(f=>!selected.includes(f)),output:dest};
fs.writeFileSync(path.join(root,'release','optimization-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,excludedFiles:report.excludedFiles.length},null,2));
