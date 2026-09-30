#!/usr/bin/env node
/**
 * Generates the showreel's ORIGINAL placeholder audio, entirely offline:
 *   public/audio/music-showreel.m4a   score composed to the reel's chapters
 *   public/audio/sfx-*.m4a            seven restrained one-shots
 *   public/audio/voiceover.m4a        placeholder VO (macOS text-to-speech)
 *
 * Nothing is downloaded; every sample is synthesised here, so there are no
 * licensing questions. Timings come from scripts/reel-timing.json (exported
 * from the live timeline). Replace any file with a licensed/recorded one of
 * the same name (or change public/audio/config.json) — no code changes.
 *
 * Usage: node scripts/generate-audio.mjs [--no-vo]
 * Needs macOS (afconvert + say).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public/audio')
const TMP = join(tmpdir(), `reel-audio-${process.pid}`)
mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })

const timing = JSON.parse(readFileSync(join(ROOT, 'scripts/reel-timing.json'), 'utf8'))
const M = timing.marks
// Beat names the score is written against (derived from the timeline marks).
const B = {
  ...M,
  ycRunIt: M.ycOwn + 1.1,
  csAI: M.csAI,
  endP1: M.voHow1 + 0.55,
  endP2: M.voHow2 + 0.05,
  endP3: M.voHow3 + 0.3,
}
const SR = 44100
const TAU = Math.PI * 2
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12)

// Deterministic randomness, so every run produces the same audio.
let seed = 20260930
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

/* ── Buffers & I/O ─────────────────────────────────────────────────────── */

const stereo = (sec) => [new Float32Array(Math.ceil(sec * SR)), new Float32Array(Math.ceil(sec * SR))]

function writeWav(path, [L, R]) {
  const n = L.length
  const buf = Buffer.alloc(44 + n * 4)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8)
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22)
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34)
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40)
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4)
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4)
  }
  writeFileSync(path, buf)
}

function readWavMono(path) {
  const b = readFileSync(path)
  let o = 12
  let fmt = null
  while (o < b.length) {
    const id = b.toString('ascii', o, o + 4)
    const size = b.readUInt32LE(o + 4)
    if (id === 'fmt ') fmt = { ch: b.readUInt16LE(o + 10), bits: b.readUInt16LE(o + 22) }
    if (id === 'data') {
      const n = size / (fmt.bits / 8) / fmt.ch
      const out = new Float32Array(n)
      for (let i = 0; i < n; i++) out[i] = b.readInt16LE(o + 8 + i * fmt.ch * 2) / 32768
      return out
    }
    o += 8 + size + (size % 2)
  }
  throw new Error('no data chunk: ' + path)
}

function encode(name, buf, kbps = 160) {
  const wav = join(TMP, name + '.wav')
  writeWav(wav, buf)
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', String(kbps * 1000), wav, join(OUT, name + '.m4a')])
  console.log(`  ✓ ${name}.m4a  (${(buf[0].length / SR).toFixed(1)} s)`)
}

/* ── DSP ───────────────────────────────────────────────────────────────── */

// Band-limited soft saw wavetable (warm pad source).
const TBL = 4096
const SAW = new Float32Array(TBL + 1)
for (let i = 0; i <= TBL; i++) {
  let v = 0
  for (let h = 1; h <= 18; h++) v += Math.sin((TAU * h * i) / TBL) / h * Math.pow(0.86, h)
  SAW[i] = v * 0.55
}
const wt = (ph) => { const x = (ph - Math.floor(ph)) * TBL; const i = x | 0; return SAW[i] + (SAW[i + 1] - SAW[i]) * (x - i) }

