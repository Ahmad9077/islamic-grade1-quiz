import { Art, StarMark } from '../art/Art'
import { BigButton, PreviewBadge, order } from './ui'

/** The book's own pictures around the mark: the five pillars and a few more. */
const ORBIT = ['pic:pillar-shahada', 'pic:pillar-salah', 'pic:pillar-zakat', 'pic:pillar-hajj', 'pic:pillar-sawm', 'pic:quran-read', 'pic:dua-girl', 'pic:safety']

export function Splash({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen splash">
      <div className="splash-top">
        <PreviewBadge />
      </div>

      <div className="splash-stage">
        <div className="orbit" aria-hidden="true">
          {ORBIT.map((art, index) => {
            // Two gentle arcs, four pictures above the mark and four below, clear of the title.
            const column = index % 4
            const above = index < 4
            const edge = column === 0 || column === 3
            return (
              <span
                key={art}
                className="orbit-item pop"
                style={order(index, {
                  '--base-delay': '250ms',
                  left: `${[12, 37, 63, 88][column]}%`,
                  top: `${above ? (edge ? 15 : 7) : edge ? 85 : 93}%`,
                })}
              >
                <span className="orbit-bob" style={order(index)}>
                  <Art art={art} />
                </span>
              </span>
            )
          })}
        </div>

        <div className="logo logo-in">
          <StarMark className="logo-mark" />
          <h1 className="logo-word">التربية الإسلامية</h1>
          <p className="logo-sub">الكتاب الأول ١-١</p>
        </div>
      </div>

      <p className="splash-tagline rise" style={order(0, { '--base-delay': '450ms' })}>
        نتدرب على أسئلة اختبار التربية الإسلامية للصف الأول
      </p>

      <div className="rise" style={order(0, { '--base-delay': '700ms' })}>
        <BigButton onClick={onStart} pulse className="start-button">
          <span>هيا نبدأ</span>
          <svg className="play-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16 5L6 12l10 7z" />
          </svg>
        </BigButton>
      </div>
    </main>
  )
}
