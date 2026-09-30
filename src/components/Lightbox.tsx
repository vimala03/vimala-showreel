import { useEffect, useRef, useState } from 'react'
import type { Screen } from '../content/projects'
import { useSwipe } from '../lib/useSwipe'

/**
 * Full-screen image viewer built on <dialog>, which gives focus trapping,
 * Escape-to-close and an inert background for free. Swipe or ←/→ to move
 * between screens; pinch-zoom is left to the browser.
 */
export default function Lightbox({ screens, start, onClose }: { screens: Screen[]; start: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [i, setI] = useState(start)
  const s = screens[i]
  const many = screens.length > 1

  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const opener = document.activeElement as HTMLElement | null
    d.showModal()
    const onCancel = (e: Event) => { e.preventDefault(); closeRef.current() }
    d.addEventListener('cancel', onCancel)
    return () => {
      d.removeEventListener('cancel', onCancel)
      if (d.open) d.close()
      opener?.focus({ preventScroll: true })
    }
  }, [])

  const step = (delta: number) => setI((v) => Math.min(screens.length - 1, Math.max(0, v + delta)))
  const swipe = useSwipe((dir) => step(dir === 'left' ? 1 : -1), many)

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={`Image ${i + 1} of ${screens.length}`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="lightbox__stage" {...swipe}>
        <img key={s.src} src={s.src} alt={s.alt} className="lightbox__img" />
      </div>
      <div className="lightbox__bar">
        <p className="lightbox__caption">
          
          {s.caption}
        </p>
        <div className="lightbox__controls">
          {many && (
            <>
              <button type="button" className="icon-btn icon-btn--dark" onClick={() => step(-1)} disabled={i === 0} aria-label="Previous image">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <span className="mono lightbox__count" aria-hidden="true">{i + 1} / {screens.length}</span>
              <button type="button" className="icon-btn icon-btn--dark" onClick={() => step(1)} disabled={i === screens.length - 1} aria-label="Next image">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <button type="button" className="icon-btn icon-btn--dark" onClick={onClose} aria-label="Close" autoFocus>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>
    </dialog>
  )
}