/** RBJ biquad, coefficients recomputed on demand (for sweeps). */
function biquad(type) {
  let b0, b1, b2, a1, a2, x1 = 0, x2 = 0, y1 = 0, y2 = 0, lastF = -1, lastQ = -1
  const set = (f, q) => {
    if (f === lastF && q === lastQ) return
    lastF = f; lastQ = q
    const w = (TAU * Math.min(f, SR * 0.45)) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q)
    let n0, n1, n2
    if (type === 'lp') { n0 = (1 - c) / 2; n1 = 1 - c; n2 = (1 - c) / 2 }
    else if (type === 'hp') { n0 = (1 + c) / 2; n1 = -(1 + c); n2 = (1 + c) / 2 }
    else { n0 = al; n1 = 0; n2 = -al } // band-pass
    const d = 1 + al
    b0 = n0 / d; b1 = n1 / d; b2 = n2 / d; a1 = (-2 * c) / d; a2 = (1 - al) / d
  }
  return (x, f, q = 0.707) => {
    set(Math.round(f), q)
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
    x2 = x1; x1 = x; y2 = y1; y1 = y
    return y
  }
}

/** Small Freeverb-style room, stereo. */
function reverb([L, R], { mix = 0.25, size = 0.84, damp = 0.35, pre = 0.02 } = {}) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617]
  const alls = [556, 441, 341, 225]
  const make = (spread) => {
    const cb = combs.map((d) => ({ buf: new Float32Array(d + spread), i: 0, f: 0 }))
    const ab = alls.map((d) => ({ buf: new Float32Array(d + spread), i: 0 }))
    return (x) => {
      let out = 0
      for (const c of cb) {
        const y = c.buf[c.i]
        c.f = y * (1 - damp) + c.f * damp
        c.buf[c.i] = x + c.f * size
        c.i = (c.i + 1) % c.buf.length
        out += y
      }
      for (const a of ab) {
        const y = a.buf[a.i]
        a.buf[a.i] = out + y * 0.5
        a.i = (a.i + 1) % a.buf.length
        out = y - out
      }
      return out * 0.015
    }
  }
  const rl = make(0), rr = make(23)
  const d = Math.round(pre * SR)
  const n = L.length
  const oL = new Float32Array(n), oR = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const inp = ((i >= d ? L[i - d] + R[i - d] : 0)) * 0.5
    oL[i] = L[i] * (1 - mix) + rl(inp) * mix * 3
    oR[i] = R[i] * (1 - mix) + rr(inp) * mix * 3
  }
  return [oL, oR]
}

function normalize([L, R], peakDb = -3) {
  let p = 0
  for (let i = 0; i < L.length; i++) p = Math.max(p, Math.abs(L[i]), Math.abs(R[i]))
  const g = p > 0 ? Math.pow(10, peakDb / 20) / p : 1
  for (let i = 0; i < L.length; i++) { L[i] = Math.tanh(L[i] * g * 1.05) ; R[i] = Math.tanh(R[i] * g * 1.05) }
  return [L, R]
}

/** Linear-in-time envelope through points [[t, v], ...]. */
const env = (pts) => (t) => {
  if (t <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0) }
  }
  return pts[pts.length - 1][1]
}
const smooth = (x) => x * x * (3 - 2 * x)

/* ── Instruments (all write into a stereo buffer) ─────────────────────── */

/** Warm pad chord with slow attack/release and a moving low-pass. */
function pad(buf, notes, t0, t1, { amp = 0.12, attack = 2.5, release = 3, cutoff = () => 1400, detune = 0.11, width = 0.6 } = {}) {
  const [L, R] = buf
  const i0 = Math.floor(t0 * SR), i1 = Math.min(L.length, Math.ceil((t1 + release) * SR))
  notes.forEach((m, k) => {
    const f = midi(m)
    const lpL = biquad('lp'), lpR = biquad('lp')
    const voices = [-detune, 0, detune].map((d) => ({ inc: (f * Math.pow(2, d / 12)) / SR, ph: rand() }))
    const pan = (k / Math.max(1, notes.length - 1) - 0.5) * width
    for (let i = i0; i < i1; i++) {
      const t = i / SR
      const a = t < t0 + attack ? smooth((t - t0) / attack) : t > t1 ? Math.max(0, 1 - (t - t1) / release) : 1
      if (a <= 0) continue
      let s = 0
      for (const v of voices) { s += wt(v.ph); v.ph += v.inc }
      s *= (amp / notes.length) * a
      const fc = cutoff(t)
      L[i] += lpL(s * (1 - pan), fc, 0.6)
      R[i] += lpR(s * (1 + pan), fc, 0.6)
    }
  })
}

