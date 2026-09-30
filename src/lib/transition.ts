/**
 * Navigates with a same-document View Transition where supported (Safari 18+,
 * iPadOS 18+, Chromium). The element passed in (the scene's product visual)
 * is given the shared name "vt-hero", and the overview's hero image carries
 * the same name, so the browser morphs one into the other. Falls back to a
 * plain navigation (with the screen's own entrance animation) elsewhere and
 * under reduced motion.
 */
type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } }

export function openWithTransition(hash: string, hero: HTMLElement | null) {
  const doc = document as VTDocument
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || reduce) {
    window.location.hash = hash
    return
  }
  if (hero) hero.style.viewTransitionName = 'vt-hero'
  document.documentElement.dataset.vt = 'open'
  const t = doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          window.removeEventListener('hashchange', done)
          // Let React commit the new screen before the browser snapshots it.
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }
        window.addEventListener('hashchange', done)
        window.location.hash = hash
        window.setTimeout(done, 400)
      }),
  )
  t.finished.finally(() => {
    if (hero) hero.style.viewTransitionName = ''
    delete document.documentElement.dataset.vt
  })
}

/** Plain navigation with a soft cross-fade (used for "Back to showreel"). */
export function navigateSoft(hash: string) {
  const doc = document as VTDocument
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || reduce) {
    window.location.hash = hash
    return
  }
  doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          window.removeEventListener('hashchange', done)
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }
        window.addEventListener('hashchange', done)
        window.location.hash = hash
        window.setTimeout(done, 400)
      }),
  )
}
