/* Service worker template. vite.config.ts fills in the version and the
 * precache list at build time and writes the result to dist/sw.js.
 *
 * Strategy: cache-first for everything, because the point is to keep working
 * on unreliable conference Wi-Fi.
 *  - install:  download every file the app needs into one versioned cache
 *  - activate: delete caches from older versions
 *  - fetch:    screens come from the cache (the app is one document, so the
 *              cached index.html serves them all); other same-origin requests
 *              are cached first, then network. Cross-origin requests (the
 *              live portfolio link, wa.me) are left to the network.
 */
const VERSION = '__VERSION__'
const CACHE = `designup-reel-${VERSION}`
const PRECACHE = __PRECACHE__

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('designup-reel-') && k !== CACHE).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html', { cacheName: CACHE, ignoreVary: true }).then((hit) => hit || fetch(req)),
    )
    return
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => {
      if (hit) return hit
      return fetch(req).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy))
        }
        return res
      })
    }),
  )
})
