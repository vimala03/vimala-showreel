import { Split } from './Split'
import { PROFILE } from '../content/profile'
import { PROJECTS, REEL_FACTS } from '../content/projects'

export type Layout = 'land' | 'port'

const [YC, CS, FL, CV] = PROJECTS

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
  const cols = layout === 'land' ? 6 : 5
  const rows = Math.ceil(CS_CHIPS.length / cols)
  const [x0, x1, y0, y1] = layout === 'land' ? [7, 86, 20, 78] : [7, 80, 18, 70]
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

/* ── Ending ────────────────────────────────────────────────────────────── */

export function SceneEnd() {
  return (
    <section className="scene s-end" data-scene="end">
      <svg className="end-svg" aria-hidden="true"><path className="end-loop" fill="none" /></svg>
      <div className="end-frames">
        {PROJECTS.map((p) => (
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
