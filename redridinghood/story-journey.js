(()=>{'use strict';const root=document.querySelector('.story-journey'),stage=root.querySelector('.tale-stage'),host=root.querySelector('.tale-scenes'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const stories=[{chapter:'I / THE PROMISE',title:'작은 바구니, 하나의 약속',copy:['소녀는 할머니께 드릴 음식을 들고 집을 나섭니다','길에서 벗어나지 말라는 엄마의 말을 마음에 담고'],props:[['oak',4,19,55,56],['firs',25,22,52,68],['house',63,27,45,65],['tree',79,19,40,25],['redhood',56,18,46,15]]},{chapter:'II / THE STRANGER',title:'숲에서 만난 다정한 낯선 이',copy:['늑대는 소녀에게 목적지를 묻고 꽃밭으로 눈을 돌리게 합니다','소녀가 꽃을 따는 동안, 늑대는 먼저 길을 나섭니다'],props:[['oak',1,23,62,45],['firs',28,25,57,70],['tree',72,23,49,55],['redhood',28,20,48,14],['wolf',52,32,35,17]]},{chapter:'III / THE COTTAGE',title:'문을 두드린 것은 누구였을까',copy:['할머니 집에 먼저 도착한 늑대는 소녀의 목소리를 흉내 냅니다','문이 열리고, 늑대는 할머니를 삼킨 뒤 침대에 눕습니다'],props:[['firs',4,25,48,65],['house',34,45,62,38],['tree',78,18,42,28],['wolf',18,30,34,12]]},{chapter:'IV / THOSE EYES',title:'할머니, 눈이 왜 그렇게 커요',copy:['뒤늦게 도착한 소녀는 침대 속 할머니를 낯설게 느낍니다','늑대는 커다란 입을 벌리고, 소녀마저 삼켜 버립니다'],props:[['house',37,43,65,51],['oak',2,23,53,55],['tree',78,19,44,44],['redhood',27,20,48,13],['wolf',53,31,37,15]]},{chapter:'V / THE REMEMBERED ENDING',title:'그리고, 우리가 기억하는 구원',copy:['사냥꾼이 늑대의 배를 갈라 소녀와 할머니를 구해 냅니다','하지만 모든 판본이 이 결말로 끝나지는 않습니다'],props:[['firs',3,26,51,66],['house',57,32,50,59],['tree',76,21,44,28],['redhood',27,18,45,13],['hunter',53,20,52,20]]}];


const places=['narrative-promise-bg.webp','narrative-stranger-bg.webp','narrative-door-bg.webp','narrative-bed-bg.webp','narrative-rescue-bg.webp'],names=['THE PROMISE','THE STRANGER','THE COTTAGE','THOSE EYES','BEYOND THE TALE'],actors=[['narrative-promise'],['narrative-stranger-girl'],['narrative-door'],['narrative-bed'],['narrative-rescue']],panelActors=['narrative-promise','narrative-stranger','narrative-door','narrative-bed','narrative-rescue'],glows=['#d7a16d','#3c648c','#dfae70','#754355','#c4b5a5'];let index=-1,busy=false,queued=null,started=false,introPlayed=false,pending=false,entryTimer=0,finishTimer=0,activeAnimations=[],scrollTarget=null,scrollTimer=0;const clamp=x=>Math.max(0,Math.min(1,x));
places.forEach(p=>{const img=new Image();img.src='images/interactive/'+p;});
const scenes=stories.map((s,i)=>{const el=document.createElement('article');el.className='tale-scene';el.dataset.scene=i;el.style.setProperty('--place','url(images/interactive/'+places[i]+')');el.style.setProperty('--glow',glows[i]);el.setAttribute('aria-hidden','true');el.inert=true;const shift=document.createElement('div');shift.className='tale-photo-shift';const photo=document.createElement('div');photo.className='tale-photo';shift.append(photo);const atmosphere=document.createElement('div');atmosphere.className='tale-atmosphere';const lamp=document.createElement('div');lamp.className='tale-lamp';el.append(atmosphere,lamp);const shade=document.createElement('div');shade.className='tale-vignette';const title=document.createElement('div');title.className='tale-giant-title';title.textContent=names[i];title.setAttribute('aria-hidden','true');const figures=document.createElement('div');figures.className='tale-figure';actors[i].forEach((name,j)=>{const shell=document.createElement('div');shell.className='tale-actor-shell';const img=document.createElement('img');img.src='images/interactive/'+name+'-actor.webp';img.alt=['엄마에게 바구니를 받는 빨간모자','꽃을 따는 빨간모자를 숨어 보는 늑대','할머니 집 문을 두드리는 늑대','침대 속 늑대를 보고 놀라는 빨간모자','빨간모자와 할머니를 구한 사냥꾼'][i];if(j)shell.classList.add('secondary');shell.append(img);figures.append(shell);});const copy=document.createElement('div');copy.className='tale-copy';const kicker=document.createElement('p');kicker.className='tale-kicker';kicker.textContent=s.chapter;const h=document.createElement('h3');h.textContent=s.title;const p=document.createElement('p');p.className='tale-story-text';p.append(document.createTextNode(s.copy[0]),document.createElement('br'),document.createTextNode(s.copy[1]));copy.append(kicker,h,p);if(i===4){const a=document.createElement('a');a.href='#endings';a.textContent='이 결말이 전부였을까 ↗';copy.append(a);}el.append(shift,shade,title,figures,copy);host.append(el);return el;});
const panels=root.querySelector('.tale-panels');
root.querySelector('.tale-controls').inert=true;const dots=root.querySelector('.tale-dots');stories.forEach((s,i)=>{const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label',(i+1)+'번째 장면 · '+s.title);b.addEventListener('click',()=>go(i));dots.append(b);});for(let i=0;i<26;i++){const spark=document.createElement('i');spark.style.cssText='--x:'+((i*37)%100)+'%;--time:'+(12+i%9)+'s;--delay:'+(-i*.9)+'s';root.querySelector('.tale-sparks').append(spark);}
function animate(el,frames,options){const a=el.animate(frames,{fill:'both',...options});activeAnimations.push(a);return a;}
function resetAnimations(){activeAnimations.forEach(a=>a.cancel());activeAnimations=[];}
function state(i){root.dataset.page=String(i+1);root.dispatchEvent(new CustomEvent('tale:scene-change',{detail:{index:i}}));stage.style.setProperty('--scene-light',glows[i]);stage.style.setProperty('--dust-color',['#ecd3ad','#819cb7','#edc68d','#b18d9e','#ddd3bc'][i]);root.querySelector('.tale-count').textContent=String(i+1).padStart(2,'0')+' / 05';[...dots.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));root.querySelector('.tale-prev').disabled=i===0;root.querySelector('.tale-next').disabled=i===4;}
function show(i,instant=false){if(busy){queued=i;return;}if(i===index)return;if(!instant)resetAnimations();const old=index,direction=old<0||i>old?1:-1;index=i;state(i);const next=scenes[i],previous=old>=0?scenes[old]:null;next.classList.add('is-active');next.inert=false;next.setAttribute('aria-hidden','false');if(previous){previous.classList.remove('is-active');previous.classList.add('is-leaving');previous.inert=true;previous.setAttribute('aria-hidden','true');}if(root.classList.contains('cube-story')){
 resetAnimations();previous?.classList.remove('is-leaving');
 if(!reduced.matches){
  animate(next,[{opacity:0,transform:'translateX(20px)'},{opacity:1,transform:'translateX(0)'}],{duration:700,easing:'cubic-bezier(.2,.7,.2,1)'});
  animate(next.querySelector('.tale-figure'),[{opacity:0,transform:'translateY(15px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:850,easing:'cubic-bezier(.2,.7,.2,1)'});
  [...next.querySelector('.tale-copy').children].forEach((el,j)=>animate(el,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,delay:120+j*80,easing:'ease-out'}));
 }
 root.dataset.transition='idle';return;
}
if(instant||reduced.matches){previous?.classList.remove('is-leaving');return;}
busy=true;root.dataset.transition='moving';const opts={duration:1450,easing:'cubic-bezier(.22,.68,.22,1)'},lampStrength=parseFloat(getComputedStyle(next.querySelector('.tale-lamp')).opacity)||.2;animate(next.querySelector('.tale-atmosphere'),[{transform:'translateX('+(direction*24)+'%)',opacity:0},{transform:'translateX(0)',opacity:.24}],{duration:1550,easing:'ease-in-out'});animate(next.querySelector('.tale-lamp'),[{transform:'translateX('+(direction*100)+'px) scale(1.15)',opacity:0},{transform:'translateX(0) scale(1)',opacity:lampStrength}],{duration:1500,easing:'ease-in-out'});animate(next.querySelector('.tale-photo-shift'),[{transform:'translateX('+(direction*24)+'%) scale(1.12)',opacity:.45},{transform:'translateX(0) scale(1)',opacity:1}],opts);animate(next.querySelector('.tale-giant-title'),[{transform:'translateX('+(direction*130)+'px)',opacity:0},{transform:'translateX(0)',opacity:1}],{...opts,duration:1050,delay:100});next.querySelectorAll('.tale-actor-shell').forEach((img,j)=>animate(img,[{transform:'translateX('+(direction*(220+j*90))+'px) scale(.94)',opacity:0},{offset:.76,transform:'translateX('+(-direction*8)+'px) scale(1.015)',opacity:1},{transform:'translateX(0) scale(1)',opacity:1}],{...opts,duration:1150,delay:60+j*80}));[...next.querySelector('.tale-copy').children].forEach((el,j)=>animate(el,[{transform:'translateX('+(direction*45)+'px) translateY(10px)',opacity:0},{transform:'translate(0)',opacity:1}],{...opts,duration:650,delay:200+j*100}));if(previous){animate(previous.querySelector('.tale-photo-shift'),[{transform:'translateX(0) scale(1)',opacity:1},{transform:'translateX('+(-direction*21)+'%) scale(.96)',opacity:0}],{...opts,duration:1000});animate(previous.querySelector('.tale-figure'),[{opacity:1,translate:'0'},{opacity:0,translate:(-direction*180)+'px'}],{...opts,duration:750});animate(previous.querySelector('.tale-copy'),[{opacity:1},{opacity:0}],{duration:350});animate(previous.querySelector('.tale-giant-title'),[{opacity:1},{opacity:0,transform:'translateX('+(-direction*100)+'px)'}],{duration:600});}
finishTimer=setTimeout(()=>{previous?.classList.remove('is-leaving');resetAnimations();busy=false;root.dataset.transition='idle';const target=queued;queued=null;if(target!==null&&target!==index)show(target);},1600);}
function open(i){
 if(started){show(i);return;}if(busy)return;
 started=true;busy=true;root.dataset.transition='opening';root.classList.add('is-started');
 entryTimer=setTimeout(()=>{
  root.classList.add('is-started');root.classList.remove('cube-is-opening');
  root.querySelector('.tale-controls').inert=false;root.querySelector('.tale-intro').inert=false;
  busy=false;show(i,true);root.dataset.transition='idle';
  root.querySelector('.cube-return').hidden=false;
  root.querySelector('.cube-return').focus({preventScroll:true});
 },reduced.matches?0:170);
}
function go(i){open(Math.max(0,Math.min(4,i)));}
function update(){pending=false;}
function backToCube(){
 clearTimeout(entryTimer);clearTimeout(finishTimer);resetAnimations();busy=false;queued=null;started=false;index=-1;
 scenes.forEach(scene=>{scene.classList.remove('is-active','is-leaving');scene.inert=true;scene.setAttribute('aria-hidden','true');});
 root.classList.remove('is-started','cube-is-opening');root.querySelector('.tale-intro').inert=false;
 root.querySelector('.tale-controls').inert=true;root.querySelector('.cube-return').hidden=true;root.dataset.transition='idle';
 root.querySelector('.cube-viewport')?.focus({preventScroll:true});
}
const dismiss=document.createElement('button');dismiss.className='cube-panel-dismiss';dismiss.type='button';dismiss.setAttribute('aria-label','이야기 창 닫고 큐브로 돌아가기');dismiss.tabIndex=-1;dismiss.addEventListener('click',backToCube);stage.append(dismiss);
const returnButton=document.createElement('button');returnButton.className='cube-return';returnButton.textContent='↖ BACK TO THE CUBE';returnButton.hidden=true;returnButton.addEventListener('click',backToCube);stage.append(returnButton);
root.addEventListener('tale:cube-open',event=>{
 const origin=event.detail.origin;
 if(!started&&origin){
  const panel=root.querySelector('.tale-scenes'),rect=panel.getBoundingClientRect();
  panel.style.setProperty('--card-from-x',(origin.x+origin.width/2-rect.left-rect.width/2)+'px');
  panel.style.setProperty('--card-from-y',(origin.y+origin.height/2-rect.top-rect.height/2)+'px');
  panel.style.setProperty('--card-from-scale',String(Math.max(.35,Math.min(.85,origin.width/Math.max(1,rect.width)))));
 }
 go(event.detail.index);
});
root.addEventListener('keydown',event=>{if(event.key==='Escape'&&started)backToCube();});

function intro(){introPlayed=true;}

stage.addEventListener('tale:advance',e=>{if(index===e.detail.from&&!busy)go(index+1);});const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))intro();},{threshold:.12});observer.observe(stage);root.querySelector('.tale-enter').addEventListener('click',()=>go(0));root.querySelector('.tale-prev').addEventListener('click',()=>go(index-1));root.querySelector('.tale-next').addEventListener('click',()=>go(index+1));root.addEventListener('keydown',e=>{if(started&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1));}});stage.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=stage.getBoundingClientRect();stage.style.setProperty('--pointer-x',((e.clientX-r.left)/r.width-.5)*-16+'px');stage.style.setProperty('--pointer-y',((e.clientY-r.top)/r.height-.5)*-10+'px');});stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--pointer-x','0px');stage.style.setProperty('--pointer-y','0px');});addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);addEventListener('pagehide',()=>{observer.disconnect();clearTimeout(entryTimer);clearTimeout(finishTimer);clearTimeout(scrollTimer);resetAnimations();});state(0);update();})();



