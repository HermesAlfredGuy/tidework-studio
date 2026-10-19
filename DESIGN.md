# TIDEWORK — art direction

**Concept.** A small instrument atelier on the Lisbon waterfront, presented as a bench document rather than a shop:
one live oscilloscope tide you can bend with your hand, three instruments drawn as measured engineering plates,
and a workshop you can read like a service manual. The sea is the only thing on the page allowed to move.

**Palette (roles).**
- `--ground #07100E` Atlantic green-black — hero, instruments, sound, footer.
- `--ground-2 #0C1A16` raised dark panels, form fields.
- `--bone #ECE6D8` aluminium/paper ground for the studio, workshop and order sections; instrument faceplates.
- `--ink #08120F` type on bone. `--ink-2 #4B564F` secondary on bone.
- `--accent #C9F455` phosphor lime — oscilloscope trace, jack rings, one CTA, < 5% of pixels.
- `--accent-ink #0A1406` text on lime.

**Type.** Display: Archivo Variable, wdth 118–125, weight 500, uppercase, tracking −0.035em, sized by a fit-to-width
routine so the wordmark is edge-to-edge on every screen. Text: Geist, 17–19px / 1.6. Labels and every number:
Geist Mono 11–12px uppercase, tracking 0.14em. Nothing else.

**Motion character.** Slow, weighty and exact: expo-out entrances (1.1–1.4s), nothing bounces, nothing spins.
The canvas tide is the only continuous motion and it has a visible pause control. Scroll reveals content, never hides it.

**Signature moment.** The hero tide: a phosphor oscilloscope line drawn across the full viewport, with a live
voltage readout. Drag horizontally to tighten its frequency, vertically to raise its swing — it eases back to its slow
Atlantic swell when released. On scroll it hands over to the instrument plates.

**Avoid.** (1) Dark synth-brand cliché: black + neon-orange glow, glowing orbs, particle dust. (2) Uniform product
cards in a 3-up grid with rounded corners. (3) Fake photography of hardware that does not exist — the instruments are
drawn as honest, dimensioned plates instead.

## References inspected (principles only, no assets copied)
- **Teenage Engineering** (teenage.engineering, capture `ref-te.png`): extreme scale contrast — micro technical
  nav type against monumental environmental type; asymmetric photographic cropping; hardware-schematic icon language;
  almost no copy. → Borrow: micro/monumental type contrast, sparse copy, one object per frame.
  → Reject: monochrome photo-hero (we have no real hardware to photograph).
- **FRAP Tools** (frap.tools, capture `ref-frap-tools.png`): earthy ground, huge negative space, wide-tracked caps,
  logo as a cut circle. → Borrow: confidence of empty space; restrained palette. → Reject: empty first viewport.
- **SOMA Laboratory** (somasynths.com, capture `ref-soma.png`): tactile, human, top-down hardware imagery; mono UI so
  the material carries the colour. → Borrow: material-first framing of instruments, human scale. → Reject: heavy
  full-width bars and flat all-caps hierarchy.
- **VESPER** (in-house object site): the lesson is continuity — one idea carrying the whole page. → Borrow: single
  continuous motif (the tide). → Reject: dark cinematic 3D object launch; TIDEWORK is 2D, drawn, matte.

## Section plan
01 hero (dark, live tide, edge-to-edge wordmark) · ticker · 02 studio (bone, scrub statement + numbers) ·
03 instruments (dark; one full-width plate + two unequal plates) · 04 workshop (bone, sticky title, patched signal line) ·
05 sound & press (dark, playable WebAudio patch + quotes) · 06 order (bone, form + terms) · footer (dark, giant mark).
