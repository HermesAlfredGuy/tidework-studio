import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { initSmoothScroll, ScrollTrigger } from './motion/core.js';
import { initReveals, refreshOnFonts } from './motion/reveal.js';
import { initMarquees, initMagnetic, initCursor, initCounters } from './motion/interactions.js';
import { playIntro } from './motion/intro.js';
import { initTide } from './motion/tide.js';
import { initFit } from './motion/fit.js';
import { initWorkshop, initPlateTilt } from './motion/workshop.js';
import { initChrome } from './motion/chrome.js';
import { initAudio } from './audio.js';
import { mountPanels } from './panels.js';

// Plates first: their intrinsic size affects layout and reveal measurements.
mountPanels();

initSmoothScroll();
initReveals();
initMarquees();
initMagnetic();
initCursor();
initCounters();
initChrome();
initWorkshop();
initPlateTilt();
initAudio();
initFit();
initTide();

refreshOnFonts();
document.fonts?.ready.then(() => ScrollTrigger.refresh());

// The wordmark is sized from measured text, so the intro waits for the fonts.
document.fonts?.ready.then(playIntro);
setTimeout(() => { if (document.querySelector('.preloader')) playIntro(); }, 2600);

window.addEventListener('load', () => ScrollTrigger.refresh());
