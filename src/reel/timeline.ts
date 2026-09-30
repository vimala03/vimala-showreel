import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { CS_CHIPS, type Layout } from './Scenes'

gsap.registerPlugin(CustomEase)

// The portfolio's own easing curve (v3.css: cubic-bezier(0.2, 0.7, 0.2, 1)).
const STUDIO = CustomEase.create('studio', 'M0,0 C0.2,0.7 0.2,1 1,1')

export type ChapterId = 'open' | 'youclean' | 'cornerstone' | 'flyin' | 'civtech' | 'end'
export type Chapter = { id: ChapterId; start: number; end: number; key: number }
/** Sound-design one-shots, fired by the audio engine when playback passes them. */
export type CueId = 'texture' | 'transform' | 'transition' | 'accent' | 'compression' | 'tonal' | 'air'
export type Cue = { id: CueId; t: number; gain?: number }

const ACCENT = '#6bb0d0'
const WARM = '#d9a868'
const INK = '#f4f0e8'
const RAISED = '#201c15'
const HAIR = '#3a352c'

type Box = { x: number; y: number; w: number; h: number; cx: number; cy: number }

/** Element box in stage coordinates (offsets ignore transforms, so this is the authored layout). */
function box(el: Element, stage: HTMLElement): Box {
  let x = 0
  let y = 0
  let n = el as HTMLElement | null
  while (n && n !== stage) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  const e = el as HTMLElement
  return { x, y, w: e.offsetWidth, h: e.offsetHeight, cx: x + e.offsetWidth / 2, cy: y + e.offsetHeight / 2 }
}

/** Point on an SVG path at progress p, for moving the signal along drawn lines. */
function along(path: SVGPathElement, len: number, p: number) {
  const pt = path.getPointAtLength(len * Math.min(1, Math.max(0, p)))
  return { x: pt.x, y: pt.y }
}

/** Virtual canvas size per composition (kept in sync with Reel.tsx and styles.css). */
export const STAGE: Record<Layout, [number, number]> = {
  land: [1440, 1000],
  port: [1000, 1440],
  phone: [600, 900],
  short: [1000, 460],
}

