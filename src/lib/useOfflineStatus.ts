import { useEffect, useState } from 'react'

export type OfflineStatus =
  | { kind: 'unsupported'; reason: string }
  | { kind: 'caching'; done: number; total: number }
  | { kind: 'ready'; total: number }
  | { kind: 'error' }

/**
 * Reports whether every file the app needs is in the service-worker cache.
 * The build writes /precache-manifest.json (see vite.config.ts); this checks
 * each entry against Cache Storage, so "Offline ready" is verified, not assumed.
 */
export function useOfflineStatus() {
  const [status, setStatus] = useState<OfflineStatus>(() => initial())
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  useEffect(() => {
    if (initial().kind === 'unsupported') return
    let cancelled = false
    let timer: number | undefined

    const check = async () => {
      try {
        await navigator.serviceWorker.ready
        const res = await caches.match('/precache-manifest.json')
        const manifest: { version: string; files: string[] } | undefined = res ? await res.json() : undefined
        if (!manifest) {
          if (!cancelled) setStatus({ kind: 'caching', done: 0, total: 0 })
        } else {
          const hits = await Promise.all(manifest.files.map((f) => caches.match(f, { ignoreVary: true })))
          const done = hits.filter(Boolean).length
          if (cancelled) return
          setStatus(done === manifest.files.length
            ? { kind: 'ready', total: done }
            : { kind: 'caching', done, total: manifest.files.length })
          if (done === manifest.files.length) return
        }
      } catch {
        if (!cancelled) setStatus({ kind: 'error' })
      }
      if (!cancelled) timer = window.setTimeout(check, 1500)
    }

    check()
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [])

  return { status, online }
}

function initial(): OfflineStatus {
  if (import.meta.env.DEV) return { kind: 'unsupported', reason: 'Dev server: offline caching runs in the production build only' }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    return { kind: 'unsupported', reason: 'Needs HTTPS (or localhost) for offline caching' }
  }
  return { kind: 'caching', done: 0, total: 0 }
}
