(() => {
 'use strict';
 const root=document.querySelector('.cube-story');if(!root)return;
 const host=root.querySelector('.tale-panels');
 const data=[
  ['THE PROMISE','작은 바구니, 하나의 약속','narrative-promise-bg.webp','narrative-promise',0],
  ['THE STRANGER','숲에서 만난 다정한 낯선 이','narrative-stranger-bg.webp','narrative-stranger',1],
  ['THE COTTAGE','문을 두드린 것은 누구였을까','narrative-door-bg.webp','narrative-door',2],
  ['THOSE EYES','할머니, 눈이 왜 그렇게 커요','narrative-bed-bg.webp','narrative-bed',3],
  ['BEYOND THE TALE','그리고, 우리가 기억하는 구원','narrative-rescue-bg.webp','narrative-rescue',4],
  ['INTO THE WOODS','다섯 장면으로 만나는 빨간모자','forest-alley.webp','redhood',0]
 ];
 const rotations=[[0,0],[0,90],[0,180],[0,-90],[90,0],[-90,0]];
 host.innerHTML='<div class="cube-ground" aria-hidden="true"></div><div class="cube-viewport" tabindex="0" role="group" aria-label="회전하는 이야기 큐브. 드래그 또는 방향키로 회전하고 각 면을 눌러 이야기를 여세요"><div class="cube-float"><div class="story-cube"></div></div></div><div class="cube-navigation"><button class="cube-prev" aria-label="큐브 이전 면">←</button><span class="cube-face-count">01 / 06</span><button class="cube-next" aria-label="큐브 다음 면">→</button></div><p class="cube-gesture">DRAG TO ROTATE · CLICK A FACE TO ENTER</p>';
 const viewport=host.querySelector('.cube-viewport'),cube=host.querySelector('.story-cube');
 const motes=document.createElement('div');motes.className='cube-gold-motes cursor-motes';motes.setAttribute('aria-hidden','true');root.querySelector('.tale-stage').append(motes);
 const sparks=[];let sparkIndex=0,lastEmit=0;
 for(let i=0;i<28;i++){const spark=document.createElement('i');motes.append(spark);sparks.push(spark);}
 function pointerSpark(event){
  if(event.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const now=performance.now();if(now-lastEmit<25)return;lastEmit=now;
  const rect=motes.getBoundingClientRect();
  for(let i=0;i<2;i++){
   const spark=sparks[sparkIndex++%sparks.length];spark.getAnimations().forEach(a=>a.cancel());
   const size=2+Math.random()*3;Object.assign(spark.style,{left:(event.clientX-rect.left+(Math.random()-.5)*12)+'px',top:(event.clientY-rect.top+(Math.random()-.5)*12)+'px',width:size+'px',height:size+'px'});
   spark.animate([{opacity:0,transform:'translate(0,0) scale(.4)'},{offset:.12,opacity:.95,transform:'translate(0,-3px) scale(1)'},{opacity:0,transform:'translate('+((Math.random()-.5)*46)+'px,'+(-22-Math.random()*35)+'px) scale(.1)'}],{duration:650+Math.random()*350,easing:'ease-out'});
  }
 }
 root.querySelector('.tale-stage').addEventListener('pointermove',pointerSpark,{passive:true});
 addEventListener('pagehide',()=>sparks.forEach(spark=>spark.getAnimations().forEach(a=>a.cancel())));

 let x=-12,y=-22,selected=0,drag=null,moved=false,suppressClick=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),float=host.querySelector('.cube-float');
 let velocityX=0,velocityY=0,raf=0,lastFrame=0,visible=false,turn=null,requestedFace=null,webglView=null,faceOpenTimer=0;
 const normals=[[0,0,1],[1,0,0],[0,0,-1],[-1,0,0],[0,-1,0],[0,1,0]];
 root.querySelector('.tale-intro-copy').remove();
 const title=document.createElement('h2');title.className='cube-heading';title.textContent='STORY CUBE';root.querySelector('.tale-intro').append(title);
 const selectors=document.createElement('nav');selectors.className='cube-face-selectors';selectors.setAttribute('aria-label','큐브 장면 선택');host.append(selectors);
 function render(){
  webglView?.setRotation(x,y,Boolean(drag));
  cube.style.transform=`rotateX(${x}deg) rotateY(${y}deg)`;
  const rx=x*Math.PI/180,ry=y*Math.PI/180;
  cube.querySelectorAll('.story-cube-face').forEach((face,i)=>{
   const [a,b,c]=normals[i],nx=Math.cos(ry)*a+Math.sin(ry)*c,z=-Math.sin(ry)*a+Math.cos(ry)*c,ny=Math.cos(rx)*b-Math.sin(rx)*z,nz=Math.sin(rx)*b+Math.cos(rx)*z;
   const light=Math.max(0,-nx*.35-ny*.6+nz*.72);
   face.style.setProperty('--face-light',String(.7+light*.4));
   face.style.setProperty('--face-sheen',String(.04+Math.pow(light,5)*.19));
  });
 }
 function stopSpin(){cancelAnimationFrame(raf);raf=0;lastFrame=0;velocityX=velocityY=0;turn=null;}
 function tick(now){
  raf=0;if(!visible||document.hidden||reduced.matches||drag)return;
  const dt=lastFrame?Math.min(.05,(now-lastFrame)/1000):0;lastFrame=now;
  if(turn){
   const t=Math.min(1,(now-turn.started)/850),u=t*t*(3-2*t);
   x=turn.x+(turn.tx-turn.x)*u;y=turn.y+(turn.ty-turn.y)*u;
   if(t===1)turn=null;
  }else{x+=velocityX*dt;y+=(velocityY+(root.classList.contains('is-started')?0:2.2))*dt;}
  const decay=Math.exp(-3*dt);velocityX*=decay;velocityY*=decay;
  if(Math.abs(velocityX)<.03)velocityX=0;if(Math.abs(velocityY)<.03)velocityY=0;
  render();raf=requestAnimationFrame(tick);
 }
 function resume(){if(!raf&&visible&&!document.hidden&&!reduced.matches&&!drag){lastFrame=0;raf=requestAnimationFrame(tick);}}

 viewport.addEventListener('pointerenter',()=>{visible=true;resume()});
 function nearest(){
  const rx=x*Math.PI/180,ry=y*Math.PI/180;
   let max=-Infinity,next=0;
  normals.forEach(([a,b,c],i)=>{const z=-Math.sin(ry)*a+Math.cos(ry)*c;const depth=Math.sin(rx)*b+Math.cos(rx)*z;if(depth>max){max=depth;next=i;}});
  selected=next;host.querySelector('.cube-face-count').textContent=String(next+1).padStart(2,'0')+' / 06';
  selectors.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===next)));
 }
 function orient(i){
  stopSpin();cube.classList.remove('is-orienting');selected=(i+6)%6;
  const closest=(angle,target)=>angle+((target-angle+180)%360+360)%360-180;
  const tx=closest(x,-rotations[selected][0]-10),ty=closest(y,-rotations[selected][1]-16);
  if(reduced.matches||!visible){x=tx;y=ty;render();nearest();}
  else {turn={x,y,tx,ty,started:performance.now()};resume();}
 }
 root.addEventListener('tale:scene-change',event=>{
  const index=event.detail.index;
  const face=requestedFace!==null&&data[requestedFace][4]===index?requestedFace:index;
  requestedFace=null;orient(face);
 });

 function openFace(i){
  if(suppressClick)return;
  clearTimeout(faceOpenTimer);requestedFace=i;velocityX=velocityY=0;
  const origin=webglView?.getFaceBounds(i)||cube.querySelectorAll('.story-cube-face')[i].getBoundingClientRect();
  webglView?.flashFace(i);
  const face=cube.querySelectorAll('.story-cube-face')[i];face.classList.remove('face-selected');void face.offsetWidth;face.classList.add('face-selected');
  faceOpenTimer=setTimeout(()=>{
   faceOpenTimer=0;
   root.dispatchEvent(new CustomEvent('tale:cube-open',{detail:{index:data[i][4],origin:{x:origin.x,y:origin.y,width:origin.width,height:origin.height}}}));
  },reduced.matches?0:230);
 }

 data.forEach(([name,caption,bg,actor,index],i)=>{
  const face=document.createElement('button');face.className='story-cube-face cube-face-'+i;face.type='button';face.setAttribute('aria-label','스토리 열기 · '+caption);face.style.setProperty('--cube-image',`url("images/interactive/${bg}")`);
  face.innerHTML=`<span class="cube-face-photo"></span><img src="images/interactive/${actor}-actor.webp" alt="" draggable="false"><span class="cube-face-border"></span><span class="cube-face-sheen"></span>`;
  face.addEventListener('click',()=>openFace(i));cube.append(face);
  const button=document.createElement('button');button.type='button';button.textContent=String(i+1).padStart(2,'0');button.setAttribute('aria-label','큐브 회전 · '+caption);button.addEventListener('click',()=>orient(i));selectors.append(button);
 });
 viewport.addEventListener('pointerdown',event=>{if(event.button!==0)return;visible=true;clearTimeout(faceOpenTimer);faceOpenTimer=0;stopSpin();float.classList.add('is-held');cube.classList.remove('is-orienting');drag={id:event.pointerId,x:event.clientX,y:event.clientY,rx:x,ry:y,lastX:event.clientX,lastY:event.clientY,lastAt:performance.now()};moved=false;suppressClick=false;});
 viewport.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!moved&&Math.hypot(dx,dy)>7){moved=true;viewport.setPointerCapture(event.pointerId);cube.classList.add('is-dragging');}
  if(!moved)return;
  const now=performance.now(),dt=Math.max(8,now-drag.lastAt)/1000;
  velocityY=Math.max(-110,Math.min(110,(event.clientX-drag.lastX)*.45/dt));
  velocityX=Math.max(-110,Math.min(110,-(event.clientY-drag.lastY)*.45/dt));
  drag.lastX=event.clientX;drag.lastY=event.clientY;drag.lastAt=now;
  y=drag.ry+dx*.45;x=drag.rx-dy*.45;render();nearest();
 });
 function release(event){if(!drag||drag.id!==event.pointerId)return;suppressClick=moved;if(event.type==='pointercancel'||performance.now()-drag.lastAt>100||!moved)velocityX=velocityY=0;drag=null;float.classList.remove('is-held');cube.classList.remove('is-dragging');if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);nearest();resume();}
 viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);addEventListener('pointerup',release);addEventListener('pointercancel',release);
 viewport.addEventListener('lostpointercapture',()=>{if(drag){drag=null;float.classList.remove('is-held');cube.classList.remove('is-dragging');resume();}});
 host.querySelector('.cube-prev').addEventListener('click',()=>orient(selected-1));host.querySelector('.cube-next').addEventListener('click',()=>orient(selected+1));
 viewport.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();orient(selected+(event.key==='ArrowRight'?1:-1));}else if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();orient(event.key==='ArrowUp'?4:5);}else if(event.key==='Enter'&&event.target===viewport){event.preventDefault();suppressClick=false;openFace(selected);}});
 // Reveal the title as the reader leaves the character gallery.
 title.innerHTML=['STORY','CUBE'].map((word,row)=>'<span class="cube-title-mask"><span class="cube-title-line" style="--line:'+row+'">'+word+'</span></span>').join('');

 let depthFrame=0,scrollDepth=.5;
 function updateDepth(){
  depthFrame=0;const rect=root.getBoundingClientRect();
  scrollDepth=reduced.matches?.5:Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));
  root.style.setProperty('--cube-title-scale',String(.88+scrollDepth*.32));
  root.style.setProperty('--cube-title-y',((scrollDepth-.5)*-38)+'px');
  root.style.setProperty('--cube-object-scale',String(.96+scrollDepth*.08));
  webglView?.setDepth(scrollDepth);
 }
 function scheduleDepth(){if(!depthFrame)depthFrame=requestAnimationFrame(updateDepth);}
 addEventListener('scroll',scheduleDepth,{passive:true});addEventListener('resize',scheduleDepth);reduced.addEventListener('change',scheduleDepth);updateDepth();
 title.setAttribute('aria-label','STORY CUBE');title.querySelectorAll('span').forEach(span=>span.setAttribute('aria-hidden','true'));
 const titleObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>title.classList.toggle('is-revealed',entry.isIntersecting));},{threshold:.6});titleObserver.observe(title);
 const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible)resume();else stopSpin();root.classList.toggle('cube-in-view',visible);},{threshold:.01});observer.observe(viewport);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpin();else resume();});
 reduced.addEventListener('change',()=>{stopSpin();resume();});
 addEventListener('pagehide',()=>{clearTimeout(faceOpenTimer);stopSpin();observer.disconnect();titleObserver.disconnect();webglView?.dispose();cancelAnimationFrame(depthFrame);removeEventListener('scroll',scheduleDepth);removeEventListener('resize',scheduleDepth);});
 import('./story-cube-webgl.js?v=20261107-rotation4').then(module=>module.createStoryCube(viewport,data,openFace,reduced)).then(view=>{
  webglView=view;webglView.setRotation(x,y,Boolean(drag));webglView.setDepth(scrollDepth);root.classList.add('cube-webgl-ready');
 }).catch(error=>console.warn('WebGL cube unavailable; retaining interactive CSS cube.',error));
 render();nearest();
})();
