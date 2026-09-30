import { gsap } from 'gsap'
import type { Cue } from '../reel/timeline'

/**
 * The showreel's audio engine.
 *
 * Mental model: the reel starts, music sets the mood, and narration (Voice) is
 * an optional guided tour the viewer can switch on.
 *
 * - Two independent switches: `music` (score + sound design) and `voice`
 *   (narration). Neither ever changes the other.
 * - Defaults on every load: music on, voice off. Nothing is persisted, so a
 *   reload always returns to that. (Reduced motion: music starts off, since the
 *   reel shows still frames there.)
 * - The reel is the clock. Tracks start at the reel's current time, fade when
 *   it pauses, re-sync on scrubs/jumps. Toggling never touches the reel.
 * - Autoplay is attempted, never assumed. If the browser blocks it, the reel
 *   still plays, the control says "Sound off · Tap to play", and the first
 *   gesture anywhere unlocks audio and starts MUSIC ONLY. That gesture is never
 *   also treated as a toggle or a stage tap (see takeUnlockTap).
 * - Web Audio, not <audio>: iPad Safari ignores <audio>.volume, and ducking
 *   needs real gain nodes. Assets/levels come from /audio/config.json.
 */

export type AudioPrefs = { music: boolean; voice: boolean }
type Snapshot = { t: number; playing: boolean; atEnd: boolean; reduced: boolean }
type Track = { node: AudioBufferSourceNode; gain: GainNode; startCtx: number; startPos: number }
type Config = {
  music: { file: string; volume: number; offset: number }
  voiceover: { file: string; volume: number; offset: number; duckMusicTo: number }
  sfx: { volume: number; files: Record<string, string> }
}

const BASE = '/audio/'
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

class AudioEngine {
  prefs: AudioPrefs = { music: !reducedMotion(), voice: false }
  unlocked = false
  /** True once we know the browser blocked autoplay (the control invites a tap). */
  blocked = false
  /** Narration is audible right now (drives the Voice activity pulse). */
  speaking = false
  /** Increments whenever music becomes audible from silence (drives the start pulse). */
  musicStarts = 0
  private unlockTapAt = 0
  private ctx: AudioContext | null = null
  private master!: GainNode
  private musicBus!: GainNode
  private duck!: GainNode
  private voiceBus!: GainNode
  private sfxBus!: GainNode
  private config: Config | null = null
  private buffers: { music?: AudioBuffer; voice?: AudioBuffer; sfx: Record<string, AudioBuffer> } = { sfx: {} }
  private voiceEnv: Float32Array | null = null
  private music: Track | null = null
  private voice: Track | null = null
  private source: (() => Snapshot) | null = null
  private cues: Cue[] = []
  private lastT = -1
  private lastPlaying = false
  private listeners = new Set<() => void>()
  private loading: Promise<void> | null = null

