// Instrument plates, drawn to scale in millimetres.
// Eurorack geometry: 1 HP = 5.08 mm, 3U = 128.5 mm. Everything here is vector so the
// instruments stay honest — they are drawings, not photographs of hardware that doesn't exist.

const HP = 5.08;
const U3 = 128.5;

const C = {
  plate1: '#f2ede1',
  plate2: '#ddd5c2',
  plate3: '#cfc6b1',
  edge: '#a79e8b',
  ink: '#1d211c',
  ink2: '#4a4f45',
  ink3: '#6d7264',
  lime: '#b6dd3f',
  knob1: '#2b2d27',
  knob2: '#151713',
  jackRing: '#9e9683',
  hole: '#0d100c',
  cable: '#1f2420',
  cableLive: '#c9f455',
};

const f = (n) => Number(n.toFixed(2));

// Each panel gets its own gradient namespace so ids stay unique in the document.
let P = '';
const id = (n) => `${P}${n}`;

/* ---------- primitives ---------------------------------------------------- */

function txt(x, y, s, { size = 2.6, fill = C.ink2, anchor = 'middle', weight = 400, family = 'mono', ls = 0.12, opacity = 1 } = {}) {
  const fam = family === 'display'
    ? "'Archivo Variable', 'Helvetica Neue', sans-serif"
    : "'Geist Mono', ui-monospace, monospace";
  return `<text x="${f(x)}" y="${f(y)}" font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${s}</text>`;
}

function knob(x, y, r, label, { big = false, value = 0.62, live = false } = {}) {
  const ticks = r >= 7 ? 11 : 0;
  let t = '';
  for (let i = 0; i < ticks; i++) {
    const a = (-135 + (270 / (ticks - 1)) * i) * Math.PI / 180;
    const r1 = r + 1.7, r2 = r + 2.9;
    t += `<line x1="${f(x + Math.cos(a) * r1)}" y1="${f(y + Math.sin(a) * r1)}" x2="${f(x + Math.cos(a) * r2)}" y2="${f(y + Math.sin(a) * r2)}" stroke="${C.ink3}" stroke-width="0.28" opacity="0.75"/>`;
  }
  const ang = (-135 + 270 * value) * Math.PI / 180;
  return `<g>${t}
    <circle cx="${f(x)}" cy="${f(y + 0.7)}" r="${f(r + 0.3)}" fill="#6d6553" opacity="0.35"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${C.knob2}" stroke="#0a0b08" stroke-width="0.3"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.8)}" fill="${C.knob1}"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.8)}" fill="url(#${id('knobGrad')})" opacity="0.55"/>
    <line x1="${f(x + Math.cos(ang) * r * 0.3)}" y1="${f(y + Math.sin(ang) * r * 0.3)}" x2="${f(x + Math.cos(ang) * r * 0.74)}" y2="${f(y + Math.sin(ang) * r * 0.74)}" stroke="${C.plate1}" stroke-width="${f(Math.max(0.55, r * 0.1))}" stroke-linecap="round"/>
    <circle cx="${f(x - r * 0.28)}" cy="${f(y - r * 0.34)}" r="${f(r * 0.12)}" fill="#ffffff" opacity="0.16"/>
    ${label ? txt(x, y + r + 4.2, label, { size: r >= 7 ? 2.7 : 2.4 }) : ''}
  </g>`;
}

