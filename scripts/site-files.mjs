import fs from 'node:fs';
import path from 'node:path';
export const root = path.resolve(import.meta.dirname, '..');
const slash = value => value.split(path.sep).join('/');
const ignored = new Set(['.backups','.tools','node_modules','dist','release','.git']);
export function inventory(dir=root) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
    if (ignored.has(entry.name)) return [];
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?inventory(full):[slash(path.relative(root,full))];
  });
}
export function siteFiles() {
  const all=inventory(), available=new Set(all), included=new Set(), queue=[['index.html','']];
  const missing=[];
  const ext='(?:html|css|js|mjs|cjs|json|glb|gltf|png|webp|jpe?g|svg|webm|mp4|woff2?|ttf|ogg|mp3|wav)';
  function resolveRef(value,file,context,required=false) {
    value=value.replace(/&amp;/g,'&').split(/[?#]/)[0];
    if (!value || /^(?:data:|https?:|blob:|mailto:|javascript:|#|%23)/.test(value)) return;
    const bases=[path.posix.dirname(file),context,''];
    const results=new Set();
    for(const base of bases){
      const candidate=path.posix.normalize(path.posix.join(base,value));
      if(available.has(candidate))results.add(candidate);
    }
    if(results.size)for(const candidate of results)queue.push([candidate,candidate.endsWith('.html')?path.posix.dirname(candidate):context]);
    else if(required&&!value.includes('${'))missing.push({file,reference:value});
  }
  const states=new Set();
  while(queue.length){
    const [file,context]=queue.shift(),key=file+'|'+context;
    if(states.has(key))continue;states.add(key);included.add(file);
    if(!/\.(?:html|css|js|mjs|json|glb)$/.test(file))continue;
    const data=fs.readFileSync(path.join(root,file));
    if(file.endsWith('.glb')){
      if(data.toString('ascii',0,4)!=='glTF')throw Error('Invalid GLB: '+file);
      const json=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)).trim());
      for(const item of [...(json.images||[]),...(json.buffers||[])])if(item.uri)resolveRef(item.uri,file,context,true);
      continue;
    }
    const text=data.toString('utf8');
    // History scripts construct these names by concatenating era and index.
    if(text.includes('../design-assets/symbols/')){
      for(const asset of all.filter(name=>/^design-assets\/symbols\/(?:perrault|grimm)-\d{2}\.webp$/.test(name)))queue.push([asset,context]);
    }
    // Static references, including embedded HTML and CSS inside scripts.
    const re=new RegExp('["\x27`(\\s]((?:\\.\\.?/|/)?[A-Za-z0-9_@-][A-Za-z0-9_@./ -]*\\.'+ext+'(?:[?#][^"\x27`<>\\s)]*)?)','g');
    for(const match of text.matchAll(re))resolveRef(match[1],file,context);
    if(file.endsWith('.html'))for(const match of text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g))resolveRef(match[1],file,context,true);
    if(file.endsWith('.css'))for(const match of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g))resolveRef(match[1],file,context,true);
    // Template-based names: scene model loader and generated paths.
    if(file==='forest-entry/forest-three.js'){
      for(const model of all.filter(name=>/^forest-entry\/models\/.*\.glb$/.test(name))){
        const name=path.posix.basename(model,'.glb');
        if(text.includes("'"+name+"'")||text.includes('"'+name+'"'))queue.push([model,context]);
      }
    }
    for(const match of text.matchAll(/(?:['"`])([^'"`\n]*\$\{[^'"`\n]+)(?:['"`])/g)){
      const template=match[1];if(!/\.(?:webp|png|glb|jpg|svg|js|json)$/.test(template))continue;
      if(file==='forest-entry/forest-three.js'&&template.includes('models/'))continue;
      const pattern=template.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\\$\\\{.*?\\\}/g,'.*');
      for(const base of [path.posix.dirname(file),context,'']){
        const prefix=base?base+'/':'';let regex;try{regex=new RegExp('^'+prefix+pattern.replace(/^\.\//,'')+'$');}catch{continue;}
        for(const asset of all)if(regex.test(asset))queue.push([asset,context]);
      }
    }
  }
  // Legal text accompanies the bundled engine even though it is not fetched.
  for(const file of ['book-library/vendor/THREE-LICENSE.txt'])if(available.has(file))included.add(file);
  return {files:[...included].sort(),missing,all};
}
