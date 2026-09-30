import { PROFILE } from '../content/profile'

export default function About() {
  return (
    <section className="about" aria-labelledby="about-heading">
      <div className="about__portrait"><img src={PROFILE.portrait} alt={`Portrait of ${PROFILE.name}`} /></div>
      <div className="about__text">
        <p className="meta">{PROFILE.words.slice(0, 2).join(' · ')} · Product systems</p>
        <h1 id="about-heading" className="about__name" tabIndex={-1} data-screen-heading>{PROFILE.name}</h1>
        <p className="meta about__role">{PROFILE.title} · {PROFILE.location}</p>
        <p className="about__statement">{PROFILE.statement}</p>
        <p className="about__bio">{PROFILE.bio}</p>
        <div className="about__belief">
          <p className="meta">How I approach product design</p>
          <p className="about__belief-lead">{PROFILE.belief.lead}</p>
          <p className="about__belief-body">
            {PROFILE.belief.prefix} {PROFILE.belief.phrases[0]}, {PROFILE.belief.phrases[1]}, and {PROFILE.belief.phrases[2]}.
          </p>
        </div>
        <a className="cta" href="#/contact">Stay in touch <span aria-hidden="true">→</span></a>
      </div>
    </section>
  )
}
