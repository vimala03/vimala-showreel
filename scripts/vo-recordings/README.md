# Your recorded voiceover

Drop one file per line here, named after its mark, then run `node scripts/generate-audio.mjs`.
The generator places each take at its mark and rebuilds `public/audio/voiceover.m4a`.
Lines without a recording fall back to the placeholder text-to-speech.

| File name | Line | Starts at (s) | Keep it under |
|---|---|---|---|
| voIntro.wav | Namaskaram, I'm Vimala Banavath, a Senior Product Designer. | 1.6 | 4.6 s |
| voWhat.wav | I design digital products across AI, enterprise and real-world operations, turning complex problems into experiences people can actually use. | 6.4 | 10.0 s |
| voSystem.wav | Sometimes, that means designing the system. | 16.9 | 3.2 s |
| voBuild.wav | And sometimes, building it myself. | 24.85 | 2.9 s |
| voEnterprise.wav | For enterprise products, I focus on making complexity clearer, faster and easier to navigate. | 46.8 | 6.3 s |
| voConsumer.wav | I've also worked on consumer experiences where every interaction needs to feel effortless. | 54.2 | 5.6 s |
| voAmbiguity.wav | And some projects start with ambiguity — understanding people first, then designing the experience around what they actually need. | 62.85 | 8.6 s |
| voBelief.wav | For me, good product design starts before the screen. | 78.95 | 3.5 s |
| voHow1.wav | It's about understanding the system, | 82.75 | 2.0 s |
| voHow2.wav | making complexity easier to navigate, | 84.9 | 2.6 s |
| voHow3.wav | and building experiences people can trust. | 87.7 | 2.8 s |
| voIdentity.wav | I'm Vimala Banavath. … Senior Product Designer. | 91.95 | 3.6 s |

**Recording format:** WAV, 48 kHz or 44.1 kHz, 24-bit, mono. Trim to about 0.1 s of room tone before and after each take, with no music and no processing beyond gentle noise reduction. A quiet, soft-furnished room with the phone or mic 15–20 cm away is enough.

If a take runs longer than "Keep it under", the next line is pushed later automatically (the generator prints a warning). The visuals don't move, so keep takes close to these lengths, or ask for the holds to be re-timed.