/** Soft sine drone. */
function drone(buf, m, t0, t1, amp, fadeIn = 3, fadeOut = 3) {
  const [L, R] = buf, f = midi(m)
  for (let i = Math.floor(t0 * SR); i < Math.min(L.length, (t1 + fadeOut) * SR); i++) {
    const t = i / SR
    const a = t < t0 + fadeIn ? smooth((t - t0) / fadeIn) : t > t1 ? Math.max(0, 1 - (t - t1) / fadeOut) : 1
    const s = (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2 * t)) * amp * a
    L[i] += s; R[i] += s
  }
}

/** Plucked tone: sine + soft harmonics, exponential decay. */
function pluck(buf, m, t, { amp = 0.08, decay = 0.6, pan = 0, bright = 0.3 } = {}) {
  const [L, R] = buf, f = midi(m)
  const n = Math.min(L.length, Math.floor((t + decay * 6) * SR))
  for (let i = Math.floor(t * SR); i < n; i++) {
    const x = i / SR - t
    const a = Math.min(1, x / 0.006) * Math.exp(-x / decay)
    const s = (Math.sin(TAU * f * x) + bright * Math.sin(TAU * f * 2 * x) * Math.exp(-x / (decay * 0.4)) + 0.12 * Math.sin(TAU * f * 3 * x) * Math.exp(-x / (decay * 0.25))) * amp * a
    L[i] += s * (1 - pan); R[i] += s * (1 + pan)
  }
}

/** Bell: inharmonic partials, long decay. */
function bell(buf, m, t, amp = 0.05, decay = 2.4, pan = 0) {
  const [L, R] = buf, f = midi(m)
  const parts = [[1, 1], [2.0, 0.35], [3.01, 0.12], [4.2, 0.06]]
  for (let i = Math.floor(t * SR); i < Math.min(L.length, (t + decay * 5) * SR); i++) {
    const x = i / SR - t
    let s = 0
    for (const [r, g] of parts) s += Math.sin(TAU * f * r * x) * g * Math.exp(-x / (decay / r))
    s *= amp * Math.min(1, x / 0.004)
    L[i] += s * (1 - pan); R[i] += s * (1 + pan)
  }
}

/** Sub pulse: short sine thump with a small pitch drop. */
function sub(buf, m, t, amp = 0.12, decay = 0.28) {
  const [L, R] = buf, f = midi(m)
  let ph = 0
  for (let i = Math.floor(t * SR); i < Math.min(L.length, (t + decay * 5) * SR); i++) {
    const x = i / SR - t
    ph += (f * (1 + 0.5 * Math.exp(-x / 0.03))) / SR
    const s = Math.sin(TAU * ph) * amp * Math.min(1, x / 0.004) * Math.exp(-x / decay)
    L[i] += s; R[i] += s
  }
}

/** Filtered noise (air, texture, whooshes). fc/q/amp/pan are functions of local time. */
function noise(buf, t, dur, { amp, fc, q = () => 1.2, pan = () => 0, type = 'bp' }) {
  const [L, R] = buf
  const fl = biquad(type), fr = biquad(type)
  for (let i = Math.floor(t * SR); i < Math.min(L.length, (t + dur) * SR); i++) {
    const x = i / SR - t
    const a = amp(x / dur)
    if (a <= 0) { fl(0, fc(x / dur), q(x / dur)); fr(0, fc(x / dur), q(x / dur)); continue }
    const p = pan(x / dur)
    L[i] += fl((rand() * 2 - 1) * a * (1 - p), fc(x / dur), q(x / dur))
    R[i] += fr((rand() * 2 - 1) * a * (1 + p), fc(x / dur), q(x / dur))
  }
}

