// A small generative patch, synthesised live in the browser — never autoplayed.
// Two detuned voices through a swept lowpass, a slow drone and a dust bed, into a filter delay.
// A matching oscilloscope shows the actual output.

const NOTES = [110.0, 130.81, 164.81, 196.0, 246.94, 293.66]; // A minor pentatonic-ish
const PATTERN = [1, 0, 1, 1, 0, 1, 0, 1];

export function initAudio() {
  const btn = document.getElementById('playPatch');
  const canvas = document.getElementById('scope');
  const levelEl = document.getElementById('audioLevel');
  if (!btn || !canvas) return;

  const ctx2d = canvas.getContext('2d');
  let audio = null;
  let playing = false;
  let timer = null;
  let raf = 0;
  let step = 0;
  let nextTime = 0;
  let noteIdx = 2;
  let dir = 1;

  function makeAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ac = new AC();

    const master = ac.createGain();
    master.gain.value = 0;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 22;
    comp.ratio.value = 4;
    comp.attack.value = 0.008;
    comp.release.value = 0.3;
    const analyser = ac.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;

    // filter delay (dotted-ish eighth at 52 BPM)
    const delay = ac.createDelay(2);
    delay.delayTime.value = 0.577;
    const fb = ac.createGain();
    fb.gain.value = 0.36;
    const damp = ac.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 1700;
    const wet = ac.createGain();
    wet.gain.value = 0.3;

    delay.connect(damp); damp.connect(fb); fb.connect(delay);
    damp.connect(wet); wet.connect(master);
    master.connect(comp); comp.connect(analyser); analyser.connect(ac.destination);

    // drone: A1 + E2, slowly breathing
    const droneGain = ac.createGain();
    droneGain.gain.value = 0.055;
    const droneFilter = ac.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 360;
    droneFilter.Q.value = 0.7;
    droneFilter.connect(droneGain); droneGain.connect(master);
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.055;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain); lfoGain.connect(droneFilter.frequency);
    lfo.start();

    const droneOscs = [55, 82.41, 110.02].map((f, i) => {
      const o = ac.createOscillator();
      o.type = i === 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = i === 0 ? -4 : 3;
      const g = ac.createGain();
      g.gain.value = i === 2 ? 0.5 : 1;
      o.connect(g); g.connect(droneFilter);
      o.start();
      return o;
    });

    // dust bed: filtered noise, very quiet
    const len = ac.sampleRate * 2;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const noise = ac.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const nf = ac.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 1400; nf.Q.value = 0.5;
    const ng = ac.createGain();
    ng.gain.value = 0.012;
    noise.connect(nf); nf.connect(ng); ng.connect(master);
    const nLfo = ac.createOscillator();
    nLfo.frequency.value = 0.09;
    const nLfoG = ac.createGain();
    nLfoG.gain.value = 0.008;
    nLfo.connect(nLfoG); nLfoG.connect(ng.gain);
    nLfo.start();
    noise.start();

    return { ac, master, analyser, delay, droneOscs, noise, lfo, nLfo, droneGain, ng };
  }

  function note(t, freq, vel, dur = 2.6) {
    const { ac, master, delay } = audio;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);

    const filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.Q.value = 3.2;
    filt.frequency.setValueAtTime(340, t);
    filt.frequency.linearRampToValueAtTime(900 + vel * 9000, t + 0.05);
    filt.frequency.exponentialRampToValueAtTime(430, t + dur * 0.85);

    const o1 = ac.createOscillator();
    o1.type = 'sawtooth'; o1.frequency.value = freq; o1.detune.value = -6;
    const o2 = ac.createOscillator();
    o2.type = 'triangle'; o2.frequency.value = freq; o2.detune.value = 7;
    const o3 = ac.createOscillator();
    o3.type = 'sine'; o3.frequency.value = freq * 2.002;

    const mix = ac.createGain();
    mix.gain.value = 0.8;
    o1.connect(mix); o2.connect(mix);
    const air = ac.createGain();
    air.gain.value = 0.09;
    o3.connect(air); air.connect(mix);

    mix.connect(filt); filt.connect(g);
    g.connect(master);
    const send = ac.createGain();
    send.gain.value = 0.38;
    g.connect(send); send.connect(delay);

    [o1, o2, o3].forEach((o) => { o.start(t); o.stop(t + dur + 0.1); });
  }

  function schedule() {
    if (!audio) return;
    const spb = 60 / 52 / 2; // eighth notes at 52 BPM
    while (nextTime < audio.ac.currentTime + 0.25) {
      if (PATTERN[step % PATTERN.length]) {
        // random walk through the scale, occasionally an octave up
        if (Math.random() < 0.34) {
          noteIdx += dir;
          if (noteIdx >= NOTES.length - 1) { noteIdx = NOTES.length - 1; dir = -1; }
          if (noteIdx <= 0) { noteIdx = 0; dir = 1; }
        }
        const octave = Math.random() < 0.12 ? 2 : 1;
        const vel = 0.055 + Math.random() * 0.055;
        note(nextTime + Math.random() * 0.01, NOTES[noteIdx] * octave, vel, 2.2 + Math.random() * 1.2);
      }
      nextTime += spb;
      step++;
    }
  }

  function drawScope() {
    const { analyser } = audio;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    if (canvas.width !== Math.round(r.width * dpr) || canvas.height !== Math.round(r.height * dpr)) {
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
    }
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = r.width, h = r.height;
    const buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);

    ctx2d.clearRect(0, 0, w, h);
    ctx2d.beginPath();
    for (let i = 0; i < buf.length; i++) {
      const x = (i / (buf.length - 1)) * w;
      const y = h / 2 + ((buf[i] - 128) / 128) * (h * 0.36);
      i ? ctx2d.lineTo(x, y) : ctx2d.moveTo(x, y);
    }
    ctx2d.strokeStyle = 'rgba(201,244,85,0.85)';
    ctx2d.lineWidth = 1.4;
    ctx2d.lineJoin = 'round';
    ctx2d.shadowColor = 'rgba(201,244,85,0.5)';
    ctx2d.shadowBlur = 8;
    ctx2d.stroke();
    ctx2d.shadowBlur = 0;

    // level readout, ~10fps
    if (!drawScope.t || performance.now() - drawScope.t > 100) {
      drawScope.t = performance.now();
      let sum = 0;
      for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
      const rms = Math.sqrt(sum / buf.length);
      if (levelEl) levelEl.textContent = rms > 0.0008 ? `${(20 * Math.log10(rms)).toFixed(0)} dB` : '−∞ dB';
    }
    raf = requestAnimationFrame(drawScope);
  }

  function setPlaying(v) {
    playing = v;
    btn.setAttribute('aria-pressed', String(v));
    btn.querySelector('.audition__txt').textContent = v ? 'Stop the patch' : 'Play the patch';
  }

  async function play() {
    if (!audio) audio = makeAudio();
    if (!audio) return;
    await audio.ac.resume();
    audio.master.gain.cancelScheduledValues(audio.ac.currentTime);
    audio.master.gain.setValueAtTime(audio.master.gain.value, audio.ac.currentTime);
    audio.master.gain.linearRampToValueAtTime(0.62, audio.ac.currentTime + 1.1);
    nextTime = audio.ac.currentTime + 0.12;
    step = 0;
    clearInterval(timer);
    timer = setInterval(schedule, 100);
    schedule();
    setPlaying(true);
    cancelAnimationFrame(raf);
    drawScope();
  }

  function stop() {
    if (!audio) return;
    const t = audio.ac.currentTime;
    audio.master.gain.cancelScheduledValues(t);
    audio.master.gain.setValueAtTime(audio.master.gain.value, t);
    audio.master.gain.linearRampToValueAtTime(0.0001, t + 0.45);
    clearInterval(timer);
    timer = null;
    setPlaying(false);
    cancelAnimationFrame(raf);
    // clear the scope after the fade
    setTimeout(() => {
      if (!playing) {
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        if (levelEl) levelEl.textContent = '−∞ dB';
      }
    }, 600);
  }

  btn.addEventListener('click', () => (playing ? stop() : play()));

  // keep the scope crisp on resize
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (playing) drawScope(); }, 150); });

  // pause audio when the tab is hidden
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });
}
