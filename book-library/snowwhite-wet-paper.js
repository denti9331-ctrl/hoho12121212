/* Natural capillary texture reveals progressively, without translating or scaling it. */
(() => {
  const stage=document.querySelector('.library-stage');if(!stage)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(pointer:fine)');
  const canvas=document.createElement('canvas');canvas.className='snowwhite-wet-paper';canvas.setAttribute('aria-hidden','true');
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,depth:false,antialias:false,powerPreference:'low-power'});if(!gl)return;
  const vertex='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const fragment=`precision highp float;varying vec2 uv;uniform vec2 size;uniform vec4 drops[12];uniform vec2 variants[12];uniform sampler2D paper,backdrop;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
  void main(){vec2 pt=vec2(uv.x,1.-uv.y)*size;float coverage=0.;
    for(int i=0;i<12;i++){vec4 d=drops[i];if(d.w<1.)continue;float age=d.z;float grow=1.-exp(-age*2.5);float retreat=smoothstep(1.35,3.15,age);
      vec2 q=(pt-d.xy)/d.w;float a=variants[i].x,c=cos(a),s=sin(a);q=mat2(c,-s,s,c)*q;q.x*=variants[i].y;
      vec2 tex=q+.5;if(tex.x<0.||tex.y<0.||tex.x>1.||tex.y>1.)continue;
      float density=1.-texture2D(paper,tex).r;
      float fibers=noise(pt*.07)*.025+noise(pt*.31)*.008;
      float edge=length(q)+(1.-density)*.08+fibers;
      float front=.055+grow*.64;
      float wetFront=1.-smoothstep(front-.025,front+.018,edge);
      float threshold=mix(.64,.045,grow)+retreat*.16;
      float pigment=smoothstep(threshold,threshold+.14,density);
      float stain=pigment*wetFront*pow(1.-retreat,1.35)*.91;
      coverage=1.-(1.-coverage)*(1.-stain);
    }
    float aspect=size.x/size.y;vec2 imageUv=(vec2(uv.x,1.-uv.y)-.5)*vec2(min(aspect/1.777,1.),min(1.777/aspect,1.))+.5;
    vec3 color=texture2D(backdrop,imageUv).rgb;gl_FragColor=vec4(color*coverage,coverage);
  }`;
  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch(e){console.warn('Wet ink unavailable',e);return;}
  gl.useProgram(program);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
  let ready=0;
  function texture(unit,url){const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));const image=new Image();image.onload=()=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready++;};image.src=url;return t;}
  texture(0,'assets/wet-ink-bloom-v1.png');texture(1,'assets/hidden-snowwhite-v1.webp');
  const u=Object.fromEntries(['size','paper','backdrop','drops[0]','variants[0]'].map(n=>[n,gl.getUniformLocation(program,n)]));gl.uniform1i(u.paper,0);gl.uniform1i(u.backdrop,1);
  stage.append(canvas);
  let width=1,height=1,frame=0,visible=true,alive=true,selected=false,previous=null,lastStamp=0,slot=0;
  const drops=Array.from({length:12},()=>({x:0,y:0,born:-10000,r:0,a:0,s:1})),data=new Float32Array(48),variants=new Float32Array(24);
  function enabled(){return alive&&visible&&!document.hidden&&document.body.dataset.tale==='3'&&!document.body.classList.contains('opening')&&!document.body.classList.contains('reading')&&!reduced.matches&&fine.matches;}
  function clear(){cancelAnimationFrame(frame);frame=0;previous=null;drops.forEach(d=>d.r=0);gl.clear(gl.COLOR_BUFFER_BIT);}
  function resize(){clear();const b=stage.getBoundingClientRect();width=b.width;height=b.height;const ratio=Math.min(devicePixelRatio||1,1.5,1920/width);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(u.size,width,height);}
  function tick(now){frame=0;if(!enabled()){clear();return;}let active=false;for(let i=0;i<12;i++){const d=drops[i],age=(now-d.born)/1000;if(age>3.2)d.r=0;else if(d.r)active=true;data.set([d.x,d.y,age,d.r],i*4);variants.set([d.a,d.s],i*2);}gl.uniform4fv(u['drops[0]'],data);gl.uniform2fv(u['variants[0]'],variants);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);if(active)frame=requestAnimationFrame(tick);}
  stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!enabled()||ready<2)return;const b=stage.getBoundingClientRect(),now=performance.now(),point={x:e.clientX-b.left,y:e.clientY-b.top};const distance=previous?Math.hypot(point.x-previous.x,point.y-previous.y):100;if(now-lastStamp>65&&distance>28){Object.assign(drops[slot++%12],point,{born:now,r:Math.min(width*.16,190)*(1+Math.random()*.18),a:Math.random()*6.28,s:.85+Math.random()*.3});previous=point;lastStamp=now;if(!frame)frame=requestAnimationFrame(tick);}},{passive:true});
  stage.addEventListener('pointerleave',()=>previous=null);
  const state=new MutationObserver(()=>{const next=document.body.dataset.tale==='3';if(next!==selected||((frame||previous)&&!enabled()))clear();selected=next;canvas.style.display=next?'':'none';});state.observe(document.body,{attributes:true,attributeFilter:['data-tale','class']});
  const view=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)clear();});view.observe(stage);const size=new ResizeObserver(resize);size.observe(stage);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});reduced.addEventListener('change',clear);resize();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();alive=false;cancelAnimationFrame(frame);canvas.style.display='none';});addEventListener('pagehide',()=>{clear();alive=false;state.disconnect();view.disconnect();size.disconnect();});
})();
