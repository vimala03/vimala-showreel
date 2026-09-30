import { href, type Route } from '../router'
import { useOfflineStatus } from '../lib/useOfflineStatus'

const NAV: { label: string; route: Route; match: Route['name'][] }[] = [
  { label: 'Showreel', route: { name: 'intro' }, match: ['intro'] },
  { label: 'Work', route: { name: 'work' }, match: ['work', 'project'] },
  { label: 'About', route: { name: 'about' }, match: ['about'] },
  { label: 'Contact', route: { name: 'contact' }, match: ['contact'] },
]

/** Mirrors the portfolio's nav: "VB — Product Designer" left, quiet links right. */
export default function TopBar({ route }: { route: Route }) {
  return (
    <header className="topbar" data-overlay={route.name === 'intro' || undefined}>
      <a className="brand" href="#/" aria-label="Vimala Banavath, showreel">
        <span className="brand__mark">VB</span>
        <span className="brand__role">— Senior Product Designer</span>
      </a>
      <nav className="topbar__nav" aria-label="Primary">
        {NAV.map((n) => (
          <a key={n.label} href={href(n.route)} className="nav-link" aria-current={n.match.includes(route.name) ? 'page' : undefined}>
            {n.label}
          </a>
        ))}
        <OfflinePill />
      </nav>
    </header>
  )
}

function OfflinePill() {
  const { status, online } = useOfflineStatus()
  let tone: 'ok' | 'wait' | 'off' = 'wait'
  let label = 'Checking'
  let detail = ''
  if (status.kind === 'ready') {
    tone = 'ok'
    label = online ? 'Offline ready' : 'Offline'
    detail = `${status.total} files cached on this device`
  } else if (status.kind === 'caching') {
    label = status.total ? `Caching ${status.done}/${status.total}` : 'Caching'
    detail = 'Saving the showreel for offline use'
  } else if (status.kind === 'unsupported') {
    tone = 'off'
    label = online ? 'Online only' : 'No connection'
    detail = status.reason
  } else {
    tone = 'off'
    label = 'Cache error'
    detail = 'Reload while online to retry'
  }
  return (
    <span className={`status status--${tone}`} role="status" aria-live="polite" title={detail}>
      <span className="status__dot" aria-hidden="true" />
      <span className="status__label">{label}</span>
      <span className="visually-hidden">. {detail}</span>
    </span>
  )
}