  constructor() {
    if (typeof window === 'undefined') return
    const unlock = () => this.unlock()
    // Capture phase, so the gesture that also presses a button still counts.
    window.addEventListener('pointerdown', unlock, true)
    window.addEventListener('touchend', unlock, true)
    window.addEventListener('keydown', unlock, true)
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return
      if (document.hidden) this.ctx.suspend().catch(() => {})
      else if (this.unlocked) this.ctx.resume().catch(() => {})
    })
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }
  private emit() { this.listeners.forEach((fn) => fn()) }

  /** Music and voice are independent: changing one never changes the other. */
  setPrefs(next: Partial<AudioPrefs>) {
    const wasAudible = this.prefs.music && this.unlocked
    this.prefs = { ...this.prefs, ...next }
    if (this.prefs.music || this.prefs.voice) this.ensureLoaded()
    if (!this.prefs.music) { this.stop(this.music); this.music = null }
    if (!this.prefs.voice) { this.stop(this.voice); this.voice = null; this.speaking = false }
    if (!wasAudible && this.prefs.music && this.unlocked) this.musicStarts++
    this.emit()
  }

  /** Called inside a user gesture: create/resume the context (iOS requires this). */
  private unlock() {
    try {
      // iOS 17+: play even with the ring/silent switch on (it is media, not a UI sound).
      const nav = navigator as Navigator & { audioSession?: { type: string } }
      if (nav.audioSession) nav.audioSession.type = 'playback'
      if (!this.ctx) this.build()
      if (this.ctx!.state !== 'running') this.ctx!.resume().catch(() => {})
      // A near-silent blip inside the gesture fully unlocks older iOS Safari.
      const b = this.ctx!.createBuffer(1, 1, this.ctx!.sampleRate)
      const s = this.ctx!.createBufferSource()
      s.buffer = b
      s.connect(this.ctx!.destination)
      s.start(0)
      if (!this.unlocked) {
        this.unlocked = true
        // This gesture unlocked audio; it must not also toggle a control or tap the stage.
        this.unlockTapAt = performance.now()
        this.blocked = false
        if (this.prefs.music) this.musicStarts++
        this.emit()
      }
      this.ensureLoaded()
    } catch { /* Web Audio unavailable: the reel simply stays silent. */ }
  }

  private build() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx({ latencyHint: 'playback' })
    this.ctx = ctx
    this.master = ctx.createGain()
    this.musicBus = ctx.createGain()
    this.duck = ctx.createGain()
    this.voiceBus = ctx.createGain()
    this.sfxBus = ctx.createGain()
    this.musicBus.connect(this.duck).connect(this.master)
    this.voiceBus.connect(this.master)
    this.sfxBus.connect(this.master)
    this.master.connect(ctx.destination)
  }

  private ensureLoaded() {
    if (!this.ctx || this.loading) return
    this.loading = this.load().catch((e) => { console.warn('[audio] load failed', e); this.loading = null })
  }

  private async load() {
    const ctx = this.ctx!
    const cfg: Config = await (await fetch(BASE + 'config.json')).json()
    this.config = cfg
    this.musicBus.gain.value = cfg.music.volume
    this.voiceBus.gain.value = cfg.voiceover.volume
    this.sfxBus.gain.value = cfg.sfx.volume
    const decode = async (file: string) => ctx.decodeAudioData(await (await fetch(BASE + file)).arrayBuffer())
    // Music first (it's what's heard first), then the rest in parallel.
    this.buffers.music = await decode(cfg.music.file)
    await Promise.all([
      ...Object.entries(cfg.sfx.files).map(async ([id, f]) => { this.buffers.sfx[id] = await decode(f) }),
      decode(cfg.voiceover.file).then((b) => { this.buffers.voice = b; this.voiceEnv = envelope(b) }).catch(() => {}),
    ])
  }

  /** The reel registers itself; the engine follows it every frame. */
  attach(source: () => Snapshot, cues: Cue[]) {
    this.source = source
    this.cues = cues
    this.lastT = -1
    gsap.ticker.add(this.tick)
    this.tryAutoplay()
  }

  /** Attempt to start without a gesture. Honest about the result: never assumes success. */
  private tryAutoplay() {
    if (this.unlocked || !this.prefs.music) return
    try {
      if (!this.ctx) this.build()
      this.ensureLoaded()
      const ctx = this.ctx!
      // Dev only: ?simulate-autoplay-block reproduces iPad Safari's behaviour on desktop.
      if (import.meta.env.DEV && location.search.includes('simulate-autoplay-block')) {
        ctx.suspend().catch(() => {})
        this.blocked = true
        this.emit()
        return
      }
      const settle = () => {
        if (this.unlocked) return
        if (ctx.state === 'running') {
          this.unlocked = true
          this.blocked = false
          if (this.prefs.music) this.musicStarts++
        } else this.blocked = true
        this.emit()
      }
      ctx.resume().then(settle, settle)
      // resume() can stay pending forever when blocked; decide after a beat.
      window.setTimeout(settle, 600)
    } catch { this.blocked = true; this.emit() }
  }

  /** True once, for the gesture that unlocked blocked audio: it shouldn't also toggle or tap. */
  takeUnlockTap() {
    const hit = this.unlockTapAt && performance.now() - this.unlockTapAt < 1200
    this.unlockTapAt = 0
    return !!hit
  }

  detach() {
    gsap.ticker.remove(this.tick)
    this.source = null
    this.stop(this.music); this.music = null
    this.stop(this.voice); this.voice = null
    this.setSpeaking(false)
  }

  private setSpeaking(v: boolean) {
    if (this.speaking !== v) { this.speaking = v; this.emit() }
  }

  private tick = () => {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running' || !this.source || !this.config) return
    const s = this.source()
    const visible = !document.hidden
    const wantMusic = this.prefs.music && visible

    if (s.reduced) {
      // Reduced motion: the reel doesn't play, so music is a free-running bed (no SFX, no VO).
      if (wantMusic && !this.music && this.buffers.music) this.music = this.start(this.buffers.music, this.musicBus, 0, 1.2)
      if (!wantMusic && this.music) { this.stop(this.music); this.music = null }
      if (this.voice) { this.stop(this.voice); this.voice = null }
      this.setSpeaking(false)
      return
    }

    const rolling = s.playing || s.atEnd
    this.music = this.sync(this.music, this.buffers.music, this.musicBus, wantMusic && rolling, s.t + this.config.music.offset, s.atEnd)
    this.voice = this.sync(this.voice, this.buffers.voice, this.voiceBus, this.prefs.voice && visible && rolling, s.t + this.config.voiceover.offset, s.atEnd)

    // Duck the music only while narration is actually speaking (voice track's own envelope).
    const now = ctx.currentTime
    let env = 0
    if (this.voice && this.voiceEnv) {
      const i = Math.floor((s.t + this.config.voiceover.offset + 0.2) * 20)
      env = this.voiceEnv[Math.max(0, Math.min(this.voiceEnv.length - 1, i))] ?? 0
    }
    const duckTo = 1 - (1 - this.config.voiceover.duckMusicTo) * env
    this.duck.gain.setTargetAtTime(duckTo, now, duckTo < this.duck.gain.value ? 0.18 : 0.45)
    this.setSpeaking(!!this.voice && env > 0.5)

    // Sound design belongs to the music layer; it fires only when playback passes a cue.
    if (wantMusic && s.playing && this.lastPlaying && s.t > this.lastT && s.t - this.lastT < 0.35) {
      // Effects step back when they'd sit under a spoken word.
      for (const c of this.cues) if (c.t > this.lastT && c.t <= s.t) this.fire(c, 1 - Math.min(0.6, env * (1 - this.config.voiceover.duckMusicTo) * 1.3))
    }
    this.lastT = s.t
    this.lastPlaying = s.playing
  }

  private sync(track: Track | null, buf: AudioBuffer | undefined, bus: GainNode, should: boolean, pos: number, atEnd: boolean): Track | null {
    if (!should || !buf) { this.stop(track); return null }
    if (track) {
      // At the end hold, let the tail ring out rather than chasing a frozen playhead.
      if (atEnd) return track
      const expected = track.startPos + (this.ctx!.currentTime - track.startCtx)
      if (Math.abs(expected - pos) < 0.15) return track
      this.stop(track)
    }
    if (pos < 0 || pos >= buf.duration - 0.05 || atEnd) return null
    return this.start(buf, bus, pos, pos < 0.2 ? 0.05 : 0.35)
  }

  private start(buf: AudioBuffer, bus: GainNode, pos: number, fadeIn: number): Track {
    const ctx = this.ctx!
    const node = ctx.createBufferSource()
    node.buffer = buf
    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(1, now + fadeIn)
    node.connect(gain).connect(bus)
    node.start(now + 0.01, Math.max(0, pos))
    return { node, gain, startCtx: now + 0.01, startPos: Math.max(0, pos) }
  }

  private stop(track: Track | null) {
    if (!track || !this.ctx) return
    const now = this.ctx.currentTime
    track.gain.gain.cancelScheduledValues(now)
    track.gain.gain.setTargetAtTime(0, now, 0.12)
    try { track.node.stop(now + 0.7) } catch { /* already stopped */ }
  }

  /** Dev-only introspection for automated checks. */
  debug() {
    const pos = (tr: Track | null) => (tr && this.ctx ? +(tr.startPos + this.ctx.currentTime - tr.startCtx).toFixed(2) : null)
    return {
      state: this.ctx?.state ?? 'none', unlocked: this.unlocked, blocked: this.blocked, prefs: this.prefs, speaking: this.speaking,
      loaded: { music: !!this.buffers.music, voice: !!this.buffers.voice, sfx: Object.keys(this.buffers.sfx).length },
      musicPos: pos(this.music), voicePos: pos(this.voice), duck: +this.duck?.gain.value.toFixed(2), fired: this.fired.slice(-12),
    }
  }
  private fired: string[] = []

  private fire(c: Cue, scale = 1) {
    const buf = this.buffers.sfx[c.id]
    if (import.meta.env.DEV) this.fired.push(`${c.id}@${c.t.toFixed(1)}`)
    if (!buf || !this.ctx) return
    const node = this.ctx.createBufferSource()
    node.buffer = buf
    const g = this.ctx.createGain()
    g.gain.value = (c.gain ?? 1) * scale
    node.connect(g).connect(this.sfxBus)
    node.start()
  }
}

/**
 * 20 Hz speech envelope (0–1) for ducking: quick to engage, holds through the
 * short gaps between words and phrases, then releases slowly, so the music
 * breathes back in after a sentence instead of pumping between words.
 */
function envelope(buf: AudioBuffer) {
  const d = buf.getChannelData(0)
  const step = Math.floor(buf.sampleRate / 20)
  const n = Math.ceil(d.length / step)
  const raw = new Float32Array(n)
  for (let k = 0; k < n; k++) {
    let s = 0
    for (let i = k * step; i < Math.min(d.length, (k + 1) * step); i++) s += d[i] * d[i]
    raw[k] = Math.sqrt(s / step) > 0.012 ? 1 : 0
  }
  const HOLD = 14 // 0.7 s
  const out = new Float32Array(n)
  let v = 0
  let hold = 0
  for (let k = 0; k < n; k++) {
    if (raw[k]) hold = HOLD
    const target = hold > 0 ? 1 : 0
    if (hold > 0) hold--
    v += (target - v) * (target > v ? 0.45 : 0.07)
    out[k] = v
  }
  return out
}

export const audio = new AudioEngine()
if (import.meta.env.DEV) (window as unknown as { __audio: AudioEngine }).__audio = audio
