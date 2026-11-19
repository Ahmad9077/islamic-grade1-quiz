import { Art, StarMark } from '../art/Art'
import { SUBJECTS, TOPICS, type Subject, type TopicId } from '../data/catalog'
import { toneStyle } from '../data/tones'
import { arabicNumber } from '../domain/format'
import type { SavedProgress } from '../domain/progress'
import { testSize } from '../domain/round'
import { HUB_URL } from '../hub/bootstrap'
import { PreviewBadge, SoundToggle, Stars, order } from './ui'

interface HomeProps {
  progress: SavedProgress
  muted: boolean
  onToggleSound: () => void
  onOpenTopic: (topic: TopicId) => void
  onStartTest: (subject: Subject) => void
}

const BANNER_ART: Record<Subject, string> = { islamic: 'pic:creator-earth', quran: 'pic:kaaba' }

export function Home({ progress, muted, onToggleSound, onOpenTopic, onStartTest }: HomeProps) {
  let step = 0
  return (
    <main className="screen home">
      <header className="top-bar">
        <div className="brand">
          <StarMark className="brand-mark" />
          <span className="brand-word">التربية الإسلامية</span>
          <PreviewBadge />
        </div>
        <SoundToggle muted={muted} onToggle={onToggleSound} />
      </header>

      <section className="home-body">
        {(Object.keys(SUBJECTS) as Subject[]).map((subject) => {
          const info = SUBJECTS[subject]
          return (
            <section key={subject} className={`subject-block subject-${subject}`} data-subject={subject}>
              <h2 className="section-title rise" style={order(step++)}>
                <span>{info.title}</span>
                <span className="section-date">{info.date}</span>
              </h2>

              <button type="button" className="test-banner press rise" style={{ ...toneStyle(`test-${subject}`), ...order(step++) }} onClick={() => onStartTest(subject)} data-test={subject}>
                <span className="test-banner-art" aria-hidden="true">
                  <Art art={BANNER_ART[subject]} />
                </span>
                <span className="test-banner-text">
                  <span className="test-banner-title">نموذج اختبار {info.title}</span>
                  <span className="test-banner-sub">{arabicNumber(testSize(subject))} أسئلة مثل ورقة الاختبار</span>
                  <Stars count={progress.stars[`test-${subject}`] ?? 0} size="sm" />
                </span>
              </button>

              <div className={`topic-grid count-${info.topics.length}`}>
                {TOPICS.filter((topic) => topic.subject === subject).map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    className="topic-card press rise"
                    style={{ ...toneStyle(topic.id), ...order(step++) }}
                    onClick={() => onOpenTopic(topic.id)}
                    data-topic={topic.id}
                  >
                    <span className="topic-card-field">{topic.field}</span>
                    <span className="topic-card-art" aria-hidden="true">
                      {topic.art.map((art) => (
                        <Art key={art} art={art} />
                      ))}
                    </span>
                    <span className="topic-card-title">{topic.title}</span>
                    <span className="topic-card-pages">{topic.pages}</span>
                    <span className="topic-card-foot">
                      <Stars count={progress.stars[topic.id] ?? 0} size="sm" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )
        })}

        <p className="source-note">نص القرآن الكريم من مشروع تنزيل (tanzil.net)، والتلاوة بصوت الشيخ مشاري راشد العفاسي.</p>

        {__QUIZ_BUILD_MODE__ === 'production-hub' ? (
          <a className="hub-link" href={HUB_URL}>
            العودة إلى صفحة الاختبارات
          </a>
        ) : (
          <p className="preview-note">نسخة تجريبية للمعاينة: النجوم تحفظ على هذا الجهاز فقط، ولا ترسل أي نتائج إلى الـ Hub.</p>
        )}
      </section>
    </main>
  )
}
