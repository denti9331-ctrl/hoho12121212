/* Load flowers only when Cinderella is selected; suspend offscreen playback. */
(() => {
  'use strict';
  const stage = document.querySelector('.library-stage');
  const worlds = stage?.querySelector('.worlds');
  if (!worlds) return;
  const video = document.createElement('video');
  video.className = 'library-cinderella-flower';
  video.muted = video.defaultMuted = true;
  video.loop = video.playsInline = true;
  video.defaultPlaybackRate = video.playbackRate = 1;
  video.preload = 'none';
  video.tabIndex = -1;
  video.setAttribute('aria-hidden', 'true');
  worlds.append(video);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  function update() {
    const active = document.body.dataset.tale === '0' && visible && !document.hidden && !reduced.matches;
    video.classList.toggle('is-active', active);
    if (active) {
      if (!video.getAttribute('src')) video.src = '../assets/cinderella-glue-optimized.webm';
      if (video.paused) video.play().catch(() => {});
    } else video.pause();
  }
  const state = new MutationObserver(update);
  state.observe(document.body, { attributes: true, attributeFilter: ['data-tale'] });
  const viewport = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    update();
  }, { threshold: .01 });
  viewport.observe(stage);
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  addEventListener('pagehide', () => {
    video.pause();
    state.disconnect();
    viewport.disconnect();
    document.removeEventListener('visibilitychange', update);
    reduced.removeEventListener('change', update);
  });
  update();
})();
