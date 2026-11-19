import { useId } from 'react'
import { A, verse, SURAHS } from '../data/catalog'

interface ArtProps {
  art: string
  className?: string
}

/**
 * Renders a picture at the size of its container. The art codes are listed with `ArtRef` in
 * the catalog: the book's pictures, words and sentences, and the ✓ and ✗ marks.
 */
export function Art({ art, className = '' }: ArtProps) {
  const [kind = '', ...rest] = art.split(':')
  const value = rest.join(':')
  const classes = (name: string) => `art ${name} ${className}`

  switch (kind) {
    case 'txt':
      return (
        <span className={classes('art-text')} aria-hidden="true" dir="rtl">
          {value}
        </span>
      )
    case 'tf':
      return (
        <span className={classes(`art-tf tf-${value}`)} aria-hidden="true">
          <span className="tf-mark">{value === 'yes' ? '✓' : '✗'}</span>
          <span className="tf-word">{value === 'yes' ? 'صح' : 'خطأ'}</span>
        </span>
      )
    case 'pic':
      return (
        <span className={classes('art-pic')} aria-hidden="true">
          <img src={`${import.meta.env.BASE_URL}pics/${value}.jpg`} alt="" draggable={false} />
        </span>
      )
    case 'qw':
      return (
        <span className={classes('art-quran')} aria-hidden="true" dir="rtl" lang="ar">
          {value}
        </span>
      )
    // A verse's text without its number, so a choice never shows where it belongs.
    case 'aya': {
      const [surah, n] = value.split(':').map(Number)
      const source = surah === SURAHS.masad.number ? SURAHS.masad : SURAHS.nasr
      return (
        <span className={classes('art-aya')} aria-hidden="true" dir="rtl" lang="ar">
          {verse(source, n!)}
        </span>
      )
    }
    case 'big':
      return (
        <span className={classes('art-big')} aria-hidden="true">
          {value}
        </span>
      )
    case 'star':
      return <StarMark className={className} />
    default:
      return (
        <span className={classes('art-emoji')} aria-hidden="true">
          {art}
        </span>
      )
  }
}

/** The end-of-verse ornament with the verse number, drawn by the Quran font (as on the Hub's Quran pages). */
export function AyaMarker({ n }: { n: number }) {
  return <span className="aya-marker">{`\u202D\u06DD${A(n)}\u202C`}</span>
}

/**
 * The quiz's mark: the eight-pointed star of the book's patterns, with an open book inside.
 */
export function StarMark({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={`star-mark ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#21a99f" />
          <stop offset="1" stopColor="#0d6b66" />
        </linearGradient>
      </defs>
      <g transform="translate(50 50)">
        <rect x="-33" y="-33" width="66" height="66" rx="7" fill={`url(#${id}-g)`} />
        <rect x="-33" y="-33" width="66" height="66" rx="7" fill={`url(#${id}-g)`} transform="rotate(45)" />
        <circle r="27" fill="#fff8e6" />
        <circle r="27" fill="none" stroke="#e9b949" strokeWidth="3" strokeDasharray="4 3" />
        {/* An open book on its stand */}
        <path d="M-17 -6 Q-9 -11 0 -5 Q9 -11 17 -6 L17 11 Q9 6 0 12 Q-9 6 -17 11 Z" fill="#1a8f88" />
        <path d="M0 -5 L0 12" stroke="#fff8e6" strokeWidth="2" />
        <path d="M-13 -2 Q-7 -5 -3 -1 M-13 3 Q-7 0 -3 4 M13 -2 Q7 -5 3 -1 M13 3 Q7 0 3 4" stroke="#fff8e6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M-12 17 L12 17 L7 13 L-7 13 Z" fill="#b5762c" />
      </g>
    </svg>
  )
}