function jack(x, y, label, { live = false, r = 2.5 } = {}) {
  return `<g>
    <circle cx="${f(x)}" cy="${f(y + 0.35)}" r="${f(r + 0.35)}" fill="#6d6553" opacity="0.3"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${C.jackRing}" stroke="#7c7463" stroke-width="0.25"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="${f(r - 0.45)}" fill="${C.hole}"/>
    <circle cx="${f(x - 0.35)}" cy="${f(y - 0.5)}" r="${f(r * 0.55)}" fill="#000" opacity="0.55"/>
    ${live ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r + 0.9)}" fill="none" stroke="${C.lime}" stroke-width="0.4"/>` : ''}
    ${label ? txt(x, y + r + 3.6, label, { size: 2.15, ls: 0.08, fill: C.ink2 }) : ''}
  </g>`;
}

function led(x, y, label = '') {
  return `<g>
    <circle cx="${f(x)}" cy="${f(y)}" r="2.2" fill="none" stroke="${C.ink3}" stroke-width="0.2" opacity="0.5"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="1.05" fill="${C.lime}"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="1.05" fill="url(#${id(`ledGlow`)})"/>
    ${label ? txt(x, y + 4.6, label, { size: 1.9, ls: 0.06 }) : ''}
  </g>`;
}

function toggle(x, y, label, { on = true } = {}) {
  return `<g>
    <rect x="${f(x - 3.4)}" y="${f(y - 2)}" width="6.8" height="4" rx="2" fill="#b8b09d" stroke="#8b8371" stroke-width="0.25"/>
    <circle cx="${f(x + (on ? 1.3 : -1.3))}" cy="${f(y)}" r="1.5" fill="${C.knob2}"/>
    ${label ? txt(x, y + 5.6, label, { size: 2.1, ls: 0.06 }) : ''}
  </g>`;
}

function slider(x, y, label) {
  return `<g>
    <rect x="${f(x - 0.7)}" y="${f(y - 11)}" width="1.4" height="22" rx="0.7" fill="#8c846f"/>
    <rect x="${f(x - 0.35)}" y="${f(y - 11)}" width="0.7" height="22" fill="#0e100c"/>
    <rect x="${f(x - 2.6)}" y="${f(y + 2)}" width="5.2" height="2.6" rx="0.6" fill="${C.knob1}" stroke="#0a0b08" stroke-width="0.2"/>
    <line x1="${f(x - 1.8)}" y1="${f(y + 3.3)}" x2="${f(x + 1.8)}" y2="${f(y + 3.3)}" stroke="${C.plate1}" stroke-width="0.4"/>
    ${label ? txt(x, y + 15.5, label, { size: 2.1 }) : ''}
  </g>`;
}

/* Row of items distributed evenly inside a section. */
function row(x0, w, y, items, { pad = 7 } = {}) {
  const n = items.length;
  const usable = w - pad * 2;
  let out = '';
  items.forEach((it, i) => {
    const cx = x0 + pad + (usable / n) * (i + 0.5);
    if (it.t === 'knob') out += knob(cx, y, it.r, it.l, { big: it.r >= 7 });
    else if (it.t === 'jack') out += jack(cx, y, it.l, { live: !!it.live });
    else if (it.t === 'led') out += led(cx, y, it.l);
    else if (it.t === 'toggle') out += toggle(cx, y, it.l);
    else if (it.t === 'slider') out += slider(cx, y, it.l);
    else if (it.t === 'text') out += txt(cx, y, it.l, { size: it.size || 2.4 });
  });
  return out;
}

/* Patch cable drawn over the panel: dark body, soft shadow, highlight, plug boots. */
function cable(a, b, { live = false, sag = 18, bend = 0.35 } = {}) {
  const [x1, y1] = a, [x2, y2] = b;
  const mx = (x1 + x2) / 2 + (y1 - y2) * bend;
  const my = Math.max(y1, y2) + sag;
  const d = `M ${f(x1)} ${f(y1)} C ${f(mx)} ${f(my)}, ${f(mx)} ${f(my)}, ${f(x2)} ${f(y2)}`;
  const col = live ? C.cableLive : '#2a2f29';
  const w = live ? 1.9 : 1.7;
  return `<g class="cable">
    <path d="${d}" fill="none" stroke="#000" stroke-width="${w + 1.4}" opacity="0.28" transform="translate(0,1.2)"/>
    <path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#ffffff" stroke-width="0.35" opacity="${live ? 0.5 : 0.22}" stroke-linecap="round" transform="translate(-0.2,-0.5)"/>
    <rect x="${f(x1 - 1.6)}" y="${f(y1 - 2.6)}" width="3.2" height="4.4" rx="0.7" fill="#2a2d27"/>
    <rect x="${f(x2 - 1.6)}" y="${f(y2 - 2.6)}" width="3.2" height="4.4" rx="0.7" fill="#2a2d27"/>
    <circle cx="${f(x1)}" cy="${f(y1)}" r="1.05" fill="${col}"/>
    <circle cx="${f(x2)}" cy="${f(y2)}" r="1.05" fill="${col}"/>
  </g>`;
}

/* ---------- panel assembly ------------------------------------------------ */

function defs() {
  return `<defs>
    <linearGradient id="${id(`plateGrad`)}" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${C.plate1}"/>
      <stop offset="0.55" stop-color="#e6dfce"/>
      <stop offset="1" stop-color="${C.plate3}"/>
    </linearGradient>
    <linearGradient id="${id(`knobGrad`)}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.25"/>
    </linearGradient>
    <radialGradient id="${id(`ledGlow`)}">
      <stop offset="0" stop-color="#e9ff9a"/>
      <stop offset="1" stop-color="${C.lime}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${id(`brush`)}" width="0.9" height="6" patternUnits="userSpaceOnUse">
      <rect width="0.9" height="6" fill="none"/>
      <line x1="0.45" y1="0" x2="0.45" y2="6" stroke="#ffffff" stroke-width="0.35" opacity="0.30"/>
      <line x1="0.05" y1="0" x2="0.05" y2="6" stroke="#6c6350" stroke-width="0.25" opacity="0.10"/>
    </pattern>
    <linearGradient id="${id(`sheen`)}" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="0.35" stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

