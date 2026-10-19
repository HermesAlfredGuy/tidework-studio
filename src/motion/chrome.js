// Chrome behaviour: nav tone over light/dark sections, scroll progress, Lisbon clock, mobile menu.
import { lenis } from './core.js';

export function initChrome() {
  const nav = document.querySelector('.nav');
  const bar = document.getElementById('progressBar');
  const tones = [...document.querySelectorAll('[data-tone]')];
  const menu = document.getElementById('menu');
  const menuBtn = document.getElementById('menuBtn');

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      nav?.classList.toggle('nav--stuck', y > 24);
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
      const line = 30;
      let tone = 'dark';
      for (const s of tones) {
        const r = s.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) tone = s.dataset.tone;
      }
      nav?.classList.toggle('nav--light', tone === 'light');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // --- Lisbon clock (the studio's time, not the visitor's) -------------------
  const clocks = [document.getElementById('lisbonClock'), document.getElementById('footerClock')];
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  function tick() {
    const t = fmt.format(new Date());
    if (clocks[0]) clocks[0].textContent = `Lisboa ${t}`;
    if (clocks[1]) clocks[1].textContent = `Lisboa ${t}`;
    const tz = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', timeZoneName: 'short' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName');
    document.querySelectorAll('[data-tz]').forEach((n) => (n.textContent = tz?.value || 'WEST'));
  }
  tick();
  setInterval(tick, 15000);

  // --- mobile menu ----------------------------------------------------------
  if (menu && menuBtn) {
    let open = false;
    const setOpen = (v) => {
      open = v;
      menu.classList.toggle('is-open', v);
      menu.setAttribute('aria-hidden', String(!v));
      menuBtn.setAttribute('aria-expanded', String(v));
      menuBtn.textContent = v ? 'Close' : 'Menu';
      if (v) lenis?.stop(); else lenis?.start();
      document.body.style.overflow = v ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', () => setOpen(!open));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches && open) setOpen(false); });
  }
}
