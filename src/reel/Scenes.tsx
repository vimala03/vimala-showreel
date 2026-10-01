import { Split } from './Split'
import { PROFILE } from '../content/profile'
import { PROJECTS, REEL_FACTS } from '../content/projects'
import { ATTENTION, CI, LAYERS, READING, STATUS_LABEL } from '../content/career'

/**
 * Stage compositions. Each is a fixed virtual canvas scaled to fit, with its own
 * positions and type sizes (see styles.css):
 *   land  1440×1000  desktop, iPad landscape
 *   port  1000×1440  iPad portrait, tablets
 *   phone  600×900   portrait phones
 *   short 1000×460   landscape phones
 */
export type Layout = 'land' | 'port' | 'phone' | 'short'

const [YC, CS, FL, CV, CR] = PROJECTS

/* ── Opening ───────────────────────────────────────────────────────────── */

export function SceneOpening() {
  return (
    <section className="scene s-open" data-scene="open">
      <div className="o-block">
        <h2 className="o-name"><Split text={PROFILE.name} /><i className="o-stop" aria-hidden="true" /></h2>
        <p className="o-title">{PROFILE.title}</p>
        <div className="o-words">
          {PROFILE.words.map((w, i) => (
            <span key={w} className="o-word-wrap">
              {i > 0 && <i className="o-sep" aria-hidden="true" />}
              <span className="o-word">{w}</span>
            </span>
          ))}
        </div>
        <p className="o-pov"><Split text={PROFILE.reelStatement} by="word" /></p>
      </div>
    </section>
  )
}

/* ── 01 YouClean ───────────────────────────────────────────────────────── */

export function SceneYouClean() {
  return (
    <section className="scene s-yc" data-scene="youclean">
      <SceneLabel index={YC.index} name={YC.shortName} dimension={YC.dimension} />

      <div className="yc-frags">
        <div className="frag frag--tag">
          <span className="frag__k">Order</span>
          <span className="frag__big">YC-1024</span>
          <span className="frag__s">5 Shirts · 2 Pants · 1 Saree</span>
        </div>
        <div className="frag frag--receipt">
          <span className="frag__k">Priya Sharma</span>
          <span className="frag__big">₹1,240</span>
          <span className="frag__s">₹800 paid · ₹440 pending</span>
        </div>
        <div className="frag frag--chat">
          <span className="frag__k">WhatsApp</span>
          <span className="frag__msg">Is my order ready?</span>
          <span className="frag__s">10:42</span>
        </div>
        <div className="frag frag--sheet">
          <span className="frag__k">Sheet · row 214</span>
          <span className="frag__row"><b>Priya</b><b>₹1,240</b><b>status: —</b></span>
        </div>
        <div className="frag frag--note">
          <span className="frag__k">Pickup</span>
          <span className="frag__msg">Order #YC1024 · 10:00 AM</span>
        </div>
        <div className="frag frag--slip">
          <span className="frag__k">Store</span>
          <span className="frag__msg">Kompally</span>
          <span className="frag__s">Ready for pickup</span>
        </div>
      </div>

      <p className="caption yc-cap-a">Paper slips. WhatsApp threads. A shared sheet.</p>
      <p className="caption yc-cap-b">One order record. Every state in view.</p>

      <div className="yc-states">
        {['New', 'In Progress', 'Ready', 'Delivered'].map((s) => (
          <span key={s} className="yc-state">{s}</span>
        ))}
      </div>

      <div className="yc-product">
        <div className="yc-dash frame"><img src="/img/youclean/dashboard.jpg" alt="" /></div>
        <div className="yc-mobile"><img src="/img/youclean/mobile.jpg" alt="" /></div>
      </div>

      <div className="yc-metric">
        <span className="meta yc-m-label">{REEL_FACTS.youcleanLabel}</span>
        <span className="yc-m-num yc-before">{REEL_FACTS.youcleanBefore}</span>
        <span className="yc-m-num yc-after">{REEL_FACTS.youcleanAfter}</span>
      </div>

      <div className="yc-own">
        <span className="yc-own-l">Designed it.</span>
        <span className="yc-own-l">Built it.</span>
        <span className="yc-own-l">Run it<i className="yc-own-stop" /></span>
        <p className="meta yc-own-cap">{YC.roleTitle} · {YC.company}</p>
      </div>
    </section>
  )
}

