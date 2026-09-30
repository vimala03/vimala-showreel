# Showreel: creative direction

## Point of view
The portfolio (vimaladesigner.vercel.app) is a dark, warm, quiet studio. It uses General Sans,
small tracked uppercase labels, hairlines, and one cool-blue signal (the orb). The reel is that
same studio with the lights on and the work moving. No new visual vocabulary is invented; the
portfolio's language is given time.

## One continuous thread: the signal
A single accent dot (#6bb0d0, the portfolio's orb colour) runs through the whole film:

- Opening: the full stop after the name
- YouClean: the order moving through its states
- Cornerstone: the click cursor, then the AI working down the fields
- Flyin: the head of the flight path
- Menopause Care: it warms and slows
- Ending: it connects the four worlds, underlines the closing thought phrase by phrase, then returns to the name

It is the viewer's point of attention, and the reason the reel reads as one piece, not four clips.

## Motion carries meaning
| Idea | Motion |
|---|---|
| Messy reality | Scattered, rotated, drifting paper fragments |
| Structure | Fragments square up, snap to a grid, and change material from paper to interface |
| Complexity | Many small chips, a click counter racing |
| Clarity / impact | Compression: everything collapses to one element or one number |
| AI | Fields fill one by one, each confirmed "Added" (controlled reveal = trust) |
| Consumer momentum | Faster eases, a drawn flight path, parallax product frames |
| Human context | Slow sine eases, warm tint, stillness, a photograph given room |
| Systems | Four worlds joined by one drawn line |

Stillness is used on purpose: every scene has at least one held frame.

## Facts
Every number comes from the live portfolio or the resume, except two lines the brief asked for.
Those two come from the earlier portfolio, and neither is contradicted:
- YouClean order entry: 3–5 min → < 1 min (earlier portfolio data)
- Cornerstone: 40 clicks → 1 (the earlier Cornerstone case study, translating 8 courses)

Flyin shows **no figures**: the live portfolio holds all Flyin metrics pending verification (the resume
and the earlier portfolio disagree). Its metric beat is the qualitative line "Making every interaction feel effortless."
YouClean's dashboard frames are cropped to exclude an outdated store name in the product's store switcher
(the store is in Kompally); no masking.
UI text inside fragments (YC-1024, Priya Sharma, ₹1,240, "Translate all", the Apollo fields) is
taken from the real product screenshots.

## Technology
GSAP timeline + DOM/SVG, animating transforms and opacity only. There is no WebGL: nothing here
needs it, and the iPad's battery and frame rate matter more. Scenes are authored on a fixed
virtual stage (1440×1000 landscape, 1000×1440 portrait), scaled to fit, so compositions stay exact
on every iPad. One master timeline with labels gives pause, seek, scrub and scene jumps.

## Interaction
- The reel autoplays and loops. The chapter rail at the bottom shows progress and can be scrubbed by dragging.
- Tap a project name on the rail, or tap the stage during a project scene: the reel pauses, and a
  view transition morphs the scene into that project's overview.
- Overview → Key decision → Impact → Selected screens → Full case study (the live portfolio).
- Swipe changes scene. Space pauses. ←/→ change scene. Enter opens the current project.
- Reduced motion: no autoplay. Each scene becomes a still key frame, stepped manually with crossfades.

## Narrative (final pass)
Who I am → what I work on → how I approach problems → proof through projects → what I believe → who I am.
The voice is the connective tissue, the visuals are the proof, the music is atmosphere, and the effects are emphasis.
Proof moments (YouClean transformation, 3–5 min → < 1 min, 40 clicks → 1, 1,700 → 160) are kept free of speech.
The close is one connected thought, not slogans.
