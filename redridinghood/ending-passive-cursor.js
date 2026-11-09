(()=>{
const surface=document.querySelector('.ending-interactive-surface');if(!surface||matchMedia('(pointer:coarse),(prefers-reduced-motion:reduce)').matches)return;
const ring=document.createElement('div');ring.className='ending-passive-cursor';ring.setAttribute('aria-hidden','true');document.body.append(ring);
const interactive='a,button,input,select,textarea,summary,[role="button"],.ending-letter';let frame=0,x=0,y=0;
function paint(){frame=0;ring.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`}
surface.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse')return;x=event.clientX;y=event.clientY;const passive=!event.target.closest(interactive);surface.classList.toggle('passive-cursor-area',passive);ring.classList.toggle('is-visible',passive);if(!frame)frame=requestAnimationFrame(paint)},{passive:true});
function hide(){surface.classList.remove('passive-cursor-area');ring.classList.remove('is-visible')}
surface.addEventListener('pointerleave',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});addEventListener('pagehide',()=>{cancelAnimationFrame(frame);ring.remove()});
})();