/* ── 02 Cornerstone ────────────────────────────────────────────────────── */

export const CS_CHIPS = [
  'Title', 'Description', 'Subjects', 'Keywords', 'Skills tagging', 'Provider',
  'Language(s)', 'Course code', 'Training duration', 'Credits', 'Owners', 'Thumbnail',
  'Chinese', 'French', 'German', 'Hungarian', 'Korean', 'Japanese', 'Portuguese', 'Spanish',
  'Core functions', 'Edge', 'Recruit', 'Onboarding', 'Connect', 'Learning',
  'Performance', 'Compensation', 'User management', 'Org units',
]

/** Deterministic jittered grid, in % of the stage. */
export function chipSlots(layout: Layout) {
  const cols = { land: 6, port: 5, phone: 3, short: 6 }[layout]
  const rows = Math.ceil(CS_CHIPS.length / cols)
  const [x0, x1, y0, y1] = {
    land: [7, 86, 20, 78],
    port: [7, 80, 18, 70],
    phone: [5, 64, 15, 88],
    short: [3, 83, 20, 84],
  }[layout]
  return CS_CHIPS.map((_, i) => {
    const c = i % cols
    const r = Math.floor(i / cols)
    const jx = (((i * 37) % 11) - 5) * 0.5
    const jy = (((i * 53) % 9) - 4) * 0.6
    return {
      left: x0 + (c / (cols - 1)) * (x1 - x0) + jx,
      top: y0 + (r / (rows - 1)) * (y1 - y0) + jy,
    }
  })
}

export function SceneCornerstone({ layout }: { layout: Layout }) {
  const slots = chipSlots(layout)
  return (
    <section className="scene s-cs" data-scene="cornerstone">
      <SceneLabel index={CS.index} name={CS.shortName} dimension={CS.dimension} />

      <div className="cs-chips">
        {CS_CHIPS.map((c, i) => (
          <span key={c} className="cs-chip" style={{ left: `${slots[i].left}%`, top: `${slots[i].top}%` }}>
            {c}
          </span>
        ))}
        <span className="cs-ripple" />
      </div>

      <div className="cs-counter">
        <span className="cs-count">00</span>
        <span className="meta">Clicks to translate 8 courses</span>
      </div>

      <div className="cs-collapse">
        <span className="cs-btn">Translate all</span>
      </div>

      <div className="cs-one">
        <span className="cs-one-n">1</span>
        <span className="meta cs-one-l">action</span>
      </div>

      <div className="cs-mins">
        <div className="cs-mins-row">
          <span className="cs-mins-a">1,700</span>
          <span className="cs-mins-arrow"><i /></span>
          <span className="cs-mins-b">1,700</span>
        </div>
        <span className="meta cs-mins-l">Admin minutes / month</span>
        <span className="cs-mins-s">−91% manual metadata effort</span>
      </div>

      <div className="cs-ai">
        <div className="cs-ai-copy">
          <p className="meta">Apollo AI</p>
          <h3 className="cs-ai-h">AI drafts.<br />The author decides.</h3>
        </div>
        <div className="cs-panel">
          <div className="cs-panel__head"><span className="cs-spark">✦</span> Apollo AI</div>
          {[
            ['Title', 'Leadership within product management'],
            ['Description', 'This course empowers participants with the core skills and insights needed to excel as effective leaders.'],
            ['Subjects', 'Strategic thinking · Growth · Leadership'],
            ['Keywords', 'Management proficiency · Guidance'],
            ['Skills', 'Leadership · Management · Product direction'],
          ].map(([k, v]) => (
            <div key={k} className="cs-field">
              <div className="cs-field__top">
                <span className="cs-field__k">{k}</span>
                <span className="cs-field__added">✓ Added</span>
              </div>
              <div className="cs-field__v">
                <span className="cs-field__shimmer" />
                <span className="cs-field__text">{v}</span>
              </div>
            </div>
          ))}
          <p className="cs-panel__foot">Apollo AI can make mistakes. Check for accuracy.</p>
        </div>
      </div>
    </section>
  )
}

