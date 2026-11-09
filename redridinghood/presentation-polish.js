(() => {
  const video = document.querySelector('.hero-petals');
  if (!video) return;
  document.body.append(video);
  video.classList.add('global-petals');
  video.src = '../assets/redhood-fall-optimized.webm';
  video.muted = video.defaultMuted = true;
  video.loop = video.playsInline = true;
  video.preload = 'auto';
  video.dataset.petalRole = 'fall-loop';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function sync() {
    if (document.hidden || reduced.matches) video.pause();
    else if (video.paused) video.play().catch(() => {});
  }
  video.addEventListener('loadeddata', sync, {once:true});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  addEventListener('pagehide', () => video.pause());
  sync();
})();