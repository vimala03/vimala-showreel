import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { gsap } from 'gsap'
import { SceneCareer, SceneCivtech, SceneCornerstone, SceneEnd, SceneFlyin, SceneOpening, SceneYouClean, type Layout } from './Scenes'
import { buildReel, STAGE, type Chapter, type ChapterId } from './timeline'
import { PROJECTS } from '../content/projects'
import { openWithTransition } from '../lib/transition'
import { audio } from '../audio/engine'
import AudioControl from '../audio/AudioControl'

/** Survives navigation to an overview and back, so the reel resumes where it paused. */
export const reelMemory = { time: 0, wasPlaying: true, visited: false }

/** Choose a composition from the viewport's shape (not a scaled-down desktop). */
function pickLayout(w: number, h: number): Layout {
  if (h > w * 1.05) return w < 700 ? 'phone' : 'port'
  return h < 560 ? 'short' : 'land'
}
const PROJECT_OF: Partial<Record<ChapterId, string>> = {
  youclean: 'youclean', cornerstone: 'cornerstone', flyin: 'flyin', civtech: 'civtech', career: 'career',
}
const LABEL: Record<ChapterId, string> = {
  open: 'Intro', youclean: 'YouClean', cornerstone: 'Cornerstone', flyin: 'Flyin', civtech: 'Menopause Care', career: 'Career Intelligence', end: 'Close',
}
/** The element that morphs into the overview hero when a scene is opened. */
const HERO_OF: Record<string, string> = {
  youclean: '.yc-dash', cornerstone: '.cs-panel', flyin: '.fl-desk', civtech: '.cv-photo', career: '.ci-shot--hero',
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Rail width per chapter: by duration, but short chapters stay legible and long ones don't dominate. */
const railWeight = (c: Chapter) => Math.min(24, Math.max(10, c.end - c.start))

/**
 * Two viewports, deliberately kept apart:
 *  - `w`/`h`: the area visible right now (the visual viewport). Mobile browser
 *    toolbars grow and shrink it; it only ever rescales the stage.
 *  - `cw`/`ch`: what the composition is chosen from. On touch devices spanning the
 *    screen this is the device screen in the current orientation, so Safari or Chrome
 *    with their toolbars showing picks the same composition as the installed app, and
 *    a toolbar collapsing never rebuilds the reel mid-scene.
 */
function readViewport() {
  const vv = window.visualViewport
  const zoomed = vv ? Math.abs(vv.scale - 1) > 0.01 : false
  const w = window.innerWidth
  const h = Math.round(vv && !zoomed ? vv.height : window.innerHeight)
  let ch = h
  if (window.matchMedia('(pointer: coarse)').matches && window.screen) {
    const short = Math.min(screen.width, screen.height)
    const long = Math.max(screen.width, screen.height)
    const [sw, sh] = h > w ? [short, long] : [long, short]
    // Only when the page spans the screen (not iPad split view or Stage Manager).
    if (sw > 0 && Math.abs(w - sw) <= 2 && sh >= h) ch = sh
  }
  return { w, h, cw: w, ch }
}

function useViewport() {
  const [vp, setVp] = useState(readViewport)
  useEffect(() => {
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const n = readViewport()
        setVp((p) => (p.w === n.w && p.h === n.h && p.cw === n.cw && p.ch === n.ch ? p : n))
      })
    }
    const vv = window.visualViewport
    const coarse = window.matchMedia('(pointer: coarse)')
    window.addEventListener('resize', on)
    window.addEventListener('orientationchange', on)
    vv?.addEventListener('resize', on)
    coarse.addEventListener('change', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', on)
      window.removeEventListener('orientationchange', on)
      vv?.removeEventListener('resize', on)
      coarse.removeEventListener('change', on)
    }
  }, [])
  return vp
}

