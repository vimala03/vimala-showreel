import { Fragment } from 'react'

/**
 * Splits text into word / character spans so typography can be animated as
 * objects. The visible spans are aria-hidden; the whole string is exposed
 * once via aria-label so screen readers read words, not letters.
 * Spaces sit between the inline-block word spans (not inside them), so they
 * survive layout.
 */
export function Split({ text, by = 'char', className = '' }: { text: string; by?: 'char' | 'word'; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="split__w" aria-hidden="true">
            {by === 'char' ? [...w].map((c, j) => <span key={j} className="split__c">{c}</span>) : w}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
