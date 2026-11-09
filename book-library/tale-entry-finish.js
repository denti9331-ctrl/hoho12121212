(() => {
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const layer=document.createElement('div');layer.className='tale-entry-finish';layer.setAttribute('aria-hidden','true');
  const dust=document.createElement('canvas'),ink=document.createElement('canvas');
  dust.className='cinderella-entry-dust';ink.className='snowwhite-entry-ink';
  const line=document.createElement('div');line.className='tale-entry-finish-line';line.innerHTML='<span></span>';
  layer.append(dust,ink,line);document.body.append(layer);
  const ctx=dust.getContext('2d');let gl=null,program=null,mask=null,uniforms=null;
  const image=new Image();image.src='assets/wet-ink-bloom-v1.png';
  function setupInk(){
    if(gl)return;
    gl=ink.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,powerPreference:'low-power'});if(!gl)return;
    const vertex='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
    const fragment=`precision highp float;varying vec2 uv;uniform sampler2D paper;uniform vec2 size,origin;uniform float t;
    void main(){vec2 pt=vec2(uv.x,1.-uv.y)*size;float progress=clamp(t/1.65,0.,1.);float spread=progress*progress*(3.-2.*progress);float reach=length(size)*2.7;float radius=8.+spread*reach;
      vec2 q=(pt-origin)/radius+.5;float density=1.-texture2D(paper,clamp(q,0.,1.)).r;
      float inside=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);
      float edge=smoothstep(.055,.29,density)*inside;
      float fill=smoothstep(1.25,1.7,t);float alpha=mix(edge,1.,fill);
      vec3 color=mix(vec3(.045,.035,.046),vec3(.016,.017,.022),spread);gl_FragColor=vec4(color*alpha,alpha);}`;
    function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
    try{program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch(e){console.warn('Entry ink unavailable',e);gl=null;return;}
    gl.useProgram(program);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
    mask=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,mask);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
    function upload(){gl.bindTexture(gl.TEXTURE_2D,mask);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);}
    if(image.complete&&image.naturalWidth)upload();else image.addEventListener('load',upload,{once:true});
    uniforms=Object.fromEntries(['size','origin','t','paper'].map(n=>[n,gl.getUniformLocation(program,n)]));gl.uniform1i(uniforms.paper,0);
  }
  let frame=0,start=0,kind=-1,w=1,h=1,origin={x:0,y:0},lastPointer=null,particles=[];
  document.addEventListener('pointerdown',e=>{lastPointer={x:e.clientX,y:e.clientY};},{passive:true});
  function stop(){cancelAnimationFrame(frame);frame=0;layer.classList.remove('is-active');ctx.clearRect(0,0,w,h);if(gl)gl.clear(gl.COLOR_BUFFER_BIT);}
  function draw(now){const t=(now-start)/1000;if(t>2.3||document.hidden||!document.body.classList.contains('opening')){stop();return;}
    if(kind===3&&gl){gl.uniform1f(uniforms.t,t);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);}
    else{ctx.clearRect(0,0,w,h);const p=Math.max(0,Math.min(1,(t-.1)/1.55)),dark=p*p*(3-2*p);ctx.fillStyle=`rgba(5,4,9,${dark})`;ctx.fillRect(0,0,w,h);
      if(kind===0)for(const d of particles){const age=Math.max(0,t-d.delay),fade=Math.min(1,age*8)*Math.pow(Math.max(0,1-age/1.5),1.5);if(!fade)continue;
        const x=origin.x+d.x+d.vx*age,y=origin.y+d.y+d.vy*age+age*age*32;ctx.globalAlpha=fade;ctx.fillStyle=d.warm?'#f3e9ff':'#c9b5ee';ctx.shadowColor='#b09adc';ctx.shadowBlur=d.r>1.5?9:3;ctx.beginPath();ctx.arc(x,y,d.r*(1-age*.35),0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;ctx.shadowBlur=0;
    }
    frame=requestAnimationFrame(draw);
  }
  document.addEventListener('fairytale:book-open',e=>{
    if(![0,3].includes(e.detail.index))return;stop();kind=e.detail.index;if(reduced.matches)return;
    w=innerWidth;h=innerHeight;origin=lastPointer||{x:w*.5,y:h*.48};lastPointer=null;
    const ratio=Math.min(devicePixelRatio||1,1.5);dust.width=Math.round(w*ratio);dust.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    if(kind===3){setupInk();if(gl){const r=Math.min(1.25,1440/w);ink.width=Math.round(w*r);ink.height=Math.round(h*r);gl.viewport(0,0,ink.width,ink.height);gl.uniform2f(uniforms.size,w,h);gl.uniform2f(uniforms.origin,origin.x,origin.y);}}
    layer.dataset.kind=String(kind);layer.classList.add('is-active');
    particles=Array.from({length:100},()=>({x:(Math.random()-.5)*190,y:(Math.random()-.5)*250,vx:(Math.random()-.5)*90,vy:-20-Math.random()*75,r:.6+Math.random()*2,delay:Math.random()*.22,warm:Math.random()>.5}));
    start=performance.now();frame=requestAnimationFrame(draw);
  });
  const state=new MutationObserver(()=>{if(frame&&!document.body.classList.contains('opening'))stop();});state.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});addEventListener('pagehide',()=>{stop();state.disconnect();});
})();