function screws(w, h) {
  const pts = [[6, 6], [w - 6, 6], [6, h - 6], [w - 6, h - 6]];
  return pts.map(([x, y], i) => `<g>
    <circle cx="${f(x)}" cy="${f(y)}" r="2.1" fill="#b3ab98" stroke="#8e8674" stroke-width="0.22"/>
    <circle cx="${f(x)}" cy="${f(y)}" r="1.5" fill="#cfc7b4" stroke="#928a78" stroke-width="0.2"/>
    <line x1="${f(x - 1.1)}" y1="${f(y - 0.5)}" x2="${f(x + 1.1)}" y2="${f(y + 0.5)}" stroke="#6f6757" stroke-width="0.45" transform="rotate(${i % 2 ? 30 : -18} ${f(x)} ${f(y)})"/>
  </g>`).join('');
}

function header(w, title, sub) {
  return `<g>
    ${txt(10, 12.5, 'TIDEWORK', { size: 3, anchor: 'start', family: 'display', weight: 600, fill: C.ink, ls: 0.18 })}
    ${txt(10, 25.5, title, { size: 10.5, anchor: 'start', family: 'display', weight: 500, fill: C.ink, ls: 0.02 })}
    ${txt(w - 10, 11.5, 'MARVILA · LISBOA', { size: 2.2, anchor: 'end', fill: C.ink3, ls: 0.18 })}
    ${txt(w - 10, 20.5, sub, { size: 2.4, anchor: 'end', fill: C.ink2, ls: 0.12 })}
    <line x1="8" y1="33" x2="${f(w - 8)}" y2="33" stroke="${C.ink}" stroke-width="0.35" opacity="0.55"/>
  </g>`;
}

function section(x, y, w, h, title, sub) {
  return `<g>
    ${txt(x + 5, y + 8, title, { size: 3.1, anchor: 'start', family: 'display', weight: 600, fill: C.ink, ls: 0.14 })}
    ${sub ? txt(x + w - 5, y + 8, sub, { size: 2, anchor: 'end', fill: C.ink3, ls: 0.1 }) : ''}
    <line x1="${f(x + 5)}" y1="${f(y + 11.5)}" x2="${f(x + w - 5)}" y2="${f(y + 11.5)}" stroke="${C.ink}" stroke-width="0.2" opacity="0.35"/>
  </g>`;
}

function frame(w, h) {
  return `<g>
    <rect x="0.35" y="0.35" width="${f(w - 0.7)}" height="${f(h - 0.7)}" rx="1.6" fill="url(#${id(`plateGrad`)})"/>
    <rect x="0.35" y="0.35" width="${f(w - 0.7)}" height="${f(h - 0.7)}" rx="1.6" fill="url(#${id(`brush`)})" opacity="0.5"/>
    <rect x="0.35" y="0.35" width="${f(w - 0.7)}" height="${f(h - 0.7)}" rx="1.6" fill="url(#${id(`sheen`)})"/>
    <rect x="0.35" y="0.35" width="${f(w - 0.7)}" height="${f(h - 0.7)}" rx="1.6" fill="none" stroke="${C.edge}" stroke-width="0.5"/>
    <rect x="1.4" y="1.4" width="${f(w - 2.8)}" height="${f(h - 2.8)}" rx="1.2" fill="none" stroke="#ffffff" stroke-width="0.45" opacity="0.45"/>
  </g>`;
}

