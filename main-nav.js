(() => {
 const nav=document.querySelector('.main-navigation');if(!nav)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 nav.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const target=document.getElementById(link.hash.slice(1));if(!target)return;
  event.preventDefault();
  const top=link.hash==='#main-intro'?0:scrollY+target.getBoundingClientRect().top-nav.offsetHeight;
  window.scrollTo({top:Math.max(0,top),behavior:reduced.matches?'instant':'smooth'});
 }));
 // ABOUT retains the existing script.js dialog handler and its native focus restoration.
})();
(()=>{
const nav=document.querySelector('.main-navigation');if(!nav)return;let frame=0;function update(){frame=0;const journey=document.querySelector('.forest-journey');let show=document.body.classList.contains('library-entered');if(journey&&!show){const r=journey.getBoundingClientRect(),p=Math.max(0,-r.top/Math.max(1,journey.offsetHeight-innerHeight));show=p>=.675}if(document.body.classList.contains('main-nav-visible')!==show)document.body.classList.toggle('main-nav-visible',show);nav.inert=!show;nav.setAttribute('aria-hidden',String(!show))}function schedule(){if(!frame)frame=requestAnimationFrame(update)}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});addEventListener('DOMContentLoaded',schedule,{once:true});schedule();
})();
