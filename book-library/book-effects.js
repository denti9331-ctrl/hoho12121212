/* Lightweight story particles, active only during book opening. */
(()=>{'use strict';
 const curtain=document.createElement('div');curtain.className='redhood-entry-curtain';curtain.setAttribute('aria-hidden','true');curtain.innerHTML='<div class="redhood-shadow-sweep"></div><div class="redhood-shadow-black"></div><div class="redhood-entry-progress"><span></span></div>';document.body.append(curtain);
 const canvas=document.createElement('canvas');canvas.className='tale-effects';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const sea=document.createElement('div');sea.className='mermaid-entry-curtain';sea.setAttribute('aria-hidden','true');sea.innerHTML='<svg width="0" height="0"><defs><filter id="mermaid-entry-refraction" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".008 .026" numOctaves="2" seed="14" result="water"><animate attributeName="baseFrequency" values=".008 .026;.013 .032;.009 .022" dur="2.1s" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="water" scale="0" xChannelSelector="R" yChannelSelector="G"><animate attributeName="scale" values="0;36;72;48;20" keyTimes="0;.18;.48;.76;1" dur="1.8s" begin="indefinite" fill="freeze"/></feDisplacementMap></filter></defs></svg><div class="mermaid-entry-black"></div><div class="mermaid-entry-progress"><span></span></div>';document.body.append(sea);
 const ctx=canvas.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,particles=[],start=0,kind=0,w=0,h=0;
 function stop(){cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,w,h);canvas.dataset.active='false';}
 function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);}
 addEventListener('resize',resize);resize();
 function launch(e){stop();if(reduce.matches)return;kind=e.detail.index;if(kind===0||kind===1||kind===3)return;if(kind===2){sea.querySelector('feDisplacementMap animate').beginElement();return;}start=performance.now();canvas.dataset.active='true';canvas.dataset.tale=String(kind);
 const origin={x:w*.5,y:h*.43};particles=Array.from({length:kind===1?48:64},()=>{const a=Math.random()*Math.PI*2,s=60+Math.random()*260;return{x:origin.x+(Math.random()-.5)*90,y:origin.y+(Math.random()-.5)*100,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,r:kind===2?5+Math.random()*20:3+Math.random()*11,angle:Math.random()*6.28,spin:(Math.random()-.5)*5,delay:Math.random()*.35,depth:.6+Math.random()*.5};});raf=requestAnimationFrame(draw);}
 function draw(now){const elapsed=(now-start)/1000;canvas.dataset.phase=elapsed>.45?'burst':'start';ctx.clearRect(0,0,w,h);if(elapsed>2.25||document.hidden||!document.body.classList.contains('opening')){stop();return;}
 if(kind===2){const t=Math.min(1,elapsed/1.3),ease=t*t*(3-2*t),front=h+90-ease*(h+190);const fill=ctx.createLinearGradient(0,front-35,0,front+180);fill.addColorStop(0,'#02060a00');fill.addColorStop(.35,'#04121bd9');fill.addColorStop(1,'#020406');ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(0,h+20);ctx.lineTo(0,front);for(let x=0;x<=w+24;x+=24){const wave=Math.sin(x/130+elapsed*2.2)*15+Math.sin(x/53-elapsed*1.5)*5;ctx.lineTo(x,front+wave)}ctx.lineTo(w,h+20);ctx.closePath();ctx.fill();raf=requestAnimationFrame(draw);return;}
 for(const p of particles){
 if(kind===1){
  const t=elapsed-p.delay-.12;if(t<0)continue;
  // Perspective expansion sends petals from the book toward the viewer.
  const depth=Math.max(.13,p.depth-t*.48),zoom=1/depth;
  const x=w*.5+((p.x-w*.5)+p.vx*t*.7)*zoom;
  const y=h*.43+((p.y-h*.43)+p.vy*t*.5+25*t*t)*zoom;
  const size=p.r*zoom*(1+t*.5);
  ctx.save();ctx.translate(x,y);ctx.rotate(p.angle+p.spin*t);
  ctx.globalAlpha=Math.min(1,t*7)*Math.max(0,Math.min(1,(1.8-elapsed)*3));
  ctx.scale(.55+Math.abs(Math.sin(t*5+p.angle))*.55,1);
  const shade=ctx.createLinearGradient(-size,-size,size,size);
  shade.addColorStop(0,'#f18a98');shade.addColorStop(.35,'#b93250');shade.addColorStop(1,'#4b0b25');
  ctx.fillStyle=shade;ctx.beginPath();ctx.moveTo(-size,-size*.65);
  ctx.bezierCurveTo(size*.1,-size*1.4,size*1.25,-size*.45,size*.6,size*.65);
  ctx.bezierCurveTo(size*.05,size*1.2,-size*.8,size*.55,-size,-size*.65);ctx.fill();
  ctx.strokeStyle='#ffc3cd44';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-size*.65,-size*.5);ctx.quadraticCurveTo(0,0,size*.45,size*.55);ctx.stroke();ctx.restore();continue;
 }
 const t=elapsed-p.delay;if(t<0)continue;const fade=Math.max(0,Math.min(1,t*6)*(1-t/2.1));if(!fade)continue;let x=p.x+p.vx*t*.8,y=p.y+p.vy*t+(kind===2?-65:kind===1?150:85)*t*t;
 ctx.save();ctx.translate(x,y);ctx.rotate(p.angle+p.spin*t);ctx.globalAlpha=fade;
 if(kind===2){ctx.shadowColor='#61d7ff';ctx.shadowBlur=12;ctx.strokeStyle='#b4edff';ctx.lineWidth=1.2;const g=ctx.createRadialGradient(-p.r*.3,-p.r*.3,0,0,0,p.r);g.addColorStop(0,'#d8fbff55');g.addColorStop(.75,'#388cb011');g.addColorStop(1,'#b4edff77');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(-p.r*.2,-p.r*.2,p.r*.55,3.5,4.9);ctx.stroke();}
 else if(kind===0){ctx.shadowColor='#9bd7ff';ctx.shadowBlur=7;ctx.fillStyle='#b8dfff55';ctx.strokeStyle='#e1f4ffcc';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-p.r,-p.r*.7);ctx.lineTo(p.r*.7,-p.r*.4);ctx.lineTo(p.r*.2,p.r*1.8);ctx.closePath();ctx.fill();ctx.stroke();}

 else {if(p.r>9){ctx.shadowColor='#8bc451';ctx.shadowBlur=25;ctx.fillStyle='#74ae4333';ctx.beginPath();ctx.arc(0,0,p.r*(1+t*2),0,Math.PI*2);ctx.fill();}else{ctx.fillStyle='#a82237';ctx.strokeStyle='#ff8d8d88';ctx.beginPath();ctx.moveTo(0,-p.r);ctx.quadraticCurveTo(p.r*1.5,-p.r,p.r,p.r);ctx.quadraticCurveTo(0,p.r*1.4,-p.r,p.r);ctx.quadraticCurveTo(-p.r*1.5,-p.r,0,-p.r);ctx.fill();ctx.stroke();}}
 ctx.restore();}raf=requestAnimationFrame(draw);}
 document.addEventListener('fairytale:book-open',launch);addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