/** Gliding sine (tonal transitions). */
function glide(buf, m0, m1, t, dur, amp, pan = 0) {
  const [L, R] = buf
  let ph = 0, ph2 = 0
  for (let i = Math.floor(t * SR); i < Math.min(L.length, (t + dur + 1.2) * SR); i++) {
    const x = i / SR - t
    const k = smooth(Math.min(1, x / dur))
    const f = midi(m0 + (m1 - m0) * k)
    ph += f / SR; ph2 += (f * 2) / SR
    const a = amp * Math.min(1, x / 0.08) * (x < dur ? 1 : Math.exp(-(x - dur) / 0.35))
    const s = (Math.sin(TAU * ph) + 0.18 * Math.sin(TAU * ph2)) * a
    L[i] += s * (1 - pan); R[i] += s * (1 + pan)
  }
}

/* ══════════════════════════════════════════════════════════════════════
   MUSIC: composed to the reel. Key of D. 96 bpm where there is a pulse.
   ══════════════════════════════════════════════════════════════════════ */

const I = [50, 57, 61, 64, 66]   // Dmaj9
const vi = [47, 54, 57, 61, 64]  // Bm11
const IV = [43, 50, 54, 57, 61]  // Gmaj9
const V = [45, 52, 57, 59, 64]   // Asus2
const BEAT = 60 / 96
const ch = Object.fromEntries(timing.chapters.map((c) => [c.id, c]))
const END = timing.duration
const LEN = END + 4.5

