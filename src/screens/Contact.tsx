import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { LINKEDIN_URL, PORTFOLIO_URL, PROFILE, VCARD } from '../content/profile'

const MODES = [
  { id: 'portfolio', label: 'Portfolio', text: PORTFOLIO_URL, hint: 'Scan with your phone camera to open the portfolio.' },
  { id: 'linkedin', label: 'LinkedIn', text: LINKEDIN_URL, hint: 'Scan to connect on LinkedIn.' },
  { id: 'contact', label: 'Save contact', text: VCARD, hint: 'Scan to save my contact card.' },
]

const pretty = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

/** The end of a conversation: they scan with their own phone. QR is generated on-device, offline. */
export default function Contact() {
  const [modeId, setModeId] = useState(MODES[0].id)
  const [svg, setSvg] = useState('')
  const mode = MODES.find((m) => m.id === modeId)!

  useEffect(() => {
    let live = true
    QRCode.toString(mode.text, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#f4f0e8', light: '#00000000' } })
      .then((s) => { if (live) setSvg(s) })
      .catch(() => { if (live) setSvg('') })
    return () => { live = false }
  }, [mode.text])

  return (
    <section className="contact" aria-labelledby="contact-heading">
      <div className="contact__text">
        <p className="meta">Contact</p>
        <h1 id="contact-heading" className="contact__title" tabIndex={-1} data-screen-heading>Let’s keep talking.</h1>
        <dl className="contact__list">
          <div><dt className="meta">Portfolio</dt><dd><a href={PORTFOLIO_URL} target="_blank" rel="noopener">{pretty(PORTFOLIO_URL)}</a></dd></div>
          <div><dt className="meta">Email</dt><dd><a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a></dd></div>
          <div><dt className="meta">Phone</dt><dd><a href="tel:+918886090063">+91 888 609 0063</a></dd></div>
          <div><dt className="meta">LinkedIn</dt><dd><a href={LINKEDIN_URL} target="_blank" rel="noopener">{pretty(LINKEDIN_URL)}</a></dd></div>
        </dl>
      </div>
      <div className="contact__qr">
        <div className="seg" role="group" aria-label="QR code content">
          {MODES.map((m) => (
            <button key={m.id} type="button" className="seg__opt" aria-pressed={m.id === mode.id} onClick={() => setModeId(m.id)}>{m.label}</button>
          ))}
        </div>
        <div className="qr" role="img" aria-label={`QR code. ${mode.hint}`}>
          {svg && <span className="qr__svg" dangerouslySetInnerHTML={{ __html: svg }} />}
        </div>
        <p className="qr__hint">{mode.hint}</p>
      </div>
    </section>
  )
}
