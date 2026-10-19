// Edge-to-edge wordmarks: measure the real text width and scale linearly to the container.
// The loop (not a single measure) makes it self-correcting: if the webfont swaps in later,
// the observed span width changes, the ResizeObserver fires, and the next pass fixes the size.
export function initFit() {
  const els = [...document.querySelectorAll('[data-fit]')];
  if (!els.length) return;

  function textWidth(el) {
    const lns = [...el.querySelectorAll('.wordmark__ln')];
    if (!lns.length) return el.getBoundingClientRect().width;
    const widths = lns.map((n) => n.getBoundingClientRect().width);
    const stacked = getComputedStyle(lns[0]).display === 'block';
    return stacked ? Math.max(...widths) : widths.reduce((a, b) => a + b, 0);
  }

  function fit(el) {
    // The h1 can grow with its own text inside a grid/flex parent, so the target comes
    // from the parent's content box — never from the element being measured.
    const parent = el.parentElement;
    const cs = parent ? getComputedStyle(parent) : null;
    const target = parent
      ? parent.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)
      : el.clientWidth;
    if (!target) return;
    const current = parseFloat(getComputedStyle(el).fontSize) || 100;
    const width = textWidth(el);
    if (!width || Math.abs(width - target) < 1.2) return;
    const next = Math.min(current * (target / width), 360);
    el.style.fontSize = `${next.toFixed(2)}px`;
  }

  function all() { els.forEach(fit); }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; all(); });
  }

  all();
  document.fonts?.ready.then(all);
  document.fonts?.addEventListener?.('loadingdone', all);

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(all, 80); });
  window.addEventListener('orientationchange', () => setTimeout(all, 200));

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(schedule);
    els.forEach((el) => el.querySelectorAll('.wordmark__ln').forEach((n) => ro.observe(n)));
  }
  // last-resort pass once the page has fully settled
  setTimeout(all, 1200);
}
