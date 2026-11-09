(() => {
 const hero=document.querySelector('#main-intro'),archive=document.querySelector('#book-scene');if(!hero||!archive)return;
 if(location.protocol==='file:'){
  const notice=document.createElement('div');notice.style.cssText='position:fixed;inset:0;z-index:9999;display:grid;place-content:center;gap:18px;padding:30px;background:#202831;color:#eee;text-align:center;font:16px/1.8 sans-serif';
  notice.innerHTML='<h1 style="font:32px Georgia;margin:0">DARK FAIRY TALE</h1><p>3D 모델은 실행 서버를 통해 열어야 표시됩니다.<br>fairytale-web 폴더의 <b>START-FAIRYTALE.cmd</b>를 실행해 주세요.</p><a href="http://127.0.0.1:4174/" style="color:#ead7ac">이미 실행 중이라면 여기를 눌러 열기 →</a>';
  document.body.append(notice);return;
 }
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=x=>Math.max(0,Math.min(1,x));
 const wrap=document.createElement('div');wrap.className='forest-journey';hero.before(wrap);wrap.append(hero);
 const caption=document.createElement('div');caption.className='journey-caption';caption.setAttribute('aria-live','polite');hero.append(caption);
 const hint=hero.querySelector('.main-intro__scroll');if(hint){hint.textContent='SCROLL TO EXPLORE';hint.setAttribute('aria-label','스크롤하여 신전 탐험하기');}
 const progress=document.createElement('div');progress.className='journey-progress';progress.innerHTML='<span>THE JOURNEY</span><i></i>';hero.append(progress);
 const open=document.createElement('button');open.type='button';open.className='journey-open';open.innerHTML='<span>FOUR TALES · UNANSWERED QUESTIONS</span><strong>Beyond the tale</strong><small>이야기 너머로</small>';open.disabled=true;hero.append(open);
 const wash=document.createElement('div');wash.className='journey-light';wash.setAttribute('aria-hidden','true');
 wash.innerHTML='<div class="journey-loading-flock" aria-hidden="true"></div><div class="journey-loading-copy"><span class="journey-loading-kicker">THE FORBIDDEN COLLECTION</span><p class="journey-loading-title">Loading<span>…</span></p><div class="journey-loading-track" role="progressbar" aria-label="동화책 준비 중" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><span class="journey-loading-note">A story is about to unfold</span></div>';
 const flock=wash.querySelector('.journey-loading-flock');
 for(let i=0;i<5;i++){
  const flight=document.createElement('div');flight.className='loading-butterfly-flight';flight.style.setProperty('--i',i);
  flight.innerHTML='<svg class="loading-butterfly" viewBox="0 0 100 80"><defs><radialGradient id="loading-wing-'+i+'"><stop stop-color="#d9f6ff"/><stop offset=".4" stop-color="#51c5ff"/><stop offset="1" stop-color="#164db9"/></radialGradient></defs><g fill="url(#loading-wing-'+i+')" stroke="#91dcff" stroke-width=".5"><path class="loading-wing-left" d="M49 40C34 5 4 1 8 25C10 40 26 45 40 44C15 44 18 70 32 65C42 62 47 49 49 40Z"/><path class="loading-wing-right" d="M51 40C66 5 96 1 92 25C90 40 74 45 60 44C85 44 82 70 68 65C58 62 53 49 51 40Z"/></g><path d="M50 28Q46 43 50 56Q54 43 50 28" fill="#d4efff"/><path d="M49 31L44 23M51 31L56 23" fill="none" stroke="#9adaff" stroke-width="1"/></svg>';
  flock.append(flight);
 }
 document.body.append(wash);
 const stations=[['I · THE WATCHER','괴물에게는 자신의 이야기를 들려줄 기회가 없었다'],['II · THE TIDE','어떤 소원은 목소리보다 더 많은 것을 앗아간다'],['III · THE CROWN','왕관은 어떤 이야기가 살아남을지 결정한다'],['IV · THE KEEPER','잊힌다고 해서 사라지는 것은 아니다']];let current=-2,entering=false;
 function update(){const rect=wrap.getBoundingClientRect(),distance=wrap.offsetHeight-innerHeight,p=clamp(-rect.top/Math.max(1,distance));window.ForestJourneyProgress=p;hero.dataset.progress=p.toFixed(3);hero.style.setProperty('--journey',p);hero.style.setProperty('--title-opacity',1-clamp(p/.12));const centers=[.19,.39,.59,.77];let index=-1,alpha=0;centers.forEach((v,i)=>{const a=clamp((.095-Math.abs(p-v))/.035);if(a>alpha){alpha=a;index=i;}});if(index!==current){current=index;caption.innerHTML=index<0?'':`<span>${stations[index][0]}</span><p>${stations[index][1]}</p>`;caption.classList.toggle('caption-right',index%2===0);}hero.style.setProperty('--caption-opacity',alpha);const final=clamp((p-.89)/.07);hero.style.setProperty('--final-opacity',final);const ready=hero.dataset.bookReady==='true';open.disabled=final<.95||!ready;open.tabIndex=final>.95&&ready?0:-1;open.querySelector('small').textContent=ready?'이야기 너머로':'책을 불러오는 중';progress.querySelector('i').style.transform=`scaleY(${p})`;}
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update);addEventListener('temple-assets-ready',update);update();
 const end=()=>scrollTo({top:scrollY+wrap.getBoundingClientRect().top+wrap.offsetHeight-innerHeight,behavior:reduced.matches?'instant':'smooth'});
 function home(){if(entering)return;document.body.classList.remove('library-entered');archive.setAttribute('inert','');hero.removeAttribute('inert');window.ForestBookOpening=0;scrollTo({top:0,behavior:'instant'});update();}
 function enter(){
  if(entering||Number(hero.dataset.progress)<.93)return;
  entering=true;window.ForestBookOpening=0;
  const frame=document.querySelector('#book-library-frame');
  const bar=wash.querySelector('[role="progressbar"]'),fill=bar.querySelector('i');
  let shown=0,completedAt=0;const started=performance.now(),duration=reduced.matches?250:2180;
  fill.style.transform='scaleX(0)';bar.setAttribute('aria-valuenow','0');
  wash.setAttribute('aria-hidden','false');wash.setAttribute('aria-busy','true');
  document.body.classList.add('journey-loading');
  function tick(now){
   let ready=false;
   try{ready=frame.contentDocument?.body?.dataset.libraryReady==='true';}catch{}
   const elapsed=now-started;
   const target=.92*(1-Math.exp(-elapsed/(duration*.35)));
   shown=Math.max(shown,target);
   if(ready&&elapsed>=duration){
    if(!completedAt)completedAt=now;
    shown=.92+.08*clamp((now-completedAt)/220);
   }
   fill.style.transform='scaleX('+shown+')';bar.setAttribute('aria-valuenow',String(Math.floor(shown*100)));
   if(shown<1){requestAnimationFrame(tick);return;}
   wash.setAttribute('aria-busy','false');
   setTimeout(()=>{
    document.body.classList.add('library-entered');archive.removeAttribute('inert');hero.setAttribute('inert','');
    scrollTo({top:0,behavior:'instant'});
    document.body.classList.remove('journey-loading');
    setTimeout(()=>{wash.setAttribute('aria-hidden','true');entering=false;frame?.focus({preventScroll:true});},reduced.matches?0:600);
   },reduced.matches?0:100);
  }
  requestAnimationFrame(tick);
 }

 window.ForestOpenBook=enter;open.addEventListener('click',enter);archive.setAttribute('inert','');
 // Return from a tale directly to the four-book collection.
 const returnURL=new URL(location.href);
 if(['library','book'].includes(returnURL.searchParams.get('return'))){
  document.body.classList.add('library-entered');archive.removeAttribute('inert');hero.setAttribute('inert','');
  scrollTo({top:0,behavior:'instant'});returnURL.searchParams.delete('return');returnURL.hash='';
  history.replaceState(history.state,'',returnURL.pathname+returnURL.search);
 }

 document.addEventListener('click',e=>{const link=e.target.closest('a');if(link?.getAttribute('href')==='#book-scene'){e.preventDefault();e.stopImmediatePropagation();if(!document.body.classList.contains('library-entered'))end();}else if(link?.getAttribute('href')==='#main-intro'){e.preventDefault();e.stopImmediatePropagation();home();}},true);
 addEventListener('message',e=>{if(e.origin===location.origin&&e.source===document.querySelector('#book-library-frame')?.contentWindow&&e.data==='fairytale:home'){e.stopImmediatePropagation();home();}},true);
 const script=document.createElement('script');script.src=new URL('forest-entry/forest-three.js',document.baseURI).href;document.head.append(script);
})();



