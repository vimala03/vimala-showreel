import { useEffect, useState } from 'react'
import { PROJECTS } from './content/projects'

/**
 * Tiny hash router. Hash URLs keep every screen a single cached document
 * (index.html), which is what makes the offline service worker trivial, and
 * they survive "Add to Home Screen" launches on iPad.
 */
export type Route =
  | { name: 'intro' }
  | { name: 'work' }
  | { name: 'project'; id: string; deep: boolean }
  | { name: 'about' }
  | { name: 'contact' }

export function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'work' && parts[1] && PROJECTS.some((p) => p.id === parts[1])) {
    return { name: 'project', id: parts[1], deep: parts[2] === 'deep' }
  }
  if (parts[0] === 'work') return { name: 'work' }
  if (parts[0] === 'about') return { name: 'about' }
  if (parts[0] === 'contact') return { name: 'contact' }
  return { name: 'intro' }
}

export function href(r: Route): string {
  switch (r.name) {
    case 'intro': return '#/'
    case 'work': return '#/work'
    case 'project': return `#/work/${r.id}${r.deep ? '/deep' : ''}`
    case 'about': return '#/about'
    case 'contact': return '#/contact'
  }
}

export function go(r: Route) {
  const next = href(r)
  if (window.location.hash !== next) window.location.hash = next
}

/** Parent screen, used by Escape and the back control. */
export function parent(r: Route): Route | null {
  switch (r.name) {
    case 'intro': return null
    default: return { name: 'intro' }
  }
}

/** A rough linear position, so transitions know which way to move. */
export function position(r: Route): number {
  switch (r.name) {
    case 'intro': return 0
    case 'work': return 10
    case 'project': return 20 + PROJECTS.findIndex((p) => p.id === r.id) * 2 + (r.deep ? 1 : 0)
    case 'about': return 40
    case 'contact': return 50
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