function music() {
  const buf = stereo(LEN)

  // OPENING: almost nothing. A low drone, air, two bells, the first chord at the statement.
  drone(buf, 38, 0.4, ch.youclean.start + 1, 0.026, 3.5, 3)
  noise(buf, 0.2, 14, { amp: (u) => 0.006 * Math.sin(Math.PI * u), fc: (u) => 900 + 1400 * u, q: () => 0.8 })
  // One bell before the first word; nothing under the introduction but air and a chord.
  bell(buf, 74, 0.55, 0.03, 2.6, -0.2)
  pad(buf, I, B.wordsAlign - 1.5, ch.youclean.start + 3.4, { amp: 0.05, attack: 3.5, release: 1.2, cutoff: env([[B.wordsAlign, 500], [ch.youclean.start, 900]]) })

  // YOUCLEAN: gradual build. Pulse arrives with structure, plucks with the product,
  // a harmonic turn on the compression, then stillness for "Run it."
  const yc = ch.youclean
  pad(buf, I, yc.start + 2.4, B.ycCompress, { amp: 0.085, attack: 2, release: 1.4, cutoff: env([[yc.start, 900], [B.ycCompress, 2000]]) })
  for (let t = B.ycStructure + 0.3; t < B.ycOwn - 0.4; t += BEAT) sub(buf, 38, t, 0.07 + 0.04 * ((t - B.ycStructure) / 11), 0.25)
  const arp = [62, 66, 69, 73, 76, 73, 69, 66]
  for (let k = 0, t = B.ycProduct; t < B.ycCompress + 1.2; k++, t += BEAT / 2) {
    pluck(buf, arp[k % arp.length], t, { amp: 0.028 + 0.012 * (k / 16), decay: 0.45, pan: k % 2 ? 0.25 : -0.25 })
  }
  pad(buf, vi, B.ycCompress - 0.2, B.ycOwn, { amp: 0.1, attack: 0.9, release: 1.6, cutoff: () => 1800 })
  pad(buf, IV, B.ycOwn + 0.4, yc.end - 0.6, { amp: 0.07, attack: 1.4, release: 1.2, cutoff: () => 1100 })

  // CORNERSTONE: momentum. Muted 16ths rise with the clicks, cut to silence on the
  // collapse, resolve on "1", open up for the AI.
  const cs = ch.cornerstone
  pad(buf, V, cs.start - 0.6, B.csCollapse - 0.15, { amp: 0.12, attack: 1.6, release: 0.12, cutoff: env([[cs.start, 800], [B.csCollapse, 2600]]) })
  for (let k = 0, t = B.csClicks - 0.4; t < B.csCollapse - 0.12; k++, t += BEAT / 4) {
    const u = (t - B.csClicks) / (B.csCollapse - B.csClicks)
    pluck(buf, [57, 64, 57, 69][k % 4], t, { amp: 0.03 + 0.05 * Math.max(0, u), decay: 0.09, bright: 0.6, pan: (k % 3 - 1) * 0.3 })
  }
  for (let t = B.csClicks; t < B.csCollapse - 0.2; t += BEAT) sub(buf, 33, t, 0.12, 0.22)
  pad(buf, I, B.csCollapse + 0.55, B.csMins, { amp: 0.12, attack: 1.2, release: 1.6, cutoff: () => 1500 })
  bell(buf, 74, B.csOne + 0.05, 0.04, 2.6)
  pad(buf, IV, B.csMins - 0.3, cs.end - 0.8, { amp: 0.085, attack: 1.5, release: 1.4, cutoff: env([[B.csMins, 1200], [cs.end, 2200]]) })
  const spark = [86, 81, 78, 85, 90, 85, 81, 78]
  for (let k = 0, t = B.csAI + 0.6; t < cs.end - 0.5; k++, t += BEAT / 4) {
    if (k % 3 === 2) continue
    pluck(buf, spark[k % spark.length], t, { amp: 0.011, decay: 0.3, pan: Math.sin(k) * 0.5 })
  }
  pad(buf, V, cs.end - 1.6, cs.end + 0.3, { amp: 0.07, attack: 1.2, release: 0.8, cutoff: () => 1800 })

  // FLYIN: lighter and quicker. Higher voicing, brisk arp, air on the offbeats. No sub.
  const fl = ch.flyin
  pad(buf, I.map((m) => m + 12), fl.start, B.flMetrics, { amp: 0.055, attack: 0.8, release: 1, cutoff: () => 3200 })
  pad(buf, V.map((m) => m + 12), B.flMetrics - 0.1, fl.end - 0.4, { amp: 0.07, attack: 0.6, release: 1.4, cutoff: () => 2800 })
  const arp2 = [74, 78, 81, 85, 81, 78]
  for (let k = 0, t = fl.start + 0.3; t < fl.end - 0.6; k++, t += BEAT / 2) {
    pluck(buf, arp2[k % arp2.length], t, { amp: 0.016, decay: 0.28, pan: k % 2 ? 0.35 : -0.35, bright: 0.45 })
    noise(buf, t + BEAT / 4, 0.06, { amp: (u) => 0.006 * (1 - u), fc: () => 8000, q: () => 1.5, type: 'hp' })
  }

  // MENOPAUSE CARE: reduction. No pulse, no arp. Warm, slow, a few spaced notes.
  const cv = ch.civtech
  pad(buf, vi, cv.start - 0.2, B.cvPhoto, { amp: 0.05, attack: 3.2, release: 2.2, cutoff: () => 900 })
  pad(buf, IV, B.cvPhoto - 0.8, cv.end - 1.2, { amp: 0.05, attack: 2.6, release: 2, cutoff: env([[B.cvPhoto, 900], [cv.end, 1300]]) })
  ;[[cv.start + 2.2, 66], [cv.start + 4.3, 69], [B.cvPhoto + 0.4, 74], [B.cvLine + 0.2, 71], [B.cvLine + 2.3, 69]].forEach(([t, m], k) =>
    pluck(buf, m, t, { amp: 0.028, decay: 1.6, pan: (k % 2 ? 0.2 : -0.2), bright: 0.18 }))

  // ENDING: the worlds come back together, then a controlled resolution.
  const en = ch.end
  pad(buf, I, en.start - 0.8, B.endP1 - 0.3, { amp: 0.09, attack: 2, release: 1.4, cutoff: env([[en.start, 1000], [B.endP1, 1900]]) })
  for (let k = 0, t = B.endLoop; t < B.endLoop + 2.6; k++, t += BEAT / 2) pluck(buf, arp[k % arp.length], t, { amp: 0.02, decay: 0.5, pan: k % 2 ? 0.2 : -0.2 })
  pad(buf, IV, B.endP1 - 0.4, B.endP3 + 0.6, { amp: 0.085, attack: 1.2, release: 1.2, cutoff: () => 1500 })
  pad(buf, V, B.endP3 + 0.4, B.endName - 0.2, { amp: 0.08, attack: 1, release: 0.9, cutoff: () => 1600 })
  pad(buf, [38, ...I, 69], B.endName - 0.3, END - 0.6, { amp: 0.11, attack: 1.4, release: 3.8, cutoff: env([[B.endName, 1800], [END + 3, 700]]) })
  bell(buf, 74, B.endName + 0.45, 0.022, 3.2, 0.1)

  return normalize(reverb(buf, { mix: 0.3, size: 0.86, damp: 0.4 }), -4)
}

