// The signature moment: a phosphor oscilloscope tide across the hero.
// Continuous motion, so it has a visible pause control and stops under reduced motion
// (where it draws one composed frame instead of nothing).
import { reduced } from './core.js';

const TAU = Math.PI * 2;

export function initTide() {
  const canvas = document.getElementById('tide');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const pauseBtn = document.getElementById('tidePause');
  const rdFreq = document.getElementById('rdFreq');
  const rdAmp = document.getElementById('rdAmp');
  const rdState = document.getElementById('rdState');

  let w = 0, h = 0, dpr = 1;
  let phase = 0, last = 0, raf = 0;
  let paused = false;
  let visible = true;

  // wave state: multipliers on the drifting base
  const state = { freq: 1, amp: 1, tfreq: 1, tamp: 1, bend: 0, tbend: 0 };
  let drag = null;

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced) draw(0);
  }

  function scrollP() {
    return Math.min(1, Math.max(0, window.scrollY / (window.innerHeight || 1)));
  }

  function waveY(x, t, p) {
    const baseFreq = 0.0052 * (1 + p * 0.55) * state.freq;
    const centre = h * 0.53 + Math.sin(t * 0.16) * h * 0.01;
    const amp = h * 0.155 * (1 - p * 0.4) * state.amp;
    const ph = x * baseFreq + phase;
    const harmonic =
      Math.sin(ph) * 0.74 +
      Math.sin(ph * 2.03 + 0.9) * 0.15 +
      Math.sin(ph * 3.71 - 0.6) * 0.07 +
      Math.sin(ph * 0.51 + 1.7) * 0.12;
    const envelope = 0.82 + 0.18 * Math.sin((x / w) * Math.PI); // swells mid-screen
    return centre + harmonic * amp * envelope + state.bend * Math.sin((x / w) * Math.PI) * h * 0.05;
  }

  function draw(dt) {
    const p = scrollP();
    ctx.clearRect(0, 0, w, h);

    // measurement grid: sparse verticals + a zero line
    ctx.save();
    ctx.strokeStyle = 'rgba(236,230,216,0.055)';
    ctx.lineWidth = 1;
    const cols = 12;
    for (let i = 1; i < cols; i++) {
      const x = (w / cols) * i + 0.5;
      ctx.beginPath(); ctx.moveTo(x, h * 0.2); ctx.lineTo(x, h * 0.78); ctx.stroke();
    }
    ctx.setLineDash([2, 7]);
    ctx.strokeStyle = 'rgba(236,230,216,0.12)';
    ctx.beginPath(); ctx.moveTo(0, h * 0.53); ctx.lineTo(w, h * 0.53); ctx.stroke();
    ctx.restore();

    // sample the trace
    const step = Math.max(2, Math.floor(w / 620));
    const pts = [];
    for (let x = -4; x <= w + 4; x += step) pts.push([x, waveY(x, 0, p)]);

    const stroke = (pts2, width, alpha, blur) => {
      ctx.save();
      ctx.beginPath();
      pts2.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = `rgba(201,244,85,${alpha})`;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (blur) { ctx.shadowColor = 'rgba(201,244,85,0.55)'; ctx.shadowBlur = blur; }
      ctx.stroke();
      ctx.restore();
    };

    // afterglow: the same trace a moment earlier, low alpha
    const ghost = pts.map(([x, y]) => [x, y + Math.sin(x * 0.006 + phase * 0.8) * 3]);
    stroke(ghost, 1, 0.16, 0);
    stroke(pts, 5, 0.06, 10);
    stroke(pts, 1.45, 0.95, 4);

    // sampling head
    const head = pts[pts.length - 1];
    ctx.save();
    ctx.fillStyle = 'rgba(201,244,85,0.9)';
    ctx.shadowColor = 'rgba(201,244,85,0.8)';
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(head[0] - 2, head[1], 2.2, 0, TAU); ctx.fill();
    ctx.restore();

    // tick marks + voltage labels at the left edge
    ctx.save();
    ctx.fillStyle = 'rgba(236,230,216,0.26)';
    ctx.font = '9px "Geist Mono", monospace';
    ctx.textAlign = 'left';
    for (let v = -3; v <= 3; v++) {
      if (!v) continue;
      const y = h * 0.53 - v * h * 0.05;
      ctx.fillRect(0, y, 7, 1);
      ctx.fillText(`${v > 0 ? '+' : ''}${v}V`, 12, y + 3);
    }
    ctx.restore();

    if (!dt) return;
    state.freq += (state.tfreq - state.freq) * Math.min(1, dt * 3);
    state.amp += (state.tamp - state.amp) * Math.min(1, dt * 3);
    state.bend += (state.tbend - state.bend) * Math.min(1, dt * 2.4);
    phase += dt * (0.52 + 0.4 * state.freq);
  }

  let readoutAt = 0;
  function readout(t) {
    if (!rdFreq || t - readoutAt < 140) return;
    readoutAt = t;
    const p = scrollP();
    rdFreq.textContent = (0.18 * (1 + p * 0.55) * state.freq).toFixed(2);
    rdAmp.textContent = (3.1 * (1 - p * 0.4) * state.amp).toFixed(2);
    rdState.textContent = paused ? 'Paused' : drag ? 'Held' : Math.abs(state.freq - 1) > 0.08 || Math.abs(state.amp - 1) > 0.08 ? 'Bent' : 'Drift';
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = t; return; }
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t;
    draw(dt);
    readout(t);
  }

  function start() { if (!raf && !paused && !reduced) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  // --- pointer: drag to bend frequency (x) and swing (y) ---------------------
  const interactive = (el) => el.closest('a, button, input, select, textarea, .readout');

  hero.addEventListener('pointerdown', (e) => {
    if (reduced || e.button > 0 || interactive(e.target)) return;
    drag = { x: e.clientX, y: e.clientY, f: state.tfreq, a: state.tamp };
    state.tbend = 0.6;
    hero.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.x) / Math.max(240, w);
    const dy = (e.clientY - drag.y) / Math.max(200, h);
    state.tfreq = Math.min(4.2, Math.max(0.35, drag.f * (1 + dx * 2.6)));
    state.tamp = Math.min(2.4, Math.max(0.25, drag.a * (1 - dy * 1.8)));
  }, { passive: true });
  const release = () => {
    if (!drag) return;
    drag = null;
    state.tfreq = 1; state.tamp = 1; state.tbend = 0;
    hero.classList.remove('is-dragging');
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  // --- pause control ---------------------------------------------------------
  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.lastChild.textContent = paused ? ' Resume tide' : ' Pause tide';
    if (paused) { stop(); draw(0); readout(performance.now()); } else { start(); }
  });

  // stop drawing when the hero leaves the viewport; resume when it returns
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }, { threshold: 0.02 }).observe(hero);

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });

  if (reduced) {
    // a single fully composed frame — a complete image, not a blank canvas
    if (pauseBtn) pauseBtn.style.display = 'none';
    const hint = document.querySelector('.hero__hint');
    if (hint) hint.remove();
    resize(); draw(0); readout(performance.now());
  } else {
    resize();
    start();
  }
}
