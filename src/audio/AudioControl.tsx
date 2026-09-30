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
 *   ♫ Music  /  ♫ Music off      score + sound design
 *   Voice    /  Voice on         optional narration (a guided tour)
 * When the browser blocked autoplay, the Music chip reads "Sound off · Tap to play";
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
        aria-pressed={music && !waiting}
        aria-label={waiting ? 'Sound is off. Tap to play music' : music ? 'Music on. Turn music off' : 'Music off. Turn music on'}
        onClick={onMusic}
      >
        <span className={`aud__ind aud__ind--dot${pulse ? ' is-pulsing' : ''}`} aria-hidden="true" />
        <span className="aud__glyph" aria-hidden="true">♫</span>
        <span className="aud__label">{waiting ? 'Sound off · Tap to play' : music ? 'Music' : 'Music off'}</span>
      </button>
      {!reducedMotion() && (
        <button
          type="button"
          className="aud__chip aud__chip--voice"
          data-state={voice ? 'on' : 'off'}
          data-speaking={voice && audio.speaking ? '' : undefined}
          aria-pressed={voice}
          aria-label={voice ? 'Narration on. Turn voice off' : 'Narration off. Turn voice on'}
          onClick={onVoice}
        >
          <span className="aud__ind aud__ind--ring" aria-hidden="true" />
          <span className="aud__label">{voice ? 'Voice on' : 'Voice'}</span>
        </button>
      )}
    </div>
  )
}