function svg(w, h, body, uid, label) {
  return `<svg viewBox="0 0 ${f(w)} ${f(h)}" width="${f(w)}" height="${f(h)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
    ${defs()}${frame(w, h)}${body}
  </svg>`;
}

/* ---------- MARÉ — 6U · 104 HP system ------------------------------------- */

function mare() {
  P = 'mare-';
  const w = 104 * HP, h = 2 * U3; // 528.32 × 257 mm — 104 HP of 6U
  const cw = w / 4, ch = (h - 42) / 2;
  const top = 38, rowsY = [top, top + ch];
  const sec = (i, j) => {
    const x = i * cw, y = rowsY[j];
    return { x, y, w: cw, h: ch };
  };
  let b = header(w, 'MARÉ', 'SERIES 01 · 6U · 104 HP');

  // --- row 1: sources
  let a = sec(0, 0);
  b += section(a.x, a.y, a.w, a.h, 'OSC A', 'TRI · SAW');
  b += row(a.x, a.w, a.y + 34, [{ t: 'knob', r: 8.5, l: 'FREQ' }, { t: 'knob', r: 4.4, l: 'FINE' }]);
  b += row(a.x, a.w, a.y + 55, [{ t: 'knob', r: 4.6, l: 'SHAPE' }, { t: 'knob', r: 4.6, l: 'FOLD' }, { t: 'led', l: 'ON' }]);
  b += row(a.x, a.w, a.y + 78, [{ t: 'jack', l: 'VOCT', live: true }, { t: 'jack', l: 'FM' }, { t: 'jack', l: 'SYNC' }, { t: 'jack', l: 'OUT' }]);

  a = sec(1, 0);
  b += section(a.x, a.y, a.w, a.h, 'OSC B', 'TRI · SAW');
  b += row(a.x, a.w, a.y + 34, [{ t: 'knob', r: 8.5, l: 'FREQ' }, { t: 'knob', r: 4.4, l: 'FINE' }]);
  b += row(a.x, a.w, a.y + 55, [{ t: 'knob', r: 4.6, l: 'SHAPE' }, { t: 'knob', r: 4.6, l: 'FOLD' }, { t: 'led', l: 'ON' }]);
  b += row(a.x, a.w, a.y + 78, [{ t: 'jack', l: 'VOCT', live: true }, { t: 'jack', l: 'FM' }, { t: 'jack', l: 'SYNC' }, { t: 'jack', l: 'OUT' }]);

  a = sec(2, 0);
  b += section(a.x, a.y, a.w, a.h, 'FILTER', '4-POLE LP');
  b += row(a.x, a.w, a.y + 34, [{ t: 'knob', r: 9.4, l: 'CUTOFF' }, { t: 'knob', r: 5, l: 'RES' }]);
  b += row(a.x, a.w, a.y + 55, [{ t: 'knob', r: 4.6, l: 'DRIVE' }, { t: 'knob', r: 4.6, l: 'CV AMT' }, { t: 'led', l: 'CLIP' }]);
  b += row(a.x, a.w, a.y + 78, [{ t: 'jack', l: 'IN A' }, { t: 'jack', l: 'IN B' }, { t: 'jack', l: 'CV', live: true }, { t: 'jack', l: 'OUT' }]);

  a = sec(3, 0);
  b += section(a.x, a.y, a.w, a.h, 'FOLDER', 'DIODE');
  b += row(a.x, a.w, a.y + 36, [{ t: 'knob', r: 8, l: 'FOLD' }, { t: 'knob', r: 5, l: 'BIAS' }]);
  b += row(a.x, a.w, a.y + 58, [{ t: 'toggle', l: 'SERIES' }, { t: 'led', l: 'ACTIVE' }]);
  b += row(a.x, a.w, a.y + 80, [{ t: 'jack', l: 'IN' }, { t: 'jack', l: 'CV' }, { t: 'jack', l: 'OUT', live: true }]);

  // --- row 2: modulation, sequence, mix
  a = sec(0, 1);
  b += section(a.x, a.y, a.w, a.h, 'FUNCTIONS', '×2');
  b += row(a.x, a.w, a.y + 28, [{ t: 'knob', r: 4.4, l: 'RISE' }, { t: 'knob', r: 4.4, l: 'FALL' }, { t: 'knob', r: 4.4, l: 'SHAPE' }]);
  b += row(a.x, a.w, a.y + 49, [{ t: 'jack', l: 'TRIG' }, { t: 'jack', l: 'IN' }, { t: 'jack', l: 'OUT' }, { t: 'jack', l: 'INV' }]);
  b += row(a.x, a.w, a.y + 68, [{ t: 'knob', r: 4.4, l: 'RISE' }, { t: 'knob', r: 4.4, l: 'FALL' }, { t: 'knob', r: 4.4, l: 'SHAPE' }]);
  b += row(a.x, a.w, a.y + 89, [{ t: 'jack', l: 'TRIG' }, { t: 'jack', l: 'IN' }, { t: 'jack', l: 'OUT' }, { t: 'jack', l: 'INV' }]);

  a = sec(1, 1);
  b += section(a.x, a.y, a.w, a.h, 'SEQUENCE', '8 STEP');
  b += row(a.x, a.w, a.y + 25, [{ t: 'knob', r: 3.4, l: '1' }, { t: 'knob', r: 3.4, l: '2' }, { t: 'knob', r: 3.4, l: '3' }, { t: 'knob', r: 3.4, l: '4' }]);
  b += row(a.x, a.w, a.y + 42, [{ t: 'knob', r: 3.4, l: '5' }, { t: 'knob', r: 3.4, l: '6' }, { t: 'knob', r: 3.4, l: '7' }, { t: 'knob', r: 3.4, l: '8' }]);
  b += row(a.x, a.w, a.y + 60, [{ t: 'knob', r: 4.2, l: 'RATE' }, { t: 'toggle', l: 'RUN' }, { t: 'led', l: 'CLK' }]);
  b += row(a.x, a.w, a.y + 82, [{ t: 'jack', l: 'CLK' }, { t: 'jack', l: 'RESET' }, { t: 'jack', l: 'CV' }, { t: 'jack', l: 'GATE' }]);

  a = sec(2, 1);
  b += section(a.x, a.y, a.w, a.h, 'MIX', '4 CH');
  b += row(a.x, a.w, a.y + 28, [{ t: 'knob', r: 4.2, l: 'CH 1' }, { t: 'knob', r: 4.2, l: 'CH 2' }, { t: 'knob', r: 4.2, l: 'CH 3' }]);
  b += row(a.x, a.w, a.y + 50, [{ t: 'jack', l: 'IN 1' }, { t: 'jack', l: 'IN 2' }, { t: 'jack', l: 'IN 3' }]);
  b += row(a.x, a.w, a.y + 72, [{ t: 'knob', r: 4.2, l: 'CH 4' }, { t: 'knob', r: 4.2, l: 'AUX' }, { t: 'led', l: 'PEAK' }]);
  b += row(a.x, a.w, a.y + 92, [{ t: 'jack', l: 'IN 4' }, { t: 'jack', l: 'AUX' }, { t: 'jack', l: 'OUT', live: true }]);

  a = sec(3, 1);
  b += section(a.x, a.y, a.w, a.h, 'OUTPUT', 'BALANCED');
  b += row(a.x, a.w, a.y + 34, [{ t: 'knob', r: 7.2, l: 'MASTER' }, { t: 'knob', r: 4.4, l: 'PHONES' }]);
  b += row(a.x, a.w, a.y + 56, [{ t: 'slider', l: 'LEVEL' }, { t: 'led', l: 'L' }, { t: 'led', l: 'R' }]);
  b += row(a.x, a.w, a.y + 84, [{ t: 'jack', l: 'L OUT', live: true }, { t: 'jack', l: 'R OUT', live: true }, { t: 'jack', l: 'PHONES' }]);

  // section dividers
  for (let i = 1; i < 4; i++) {
    b += `<line x1="${f(i * cw)}" y1="36" x2="${f(i * cw)}" y2="${f(h - 6)}" stroke="${C.ink}" stroke-width="0.25" opacity="0.3"/>`;
  }
  b += `<line x1="8" y1="${f(rowsY[1] - 1)}" x2="${f(w - 8)}" y2="${f(rowsY[1] - 1)}" stroke="${C.ink}" stroke-width="0.35" opacity="0.45"/>`;

  // patch cables across the panel
  // cables run jack-to-jack: OSC A OUT → FILTER IN A, FOLDER OUT → SEQ CV, FUNCTIONS OUT → MIX IN 3
  b += cable([110.25, 116], [285.75, 116], { live: true, sag: 28, bend: 0.12 });
  b += cable([501.3, 118], [212.75, 227.5], { sag: 34, bend: -0.2 });
  b += cable([80.75, 194.5], [344.75, 237.5], { live: true, sag: 20, bend: 0.14 });

  b += screws(w, h);
  b += txt(w - 10, h - 8, 'TW-MAR-026 · CAL 23.0 °C', { size: 2, anchor: 'end', fill: C.ink3, ls: 0.08 });
  return svg(w, h, b, 'mare', 'Engineering drawing of MARÉ, a 6U 104 HP modular system');
}