/* ══════════════════════════════════════════════════════════════════════
   SOUND DESIGN: seven one-shots. Quiet, short, tonal where possible.
   ══════════════════════════════════════════════════════════════════════ */

const sfx = {
  // Opening: atmosphere as the first type appears.
  texture() {
    const b = stereo(3.2)
    noise(b, 0, 3.0, { amp: (u) => 0.05 * Math.sin(Math.PI * u) ** 2, fc: (u) => 1400 + 2600 * u, q: () => 0.9, pan: (u) => Math.sin(u * 3) * 0.4 })
    glide(b, 86, 86, 0.4, 1.6, 0.012)
    return normalize(reverb(b, { mix: 0.45 }), -9)
  },
  // YouClean: fragments become structure — a soft spatial movement.
  transform() {
    const b = stereo(1.9)
    noise(b, 0, 1.3, { amp: (u) => 0.12 * Math.sin(Math.PI * u) ** 1.5, fc: (u) => 350 + 4200 * Math.sin(Math.PI * u), q: () => 0.7, pan: (u) => -0.7 + 1.4 * u, type: 'lp' })
    glide(b, 57, 64, 0.25, 0.8, 0.05)
    return normalize(reverb(b, { mix: 0.35 }), -8)
  },
  // YouClean: 3–5 min → < 1 min — a subtle tonal step up.
  transition() {
    const b = stereo(1.8)
    glide(b, 69, 74, 0.02, 0.45, 0.07, -0.15)
    glide(b, 76, 81, 0.1, 0.45, 0.035, 0.2)
    return normalize(reverb(b, { mix: 0.4 }), -9)
  },
  // YouClean: "Run it." — one restrained accent.
  accent() {
    const b = stereo(3)
    sub(b, 38, 0.0, 0.3, 0.3)
    bell(b, 74, 0.01, 0.06, 2.2)
    return normalize(reverb(b, { mix: 0.35 }), -8)
  },
  // Cornerstone: 40 clicks collapse into 1 — inhale, then a soft impact.
  compression() {
    const b = stereo(1.6)
    noise(b, 0, 0.38, { amp: (u) => 0.12 * u ** 3, fc: (u) => 600 + 5000 * u, q: () => 0.8, type: 'lp' })
    sub(b, 40, 0.38, 0.5, 0.32)
    noise(b, 0.38, 0.12, { amp: (u) => 0.08 * (1 - u), fc: () => 2200, q: () => 0.6 })
    return normalize(reverb(b, { mix: 0.3 }), -6)
  },
  // Cornerstone: 1,700 → 160 — a restrained tonal movement down.
  tonal() {
    const b = stereo(2)
    glide(b, 76, 69, 0.02, 1.1, 0.06)
    glide(b, 64, 57, 0.08, 1.1, 0.03, 0.2)
    return normalize(reverb(b, { mix: 0.4 }), -10)
  },
  // Flyin: light, quick air. Not an aeroplane.
  air() {
    const b = stereo(1.2)
    noise(b, 0, 0.8, { amp: (u) => 0.07 * Math.sin(Math.PI * u), fc: (u) => 4500 + 4000 * u, q: () => 1.1, pan: (u) => -0.5 + u })
    pluck(b, 93, 0.12, { amp: 0.02, decay: 0.25 })
    return normalize(reverb(b, { mix: 0.3 }), -12)
  },
}

