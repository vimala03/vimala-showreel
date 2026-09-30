import { PROJECTS } from '../content/projects'

/** "Explore the work": an editorial index, one project per row, like the portfolio's timeline. */
export default function SelectedWork() {
  return (
    <section className="work" aria-labelledby="work-heading">
      <header className="work__head">
        <p className="meta">Selected work</p>
        <h1 id="work-heading" className="work__title" tabIndex={-1} data-screen-heading>
          Four projects, four sides of how I work.
        </h1>
      </header>
      <ol className="work__list">
        {PROJECTS.map((p) => (
          <li key={p.id}>
            <a className="row" href={`#/work/${p.id}`}>
              <span className="row__i">{p.index}</span>
              <span className="row__body">
                <span className="row__name">{p.name}</span>
                <span className="meta row__meta">{p.roleTitle} · {p.dimension}</span>
                <span className="row__thesis">{p.thesis}</span>
                <span className="row__metric"><span className="dot" aria-hidden="true" />{p.highlights[0]}</span>
              </span>
              <span className="row__media"><img src={p.cover.src} alt="" /></span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
