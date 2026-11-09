import fs from 'node:fs';
import path from 'node:path';
import { transform } from 'esbuild';
import { root, siteFiles } from './site-files.mjs';
const {files,missing}=siteFiles();
if(missing.length)throw Error('Missing local references:\n'+missing.map(x=>`${x.file}: ${x.reference}`).join('\n'));
for(const file of files.filter(f=>/\.(?:js|mjs|css)$/.test(f))){
  await transform(fs.readFileSync(path.join(root,file),'utf8'),{loader:file.endsWith('.css')?'css':'js',target:'es2020',minify:true,legalComments:'inline'});
}
if(process.argv.includes('--check')){console.log(`Validated ${files.length} site files and JavaScript/CSS syntax.`);process.exit(0);}
const output=path.join(root,'dist');
if(path.dirname(output)!==root)throw Error('Unsafe output');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
let before=0,after=0;
for(const file of files){
  const input=fs.readFileSync(path.join(root,file));before+=input.length;
  let result=input;
  if(/\.(?:js|mjs|css)$/.test(file))result=Buffer.from((await transform(input.toString('utf8'),{loader:file.endsWith('.css')?'css':'js',target:'es2020',minify:true,legalComments:'inline'})).code);
  const dest=path.join(output,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,result);after+=result.length;
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log(JSON.stringify({files:files.length,sourceBytes:before,buildBytes:after,output},null,2));
