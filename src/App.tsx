import { useEffect, useRef, useState } from 'react'
import { go, parent, position, useRoute, type Route } from './router'
import { PROJECTS } from './content/projects'
import TopBar from './components/TopBar'
import Reel from './reel/Reel'
import SelectedWork from './screens/SelectedWork'
import ProjectOverview from './screens/ProjectOverview'
import About from './screens/About'
import Contact from './screens/Contact'
import { useWakeLock } from './lib/useWakeLock'
import { navigateSoft } from './lib/transition'

type Direction = 'forward' | 'back' | 'up'

function screenKey(r: Route) {
  return r.name === 'project' ? `project-${r.id}` : r.name
}

export default function App() {
  const route = useRoute()
  const mainRef = useRef<HTMLElement>(null)
  const isReel = route.name === 'intro'

  // Direction is derived during render so a new screen mounts with the right entrance.
  const [prevRoute, setPrevRoute] = useState<Route>(route)
  const [direction, setDirection] = useState<Direction>('up')
  if (route !== prevRoute) {
    const from = position(prevRoute)
    const to = position(route)
    setPrevRoute(route)
    setDirection(to > from ? 'forward' : to < from ? 'back' : 'up')
  }

  useWakeLock()

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
    mainRef.current?.querySelector<HTMLElement>('[data-screen-heading]')?.focus({ preventScroll: true })
  }, [route])

  // Global keys. The reel handles its own (Space, ←/→, Enter).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, [contenteditable], dialog')) return
      if (e.key === 'Escape') {
        const up = parent(route)
        if (up) { e.preventDefault(); up.name === 'intro' ? navigateSoft('#/') : go(up) }
        return
      }
      const n = Number(e.key)
      if (n >= 1 && n <= PROJECTS.length) { go({ name: 'project', id: PROJECTS[n - 1].id, deep: false }); return }
      if (route.name === 'project' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !t.closest('[data-own-arrows]')) {
        const i = PROJECTS.findIndex((p) => p.id === route.id)
        const j = e.key === 'ArrowRight' ? i + 1 : i - 1
        if (j >= 0 && j < PROJECTS.length) { e.preventDefault(); go({ name: 'project', id: PROJECTS[j].id, deep: false }) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [route])

  return (
    <div className="app" data-route={route.name}>
      <a className="skip-link" href="#main">Skip to content</a>
      <TopBar route={route} />
      <main id="main" ref={mainRef} className="main" tabIndex={-1}>
        {isReel ? (
          <Reel />
        ) : (
          <div key={screenKey(route)} className={`screen screen--${direction}`}>
            {route.name === 'work' && <SelectedWork />}
            {route.name === 'project' && <ProjectOverview id={route.id} />}
            {route.name === 'about' && <About />}
            {route.name === 'contact' && <Contact />}
          </div>
        )}
      </main>
    </div>
  )
}