/* ---------- ONDA — 3U · 42 HP --------------------------------------------- */

function onda() {
  P = 'onda-';
  const w = 42 * HP, h = U3;
  let b = header(w, 'ONDA', 'SERIES 02 · 3U · 42 HP');
  const cw = (w - 16) / 2;
  for (let i = 0; i < 2; i++) {
    const x = 8 + i * cw;
    b += section(x, 38, cw, 88, i === 0 ? 'OSC A' : 'OSC B', i === 0 ? 'CORE' : 'CORE');
    b += row(x, cw, 66, [{ t: 'knob', r: 9, l: 'FREQ' }, { t: 'knob', r: 4.6, l: 'FINE' }]);
    b += row(x, cw, 88, [{ t: 'knob', r: 4.4, l: 'SHAPE' }, { t: 'knob', r: 4.4, l: 'FOLD' }, { t: 'toggle', l: 'SYNC' }]);
    b += row(x, cw, 108, [{ t: 'jack', l: 'VOCT', live: i === 0 }, { t: 'jack', l: 'FM' }, { t: 'jack', l: 'OUT', live: i === 1 }]);
  }
  b += `<line x1="${f(w / 2)}" y1="38" x2="${f(w / 2)}" y2="${f(h - 8)}" stroke="${C.ink}" stroke-width="0.25" opacity="0.3"/>`;
  b += cable([22, 190], [74, 196], { live: true, sag: 16, bend: 0.28 });
  b += cable([120, 190], [168, 196], { sag: 12, bend: -0.2 });
  b += screws(w, h);
  b += txt(w - 8, h - 7, 'TW-OND-114', { size: 1.9, anchor: 'end', fill: C.ink3, ls: 0.08 });
  return svg(w, h, b, 'onda', 'Engineering drawing of ONDA, a 3U 42 HP dual oscillator');
}

