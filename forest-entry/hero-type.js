(() => {
 'use strict';
 const hero=document.querySelector('#main-intro');
 if(!hero||location.protocol==='file:')return;
 const caption=hero.querySelector('.journey-caption');
 if(!caption)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:767px)'),clamp=x=>Math.max(0,Math.min(1,x));
 let lines=[],station=-1,frame=0;
 const centers=[.19,.39,.59,.77];
 const observer=new MutationObserver(build);
 function build(){
  observer.disconnect();lines=[];
  const label=caption.querySelector(':scope > span');
  station=label?['I ·','II ·','III ·','IV ·'].findIndex(prefix=>label.textContent.startsWith(prefix)):-1;
  if(station>=0&&!caption.querySelector('.caption-english')){
   const english=document.createElement('p');english.className='caption-english';
   english.textContent=['The monster never got to tell its story','Some wishes cost more than a voice','The crown decides which stories survive','What is forgotten does not cease to exist'][station];
   label.after(english);
  }
  for(const block of [...caption.children]){
   const text=block.textContent.trim();if(!text)continue;
   block.replaceChildren();
   const tokens=text.split(/(\s+)/).filter(Boolean),groups=[];
   for(const token of tokens){const span=document.createElement('span');span.textContent=token;span.style.whiteSpace='pre';block.append(span);const top=span.offsetTop;let group=groups.find(g=>g.top===top);if(!group){group={top,text:''};groups.push(group);}group.text+=token;}
   block.replaceChildren(...groups.map(group=>{const line=document.createElement('span');line.className='type-line';line.textContent=group.text.trim();lines.push(line);return line;}));
  }
  if(lines.length){const diamond=document.createElement('i');diamond.className='type-diamond';diamond.setAttribute('aria-hidden','true');caption.append(diamond);}
  observer.observe(caption,{childList:true});paint();
 }
 function paint(){
  frame=0;const p=Number(hero.dataset.progress||0),center=centers[station];let maximum=0;
  lines.forEach((line,i)=>{const lag=i*.006;const alpha=center===undefined?0:Math.min(clamp((p-(center-.095)-lag)/.035),clamp((center+.095+lag-p)/.035));maximum=Math.max(maximum,alpha);line.style.opacity=String(alpha);line.style.filter=reduced.matches||mobile.matches?'none':`blur(${((1-alpha)*40).toFixed(2)}px)`;});
  caption.style.setProperty('--frame-alpha',String(maximum));
  const a=clamp(p/.12);hero.querySelector('.main-intro__copy').style.filter=reduced.matches||mobile.matches?'none':`blur(${a*40}px)`;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{if(station>=0){caption.querySelector('.type-diamond')?.remove();build();}else paint();});
 reduced.addEventListener('change',schedule);mobile.addEventListener('change',schedule);
 build();
 let active=[];
 function enter(){active.forEach(a=>a.cancel());active=[];if(reduced.matches)return;hero.querySelectorAll('.main-intro__eyebrow,h1,.main-intro__description').forEach((element,i)=>{if(element.animate)active.push(element.animate([{opacity:0,filter:mobile.matches?'none':'blur(40px)'},{opacity:1,filter:'blur(0px)'}],{duration:1200,delay:i*100,easing:'linear',fill:'backwards'}));});}
 reduced.addEventListener('change',()=>{if(reduced.matches)active.forEach(a=>a.cancel());});
 new MutationObserver(()=>{if(!hero.hasAttribute('inert')){paint();enter();}}).observe(hero,{attributes:true,attributeFilter:['inert']});
 enter();
})();



