import { useEffect } from 'react'

/**
 * Keeps the iPad screen awake while the companion is open, so it doesn't dim
 * mid-conversation. Uses the Screen Wake Lock API (Safari 16.4+); silently
 * does nothing where unsupported. The lock is released by the browser when
 * the tab is hidden, so it's re-requested when the page becomes visible.
 */
export function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      if (cancelled || document.visibilityState !== 'visible' || lock) return
      try {
        lock = await navigator.wakeLock.request('screen')
        lock.addEventListener('release', () => { lock = null })
      } catch {
        // Not allowed yet (needs a user gesture on some browsers); retried below.
      }
    }

    const onVisible = () => { if (document.visibilityState === 'visible') request() }
    request()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pointerdown', request)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pointerdown', request)
      lock?.release().catch(() => {})
    }
  }, [])
}
