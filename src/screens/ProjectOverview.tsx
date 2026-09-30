import { useRef, useState } from 'react'
import { PROJECTS, caseStudyUrl, projectById, type Screen } from '../content/projects'
import { go } from '../router'
import { useSwipe } from '../lib/useSwipe'
import { navigateSoft } from '../lib/transition'
import { useOnline } from '../lib/useOnline'
import Lightbox from '../components/Lightbox'

const SECTIONS = [
  ['overview', 'Overview'],
  ['decision', 'Key decision'],
  ['impact', 'Impact'],
  ['screens', 'Screens'],
  ['case-study', 'Case study'],
] as const

/**
 * The project, told in the order a conversation goes:
 * Overview → Key decision → Impact → Selected screens → Full case study.
 * Concise on purpose; the full story lives on the live portfolio.
 */
export default function ProjectOverview({ id }: { id: string }) {
  const p = projectById(id)!
  const i = PROJECTS.indexOf(p)
  const prev = PROJECTS[i - 1]
  const next = PROJECTS[i + 1]
  const [d, setD] = useState(0)
  const [zoom, setZoom] = useState<{ list: Screen[]; start: number } | null>(null)
  const online = useOnline()
  const rootRef = useRef<HTMLElement>(null)

  const swipe = useSwipe((dir) => {
    const j = dir === 'left' ? i + 1 : i - 1
    if (j >= 0 && j < PROJECTS.length) go({ name: 'project', id: PROJECTS[j].id, deep: false })
  })

  const jump = (sid: string) => {
    const el = rootRef.current?.querySelector(`#${sid}`)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  const decision = p.decisions[d]

  return (
    <article ref={rootRef} className="ov" aria-labelledby="ov-title" data-project={p.id}>
      <div className="ov__bar">
        <button type="button" className="pill" onClick={() => navigateSoft('#/')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          Showreel
        </button>
        <nav className="ov__sections" aria-label="Sections">
          {SECTIONS.map(([sid, label]) => (
            <button key={sid} type="button" className="ov__section-btn" onClick={() => jump(sid)}>{label}</button>
          ))}
        </nav>
        <span className="meta ov__count" aria-hidden="true">{p.index} / 0{PROJECTS.length}</span>
      </div>

      {/* Overview */}
      <section id="overview" className="ov__hero" {...swipe}>
        <div className="ov__hero-text">
          <p className="meta">{p.company} · {p.category}</p>
          <h1 id="ov-title" className="ov__title" tabIndex={-1} data-screen-heading>{p.name}</h1>
          <p className="meta ov__role">{p.roleTitle} · {p.period}</p>
          <p className="ov__lede">{p.lede}</p>
          <p className="meta ov__dimension"><span className="dot" aria-hidden="true" /> {p.dimension}</p>
        </div>
        <button type="button" className="ov__hero-media" onClick={() => setZoom({ list: [p.cover], start: 0 })} aria-label={`Enlarge: ${p.cover.alt}`}>
          <img src={p.cover.src} alt={p.cover.alt} style={{ viewTransitionName: 'vt-hero' }} />
        </button>
      </section>

      {/* Key decision */}
      <section id="decision" className="ov__block">
        <div className="ov__block-head">
          <h2 className="meta">Key decision</h2>
          <div className="seg" role="group" aria-label="Choose a decision">
            {p.decisions.map((_, k) => (
              <button key={k} type="button" className="seg__opt" aria-pressed={k === d} onClick={() => setD(k)}>
                0{k + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="ov__decision" key={d}>
          <div className="ov__decision-text">
            <h3 className="ov__decision-h">{decision.heading}</h3>
            <p className="meta">Decision</p>
            <p className="ov__p">{decision.decision}</p>
            <p className="meta">Why</p>
            <p className="ov__p ov__p--muted">{decision.why}</p>
          </div>
          {decision.image ? (
            <figure className="ov__decision-fig">
              <button
                type="button"
                className={`frame-btn${decision.image.panel ? ' frame-btn--panel' : ''}`}
                onClick={() => setZoom({ list: [decision.image!], start: 0 })}
                aria-label={`Enlarge: ${decision.image.alt}`}
              >
                <img src={decision.image.src} alt={decision.image.alt} loading="lazy" />
              </button>
              <figcaption>{decision.image.caption}</figcaption>
            </figure>
          ) : (
            <div className="ov__decision-empty"><span className="meta">No product UI for this decision</span></div>
          )}
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="ov__block">
        <div className="ov__block-head"><h2 className="meta">Impact</h2></div>
        <ul className="impact">
          {p.highlights.map((h) => (
            <li key={h} className="impact__item">{h}</li>
          ))}
        </ul>
      </section>

      {/* Selected screens */}
      <section id="screens" className="ov__block">
        <div className="ov__block-head"><h2 className="meta">Selected screens</h2></div>
        <ul className="strip" data-no-swipe data-own-arrows>
          {p.screens.map((s, k) => (
            <li key={s.src} className="strip__item">
              <button type="button" className={`frame-btn${s.panel ? ' frame-btn--panel' : ''}`} onClick={() => setZoom({ list: p.screens, start: k })} aria-label={`Enlarge: ${s.caption}`}>
                <img src={s.src} alt={s.alt} loading="lazy" />
              </button>
              <p className="strip__cap">{s.caption}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Full case study */}
      <section id="case-study" className="ov__block ov__cta-block">
        <p className="ov__thesis">{p.thesis}</p>
        {online ? (
          <a className="cta" href={caseStudyUrl(p)} target="_blank" rel="noopener">
            Explore full case study
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
            <span className="visually-hidden">(opens the live portfolio in a new tab)</span>
          </a>
        ) : (
          <span className="cta cta--off" aria-disabled="true">Full case study needs a connection</span>
        )}
        <p className="meta ov__url">{caseStudyUrl(p).replace('https://', '')}</p>

        <nav className="ov__pager" aria-label="Projects">
          {prev ? <a className="pill" href={`#/work/${prev.id}`}>← {prev.shortName}</a> : <span />}
          {next ? <a className="pill" href={`#/work/${next.id}`}>{next.shortName} →</a> : <a className="pill" href="#/contact">Contact →</a>}
        </nav>
      </section>

      {zoom && <Lightbox screens={zoom.list} start={zoom.start} onClose={() => setZoom(null)} />}
    </article>
  )
}
