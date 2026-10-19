// Page intro: a short bench warm-up, then the hero choreography.
// One timeline — this is the most important two seconds on the site.
import { gsap, reduced, lenis } from './core.js';

export function playIntro() {
  if (window.__twIntroPlayed) return;
  window.__twIntroPlayed = true;
  const pre = document.querySelector('.preloader');
  const mark = document.querySelector('.hero .wordmark');
  const bits = document.querySelectorAll('[data-intro]');

  if (reduced) {
    pre?.remove();
    gsap.fromTo(bits, { opacity: 0 }, { opacity: 1, duration: 0.7, stagger: 0.05 });
    if (mark) gsap.fromTo(mark, { opacity: 0 }, { opacity: 1, duration: 0.9 });
    return;
  }

  lenis?.stop();
  gsap.set(bits, { opacity: 0, y: 18 });
  if (mark) gsap.set(mark, { yPercent: 14, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => lenis?.start() });

  if (pre) {
    const num = pre.querySelector('.preloader__num');
    const o = { v: 0 };
    tl.to(o, {
      v: 100, duration: 1.15, ease: 'power2.inOut',
      onUpdate: () => { if (num) num.textContent = String(Math.round(o.v)).padStart(3, '0'); },
    })
      .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' })
      .add(() => pre.remove(), '-=0.1');
  }

  tl.to(mark, { yPercent: 0, opacity: 1, duration: 1.6, ease: 'expo.out' }, pre ? '-=0.75' : 0)
    .to(bits, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, '<0.25');
}