/* ── 03 Flyin ──────────────────────────────────────────────────────────── */

export function SceneFlyin() {
  return (
    <section className="scene s-fl" data-scene="flyin">
      <SceneLabel index={FL.index} name={FL.shortName} dimension={FL.dimension} />
      <svg className="fl-svg" aria-hidden="true">
        <path className="fl-arc" fill="none" />
      </svg>
      <span className="meta fl-city fl-city--a">Riyadh</span>
      <span className="meta fl-city fl-city--b">Dubai</span>
      <div className="fl-search">
        <span className="fl-search__k">Flights</span>
        <span className="fl-search__t"><Split text="Riyadh → Dubai" /></span>
        <span className="fl-search__caret" />
      </div>
      <div className="fl-frames">
        <div className="fl-hotel frame"><img src="/img/flyin/hotel.jpg" alt="" /></div>
        <div className="fl-desk frame"><img src="/img/flyin/desktop.jpg" alt="" /></div>
        <div className="fl-mob"><img src="/img/flyin/mobile.jpg" alt="" /></div>
      </div>
      <p className="fl-statement"><Split text="Making every interaction feel effortless." by="word" /></p>
    </section>
  )
}

/* ── 04 Menopause Care ─────────────────────────────────────────────────── */

export function SceneCivtech() {
  return (
    <section className="scene s-cv" data-scene="civtech">
      <div className="cv-tint" />
      <SceneLabel index={CV.index} name={CV.shortName} dimension={CV.dimension} />
      <div className="cv-map"><img src="/img/civtech/journey-map.jpg" alt="" /></div>
      <div className="cv-words">
        <span>Awareness</span><span>Waiting</span><span>Follow-up</span>
      </div>
      <div className="cv-photo"><img src="/img/civtech/cover.jpg" alt="" /></div>
      <div className="cv-finalist">
        <span className="cv-f">Finalist</span>
        <span className="meta">CivTech Scotland · {CV.roleTitle}</span>
      </div>
      <p className="cv-line"><Split text="Designing for a life stage that’s often overlooked." by="word" /></p>
    </section>
  )
}

/* ── 05 Career Intelligence ────────────────────────────────────────────── */

/** Every surface, flattened in layer order (positions are set per layout in the timeline). */
export const CI_SURFACES = LAYERS.flatMap((l, li) => l.surfaces.map((sf) => ({ ...sf, layer: li })))