/* ---------- SAL — 3U · 20 HP ---------------------------------------------- */

function sal() {
  P = 'sal-';
  const w = 20 * HP, h = U3;
  let b = header(w, 'SAL', 'SERIES 03 · 3U · 20 HP');
  b += section(8, 38, w - 16, 88, 'TEXTURE', 'NOISE');
  b += row(8, w - 16, 66, [{ t: 'knob', r: 7.4, l: 'RATE' }]);
  b += row(8, w - 16, 88, [{ t: 'knob', r: 4.6, l: 'GRAIN' }, { t: 'knob', r: 4.6, l: 'TONE' }]);
  b += row(8, w - 16, 108, [{ t: 'knob', r: 4.6, l: 'MIX' }, { t: 'toggle', l: 'DUST' }, { t: 'led', l: 'LIVE' }]);
  b += row(8, w - 16, 132, [{ t: 'jack', l: 'CLK', live: true }, { t: 'jack', l: 'OUT' }]);
  b += row(8, w - 16, 152, [{ t: 'jack', l: 'RND' }, { t: 'jack', l: 'S&H' }]);
  b += cable([30, 168], [68, 168], { live: true, sag: 12, bend: 0.2 });
  b += screws(w, h);
  b += txt(w - 8, h - 7, 'TW-SAL-041', { size: 1.9, anchor: 'end', fill: C.ink3, ls: 0.08 });
  return svg(w, h, b, 'sal', 'Engineering drawing of SAL, a 3U 20 HP noise and grain module');
}

const PANELS = { mare, onda, sal };

export function mountPanels() {
  document.querySelectorAll('[data-panel]').forEach((host) => {
    const fn = PANELS[host.dataset.panel];
    if (!fn) return;
    host.innerHTML = fn();
    const svgEl = host.querySelector('svg');
    if (svgEl) {
      // Unique-but-harmless: gradient ids stay local because each svg is separate.
      svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  });
}
