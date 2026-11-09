(()=>{
const section=document.querySelector('.fairytale-history'),stage=section?.querySelector('.history-stage');if(!stage)return;
const intro=document.createElement('div');intro.className='history-opening-title';intro.setAttribute('aria-hidden','true');intro.innerHTML='<span>THE HISTORY OF</span><strong>LITTLE RED<br>RIDING HOOD</strong><p>빨간모자의 역사</p>';
const ink=document.createElement('div');ink.className='history-diagonal-ink';ink.setAttribute('aria-hidden','true');stage.append(intro,ink);
const clamp=v=>Math.max(0,Math.min(1,v));const reduced=matchMedia('(prefers-reduced-motion: reduce)');let entered=false;
new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!entered){entered=true;intro.classList.add('is-visible')}},{threshold:0}).observe(section);
section.addEventListener('historyintroprogress',event=>{const t=event.detail.t,bridge=t>=5.9,spread=clamp(bridge?(t-5.9)/1.35:(t+5.55)/1.35),front=spread*2.55-.23;
intro.style.visibility=t< -3.95?'visible':'hidden';intro.style.opacity=String(1-clamp((spread-.76)/.24));ink.style.opacity=String(bridge?1-clamp((t-10.55)/.55):(t<-.3?1:1-clamp((t+.3)/.7)));ink.style.visibility=(t<.4||(t>=5.9&&t<11.1))?'visible':'hidden';section.classList.toggle('history-ink-era',t<0||(t>=5.9&&t<10.8));
if(t<.4||(t>=5.9&&t<11.1)){const points=['110% -10%'];for(let i=0;i<=64;i++){const y=-.1+i/64*1.2,wave=(Math.sin(y*19+spread*3)*.055+Math.sin(y*39-spread*4)*.026+Math.cos(y*9+spread)*.075)*Math.sin(spread*Math.PI);const x=1+y-front+wave;points.push(`${x*100}% ${y*100}%`)}points.push('110% 110%');ink.style.clipPath=`polygon(${points.join(',')})`}
const year=section.querySelector('.history-year');if(t>=5.9&&t<11.1){const arrive=clamp((t-7.25)/1.2),ease=1-Math.pow(1-arrive,2.5);year.style.opacity=String(clamp((t-7.25)/.3)*(1-clamp((t-10.1)/.6)));section.querySelector('#history-number').style.transform=reduced.matches?'none':`translateY(${(1-ease)*60}px) scale(${.12+ease*.98})`;}if(t<0){const arrive=clamp((t+4.1)/1.2),ease=1-Math.pow(1-arrive,2.5);year.style.opacity=String(clamp((t+4.15)/.3)*(1-clamp((t+.95)/.55)));section.querySelector('#history-number').style.transform=reduced.matches?'none':`translateY(${(1-ease)*60}px) scale(${.12+ease*.98})`;year.style.setProperty('--intro-year-glow',String(ease))}
});
})();