export function buildReel(stage: HTMLElement, layout: Layout, dims: [number, number] = STAGE[layout]) {
  // Wide compositions (land, short) share landscape choreography; tall ones (port, phone) share portrait.
  const land = layout === 'land' || layout === 'short'
  const [W, H] = dims
  const q = <T extends Element = HTMLElement>(s: string) => stage.querySelector(s) as T
  const qa = <T extends Element = HTMLElement>(s: string) => [...stage.querySelectorAll(s)] as T[]
  const b = (s: string | Element) => box(typeof s === 'string' ? q(s) : s, stage)

  // ── Measure everything first, before any tween touches the DOM. ─────────
  const m = {
    stop: b('.o-stop'),
    words: qa('.o-word').map((w) => b(w)),
    oName: b('.o-name'),
    frags: qa('.frag').map((f) => b(f)),
    fragGrid: b('.yc-frags'),
    states: qa('.yc-state').map((s) => b(s)),
    dash: b('.yc-dash'),
    ownStop: b('.yc-own-stop'),
    chips: qa('.cs-chip').map((c) => b(c)),
    counter: b('.cs-counter'),
    btn: b('.cs-btn'),
    fields: qa('.cs-field__added').map((f) => b(f)),
    cvWords: qa('.cv-words span').map((s) => b(s)),
    endFrames: qa('.end-frame__img').map((f) => b(f)),
    endStop: b('.end-stop'),
    phrases: qa('.end-ph').map((p) => b(p)),
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: STUDIO } })
  const sig = q('.sig')
  const chapters: Chapter[] = []
  const cues: Cue[] = []
  /** Where each voiceover line should land (used to build/align voiceover tracks). */
  const marks: Record<string, number> = {}
  const cue = (id: CueId, t: number, gain?: number) => cues.push({ id, t, gain })
  let T = 0

  const show = (sel: string, at: number) => tl.set(q(sel), { autoAlpha: 1 }, at)
  const hide = (sel: string, at: number) => tl.set(q(sel), { autoAlpha: 0 }, at)
  const labelIn = (scene: string, at: number) =>
    tl.fromTo(q(`${scene} .scene-label`), { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.9 }, at)
  /** Hand the signal off to a static dot in the layout (or back). */
  const sigTo = (x: number, y: number, at: number, dur = 0.9, ease: string | gsap.EaseFunction = 'expo.inOut') =>
    tl.to(sig, { x, y, duration: dur, ease }, at)

  // ════════════════════════════════════════════════════════════════════════
  // OPENING: the name, a point of view, five words that find alignment.
  // ════════════════════════════════════════════════════════════════════════
  {
    T = 0
    const block = q('.o-block')
    const chars = qa('.o-name .split__c')
    const stop = q('.o-stop')
    const words = qa('.o-word')
    const seps = qa('.o-sep')
    const pov = qa('.o-pov .split__w')
    // Centre the name alone to begin with; the block rises to make room later.
    const lift = H / 2 - m.oName.cy

    show('.s-open', T)
    tl.set(block, { y: lift }, T)
    tl.set(stop, { autoAlpha: 0 }, T)
    tl.set(sig, { x: W / 2, y: H / 2, scale: 0, autoAlpha: 1, backgroundColor: ACCENT }, T)
    tl.to(sig, { scale: 1, duration: 0.8, ease: 'back.out(2.4)' }, T + 0.3)
    tl.to(sig, { scale: 1.6, duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 1 }, T + 1.0)

    tl.fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.032 }, T + 1.5)
    cue('texture', T + 0.8)
    marks.voIntro = T + 1.6   // "Namaskaram, I'm Vimala Banavath, a Senior Product Designer."
    marks.voWhat = T + 6.4    // "I design digital products across AI, enterprise and real-world operations…"
    marks.nameIn = T + 1.3
    // The signal becomes the full stop after the name.
    sigTo(m.stop.cx, m.stop.cy + lift, T + 1.9, 1.1)
    tl.set(stop, { autoAlpha: 1 }, T + 3.0)
    tl.set(sig, { autoAlpha: 0 }, T + 3.0)

    tl.fromTo(q('.o-title'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1 }, T + 4.4)

    // Five words arrive scattered at different depths, drift, then align.
    const scatter = land
      ? [[0.17, 0.25, 2.3, -6], [0.8, 0.2, 1.3, 4], [0.12, 0.74, 1.7, 3], [0.84, 0.72, 1.1, -3], [0.52, 0.88, 1.9, 2]]
      : [[0.2, 0.18, 2.1, -6], [0.72, 0.26, 1.3, 4], [0.18, 0.78, 1.6, 3], [0.78, 0.7, 1.1, -3], [0.5, 0.9, 1.8, 2]]
    words.forEach((w, i) => {
      const [fx, fy, s, r] = scatter[i]
      const dx = fx * W - m.words[i].cx
      const dy = fy * H - m.words[i].cy - lift
      const at = T + 5.7 + i * 0.22
      tl.fromTo(w, { autoAlpha: 0, x: dx, y: dy + 24, scale: s, rotation: r }, { autoAlpha: 0.3 + (i % 3) * 0.2, y: dy, duration: 1.1 }, at)
      tl.to(w, { x: dx + (i % 2 ? -18 : 18), y: dy + (i % 2 ? 10 : -12), rotation: r * 0.5, duration: 2.2, ease: 'sine.inOut' }, at + 0.6)
    })
    tl.to(block, { y: 0, duration: 1.5, ease: 'expo.inOut' }, T + 8.7)
    tl.to(words, { x: 0, y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 1.4, ease: 'expo.inOut', stagger: 0.05 }, T + 8.7)
    marks.wordsAlign = T + 8.7
    tl.fromTo(seps, { scaleY: 0 }, { scaleY: 1, duration: 0.6, stagger: 0.06 }, T + 9.9)
    // The statement appears as it is spoken: "turning complex problems into…"
    tl.fromTo(pov, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09 }, T + 12.4)
    marks.pov = T + 12.4

    // Out: everything leaves, the signal stays.
    tl.set(sig, { x: m.stop.cx, y: m.stop.cy, autoAlpha: 1 }, T + 16.6)
    tl.set(stop, { autoAlpha: 0 }, T + 16.6)
    tl.to(block, { autoAlpha: 0, y: -30, duration: 0.8, ease: 'power2.in' }, T + 16.6)
    hide('.s-open', T + 17.5)
    // Bridge into YouClean, spoken over the hand-off.
    marks.voSystem = T + 16.9  // "Sometimes, that means designing the system."
    chapters.push({ id: 'open', start: 0, end: T + 17.1, key: T + 15.2 })
  }

  // ════════════════════════════════════════════════════════════════════════
  // 01 YOUCLEAN: messy operations → structured system → product → ownership.
  // ════════════════════════════════════════════════════════════════════════
  {
    T = 17.1
    const frags = qa('.frag')
    const states = qa('.yc-state')
    const dash = q('.yc-dash')
    const dashImg = q('.yc-dash img')
    const mobile = q('.yc-mobile')
    const product = q('.yc-product')
    const own = qa('.yc-own-l')
    const ownStop = q('.yc-own-stop')

    show('.s-yc', T)
    labelIn('.s-yc', T + 0.2)

    // Messy reality: fragments dropped across the counter.
    const scatter = land
      ? [[0.17, 0.33, -9], [0.73, 0.27, 7], [0.47, 0.2, -4], [0.3, 0.68, 5], [0.8, 0.64, -11], [0.57, 0.76, 9]]
      : [[0.28, 0.22, -9], [0.72, 0.32, 7], [0.3, 0.46, -5], [0.68, 0.58, 5], [0.3, 0.72, -10], [0.7, 0.82, 8]]
    frags.forEach((f, i) => {
      const [fx, fy, r] = scatter[i]
      const dx = fx * W - m.frags[i].cx
      const dy = fy * H - m.frags[i].cy
      const at = T + 0.5 + i * 0.16
      tl.fromTo(f, { autoAlpha: 0, x: dx, y: dy - 70, rotation: r * 1.8, scale: 1.08 }, { autoAlpha: 1, y: dy, rotation: r, scale: 1, duration: 0.9, ease: 'power3.out' }, at)
      tl.to(f, { x: dx + (i % 2 ? 14 : -12), y: dy + (i % 3 ? 8 : -10), rotation: r * 0.8, duration: 2.6, ease: 'sine.inOut' }, at + 0.8)
    })
    tl.to(sig, { autoAlpha: 0, scale: 0.4, duration: 0.5 }, T + 0.3)
    tl.fromTo(q('.yc-cap-a'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7 }, T + 2.5)
    tl.to(q('.yc-cap-a'), { autoAlpha: 0, duration: 0.5 }, T + 3.9)

    // Structure: fragments square up, snap to a grid, and change material.
    tl.to(frags, { x: 0, y: 0, rotation: 0, duration: 1.2, ease: 'expo.inOut', stagger: { each: 0.05, from: 'random' } }, T + 3.4)
    cue('transform', T + 3.35)
    marks.ycStructure = T + 3.35
    tl.to(frags, { backgroundColor: RAISED, color: INK, borderColor: HAIR, boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.9, ease: 'power2.inOut' }, T + 3.9)
    tl.fromTo(q('.yc-cap-b'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9 }, T + 4.6)

    // The order moves through its states: the signal is the status.
    tl.fromTo(states, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, T + 4.7)
    tl.set(sig, { x: m.states[0].x + 18, y: m.states[0].cy, scale: 0.7, autoAlpha: 0 }, T + 5.1)
    tl.to(sig, { autoAlpha: 1, scale: 0.7, duration: 0.3 }, T + 5.2)
    states.forEach((s, i) => {
      const at = T + 5.4 + i * 0.45
      if (i > 0) sigTo(m.states[i].x + 18, m.states[i].cy, at - 0.35, 0.4, 'power2.inOut')
      tl.to(s, { color: INK, borderColor: ACCENT, duration: 0.25 }, at)
      if (i < states.length - 1) tl.to(s, { borderColor: HAIR, duration: 0.4 }, at + 0.5)
    })

    // The system becomes the product: the grid opens into the real dashboard.
    const P = T + 7.4
    marks.ycProduct = P
    marks.voBuild = P + 0.35  // "And sometimes, building it myself."
    const g = m.fragGrid
    const d = m.dash
    const inset = `inset(${g.y - d.y}px ${d.x + d.w - (g.x + g.w)}px ${d.y + d.h - (g.y + g.h)}px ${g.x - d.x}px round 14px)`
    tl.to([...frags, ...states, q('.yc-cap-b')], { autoAlpha: 0, scale: 0.97, duration: 0.5, ease: 'power2.in' }, P - 0.2)
    tl.to(sig, { autoAlpha: 0, duration: 0.3 }, P - 0.2)
    show('.yc-product', P - 0.2)
    tl.fromTo(dash, { clipPath: inset, autoAlpha: 1 }, { clipPath: 'inset(0px 0px 0px 0px round 14px)', duration: 1.3, ease: 'expo.inOut' }, P)
    tl.fromTo(dashImg, { scale: 1.18 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, P)
    tl.fromTo(mobile, { autoAlpha: 0, y: 140 }, { autoAlpha: 1, y: 0, duration: 1.2 }, P + 0.7)
    // Signal lands on “Ready for pickup → Notify customers”: the next action where the state is.
    tl.set(sig, { x: d.x + d.w * 0.862, y: d.y + d.h * 0.195, scale: 0.6, autoAlpha: 0 }, P + 1.4)
    tl.to(sig, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(3)' }, P + 1.5)
    tl.to(sig, { scale: 1.8, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, P + 2.4)
    tl.fromTo(product, { scale: 1 }, { scale: 1.035, duration: 3.0, ease: 'none' }, P + 0.8)

    // Impact as compression: 3–5 minutes squeezes into under one.
    const M = T + 10.6
    marks.ycCompress = M + 1.75
    tl.to(product, { autoAlpha: 0.04, scale: 0.95, duration: 0.8, ease: 'power2.inOut' }, M)
    tl.fromTo(q('.yc-m-label'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6 }, M + 0.3)
    tl.fromTo(q('.yc-before'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9 }, M + 0.3)
    tl.to(q('.yc-before'), { scaleX: 0.12, autoAlpha: 0, duration: 0.55, ease: 'power4.in' }, M + 1.7)
    cue('transition', M + 1.75)
    tl.fromTo(q('.yc-after'), { scaleX: 0.12, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.8, ease: 'expo.out' }, M + 2.2)

    // Ownership: three hard cuts, no easing. Stillness.
    const O = T + 15.0
    tl.to([q('.yc-metric'), product], { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, O - 0.4)
    own.forEach((l, i) => tl.set(l, { autoAlpha: 1 }, O + i * 0.55))
    cue('accent', O + 1.1)
    marks.ycOwn = O
    tl.set(ownStop, { autoAlpha: 0 }, O)
    tl.set(sig, { x: m.ownStop.cx, y: m.ownStop.cy - 40, scale: 1, autoAlpha: 0 }, O + 1.1)
    tl.to(sig, { autoAlpha: 1, y: m.ownStop.cy, duration: 0.5, ease: 'bounce.out' }, O + 1.1)
    tl.fromTo(q('.yc-own-cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, O + 1.7)

    tl.to(own, { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, O + 2.6)
    tl.to(q('.yc-own-cap'), { autoAlpha: 0, duration: 0.4 }, O + 2.6)
    hide('.s-yc', O + 3.2)
    chapters.push({ id: 'youclean', start: T, end: O + 3.1, key: P + 1.9 })
    T = O + 3.1
  }

  // ════════════════════════════════════════════════════════════════════════
  // 02 CORNERSTONE: complexity → one action → the numbers → AI with control.
  // ════════════════════════════════════════════════════════════════════════
  {
    const S = T
    const chips = qa('.cs-chip')
    const ripple = q('.cs-ripple')
    const counter = q('.cs-counter')
    const countEl = q('.cs-count')
    const cx = W / 2
    const cy = H / 2

    show('.s-cs', S)
    labelIn('.s-cs', S + 0.1)
    tl.fromTo(chips, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: { each: 0.022, from: 'random' } }, S + 0.2)
    tl.fromTo(counter, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, S + 0.6)

    // 40 clicks, accelerating. The signal is the cursor.
    const C0 = S + 1.0
    const span = 2.6
    marks.csClicks = C0
    const clickAt = (k: number) => C0 + span * Math.pow(k / 39, 0.62)
    tl.set(sig, { autoAlpha: 1, scale: 0.55, x: m.chips[0].cx, y: m.chips[0].cy }, C0 - 0.4)
    for (let k = 0; k < 40; k++) {
      const i = (k * 7 + 3) % CS_CHIPS.length
      const at = clickAt(k)
      const gap = k === 0 ? 0.3 : at - clickAt(k - 1)
      sigTo(m.chips[i].cx, m.chips[i].cy, at - Math.min(0.22, gap * 0.85), Math.min(0.22, gap * 0.85), 'power2.out')
      tl.fromTo(chips[i], { backgroundColor: '#3a352c', borderColor: '#6bb0d0' }, { backgroundColor: RAISED, borderColor: HAIR, duration: 0.45, ease: 'power1.out' }, at)
      tl.fromTo(ripple, { x: m.chips[i].cx, y: m.chips[i].cy, scale: 0.2, autoAlpha: 0.9 }, { scale: 2.4, autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, at)
    }
    const counterProxy = { p: 0 }
    tl.to(counterProxy, {
      p: 1, duration: span, ease: 'none',
      onUpdate: () => { const n = counterProxy.p <= 0 ? 0 : Math.min(40, Math.floor(39 * Math.pow(counterProxy.p, 1 / 0.62)) + 1); countEl.textContent = String(n).padStart(2, '0') },
    }, C0)

    // The count becomes the headline.
    const B = C0 + span + 0.2
    tl.to(chips, { autoAlpha: 0.14, duration: 0.6 }, B)
    tl.to(sig, { autoAlpha: 0, duration: 0.3 }, B)
    tl.to(counter, { x: cx - m.counter.cx, y: cy - m.counter.cy, scale: { land: 2.1, port: 1.8, phone: 1.3, short: 1.6 }[layout], duration: 1.0, ease: 'expo.inOut' }, B)

    // Collapse: everything compresses into one action.
    const K = B + 1.6
    cue('compression', K + 0.35)
    marks.csCollapse = K + 0.35
    marks.csOne = K + 2.2
    chips.forEach((c, i) => {
      tl.to(c, { x: cx - m.chips[i].cx, y: cy - m.chips[i].cy, scale: 0.25, autoAlpha: 0, duration: 0.8, ease: 'expo.in' }, K + (i % 6) * 0.02)
    })
    tl.to(counter, { scale: 0.4, autoAlpha: 0, duration: 0.6, ease: 'expo.in' }, K)
    tl.fromTo(q('.cs-btn'), { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(2)' }, K + 0.75)
    tl.set(sig, { x: m.btn.cx + 60, y: m.btn.cy + 60, scale: 0.55, autoAlpha: 0 }, K + 1.1)
    tl.to(sig, { autoAlpha: 1, x: m.btn.cx + 20, y: m.btn.cy + 6, duration: 0.5, ease: 'power3.out' }, K + 1.15)
    tl.fromTo(ripple, { x: m.btn.cx + 20, y: m.btn.cy + 6, scale: 0.2, autoAlpha: 0.9 }, { scale: 3, autoAlpha: 0, duration: 0.6 }, K + 1.65)
    tl.to([q('.cs-btn'), sig], { autoAlpha: 0, y: '-=30', duration: 0.5, ease: 'power2.in' }, K + 1.9)
    tl.fromTo(q('.cs-one-n'), { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.9, ease: 'expo.out' }, K + 2.2)
    tl.fromTo(q('.cs-one-l'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, K + 2.6)

    // The numbers: 1,700 → 160.
    const N = K + 2.9
    cue('tonal', N + 1.2)
    marks.csMins = N
    tl.to(q('.cs-one'), { autoAlpha: 0, duration: 0.4 }, N)
    tl.fromTo(q('.cs-mins-a'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, N + 0.3)
    tl.fromTo(q('.cs-mins-arrow i'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.inOut' }, N + 0.8)
    const minsEl = q('.cs-mins-b')
    const mins = { v: 1700 }
    tl.fromTo(minsEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, N + 1.2)
    tl.fromTo(mins, { v: 1700 }, {
      v: 160, duration: 1.5, ease: 'expo.out',
      onUpdate: () => { minsEl.textContent = Math.round(mins.v).toLocaleString('en-US') },
    }, N + 1.2)
    tl.fromTo([q('.cs-mins-l'), q('.cs-mins-s')], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.15 }, N + 1.8)

    // AI with control: fields fill one at a time, each confirmed.
    const A = N + 3.0
    marks.csAI = A
    marks.voEnterprise = A + 0.3  // "For enterprise products, I focus on making complexity clearer…"
    tl.to(q('.cs-mins'), { autoAlpha: 0, y: -20, duration: 0.35, ease: 'power2.in' }, A - 0.6)
    show('.cs-ai', A)
    tl.fromTo(q('.cs-ai-copy'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9 }, A + 0.1)
    tl.fromTo(q('.cs-panel'), { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 1.0 }, A + 0.2)
    const fields = qa('.cs-field')
    fields.forEach((f, i) => {
      const at = A + 0.8 + i * 0.42
      const shim = f.querySelector('.cs-field__shimmer')!
      const text = f.querySelector('.cs-field__text')!
      const added = f.querySelector('.cs-field__added')!
      tl.set(sig, { x: m.fields[i].cx, y: m.fields[i].cy, scale: 0.55 }, at - 0.01)
      if (i === 0) tl.to(sig, { autoAlpha: 1, duration: 0.2 }, at)
      tl.fromTo(shim, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.3, ease: 'power2.inOut' }, at)
      tl.to(shim, { autoAlpha: 0, duration: 0.2 }, at + 0.3)
      tl.fromTo(text, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.28)
      tl.fromTo(added, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, at + 0.38)
    })
    tl.to(sig, { autoAlpha: 0, duration: 0.3 }, A + 0.8 + fields.length * 0.42)
    tl.fromTo(q('.cs-panel__foot'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, A + 3.0)

    const E = A + 6.7
    tl.to(q('.cs-ai'), { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, E)
    hide('.s-cs', E + 0.6)
    chapters.push({ id: 'cornerstone', start: S, end: E + 0.5, key: A + 4.2 })
    T = E + 0.5
  }

  // ════════════════════════════════════════════════════════════════════════
  // 03 FLYIN: lighter and faster. A route, a search, the product, momentum.
  // ════════════════════════════════════════════════════════════════════════
  {
    const S = T
    const arc = q<SVGPathElement>('.fl-arc')
    const svg = q<SVGSVGElement>('.fl-svg')
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    arc.setAttribute('d', {
      land: 'M 170 640 C 470 170, 980 150, 1270 470',
      port: 'M 140 560 C 300 180, 720 160, 860 420',
      phone: 'M 70 520 C 140 230, 440 210, 530 420',
      short: 'M 110 330 C 300 70, 700 60, 890 270',
    }[layout])
    const len = arc.getTotalLength()

    show('.s-fl', S)
    labelIn('.s-fl', S + 0.1)
    tl.set(arc, { strokeDasharray: len, strokeDashoffset: len }, S)
    tl.fromTo(q('.fl-city--a'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, S + 0.2)
    const start = along(arc, len, 0)
    tl.set(sig, { x: start.x, y: start.y, scale: 0.8, autoAlpha: 1 }, S + 0.2)
    const fly = { p: 0 }
    tl.to(arc, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, S + 0.3)
    cue('air', S + 0.3)
    marks.flArc = S + 0.3
    marks.voConsumer = S + 0.5  // "I've also worked on consumer experiences…"
    tl.to(fly, {
      p: 1, duration: 1.5, ease: 'power2.inOut',
      onUpdate: () => { const pt = along(arc, len, fly.p); gsap.set(sig, { x: pt.x, y: pt.y }) },
    }, S + 0.3)
    tl.fromTo(q('.fl-city--b'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, S + 1.6)
    tl.fromTo(q('.fl-search'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, S + 0.5)
    tl.fromTo(qa('.fl-search__t .split__c'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.045 }, S + 0.8)

    // The product arrives with momentum, in layers.
    const F = S + 2.2
    cue('air', F + 0.1, 0.7)
    marks.flFrames = F
    tl.to([q('.fl-svg'), q('.fl-city--a'), q('.fl-city--b'), sig], { autoAlpha: 0, duration: 0.4 }, F)
    tl.to(q('.fl-search'), { y: -40, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, F)
    tl.fromTo(q('.fl-desk'), { autoAlpha: 0, x: 380 }, { autoAlpha: 1, x: 0, duration: 0.9, ease: 'expo.out' }, F + 0.15)
    tl.fromTo(q('.fl-mob'), { autoAlpha: 0, y: 260 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, F + 0.35)
    tl.fromTo(q('.fl-hotel'), { autoAlpha: 0, x: -300 }, { autoAlpha: 0.9, x: 0, duration: 0.9, ease: 'expo.out' }, F + 0.5)
    tl.to(q('.fl-frames'), { x: { land: -60, port: -30, phone: -16, short: -36 }[layout], duration: 4.4, ease: 'none' }, F + 0.2)

    // Impact, counted up.
    const I = F + 2.7
    marks.flMetrics = I
    tl.to(q('.fl-frames'), { autoAlpha: 0.1, scale: 0.97, duration: 0.6 }, I)
    // Metrics held pending verification (as on the live portfolio): a qualitative line instead.
    tl.fromTo(qa('.fl-statement .split__w'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07 }, I + 0.2)

    const E = I + 3.0
    tl.to(q('.s-fl'), { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, E)
    chapters.push({ id: 'flyin', start: S, end: E + 0.45, key: I + 1.6 })
    T = E + 0.45
  }

  // ════════════════════════════════════════════════════════════════════════
  // 04 MENOPAUSE CARE: slower, warmer. From journey to a person.
  // ════════════════════════════════════════════════════════════════════════
  {
    const S = T
    const words = qa('.cv-words span')
    const photo = q('.cv-photo')

    show('.s-cv', S)
    tl.fromTo(q('.cv-tint'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.2, ease: 'sine.inOut' }, S)
    labelIn('.s-cv', S + 0.4)
    tl.fromTo(q('.cv-map'), { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 1.8, ease: 'sine.inOut' }, S + 0.4)
    tl.fromTo(q('.cv-map img'), { xPercent: 0 }, { xPercent: { land: -24, port: -34, phone: -30, short: -14 }[layout], duration: 6.2, ease: 'none' }, S + 0.4)

    tl.set(sig, { backgroundColor: WARM, scale: 0.6, autoAlpha: 0, x: m.cvWords[0].cx, y: m.cvWords[0].y + m.cvWords[0].h + 22 }, S + 1.5)
    words.forEach((w, i) => {
      const at = S + 1.6 + i * 0.85
      tl.fromTo(w, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'sine.out' }, at)
      if (i === 0) tl.to(sig, { autoAlpha: 1, duration: 0.8, ease: 'sine.inOut' }, at)
      else sigTo(m.cvWords[i].cx, m.cvWords[i].y + m.cvWords[i].h + 22, at - 0.2, 1.1, 'sine.inOut')
    })
    marks.voAmbiguity = S + 0.8  // "And some projects start with ambiguity…"

    // Human context: the photograph is given room.
    const P = S + 5.6
    marks.cvPhoto = P
    tl.to([q('.cv-map'), q('.cv-words'), sig], { autoAlpha: 0, duration: 1.1, ease: 'sine.inOut' }, P)
    tl.fromTo(photo, { autoAlpha: 1, clipPath: 'inset(48% 48% 48% 48% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 2.2, ease: 'sine.inOut' }, P + 0.4)
    tl.fromTo(q('.cv-photo img'), { scale: 1.14 }, { scale: 1, duration: 3.4, ease: 'sine.out' }, P + 0.4)
    tl.fromTo(q('.cv-finalist'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'sine.out' }, P + 1.9)
    tl.fromTo(qa('.cv-line .split__w'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'sine.out', stagger: 0.13 }, P + 4.2)
    marks.cvLine = P + 4.2

    const E = P + 6.4
    tl.to(q('.s-cv'), { autoAlpha: 0, duration: 1.1, ease: 'sine.inOut' }, E)
    chapters.push({ id: 'civtech', start: S, end: E + 1.0, key: P + 4.8 })
    T = E + 1.0
  }

  // ════════════════════════════════════════════════════════════════════════
  // ENDING: four worlds, one line. What connects them. The name.
  // ════════════════════════════════════════════════════════════════════════
  {
    const S = T
    const frames = qa('.end-frame')
    const loop = q<SVGPathElement>('.end-loop')
    q<SVGSVGElement>('.end-svg').setAttribute('viewBox', `0 0 ${W} ${H}`)
    const c = m.endFrames.map((f) => [f.cx, f.cy])
    // Order: YouClean → Cornerstone → Flyin → CivTech → back, as one loop.
    const order = [0, 1, 3, 2]
    loop.setAttribute('d', `M ${order.map((i) => c[i].join(' ')).join(' L ')} Z`)
    const len = loop.getTotalLength()

    show('.s-end', S)
    tl.set(sig, { backgroundColor: ACCENT }, S)
    tl.fromTo(frames, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 1.0, stagger: 0.22 }, S + 0.2)
    tl.set(loop, { strokeDasharray: len, strokeDashoffset: len }, S)
    const start = along(loop, len, 0)
    tl.set(sig, { x: start.x, y: start.y, scale: 0.8, autoAlpha: 0 }, S + 1.1)
    tl.to(sig, { autoAlpha: 1, duration: 0.3 }, S + 1.2)
    const run = { p: 0 }
    tl.to(loop, { strokeDashoffset: 0, duration: 1.8, ease: 'power1.inOut' }, S + 1.3)
    tl.to(run, {
      p: 1, duration: 1.8, ease: 'power1.inOut',
      onUpdate: () => { const pt = along(loop, len, run.p); gsap.set(sig, { x: pt.x, y: pt.y }) },
    }, S + 1.3)

    // One connected thought, not three slogans. The first sentence arrives as it is
    // spoken; the second appears whole and quiet, and each of its three phrases
    // comes forward as it is said, with the signal underlining it.
    const R = S + 3.5
    marks.endLoop = S + 1.3
    tl.to([...frames, loop, sig], { autoAlpha: 0, scale: 0.96, duration: 0.7, ease: 'power2.in' }, R - 0.2)
    marks.voBelief = R + 0.4       // "For me, good product design starts before the screen."
    tl.fromTo(qa('.end-t1 .split__w'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.24 }, R + 0.4)
    tl.fromTo(q('.end-t2'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1.0 }, R + 3.9)
    marks.voHow1 = R + 4.2         // "It's about understanding the system,"
    marks.voHow2 = R + 6.35        // "making complexity easier to navigate,"
    marks.voHow3 = R + 9.15        // "and building experiences people can trust."
    // Each phrase lights as its words are reached ("It's about…", "and…" lead in).
    const phraseAt = [marks.voHow1 + 0.55, marks.voHow2 + 0.05, marks.voHow3 + 0.3]
    qa('.end-ph').forEach((ph, i) => {
      const at = phraseAt[i]
      tl.to(ph, { color: INK, duration: 0.6, ease: 'power2.out' }, at)
      tl.fromTo(ph, { textDecorationColor: 'rgba(107, 176, 208, 0)' }, { textDecorationColor: 'rgba(107, 176, 208, 0.75)', duration: 0.9, ease: 'power2.out' }, at)
      const pb = m.phrases[i]
      if (i === 0) tl.set(sig, { x: pb.x, y: pb.y + pb.h + 6, scale: 0.5, autoAlpha: 0 }, at - 0.01)
      if (i === 0) tl.to(sig, { autoAlpha: 1, duration: 0.3 }, at)
      tl.to(sig, { x: pb.x + pb.w, y: pb.y + pb.h + 6, duration: 1.1, ease: 'power2.inOut' }, at)
    })
    tl.to(sig, { autoAlpha: 0, duration: 0.4 }, R + 11.2)
    tl.to(q('.end-thought'), { autoAlpha: 0, y: -16, duration: 0.7, ease: 'power2.in' }, R + 12.2)

    // Identity, kept simple.
    const N = R + 12.9
    marks.endName = N
    marks.voIdentity = N + 0.5     // "I'm Vimala Banavath." … "Senior Product Designer."
    const chars = qa('.end-name .split__c')
    const stop = q('.end-stop')
    tl.set(stop, { autoAlpha: 0 }, S)
    tl.fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.03 }, N)
    tl.set(sig, { x: m.endStop.cx, y: m.endStop.cy - 60, scale: 1, autoAlpha: 0 }, N + 0.6)
    tl.to(sig, { autoAlpha: 1, y: m.endStop.cy, duration: 0.7, ease: 'bounce.out' }, N + 0.7)
    tl.fromTo(q('.end-title'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9 }, N + 2.4)
    tl.fromTo(q('.end-cta'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9 }, N + 3.6)
    tl.to({}, { duration: 0.2 }, N + 4.5)
    chapters.push({ id: 'end', start: S, end: N + 4.7, key: N + 4.5 })
  }

  cues.sort((a, b) => a.t - b.t)
  return { tl, chapters, cues, marks, duration: tl.duration() }
}
