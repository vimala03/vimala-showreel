import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

/**
 * Offline support without a PWA framework: after the build finishes, list
 * every file in dist/, hash their contents into a version, and write
 *   dist/precache-manifest.json  (what the UI checks to show "Offline ready")
 *   dist/sw.js                   (src/sw-template.js with the list inlined)
 * A content change → new version → new cache; the old one is deleted.
 */
function offlinePrecache(): Plugin {
  let outDir = 'dist'
  return {
    name: 'offline-precache',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir },
    closeBundle() {
      const root = join(process.cwd(), outDir)
      const files: string[] = []
      const walk = (dir: string) => {
        for (const name of readdirSync(dir)) {
          const p = join(dir, name)
          if (statSync(p).isDirectory()) walk(p)
          else files.push(p)
        }
      }
      walk(root)

      const skip = new Set(['sw.js', 'precache-manifest.json', '.DS_Store'])
      const urls: string[] = []
      const hash = createHash('sha256')
      for (const f of files.sort()) {
        const rel = relative(root, f).split(sep).join('/')
        if (skip.has(rel.split('/').pop()!)) continue
        urls.push('/' + rel)
        hash.update(rel).update(readFileSync(f))
      }
      const version = hash.digest('hex').slice(0, 12)
      const precache = ['/', ...urls, '/precache-manifest.json']

      writeFileSync(join(root, 'precache-manifest.json'), JSON.stringify({ version, files: precache }, null, 2))
      const template = readFileSync(join(process.cwd(), 'src/sw-template.js'), 'utf8')
      writeFileSync(
        join(root, 'sw.js'),
        template.replaceAll('__VERSION__', version).replaceAll('__PRECACHE__', JSON.stringify(precache)),
      )
      const bytes = files.reduce((n, f) => n + statSync(f).size, 0)
      console.log(`\n[offline] precached ${precache.length} files (${(bytes / 1024 / 1024).toFixed(1)} MB), version ${version}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), offlinePrecache()],
  server: { port: 5190, strictPort: true },
  preview: { port: 4173 },
  build: { assetsInlineLimit: 0 },
})