export default function Reel() {
  const vp = useViewport()
  const layout = pickLayout(vp.cw, vp.ch)
  // Shorter phones (iPhone SE-class, 320×568) get a compact 600×740 phone composition.
  const compact = layout === 'phone' && vp.ch / vp.cw < 1.95
  const [W, H]: [number, number] = compact ? [600, 740] : STAGE[layout]

  // The stage fills exactly the space between the real top bar and the real rail
  // (both include safe-area insets), measured rather than assumed.
  const railRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ top: 64, bottom: 104, w: vp.w, h: vp.h - 168 })
  useLayoutEffect(() => {
    const measure = () => {
      const bar = document.querySelector('.topbar')
      const top = bar ? Math.round(bar.getBoundingClientRect().bottom) : 64
      const bottom = railRef.current?.offsetHeight ?? 104
      const v = viewportRef.current
      // Height from the chrome itself (the viewport element may not have re-laid out yet).
      setFrame({ top, bottom, w: v?.clientWidth ?? vp.w, h: Math.max(0, vp.h - top - bottom) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    const bar = document.querySelector('.topbar')
    if (bar) ro.observe(bar)
    if (railRef.current) ro.observe(railRef.current)
    if (viewportRef.current) ro.observe(viewportRef.current)
    return () => ro.disconnect()
  }, [vp.w, vp.h, layout])
  const scale = Math.max(0.1, Math.min(frame.w / W, frame.h / H))

  const stageRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([])
  const loopCall = useRef<gsap.core.Tween | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [duration, setDuration] = useState(1)
  const [current, setCurrent] = useState<ChapterId>('open')
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const rm = reducedMotion()

  const chapterAt = useCallback((t: number, list: Chapter[]) => {
    for (let i = list.length - 1; i >= 0; i--) if (t >= list[i].start - 0.001) return list[i]
    return list[0]
  }, [])

  // Build (and rebuild on orientation change) the master timeline.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let cancelled = false
    let ctx: gsap.Context | null = null

    document.fonts.ready.then(() => {
      if (cancelled) return
      ctx = gsap.context(() => {
        const { tl, chapters: ch, cues, marks, duration: d } = buildReel(stage, layout, [W, H])
        tlRef.current = tl
        // Dev only: lets frame-by-frame review seek the timeline from the console.
        if (import.meta.env.DEV) (window as unknown as { __reel: unknown }).__reel = { tl, chapters: ch, cues, marks }
        setChapters(ch)
        setDuration(d)

        let last: ChapterId | null = null
        tl.eventCallback('onUpdate', () => {
          const t = tl.time()
          ch.forEach((c, i) => {
            const el = fillRefs.current[i]
            if (el) el.style.transform = `scaleX(${Math.min(1, Math.max(0, (t - c.start) / (c.end - c.start)))})`
          })
          const cur = chapterAt(t, ch).id
          if (cur !== last) { last = cur; setCurrent(cur) }
          reelMemory.time = t
        })
        // Audio follows the reel; the reel never waits for audio.
        audio.attach(() => ({ t: tl.time(), playing: !tl.paused() && tl.progress() < 1, atEnd: tl.progress() >= 1 && !tl.paused(), reduced: rm }), cues)
        tl.eventCallback('onComplete', () => {
          // Networking mode: hold the final frame, then loop.
          loopCall.current = gsap.delayedCall(5, () => { tl.restart(); setPlaying(true) })
        })

        const startAt = reelMemory.visited ? reelMemory.time : 0
        if (rm) {
          const c = chapterAt(startAt, ch)
          tl.seek(c.key, false)
          setPlaying(false)
        } else {
          tl.seek(startAt, false)
          if (reelMemory.wasPlaying) { tl.play(); setPlaying(true) }
        }
        reelMemory.visited = true
        setReady(true)
      }, stage)
    })

    return () => {
      cancelled = true
      // Keep the position before reverting: revert re-renders the old timeline.
      const old = tlRef.current
      if (old) { reelMemory.time = old.time(); old.eventCallback('onUpdate', null) }
      audio.detach()
      loopCall.current?.kill()
      ctx?.revert()
      tlRef.current = null
    }
  }, [layout, compact, rm, chapterAt])

  const play = useCallback(() => {
    const tl = tlRef.current
    if (!tl || rm) return
    loopCall.current?.kill()
    if (tl.progress() >= 1) tl.restart()
    else tl.play()
    setPlaying(true)
    reelMemory.wasPlaying = true
  }, [rm])

  const pause = useCallback(() => {
    tlRef.current?.pause()
    loopCall.current?.kill()
    setPlaying(false)
    reelMemory.wasPlaying = false
  }, [])

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play])

  /** Jump to a chapter: its start when playing, its key frame when reduced motion. */
  const goChapter = useCallback((i: number) => {
    const tl = tlRef.current
    const c = chapters[i]
    if (!tl || !c) return
    loopCall.current?.kill()
    if (rm) {
      const stage = stageRef.current!
      gsap.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 0.35 })
      tl.seek(c.key, false)
    } else {
      tl.seek(c.start + 0.001, false)
      tl.play()
      setPlaying(true)
      reelMemory.wasPlaying = true
    }
  }, [chapters, rm])

  /** Reduced motion: show one settled frame of a long chapter. */
  const seekFrame = useCallback((t: number) => {
    const tl = tlRef.current
    if (!tl) return
    gsap.fromTo(stageRef.current!, { opacity: 0 }, { opacity: 1, duration: 0.35 })
    tl.seek(t, false)
  }, [])

  const step = useCallback((dir: 1 | -1) => {
    const i = chapters.findIndex((c) => c.id === current)
    // Reduced motion walks through a long chapter's frames before leaving it.
    const frames = rm ? chapters[i]?.steps : undefined
    if (frames && tlRef.current) {
      const t = tlRef.current.time()
      const next = dir > 0 ? frames.find((f) => f > t + 0.01) : [...frames].reverse().find((f) => f < t - 0.01)
      if (next !== undefined) { seekFrame(next); return }
    }
    const j = Math.min(chapters.length - 1, Math.max(0, i + dir))
    if (j === i) return
    const into = rm ? chapters[j].steps : undefined
    if (into) seekFrame(dir > 0 ? into[0] : into[into.length - 1])
    else goChapter(j)
  }, [chapters, current, goChapter, rm, seekFrame])

  /** Pause and morph the current scene into the project's overview. */
  const openProject = useCallback((id: string) => {
    const tl = tlRef.current
    if (tl) {
      reelMemory.wasPlaying = playing
      reelMemory.time = tl.time()
      tl.pause()
    }
    loopCall.current?.kill()
    const hero = stageRef.current?.querySelector<HTMLElement>(HERO_OF[id])
    const visible = hero && Number(getComputedStyle(hero).opacity) > 0.3 && getComputedStyle(hero).visibility !== 'hidden'
    openWithTransition(`#/work/${id}`, visible ? hero : null)
  }, [playing])

  // Keyboard: Space play/pause · ←/→ scenes · Enter opens the current project.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, dialog')) return
      if (e.key === ' ' && !t.closest('button, a')) { e.preventDefault(); rm ? step(1) : toggle() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
      else if (e.key === 'Enter' && !t.closest('button, a') && PROJECT_OF[current]) openProject(PROJECT_OF[current]!)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, step, current, openProject, rm])

  // Pause when the tab/app is hidden; resume when it returns.
  useEffect(() => {
    const on = () => {
      if (document.hidden) tlRef.current?.pause()
      else if (reelMemory.wasPlaying && !rm) tlRef.current?.play()
    }
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [rm])

  // Stage gestures: tap opens the project on screen (or toggles play); swipe changes scene.
  const gesture = useRef<{ x: number; y: number; t: number; id: number } | null>(null)
  const onStageDown = (e: RPointerEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    gesture.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId }
  }
  const onStageUp = (e: RPointerEvent) => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.id !== e.pointerId) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && e.timeStamp - g.t < 800) {
      step(dx < 0 ? 1 : -1)
    } else if (Math.hypot(dx, dy) < 10) {
      // The tap that unlocked audio shouldn't also pause the reel or open a project.
      if (audio.takeUnlockTap()) return
      // People tap what they saw a beat ago: near a boundary, open the scene that just left.
      const t = tlRef.current?.time() ?? 0
      const seen = chapters.length ? chapterAt(Math.max(0, t - 0.5), chapters).id : current
      const pid = PROJECT_OF[seen] ?? PROJECT_OF[current]
      if (pid) openProject(pid)
      else if (rm) step(1)
      else toggle()
    }
  }

  // Rail scrubbing (drag along the progress track).
  const trackRef = useRef<HTMLDivElement>(null)
  const scrub = useRef<{ resume: boolean } | null>(null)
  const seekFromX = (clientX: number) => {
    const tl = tlRef.current
    const r = trackRef.current?.getBoundingClientRect()
    if (!tl || !r) return
    // Through the same weights the rail is drawn with, so the fill follows the finger.
    let acc = Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * chapters.reduce((n, c) => n + railWeight(c), 0)
    for (const c of chapters) {
      const w = railWeight(c)
      if (acc <= w || c === chapters[chapters.length - 1]) { tl.seek(c.start + Math.min(1, acc / w) * (c.end - c.start), false); return }
      acc -= w
    }
  }
  const onTrackDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (rm) return
    e.currentTarget.setPointerCapture(e.pointerId)
    scrub.current = { resume: playing }
    loopCall.current?.kill()
    tlRef.current?.pause()
    seekFromX(e.clientX)
  }
  const onTrackMove = (e: RPointerEvent<HTMLDivElement>) => { if (scrub.current) seekFromX(e.clientX) }
  const onTrackUp = () => {
    if (!scrub.current) return
    if (scrub.current.resume) play()
    else setPlaying(false)
    scrub.current = null
  }

  // On compact rails the chapter list scrolls horizontally; keep the active chapter in view.
  const chaptersRef = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const ol = chaptersRef.current
    if (!ol || ol.scrollWidth <= ol.clientWidth + 1) return
    const li = ol.querySelector<HTMLElement>('[aria-current="step"]')?.closest('li')
    if (!li) return
    const left = li.offsetLeft - (ol.clientWidth - li.offsetWidth) / 2
    ol.scrollTo({ left: Math.max(0, left), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [current, layout])

  const currentProject = PROJECT_OF[current] ? PROJECTS.find((p) => p.id === PROJECT_OF[current]) : undefined

  return (
    <div className="reel" data-layout={layout} data-ready={ready || undefined} style={{ height: vp.h }}>
      <h1 className="visually-hidden">Vimala Banavath: showreel of selected work</h1>
      <p className="visually-hidden">
        An animated reel of five projects: YouClean, Cornerstone, Flyin, Menopause Care and Career Intelligence. Use the
        chapter controls below to open any project, or pause the reel.
      </p>

      <div
        ref={viewportRef}
        className="reel__viewport"
        style={{ top: frame.top, bottom: frame.bottom }}
        onPointerDown={onStageDown}
        onPointerUp={onStageUp}
        onPointerCancel={() => { gesture.current = null }}
      >
        <div
          ref={stageRef}
          className="stage"
          data-layout={layout}
          data-compact={compact || undefined}
          aria-hidden="true"
          style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <SceneOpening />
          <SceneYouClean />
          <SceneCornerstone layout={layout} />
          <SceneFlyin />
          <SceneCivtech />
          <SceneCareer />
          <SceneEnd />
          <span className="sig" />
        </div>
      </div>

      <div className="rail" ref={railRef}>
        {rm ? (
          <button type="button" className="rail__play" onClick={() => step(1)} aria-label="Next scene">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button type="button" className="rail__play" onClick={toggle} aria-label={playing ? 'Pause showreel' : 'Resume showreel'} aria-pressed={playing}>
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 7 5.5z" /></svg>
            )}
          </button>
        )}

        <AudioControl />

        <div className="rail__body">
          <div
            ref={trackRef}
            className="rail__track"
            onPointerDown={onTrackDown}
            onPointerMove={onTrackMove}
            onPointerUp={onTrackUp}
            onPointerCancel={onTrackUp}
            role="slider"
            aria-label="Showreel position"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(reelMemory.time)}
            aria-valuetext={`${LABEL[current]}`}
            tabIndex={-1}
          >
            {chapters.map((c, i) => (
              <span key={c.id} className="rail__seg" style={{ flexGrow: railWeight(c) }}>
                <span className="rail__fill" ref={(el) => { fillRefs.current[i] = el }} />
              </span>
            ))}
          </div>
          <ol className="rail__chapters" ref={chaptersRef}>
            {chapters.map((c, i) => {
              const pid = PROJECT_OF[c.id]
              const p = pid ? PROJECTS.find((x) => x.id === pid) : undefined
              return (
                <li key={c.id} style={{ flexGrow: railWeight(c) }} className={p ? 'is-project' : 'is-bookend'}>
                  <button
                    type="button"
                    className="rail__chapter"
                    aria-current={c.id === current ? 'step' : undefined}
                    onClick={() => (p ? openProject(p.id) : goChapter(i))}
                    aria-label={p ? `Open ${p.shortName} overview` : `Go to ${LABEL[c.id]}`}
                  >
                    {p && <span className="rail__i">{p.index}</span>}
                    <span className="rail__n">{LABEL[c.id]}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
        {currentProject ? (
          <button type="button" className="reel__open" onClick={() => openProject(currentProject.id)} key={currentProject.id} aria-label={`Open ${currentProject.shortName} overview`}>
            <span className="reel__open-i">{currentProject.index}</span>
            <span className="reel__open-n">Open<span className="reel__open-name"> {currentProject.shortName}</span></span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
          </button>
        ) : (
          <span className="reel__open reel__open--idle" aria-hidden="true">Open</span>
        )}
      </div>
    </div>
  )
}