export function SceneCareer() {
  return (
    <section className="scene s-ci" data-scene="career">
      <SceneLabel index={CR.index} name={CR.shortName} dimension={CR.dimension} />
      <svg className="ci-svg" aria-hidden="true">
        {CI.fragments.slice(0, 6).map((f) => <path key={f} className="ci-frag-link" fill="none" />)}
        {READING.excerpts.map((e) => <path key={e.source} className="ci-conv" fill="none" />)}
        <path className="ci-gapline" fill="none" />
      </svg>

      {/* The question */}
      <div className="ci-q">
        <p className="ci-q-t"><Split text={CI.question} by="word" /></p>
        <p className="meta ci-q-n">{CI.name}</p>
      </div>

      {/* Fragmentation */}
      <div className="ci-frags">
        {CI.fragments.map((f) => <span key={f} className="ci-frag">{f}</span>)}
      </div>
      <div className="ci-caps">
        <p className="ci-cap-a">{CI.everywhere}</p>
        <p className="ci-cap-b">{CI.isnt}</p>
      </div>

      {/* The model */}
      <div className="ci-model">
        {CI.model.map((m, i) => (
          <span key={m} className="ci-model-step">
            {i > 0 && <i className="ci-model-arrow" aria-hidden="true" />}
            <span className="ci-model-n">{m}</span>
          </span>
        ))}
      </div>
      <div className="ci-doc">
        <p className="ci-doc-a">{CI.documents}</p>
        <p className="ci-doc-b">{CI.living}</p>
      </div>

      {/* The ecosystem: six layers, every surface */}
      <div className="ci-eco">
        <svg className="ci-eco-svg" aria-hidden="true">
          {LAYERS.map((l) => <path key={l.name} className="ci-spoke" fill="none" />)}
          {CI_SURFACES.map((sf) => <path key={sf.name} className="ci-twig" fill="none" data-status={sf.status} />)}
        </svg>
        <div className="ci-core">
          <span className="ci-core-v ci-core-v--layers"><b>6</b><span>intelligence layers</span></span>
          <span className="ci-core-v ci-core-v--surfaces"><b>30+</b><span>product surfaces explored</span></span>
        </div>
        {LAYERS.map((l, i) => (
          <span key={l.name} className="ci-hub">
            <i className="ci-hub-dot" />
            <span className="ci-hub-l"><span className="ci-hub-i">0{i + 1}</span>{l.name}</span>
          </span>
        ))}
        {CI_SURFACES.map((sf) => (
          <span key={sf.name} className="ci-node" data-status={sf.status} data-name={sf.name}>
            <i className="ci-node-dot" />
            <span className="ci-node-l">{sf.name}</span>
          </span>
        ))}
      </div>
      <p className="ci-legend">
        {(['built', 'explored', 'future'] as const).map((st) => (
          <span key={st} className="ci-legend-i" data-status={st}><i />{STATUS_LABEL[st]}</span>
        ))}
      </p>
      <p className="ci-begin">{CI.beginning}</p>

      {/* The first experiment */}
      <div className="ci-first">
        <p className="ci-first-t">{CI.first}</p>
        <div className="ci-shot ci-shot--hero frame"><img src="/img/career/hero.jpg" alt="" /></div>
      </div>

      {/* Claim → evidence → signal / gap → next move */}
      <div className="ci-read">
        <div className="ci-row ci-row--a">
          <div className="ci-claim"><span className="ci-k">The portfolio says</span><p className="ci-claim-t">“{READING.claim}”</p></div>
          <div className="ci-exs">
            {READING.excerpts.map((e) => (
              <div key={e.source} className="ci-ex"><p>“{e.text}”</p><span className="ci-src">{e.source}</span></div>
            ))}
          </div>
          <div className="ci-out ci-out--signal">
            <i className="ci-knot" />
            <span className="ci-k">The signal</span>
            <p className="ci-out-t">{READING.signal}</p>
            <span className="ci-out-n">{READING.signalNote}</span>
          </div>
        </div>
        <div className="ci-row ci-row--b">
          <div className="ci-claim"><span className="ci-k">It also says</span><p className="ci-claim-t">“{READING.claim2}”</p></div>
          <div className="ci-exs">
            <div className="ci-ex"><p>“{READING.excerpt2.text}”</p><span className="ci-src">{READING.excerpt2.source}</span></div>
          </div>
          <div className="ci-out ci-out--gap">
            <i className="ci-knot" />
            <span className="ci-k">The gap</span>
            <p className="ci-out-t">{READING.gap}</p>
            <span className="ci-out-n">{READING.gapNote}</span>
          </div>
        </div>
        <div className="ci-next"><span className="ci-k">The next move</span><p>{READING.next}</p></div>
      </div>
      <div className="ci-proof">
        <div className="ci-shot ci-shot--read frame"><img src="/img/career/reading.jpg" alt="" /></div>
        <p className="meta ci-proof-l">Working prototype · sample reading</p>
      </div>

      {/* Attention Intelligence */}
      <div className="ci-att">
        <span className="ci-sample">{ATTENTION.sample}</span>
        <div className="ci-visits">
          <span className="ci-k">{ATTENTION.period}</span>
          <p className="ci-visits-n"><b>{ATTENTION.visits}</b> visits</p>
        </div>
        <div className="ci-bars">
          {ATTENTION.opened.map((o) => (
            <div key={o.name} className="ci-bar">
              <p className="ci-bar-t"><b>{o.n}</b> opened <b>{o.name}</b></p>
              <span className="ci-bar-track"><i style={{ width: `${(o.n / ATTENTION.visits) * 100}%` }} /></span>
              <span className="ci-bar-n">{o.note}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ci-obs">
        <p className="ci-obs-a">{ATTENTION.observe}</p>
        <p className="ci-obs-b">{ATTENTION.intent}</p>
        <div className="ci-cols">
          {[ATTENTION.observed, ATTENTION.interpreted, ATTENTION.never].map((c, i) => (
            <div key={c.k} className={`ci-col ci-col--${i}`}>
              <span className="ci-col-k"><i />{c.k}</span>
              <p className="ci-col-v">{i === 2 ? <span className="ci-strike">{c.v}</span> : c.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2030 */}
      <div className="ci-2030">
        <span className="meta ci-2030-l">{CI.thesisLabel}</span>
        <span className="ci-year">2030</span>
        <p className="ci-2030-a">{CI.thesisA}</p>
        <p className="ci-2030-b">{CI.thesisB}</p>
        <p className="ci-2030-c">{CI.thesisC}</p>
      </div>

      {/* Close */}
      <div className="ci-close">
        <h3 className="ci-close-n"><Split text={CI.name} /></h3>
        <p className="ci-close-l">{CI.close}</p>
      </div>
    </section>
  )
}

/* ── Ending ────────────────────────────────────────────────────────────── */

export function SceneEnd() {
  return (
    <section className="scene s-end" data-scene="end">
      <svg className="end-svg" aria-hidden="true"><path className="end-loop" fill="none" /></svg>
      <div className="end-frames">
        {PROJECTS.slice(0, 4).map((p) => (
          <div key={p.id} className={`end-frame end-frame--${p.id}`}>
            <div className="end-frame__img"><img src={p.cover.src} alt="" /></div>
            <span className="meta end-frame__n">{p.index} {p.shortName}</span>
          </div>
        ))}
      </div>
      <div className="end-thought">
        <p className="end-t1"><Split text={PROFILE.belief.lead} by="word" /></p>
        <p className="end-t2">
          {PROFILE.belief.prefix}{' '}
          {PROFILE.belief.phrases.map((ph, i) => (
            <span key={ph}>
              <span className="end-ph">{ph}</span>
              {i < PROFILE.belief.phrases.length - 1 ? (i === PROFILE.belief.phrases.length - 2 ? ', and ' : ', ') : '.'}
            </span>
          ))}
        </p>
      </div>
      <div className="end-sign">
        <h2 className="end-name"><Split text={PROFILE.name} /><i className="end-stop" aria-hidden="true" /></h2>
        <p className="end-title">{PROFILE.title}</p>
        <a className="end-cta" href="#/work" data-cta>Explore the work <span aria-hidden="true">→</span></a>
      </div>
    </section>
  )
}

function SceneLabel({ index, name, dimension }: { index: string; name: string; dimension: string }) {
  return (
    <p className="scene-label">
      <span className="scene-label__i">{index}</span>
      <span className="scene-label__n">{name}</span>
      <span className="scene-label__d">{dimension}</span>
    </p>
  )
}
