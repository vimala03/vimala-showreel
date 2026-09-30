import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

/**
 * Horizontal swipe detection with pointer events. The element should have
 * `touch-action: pan-y` so the browser still owns vertical scrolling and
 * pinch-zoom; only a clearly horizontal, fast-enough gesture counts.
 */
export function useSwipe(onSwipe: (dir: 'left' | 'right') => void, enabled = true) {
  const start = useRef<{ x: number; y: number; t: number; id: number } | null>(null)

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!enabled || e.pointerType === 'mouse') return
    if ((e.target as HTMLElement).closest('[data-no-swipe]')) return
    start.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId }
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    const s = start.current
    start.current = null
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    const dt = e.timeStamp - s.t
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5 || dt > 700) return
    onSwipe(dx < 0 ? 'left' : 'right')
  }

  const onPointerCancel = () => { start.current = null }

  return { onPointerDown, onPointerUp, onPointerCancel }
}
