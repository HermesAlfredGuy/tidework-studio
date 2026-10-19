// Workshop line + instrument plate tilt.
import { gsap, ScrollTrigger, reduced, finePointer } from './core.js';

export function initWorkshop() {
  const list = document.getElementById('steps');
  const fill = document.getElementById('stepsFill');
  const steps = [...document.querySelectorAll('.step')];
  if (!list || !fill || !steps.length) return;

  if (reduced) {
    fill.style.transform = 'scaleY(1)';
    steps.forEach((s) => s.classList.add('is-on'));
    return;
  }

  gsap.fromTo(fill, { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: list, start: 'top 72%', end: 'bottom 58%', scrub: 0.6 },
  });

  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 64%',
      onEnter: () => step.classList.add('is-on'),
      onLeaveBack: () => step.classList.remove('is-on'),
    });
  });
}

export function initPlateTilt() {
  if (!finePointer || reduced) return;
  document.querySelectorAll('.plate').forEach((plate) => {
    const svg = plate.querySelector('.plate__art svg');
    if (!svg) return;
    let raf = 0;
    plate.addEventListener('pointermove', (e) => {
      const r = plate.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      plate.classList.add('is-tilting');
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        svg.style.setProperty('--ry', `${(nx * 2.4).toFixed(2)}deg`);
        svg.style.setProperty('--rx', `${(-ny * 1.8).toFixed(2)}deg`);
      });
    });
    plate.addEventListener('pointerleave', () => {
      plate.classList.remove('is-tilting');
      svg.style.setProperty('--ry', '0deg');
      svg.style.setProperty('--rx', '0deg');
    });
  });
}
