/* Native text stays sharp; small pooled trails stop rendering when idle. */
(() => {
  const stage = document.querySelector('.library-stage');
  const title = document.querySelector('#tale-title');
  if (!stage || !title) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const canvas = document.createElement('canvas');
  canvas.className = 'tale-hover-trails';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cursor = document.createElement('div');
  cursor.className = 'tale-mouse-dot';
  cursor.setAttribute('aria-hidden', 'true');
  stage.append(canvas, cursor);
  let width, height, rect, visible = true, frame = 0, last = 0, lastStamp = 0;
  let pointer = null, previous = null, particles = [], kind = document.body.dataset.tale;
  const water = new Image();
  water.src = 'assets/hidden-mermaid-v1.webp';
  const lens = document.createElement('canvas'); lens.width = 320; lens.height = 220;
  const lensCtx = lens.getContext('2d');
  const lensMask = document.createElement('canvas'); lensMask.width = 320; lensMask.height = 220;
  const maskCtx = lensMask.getContext('2d');
  // Overlapping soft lobes form an uneven patch, never a drawn ripple ring.
  for (const [x, y, rx, ry] of [[135,105,116,84],[210,105,88,70],[90,140,70,60],[175,60,91,53],[225,145,69,53]]) {
    maskCtx.save(); maskCtx.translate(x, y); maskCtx.scale(rx, ry);
    const feather = maskCtx.createRadialGradient(0, 0, .1, 0, 0, 1);
    feather.addColorStop(0, '#fff'); feather.addColorStop(.4, '#ffffffc0'); feather.addColorStop(1, '#fff0');
    maskCtx.fillStyle = feather; maskCtx.fillRect(-1, -1, 2, 2); maskCtx.restore();
  }
  function resize() {
    rect = stage.getBoundingClientRect(); width = rect.width; height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function allowed() {
    return visible && !document.hidden && fine.matches && !reduced.matches &&
      !document.body.classList.contains('opening') && !document.body.classList.contains('reading');
  }
  function clear() {
    cancelAnimationFrame(frame); frame = 0; particles = []; pointer = previous = null;
    stage.classList.remove('has-tale-pointer'); title.style.removeProperty('mask-image');
    ctx.clearRect(0, 0, width, height);
  }
  function draw(now) {
    frame = 0;
    if (!allowed()) { clear(); return; }
    ctx.clearRect(0, 0, width, height);
    particles = particles.filter(p => now - p.born < p.life);
    for (const p of particles) {
      const age = (now - p.born) / p.life, fade = Math.sin(Math.PI * age);
      ctx.save(); ctx.translate(p.x, p.y);
      if (kind === '0') {
        ctx.translate(p.dx * age + Math.sin(age * 5 + p.angle) * 7, age * 28 + age * age * 95);
        const size = p.size * (1 - age * .65);
        ctx.globalAlpha = Math.min(1, age * 16) * (1 - age) * .95;
        ctx.shadowColor = '#dec5ff'; ctx.shadowBlur = p.size > 1.5 ? 5 : 0;
        ctx.fillStyle = p.size > 1.5 ? '#e3d4fa' : '#fff4e5';
        ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
      } else if (kind === '2') {
        // Feathered strips bend the painted water; no ring or hard lens edge.
        if (water.complete && water.naturalWidth) {
          const scale = Math.max(width / water.width, height / water.height);
          const dw = water.width * scale, dh = water.height * scale;
          lensCtx.clearRect(0, 0, 320, 220);
          for (let y = 0; y < 220; y += 8) {
            lensCtx.save(); lensCtx.beginPath(); lensCtx.rect(0, y, 320, 8); lensCtx.clip();
            const bend = (Math.sin(y * .032 + age * 5 + p.angle) * 17 + Math.sin(y * .067 - age * 3) * 6) * fade;
            lensCtx.drawImage(water, (width - dw) / 2 - p.x + 160 + bend,
              (height - dh) / 2 - p.y + 110 + Math.sin(age * 4 + y * .02) * 7 * fade, dw, dh);
            lensCtx.restore();
          }
          lensCtx.globalCompositeOperation = 'destination-in'; lensCtx.drawImage(lensMask, 0, 0);
          lensCtx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = fade * .85; ctx.drawImage(lens, -160, -110);
        }
      }
      ctx.restore();
    }
    last = now;
    if (particles.length) frame = requestAnimationFrame(draw);
  }
  function wake() { if (!frame && allowed()) frame = requestAnimationFrame(draw); }
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !allowed()) return;
    rect = stage.getBoundingClientRect();
    pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    stage.classList.add('has-tale-pointer');
    cursor.style.transform = 'translate3d(' + (pointer.x - 7) + 'px,' + (pointer.y - 7) + 'px,0)';
    const r = title.getBoundingClientRect();
    if (e.clientX >= r.left - 70 && e.clientX <= r.right + 70 && e.clientY >= r.top - 70 && e.clientY <= r.bottom + 70) {
      title.style.maskImage = `radial-gradient(ellipse 95px 65px at ${e.clientX - r.left}px ${e.clientY - r.top}px,#0005 0%,#0009 45%,#000 100%)`;
    } else title.style.removeProperty('mask-image');
    const now = performance.now(), distance = previous ? Math.hypot(pointer.x - previous.x, pointer.y - previous.y) : 20;
    if (now - lastStamp > (kind === '2' ? 170 : 45) && distance > 9 && (kind === '0' || kind === '2')) {
      const count = kind === '0' ? 8 : 1;
      for (let i = 0; i < count; i++) particles.push({
        x: pointer.x + (Math.random() - .5) * 13,
        y: pointer.y + (Math.random() - .5) * 9,
        born: now - Math.random() * 70, life: kind === '0' ? 1500 + Math.random() * 450 : 1400,
        dx: (Math.random() - .5) * 40, angle: Math.random() * Math.PI,
        size: kind === '0' ? .8 + Math.random() * 2.1 : 4 });
      if (particles.length > 180) particles.splice(0, particles.length - 180);
      previous = pointer; lastStamp = now; wake();
    }
  }, { passive: true });
  stage.addEventListener('pointerleave', () => {
    pointer = previous = null; stage.classList.remove('has-tale-pointer'); title.style.removeProperty('mask-image');
  });
  const state = new MutationObserver(() => {
    const next = document.body.dataset.tale;
    if (next !== kind || document.body.classList.contains('opening') || document.body.classList.contains('reading')) {
      kind = next; clear();
    }
  });
  state.observe(document.body, { attributes: true, attributeFilter: ['data-tale', 'class'] });
  const view = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; if (!visible) clear();
  });
  view.observe(stage);
  const size = new ResizeObserver(() => { clear(); resize(); }); size.observe(stage);
  document.addEventListener('visibilitychange', clear);
  reduced.addEventListener('change', clear); fine.addEventListener('change', clear);
  addEventListener('pagehide', () => { clear(); state.disconnect(); view.disconnect(); size.disconnect(); });
  resize();
})();
