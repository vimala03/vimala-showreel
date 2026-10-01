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
| voQuestion.wav | I started with a simple question. What if your career could understand itself? | 75.55 | 6.3 s |
| voScattered.wav | Today, our professional story is scattered across résumés, portfolios, profiles and applications. | 82.35 | 6.6 s |
| voModel.wav | Career Intelligence explores a different model. Evidence becomes capability, capability becomes opportunity, and signals shape the next move. | 89.35 | 13.5 s |
| voLayers.wav | I explored it as one system: six intelligence layers, and more than thirty product surfaces. | 103.15 | 8.2 s |
| voBuilt.wav | Two of them are working today. | 111.65 | 2.3 s |
| voFirst.wav | The first working experiment is narrower. What does your work actually prove? | 114.25 | 6.5 s |
| voRead.wav | It reads a claim against the evidence. Where excerpts converge, a signal. Where they're thin, a gap, and one next move. | 121.05 | 13.8 s |
| voSend.wav | Then: what happens after you press send? | 135.15 | 4.4 s |
| voObserve.wav | We can observe behaviour. … We cannot know intent. | 139.85 | 11.2 s |
| voBegin.wav | The portfolio is only the beginning. | 151.35 | 3.6 s |
| vo2030.wav | My thesis for 2030: the career profile may no longer be a document. It may become a living intelligence layer. | 155.25 | 7.8 s |
| voExplore.wav | Career Intelligence is an exploration of what that could look like. | 163.35 | 12.0 s |
| voBelief.wav | For me, good product design starts before the screen. | 175.65 | 3.5 s |
| voHow1.wav | It's about understanding the system, | 179.45 | 2.0 s |
| voHow2.wav | making complexity easier to navigate, | 181.6 | 2.6 s |
| voHow3.wav | and building experiences people can trust. | 184.4 | 2.8 s |
| voIdentity.wav | I'm Vimala Banavath. … Senior Product Designer. | 188.65 | 3.6 s |

**Recording format:** WAV, 48 kHz or 44.1 kHz, 24-bit, mono. Trim to about 0.1 s of room tone before and after each take, with no music and no processing beyond gentle noise reduction. A quiet, soft-furnished room with the phone or mic 15–20 cm away is enough.

If a take runs longer than "Keep it under", the next line is pushed later automatically (the generator prints a warning). The visuals don't move, so keep takes close to these lengths, or ask for the holds to be re-timed.
