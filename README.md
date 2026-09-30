# DesignUp showreel

An interactive, cinematic showreel of four projects, built for an iPad at DesignUp 2026.
It is independent of both portfolio repos: it only reads images from
`~/Documents/Redesign of my portfolio/redesigning PF` (via `npm run assets`) and takes its
design language and facts from the live portfolio (`~/Documents/Sept 2026`, vimaladesigner.vercel.app).
See `CREATIVE_DIRECTION.md` for the thinking.

## Run

```bash
npm install
npm run dev        # http://localhost:5190  (live reload, no offline caching)
npm run serve      # build + preview at http://localhost:4173  (offline caching on)
```

## Using it

- The reel autoplays (about 76 s) and loops after a 5 s hold on the final frame.
- Tap the stage during a project scene, the chapter name on the rail, or **Open …** to pause the
  reel and morph into that project's overview: Overview → Key decision → Impact → Screens →
  Full case study (live portfolio).
- **Showreel** (top left of the overview) returns to the reel and resumes where it paused.
- Drag along the thin progress line to scrub. Swipe left/right on the stage to change scene.
- Keyboard: Space play/pause · ←/→ scene · Enter open current project · 1–4 open a project · Esc back to the reel.
- Reduced motion: no autoplay. Each scene is a still key frame, and ▶ / → steps through them.

## Structure

```
src/reel/Scenes.tsx     markup for the six scenes (opening, 4 projects, ending)
src/reel/timeline.ts    the choreography: one GSAP master timeline, measured from layout
src/reel/Reel.tsx       stage scaling, orientation, playback, rail, gestures, keyboard
src/reel/Split.tsx      splits type into words/letters for kinetic typography
src/screens/            ProjectOverview, SelectedWork, About, Contact
src/content/            projects.ts (facts + sources), profile.ts
src/lib/transition.ts   view-transition morph from scene to overview
```

## Offline

`vite build` lists and hashes every file in `dist/`, then writes `sw.js` and
`precache-manifest.json`. The first visit caches everything (about 6.3 MB). After that, the reel,
fonts, images and overviews all load without a network. The pill in the top bar only says
**Offline ready** once every file is confirmed in the cache. Only "Explore full case study"
needs a connection, and it says so when you're offline.

Service workers need HTTPS or `localhost`.

## iPad

- **Try it now (same Wi-Fi, no offline):** `npm run serve`, then open `http://<Mac IP>:4173` in Safari.
- **Conference (offline):** host `dist/` on HTTPS (e.g. a separate Vercel project). Open it once
  on the iPad, wait for **Offline ready**, then Share → Add to Home Screen. Launch it from the icon.

## Audio

Sound is the default; mute is the opt-out. The reel is still fully understandable with sound off.

| Layer | File(s) in `public/audio/` | Behaviour |
|---|---|---|
| Music | `music-showreel.m4a` (~100 s) | Locked to the reel (pause, scrub, jump, loop). Ducks gently under speech and breathes back in after each line. Fades out in overviews. |
| Voiceover | `voiceover.m4a` (~100 s) | **Off by default**: an explicit choice via the "Voice" switch. It starts at the reel's current position (never from the beginning), and music ducks only while it's speaking. Turning it off leaves music and reel untouched. |
| Sound design | `sfx-*.m4a` (7 files) | Fire only when playback passes a cue. They step back automatically if they'd land under a spoken word. |

**Startup:** the reel tries to start with sound: music on, voiceover off. If the browser allows it, music simply plays. If it's blocked (typical on iPad Safari), the reel keeps playing silently, the control reads **Tap to unmute**, and the first tap anywhere unlocks audio at the reel's current position (music only). That tap doesn't also pause the reel or open a project.

**Control:** `Sound` / `Muted` for the audio system, plus a separate `Voice Off` / `Voice On` switch for narration. Unmuting always returns to music only. Preferences last for the session.

**Reduced motion:** sound starts off (the reel shows still frames). If turned on, music plays as a free-running bed, with no voiceover or effects.

### Replacing audio (no code changes)

- **Your voiceover (recommended):** record each line into `scripts/vo-recordings/` (see the README there for file names, timings and format), then run `node scripts/generate-audio.mjs`.
- **A licensed music track:** drop it in `public/audio/`, update the name in `config.json`, then set `volume`, `offset` and `duckMusicTo` there.
- Run `npm run build`. Everything is re-cached for offline use.

The script lives in `scripts/voiceover-script.json`, and the marks in `scripts/reel-timing.json`.
