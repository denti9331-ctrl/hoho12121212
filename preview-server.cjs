const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const args=process.argv.slice(2), value=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const base = path.resolve(__dirname,value('--dir','.')), port = Number(value('--port',process.env.PORT||4174)), url = `http://127.0.0.1:${port}/`;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.webm':'video/webm','.mp4':'video/mp4','.woff2':'font/woff2','.ttf':'font/ttf'};
function open(){if(process.argv.includes('--open'))spawn('explorer.exe',[url],{detached:true,stdio:'ignore'}).unref();console.log('Dark Fairy Tale: '+url);}
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,url).pathname);}catch{res.writeHead(400);return res.end();}
 let file=path.resolve(base,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end();}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404);return res.end('Not found');}
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'};
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
   if(!match[1])start=Math.max(0,stat.size-Number(match[2]));else start=Number(match[1]);
   if(match[1]&&match[2])end=Math.min(end,Number(match[2]));
   if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);
  if(req.method==='HEAD'||stat.size===0)return res.end();
  const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 });
});
server.on('error',error=>{
 if(error.code!=='EADDRINUSE'){console.error(error.message);process.exitCode=1;return;}
 http.get(url,response=>{let text='';response.setEncoding('utf8');response.on('data',chunk=>text+=chunk);response.on('end',()=>{if(text.includes('forest-entry/forest-entry.js')&&text.includes('DARK FAIRY TALE'))open();else{console.error('Port 4174 is used by another application.');process.exitCode=1;}});}).on('error',error=>{console.error(error.message);process.exitCode=1;});
});
server.listen(port,'127.0.0.1',open);
