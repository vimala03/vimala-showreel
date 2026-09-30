import { useEffect, useState, useSyncExternalStore } from 'react'
import { audio } from './engine'

function useAudio() {
  return useSyncExternalStore(
    (fn) => audio.subscribe(fn),
    () => `${audio.prefs.music}|${audio.prefs.voice}|${audio.unlocked}|${audio.blocked}|${audio.speaking}|${audio.musicStarts}`,
  )
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Two quiet, independent chips in the rail:
 *   ♫ Music  /  ♫ Muted          score + sound design
 *   Voice Off /  Voice On        optional narration (a guided tour)
 * When the browser blocked autoplay, the Music chip reads "Tap for sound";
 * any first tap then starts music only and never toggles anything.
 */
export default function AudioControl() {
  useAudio()
  const { music, voice } = audio.prefs
  const waiting = music && !audio.unlocked && audio.blocked
  const playing = music && audio.unlocked

  // A brief pulse when music becomes audible, then a settled, static indicator.
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    if (audio.musicStarts === 0) return
    setPulse(true)
    const t = window.setTimeout(() => setPulse(false), 1800)
    return () => window.clearTimeout(t)
  }, [audio.musicStarts])

  const onMusic = () => {
    // The tap that unlocked audio has already started music; don't also turn it off.
    if (audio.takeUnlockTap()) return
    audio.setPrefs({ music: !music })
  }
  const onVoice = () => {
    audio.takeUnlockTap() // an explicit Voice tap is intentional, even if it also unlocked audio
    audio.setPrefs({ voice: !voice })
  }

  return (
    <div className="aud" role="group" aria-label="Audio">
      <button
        type="button"
        className="aud__chip aud__chip--music"
        data-state={waiting ? 'waiting' : playing ? 'on' : music ? 'pending' : 'off'}
        aria-label={waiting ? 'Tap for sound: play music' : music ? 'Mute music' : 'Play music'}
        title={waiting ? 'Tap for sound' : music ? 'Music on · tap to mute' : 'Music muted · tap to play'}
        onClick={onMusic}
      >
        <span className={`aud__ind aud__ind--dot${pulse ? ' is-pulsing' : ''}`} aria-hidden="true" />
        <span className="aud__glyph" aria-hidden="true">♫</span>
        <span className={`aud__label${waiting ? ' aud__label--keep' : ''}`}>{waiting ? 'Tap for sound' : music ? 'Music' : 'Muted'}</span>
      </button>
      {!reducedMotion() && (
        <button
          type="button"
          className="aud__chip aud__chip--voice"
          data-state={voice ? 'on' : 'off'}
          data-speaking={voice && audio.speaking ? '' : undefined}
          aria-label={voice ? 'Disable voiceover' : 'Enable voiceover'}
          title={voice ? 'Voiceover on · tap to turn off' : 'Voiceover off · tap to turn on'}
          onClick={onVoice}
        >
          <span className="aud__ind aud__ind--ring" aria-hidden="true" />
          <span className="aud__label aud__label--keep">{voice ? 'Voice On' : 'Voice Off'}</span>
        </button>
      )}
    </div>
  )
}