/* ══════════════════════════════════════════════════════════════════════
   VOICEOVER (placeholder): macOS TTS, each line placed at its mark.
   ══════════════════════════════════════════════════════════════════════ */

/**
 * `say` occasionally writes a truncated file when called in quick succession.
 * Render each phrase until two consecutive takes agree in length.
 */
function speak(voice, rate, text, aiff, wav) {
  let prev = -1
  for (let attempt = 0; attempt < 6; attempt++) {
    execFileSync('say', ['-v', voice, '-r', String(rate), '-o', aiff, text])
    execFileSync('afconvert', ['-f', 'WAVE', '-d', `LEI16@${SR}`, '-c', '1', aiff, wav])
    const mono = readWavMono(wav)
    if (Math.abs(mono.length - prev) < SR * 0.02) return mono
    prev = mono.length
  }
  console.warn(`  ! unstable TTS length for: "${text}"`)
  return readWavMono(wav)
}

function voiceover() {
  const script = JSON.parse(readFileSync(join(ROOT, 'scripts/voiceover-script.json'), 'utf8'))
  const voice = process.env.VO_VOICE || script.voice
  const buf = stereo(LEN)
  let prevEnd = 0
  let k = 0
  const report = []
  for (const line of script.lines) {
    let at = Math.max(M[line.mark], prevEnd + 0.25)
    const lineStart = at
    // A recorded take for this line wins over TTS: scripts/vo-recordings/<mark>.(wav|aif|aiff|m4a|mp3)
    const rec = ['wav', 'aif', 'aiff', 'm4a', 'mp3'].map((ext) => join(ROOT, 'scripts/vo-recordings', `${line.mark}.${ext}`)).find((f) => existsSync(f))
    const parts = rec ? [[null, 0, 0, rec]] : line.parts
    for (const [text, pause, rate, file] of parts) {
      const aiff = join(TMP, `vo${k}.aiff`)
      const wav = join(TMP, `vo${k}.wav`)
      k++
      let mono
      if (file) {
        execFileSync('afconvert', ['-f', 'WAVE', '-d', `LEI16@${SR}`, '-c', '1', file, wav])
        mono = readWavMono(wav)
      } else {
        mono = speak(voice, rate, text, aiff, wav)
      }
      // Trim TTS lead/trail silence so pauses are exactly what the script says.
      let a = 0, z = mono.length - 1
      while (a < z && Math.abs(mono[a]) < 0.004) a++
      while (z > a && Math.abs(mono[z]) < 0.004) z--
      mono = mono.subarray(Math.max(0, a - 400), Math.min(mono.length, z + 1600))
      const i0 = Math.floor(at * SR)
      for (let i = 0; i < mono.length && i0 + i < buf[0].length; i++) {
        // 5 ms fades so phrase joins never click.
        const f = Math.min(1, i / 220, (mono.length - i) / 220)
        buf[0][i0 + i] += mono[i] * 0.9 * f
        buf[1][i0 + i] += mono[i] * 0.9 * f
      }
      at += mono.length / SR + pause
    }
    prevEnd = at
    report.push(`    ${line.mark.padEnd(13)} ${lineStart.toFixed(2)} → ${at.toFixed(2)} s${rec ? '  [recorded]' : ''}${lineStart > M[line.mark] + 0.01 ? '  (pushed later by previous line)' : ''}`)
  }
  console.log(`  voice: ${voice}\n` + report.join('\n'))
  return normalize(reverb(buf, { mix: 0.06, size: 0.45 }), -3)
}

/* ── Render ────────────────────────────────────────────────────────────── */

console.log('Rendering original showreel audio →', OUT)
encode('music-showreel', music(), 160)
for (const [name, fn] of Object.entries(sfx)) encode(`sfx-${name}`, fn(), 128)
if (!process.argv.includes('--no-vo')) encode('voiceover', voiceover(), 96)
if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true })
console.log('Done.')
