import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Art } from '../art/Art'
import { celebrate } from '../art/confetti'
import { useNarrator } from '../audio/NarratorContext'
import type { Cue } from '../audio/player'
import { sfx } from '../audio/sfx'
import { CHEERS, RETRIES, clip, roundClips, type Cheer, type Option, type Pair, type Question } from '../data/catalog'
import { TONES, toneStyle, type ToneId } from '../data/tones'
import { arabicNumber } from '../domain/format'
import { arrangeOptions, shuffle, testSlot } from '../domain/round'
import type { Attempt } from '../hub/bridge'
import { ArrowIcon, BigButton, CloseButton, SpeakerButton, StarIcon, order } from './ui'

/** Cheers rest for this many answers before they can come back. */
const CHEER_REST = 5

// Narration starts once the question has settled on screen.
const ASK_DELAY_MS = 380

const ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر']

/** A random item that was not used recently; the pick joins the recent list. */
function fresh<T>(items: readonly T[], recent: T[], rest: number): T {
  const pool = items.filter((item) => !recent.includes(item))
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? items[0]!
  recent.push(pick)
  if (recent.length > rest) recent.shift()
  return pick
}

/** A stable number from text, so each round can explain an answer a different way. */
function spread(text: string): number {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

export interface Round {
  id: number
  kind: 'practice' | 'test'
  tone: ToneId
  questions: Question[]
}

interface QuizScreenProps {
  round: Round
  /** Played once before question one: the mock-test introduction. */
  intro?: string
  onExit: () => void
  onFinish: (attempts: Attempt[]) => void
}

type Phase = 'asking' | 'answered'

export function QuizScreen({ round, intro, onExit, onFinish }: QuizScreenProps) {
  const narrator = useNarrator()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('asking')
  const [chosen, setChosen] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [cheer, setCheer] = useState<Cheer>(CHEERS[0]!)
  const [retry, setRetry] = useState(RETRIES[0]!)
  const [confirmExit, setConfirmExit] = useState(false)
  const recentCheers = useRef<Cheer[]>([])
  const recentRetries = useRef<(typeof RETRIES)[number][]>([])
  const tileRefs = useRef(new Map<string, HTMLElement>())
  const optionsRef = useRef<HTMLDivElement>(null)

  const question = round.questions[index]!
  const options = useMemo(() => arrangeOptions(question), [question])
  // One of the question's explanations, picked afresh for every round.
  const explanation = useMemo(() => question.explain[spread(`${round.id}:${question.key}`) % question.explain.length]!, [question, round.id])
  const correctOption = question.options.find((option) => option.id === question.answer)
  const tone = round.kind === 'test' ? question.topic : round.tone
  const explainCues: Cue[] = explanation.clips.map((id, n) => ({ clip: id, gap: n === 0 ? 450 : 200 }))
  const askCues = useMemo<Cue[]>(() => question.ask.map((id, n) => ({ clip: id, gap: n === 0 ? 0 : 200 })), [question])

  // Load every clip of the round up front, so no question waits for its audio.
  useEffect(() => {
    narrator.preload(roundClips(round.questions))
  }, [narrator, round.questions])

  useEffect(() => {
    const opening = intro && index === 0 ? [{ clip: intro }, ...askCues.map((cue, n) => (n === 0 ? { ...cue, gap: 500 } : cue))] : askCues
    if (opening.length === 0) return
    const timer = window.setTimeout(() => void narrator.play(opening), ASK_DELAY_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the introduction plays once, before question one
  }, [askCues, narrator])

  useEffect(() => () => narrator.stop(), [narrator])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  // Keep the answers in view above the feedback sheet on short phone screens.
  useEffect(() => {
    if (phase !== 'answered') return
    const timer = window.setTimeout(() => {
      const box = optionsRef.current?.getBoundingClientRect()
      const sheet = document.querySelector('.feedback')?.getBoundingClientRect()
      if (!box || !sheet) return
      const overlap = box.bottom + 12 - sheet.top
      if (overlap > 0) window.scrollBy({ top: overlap, behavior: 'smooth' })
    }, 650)
    return () => window.clearTimeout(timer)
  }, [phase])

  function settle(correct: boolean, chosenId: string, anchor?: HTMLElement | null) {
    setPhase('answered')
    setAttempts((list) => [...list, { questionKey: question.key, chosen: chosenId, correct }])
    if (correct) {
      sfx.correct()
      const pick = fresh(CHEERS, recentCheers.current, CHEER_REST)
      setCheer(pick)
      celebrate(anchor ?? undefined, TONES[tone].tone)
      void narrator.play([{ clip: pick.clip, gap: 300 }, ...explainCues])
    } else if (question.kind !== 'pick') {
      sfx.wrong()
      void narrator.play([{ clip: clip.ui('review'), gap: 450 }, ...explainCues])
    } else {
      sfx.wrong()
      const pick = fresh(RETRIES, recentRetries.current, 2)
      setRetry(pick)
      const reveal: Cue[] = correctOption?.clip ? [{ clip: correctOption.clip, gap: 120 }] : []
      void narrator.play([{ clip: pick.clip, gap: 450 }, ...reveal, ...explainCues])
    }
  }

  function answer(option: Option) {
    if (phase !== 'asking') return
    narrator.stop()
    setChosen(option.id)
    settle(option.id === question.answer, option.id, tileRefs.current.get(option.id))
  }

  function next() {
    sfx.tap()
    narrator.stop()
    if (index + 1 >= round.questions.length) {
      onFinish(attempts)
      return
    }
    setIndex(index + 1)
    setPhase('asking')
    setChosen(null)
  }

  const lastCorrect = attempts.at(-1)?.correct ?? false
  const answered = phase === 'answered'
  const register = (id: string) => (node: HTMLElement | null) => {
    if (node) tileRefs.current.set(id, node)
    else tileRefs.current.delete(id)
  }

  // The paper's heading: «السؤال الأول :» in the mock test, the question's number in a lesson.
  const slot = round.kind === 'test' ? testSlot(index) : null
  const heading = slot ? `السؤال ${ORDINALS[slot.slot - 1] ?? arabicNumber(slot.slot)}` : `السؤال ${ORDINALS[index] ?? arabicNumber(index + 1)}`
  const part = slot && slot.parts > 1 ? slot.part : null
  const tfMark = question.format === 'tf' && answered ? question.answer : null

  return (
    <main className={`screen quiz-screen ${answered ? 'has-feedback' : ''}`} style={toneStyle(tone)}>
      <header className="top-bar quiz-top">
        <CloseButton onClick={() => setConfirmExit(true)} />
        <div className="track" aria-label={`السؤال ${arabicNumber(index + 1)} من ${arabicNumber(round.questions.length)}`}>
          {round.questions.map((entry, n) => {
            const attempt = attempts[n]
            const state = attempt ? (attempt.correct ? 'is-right' : 'is-miss') : n === index ? 'is-current' : ''
            return (
              <span key={entry.key} className={`track-step ${state}`}>
                {attempt?.correct ? (
                  <span className="track-star pop">
                    <StarIcon />
                  </span>
                ) : null}
              </span>
            )
          })}
        </div>
        <span className="quiz-count">
          {arabicNumber(index + 1)}/{arabicNumber(round.questions.length)}
        </span>
      </header>

      <section key={question.key} className={`question question-${question.kind} format-${question.format} question-in`} data-question-key={question.key}>
        <div className="paper-head">
          <span className="paper-pill">
            <span className="paper-flower" aria-hidden="true">
              ❀
            </span>
            {heading} :
          </span>
          <p className="instruction">{question.instruction}</p>
          {question.ask.length > 0 ? <SpeakerButton onClick={() => void narrator.play(askCues)} /> : null}
        </div>

        {question.cloze ? (
          <div className="hadith-card pop" style={order(0, { '--base-delay': '80ms' })}>
            <p className="hadith-lead">{question.cloze.lead}</p>
            <p className="hadith-text">
              «{question.cloze.before}
              <span className={`hadith-blank ${answered ? 'is-filled' : ''}`}>{answered ? <span className="ink-word">{correctOption?.label}</span> : '\u00a0'}</span>
              {question.cloze.after}»
            </p>
          </div>
        ) : null}

        {question.format === 'tf' ? (
          <div className="statement pop" style={order(0, { '--base-delay': '80ms' })}>
            {part ? <span className="statement-number">{arabicNumber(part)}</span> : null}
            <p className="statement-text">{question.prompt}</p>
            <span className="statement-slot" aria-hidden="true">
              (<span className={`slot-mark ${tfMark ? `ink-mark mark-${tfMark}` : ''}`}>{tfMark === 'yes' ? '✓' : tfMark === 'no' ? '✗' : ''}</span>)
            </span>
          </div>
        ) : question.prompt ? (
          <div className="prompt-card pop" style={order(0, { '--base-delay': '80ms' })}>
            {part ? <span className="statement-number">{arabicNumber(part)}</span> : null}
            <p className="prompt">{question.prompt}</p>
          </div>
        ) : null}

        {question.kind === 'pick' ? (
          <div
            ref={optionsRef}
            className={`options holds-${optionKind(options[0]?.art ?? '')} count-${options.length} ${options.some((option) => option.art.startsWith('txt:') && option.label.length > 16) ? 'has-long' : ''}`}
          >
            {options.map((option, n) => {
              const isChosen = chosen === option.id
              const isAnswer = option.id === question.answer
              const state = answered ? (isChosen ? (isAnswer ? 'is-correct' : 'is-wrong') : isAnswer ? 'is-reveal' : 'is-dim') : ''
              return (
                <div key={option.id} className="option-slot rise" style={order(n, { '--base-delay': '140ms' })}>
                  <button
                    ref={register(option.id)}
                    type="button"
                    className={`option ${optionKind(option.art)} ${state}`}
                    onClick={() => answer(option)}
                    disabled={answered}
                    aria-label={option.label}
                    data-option={option.id}
                  >
                    <span className="option-art" aria-hidden="true">
                      <Art art={option.art} />
                    </span>
                    {isChosen || (answered && isAnswer) ? <InkRing tone={state === 'is-wrong' ? 'miss' : 'good'} /> : null}
                  </button>
                </div>
              )
            })}
          </div>
        ) : null}

        {question.kind === 'match' ? (
          <div ref={optionsRef} className="match-wrap">
            <MatchBoard
              question={question}
              locked={answered}
              onHit={() => sfx.tap()}
              onMiss={() => {
                sfx.wrong()
                void narrator.play([{ clip: clip.ui('match-wrong') }])
              }}
              onDone={(mistakes, board) => settle(mistakes === 0, `mistakes:${mistakes}`, board)}
            />
          </div>
        ) : null}

        {question.kind === 'circle' ? (
          <div ref={optionsRef}>
            <CircleBoard question={question} options={options} locked={answered} onCheck={(picked, board) => settle(sameSet(picked, question.good), picked.join(',') || 'none', board)} />
          </div>
        ) : null}

        {question.kind === 'mark' ? (
          <div ref={optionsRef}>
            <MarkBoard
              question={question}
              options={options}
              locked={answered}
              onCheck={(marks, board) => {
                const wrong = options.filter((option) => marks[option.id] !== question.good.includes(option.id)).length
                settle(wrong === 0, `wrong:${wrong}`, board)
              }}
            />
          </div>
        ) : null}

        {question.kind === 'order' ? (
          <div ref={optionsRef}>
            <OrderBoard
              question={question}
              options={options}
              locked={answered}
              onHit={() => sfx.tap()}
              onMiss={() => {
                sfx.wrong()
                void narrator.play([{ clip: clip.ui('match-wrong') }])
              }}
              onDone={(mistakes, board) => settle(mistakes === 0, `mistakes:${mistakes}`, board)}
            />
          </div>
        ) : null}
      </section>

      {answered ? (
        <aside key={`feedback-${question.key}`} className={`feedback ${lastCorrect ? 'feedback-good' : 'feedback-miss'}`} role="status">
          <div className="feedback-head">
            {lastCorrect ? (
              <span className="feedback-star spin-in">
                <StarIcon />
              </span>
            ) : (
              <span className="feedback-bulb" aria-hidden="true">
                <Art art="💡" />
              </span>
            )}
            <div className="feedback-titles">
              {lastCorrect ? (
                <p className="feedback-title">{cheer.text}</p>
              ) : question.kind !== 'pick' ? (
                <p className="feedback-title">خلنا نتذكر:</p>
              ) : (
                <>
                  <p className="feedback-encourage">{retry.text}</p>
                  <p className="feedback-title">الجواب الصحيح:</p>
                  {correctOption ? (
                    <span className={`feedback-answer ${optionKind(correctOption.art)}`} aria-label={correctOption.label}>
                      <Art art={correctOption.art} />
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <ul className="feedback-facts">
            {explanation.text.split('\n').map((line) => (
              <li key={line} className="feedback-fact">
                {line}
              </li>
            ))}
          </ul>
          <div className="feedback-actions">
            {explainCues.length > 0 ? <SpeakerButton onClick={() => void narrator.play(explainCues)} label="إعادة الشرح" /> : <span />}
            <BigButton onClick={next} pulse className="next-button">
              {index + 1 >= round.questions.length ? 'النتيجة' : 'التالي'}
              <ArrowIcon direction="next" />
            </BigButton>
          </div>
        </aside>
      ) : null}

      {confirmExit ? (
        <div className="sheet-backdrop fade-in">
          <div className="sheet pop" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <p id="exit-title" className="sheet-title">
              نطلع من الجولة؟
            </p>
            <p className="sheet-sub">إجابات هذي الجولة ما راح تنحفظ.</p>
            <div className="sheet-actions">
              <BigButton onClick={() => setConfirmExit(false)}>نكمل</BigButton>
              <BigButton tone="paper" onClick={onExit}>
                خروج
              </BigButton>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id))
}

/** The art code's kind: `pic:hajj` → `pic`; emoji have none. */
function artKind(art: string): string {
  const match = /^([a-z]+):/.exec(art)
  return match ? match[1]! : 'emoji'
}

function optionKind(art: string): string {
  return `option-${artKind(art)}`
}

/** A hand-drawn ring, like the pen circle on a marked exam paper («حوّط»). */
function InkRing({ tone }: { tone: 'good' | 'miss' | 'pen' }) {
  return (
    <svg className={`ink-ring ink-${tone}`} viewBox="0 0 120 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M62 7 C 96 6, 116 24, 114 50 C 112 79, 86 95, 56 94 C 24 93, 5 74, 6 49 C 7 24, 30 8, 66 9 C 78 10, 88 13, 95 18" pathLength="100" />
    </svg>
  )
}

function PictureTile({ option, children, className = '' }: { option: Option; children?: ReactNode; className?: string }) {
  return (
    <span className={`picture-tile ${className}`}>
      <span className="picture-frame" aria-hidden="true">
        <Art art={option.art} />
      </span>
      {option.caption ? <span className="picture-caption">{option.caption}</span> : null}
      {children}
    </span>
  )
}

// ── «ضع دائرة حول…» ─────────────────────────────────────────────────────────
interface CircleBoardProps {
  question: Question
  options: Option[]
  locked: boolean
  onCheck: (picked: string[], board: HTMLElement | null) => void
}

function CircleBoard({ question, options, locked, onCheck }: CircleBoardProps) {
  const [picked, setPicked] = useState<string[]>([])
  const boardRef = useRef<HTMLDivElement>(null)

  function toggle(id: string) {
    if (locked) return
    sfx.tap()
    setPicked((list) => (list.includes(id) ? list.filter((other) => other !== id) : [...list, id]))
  }

  return (
    <div ref={boardRef} className={`picture-board count-${options.length}`}>
      <div className="picture-grid">
        {options.map((option, n) => {
          const isPicked = picked.includes(option.id)
          const isGood = question.good.includes(option.id)
          const state = locked ? (isPicked ? (isGood ? 'is-correct' : 'is-wrong') : isGood ? 'is-reveal' : 'is-dim') : isPicked ? 'is-picked' : ''
          return (
            <button
              key={option.id}
              type="button"
              className={`picture-button rise ${state}`}
              style={order(n, { '--base-delay': '140ms' })}
              onClick={() => toggle(option.id)}
              disabled={locked}
              aria-pressed={isPicked}
              aria-label={option.label}
              data-option={option.id}
            >
              <PictureTile option={option}>
                {isPicked || (locked && isGood) ? <InkRing tone={locked ? (isGood ? 'good' : 'miss') : 'pen'} /> : null}
              </PictureTile>
            </button>
          )
        })}
      </div>
      {!locked ? (
        <div className="check-row rise" style={order(options.length, { '--base-delay': '140ms' })}>
          <CheckButton disabled={picked.length === 0} onClick={() => onCheck(picked, boardRef.current)} />
        </div>
      ) : null}
    </div>
  )
}

// ── «ضع علامة (✓) أسفل… و(✗) أسفل…» ───────────────────────────────────────
interface MarkBoardProps {
  question: Question
  options: Option[]
  locked: boolean
  onCheck: (marks: Record<string, boolean>, board: HTMLElement | null) => void
}

function MarkBoard({ question, options, locked, onCheck }: MarkBoardProps) {
  const [marks, setMarks] = useState<Record<string, boolean>>({})
  const boardRef = useRef<HTMLDivElement>(null)
  const faces = question.marks === 'face'
  const glyph = (yes: boolean) => (faces ? (yes ? '🙂' : '☹️') : yes ? '✓' : '✗')

  function choose(id: string, yes: boolean) {
    if (locked) return
    sfx.tap()
    setMarks((current) => ({ ...current, [id]: yes }))
  }

  const done = options.every((option) => option.id in marks)

  return (
    <div ref={boardRef} className={`picture-board mark-board count-${options.length} ${faces ? 'uses-faces' : ''}`}>
      <div className="picture-grid">
        {options.map((option, n) => {
          const mine = marks[option.id]
          const truth = question.good.includes(option.id)
          const state = locked ? (mine === truth ? 'is-correct' : 'is-wrong') : ''
          return (
            <div key={option.id} className={`mark-cell rise ${state}`} style={order(n, { '--base-delay': '140ms' })} data-option={option.id}>
              <PictureTile option={option} />
              <span className="mark-slot" aria-hidden="true">
                (<span className={`slot-mark ${mine !== undefined ? 'ink-mark' : ''} ${mine === undefined ? '' : `mark-${mine ? 'yes' : 'no'}`}`}>{mine === undefined ? '' : glyph(mine)}</span>)
              </span>
              {locked ? (
                mine !== truth ? <span className="mark-truth">{glyph(truth)}</span> : null
              ) : (
                <span className="mark-choices">
                  {[true, false].map((yes) => (
                    <button
                      key={String(yes)}
                      type="button"
                      className={`mark-choice press mark-choice-${yes ? 'yes' : 'no'} ${mine === yes ? 'is-on' : ''}`}
                      onClick={() => choose(option.id, yes)}
                      aria-label={`${option.label}: ${yes ? (faces ? 'عبادة' : 'صح') : faces ? 'ليست عبادة' : 'خطأ'}`}
                      aria-pressed={mine === yes}
                      data-mark={yes ? 'yes' : 'no'}
                    >
                      {glyph(yes)}
                    </button>
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {!locked ? (
        <div className="check-row rise" style={order(options.length, { '--base-delay': '140ms' })}>
          <CheckButton disabled={!done} onClick={() => onCheck(marks, boardRef.current)} />
        </div>
      ) : null}
    </div>
  )
}

// ── «أعد الترتيب» ───────────────────────────────────────────────────────────
interface OrderBoardProps {
  question: Question
  options: Option[]
  locked: boolean
  onHit: () => void
  onMiss: () => void
  onDone: (mistakes: number, board: HTMLElement | null) => void
}

function OrderBoard({ question, options, locked, onHit, onMiss, onDone }: OrderBoardProps) {
  const [placed, setPlaced] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [shaking, setShaking] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const words = !options.some((option) => option.art.startsWith('pic:'))

  function tap(option: Option) {
    if (locked || placed.includes(option.id)) return
    const expected = question.options[placed.length]
    if (option.id === expected?.id) {
      onHit()
      const done = [...placed, option.id]
      setPlaced(done)
      if (done.length === question.options.length) window.setTimeout(() => onDone(mistakes, boardRef.current), 350)
      return
    }
    setMistakes((count) => count + 1)
    setShaking(option.id)
    onMiss()
    window.setTimeout(() => setShaking(null), 450)
  }

  return (
    <div ref={boardRef} className={`order-board ${words ? 'order-words' : 'order-pictures'}`}>
      <div className="order-strip" aria-label="الترتيب">
        {question.options.map((option, n) => {
          const filled = placed[n] ? question.options.find((entry) => entry.id === placed[n]) : null
          return (
            <span key={option.id} className={`order-cell ${filled ? 'is-filled pop' : ''}`}>
              <span className="order-number">{arabicNumber(n + 1)}</span>
              <span className="order-word">{filled ? filled.label : ''}</span>
            </span>
          )
        })}
      </div>
      <div className={`order-items count-${options.length}`}>
        {options.map((option, n) => {
          const at = placed.indexOf(option.id)
          return (
            <button
              key={option.id}
              type="button"
              className={`order-item rise ${at >= 0 ? 'is-placed' : ''} ${shaking === option.id ? 'shake' : ''}`}
              style={order(n, { '--base-delay': '140ms' })}
              onClick={() => tap(option)}
              disabled={locked || at >= 0}
              aria-label={option.label}
              data-option={option.id}
            >
              {words ? (
                <span className="order-text">{option.label}</span>
              ) : (
                <PictureTile option={option} />
              )}
              {at >= 0 ? <span className="order-badge pop">{arabicNumber(at + 1)}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CheckButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`big-button big-button-leaf press check-button ${disabled ? 'is-waiting' : 'is-pulsing'}`} onClick={onClick} disabled={disabled}>
      تحقّق
    </button>
  )
}

// ── «صل» ────────────────────────────────────────────────────────────────────
interface MatchBoardProps {
  question: Question
  locked: boolean
  onHit: () => void
  onMiss: () => void
  onDone: (mistakes: number, board: HTMLElement | null) => void
}

interface Line {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * The paper's «صل» exercise: group (أ) on the right, where Arabic reading starts, is chosen
 * first; group (ب) answers it, and each match is joined with a line from dot to dot.
 */
function MatchBoard({ question, locked, onHit, onMiss, onDone }: MatchBoardProps) {
  const seconds = useMemo(() => {
    // Never leave every partner directly opposite its pair.
    let order = shuffle(question.pairs)
    for (let tries = 0; tries < 6 && order.every((pair, n) => pair.id === question.pairs[n]!.id); tries += 1) order = shuffle(question.pairs)
    return order
  }, [question])
  const [selected, setSelected] = useState<string | null>(null)
  const [nudge, setNudge] = useState(false)
  const [matched, setMatched] = useState<string[]>([])
  const [shaking, setShaking] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const boardRef = useRef<HTMLDivElement>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())

  useLayoutEffect(() => {
    function measure() {
      const board = boardRef.current?.getBoundingClientRect()
      if (!board) return
      setLines(
        matched.flatMap((id) => {
          const a = refs.current.get(`first-${id}`)?.getBoundingClientRect()
          const b = refs.current.get(`second-${id}`)?.getBoundingClientRect()
          if (!a || !b) return []
          // Join the facing edges, whichever side each column is on.
          const aRight = a.left > b.left
          return [
            {
              id,
              x1: (aRight ? a.left - 7 : a.right + 7) - board.left,
              y1: a.top + a.height / 2 - board.top,
              x2: (aRight ? b.right + 7 : b.left - 7) - board.left,
              y2: b.top + b.height / 2 - board.top,
            },
          ]
        }),
      )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [matched])

  function chooseFirst(pair: Pair) {
    if (locked || matched.includes(pair.id)) return
    sfx.tap()
    setSelected(pair.id)
  }

  function answerSecond(pair: Pair) {
    if (locked || matched.includes(pair.id)) return
    if (!selected) {
      // Start from group (أ): point the child back to it.
      setNudge(true)
      window.setTimeout(() => setNudge(false), 650)
      return
    }
    onHit()
    if (selected === pair.id) {
      const done = [...matched, pair.id]
      setMatched(done)
      setSelected(null)
      if (done.length === question.pairs.length) window.setTimeout(() => onDone(mistakes, boardRef.current), 350)
      return
    }
    setMistakes((count) => count + 1)
    setShaking([`first-${selected}`, `second-${pair.id}`])
    setSelected(null)
    onMiss()
    window.setTimeout(() => setShaking([]), 450)
  }

  function cell(side: 'first' | 'second', pair: Pair, n: number) {
    const key = `${side}-${pair.id}`
    const colour = question.pairs.findIndex((entry) => entry.id === pair.id)
    const state = matched.includes(pair.id)
      ? `is-matched match-color-${colour}`
      : side === 'first' && selected === pair.id
        ? 'is-selected'
        : side === 'second' && !selected
          ? 'is-waiting'
          : ''
    const art = side === 'first' ? pair.first : pair.second
    return (
      <div key={key} className="match-slot rise" style={order(n + (side === 'second' ? 1 : 0), { '--base-delay': '140ms' })}>
        <button
          ref={(node) => {
            if (node) refs.current.set(key, node)
            else refs.current.delete(key)
          }}
          type="button"
          className={`match-item match-${side} ${optionKind(art)} ${state} ${shaking.includes(key) ? 'shake' : ''}`}
          onClick={() => (side === 'first' ? chooseFirst(pair) : answerSecond(pair))}
          disabled={locked}
          aria-label={side === 'first' ? pair.label : art.startsWith('txt:') ? art.slice(4) : 'صورة'}
          aria-pressed={side === 'first' ? selected === pair.id : undefined}
          data-pair={pair.id}
          data-side={side}
        >
          <span className="option-art" aria-hidden="true">
            <Art art={art} />
          </span>
          <span className="match-dot" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div ref={boardRef} className="match-board" dir="rtl">
      <svg className="match-lines" aria-hidden="true">
        {lines.map((line) => (
          <line
            key={line.id}
            className={`match-line match-color-${question.pairs.findIndex((pair) => pair.id === line.id)}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
          />
        ))}
      </svg>
      <div className={`match-column match-column-first ${nudge ? 'nudge' : ''}`}>
        <span className="match-head">المجموعة (أ)</span>
        {question.pairs.map((pair, n) => cell('first', pair, n))}
      </div>
      <div className="match-column">
        <span className="match-head">المجموعة (ب)</span>
        {seconds.map((pair, n) => cell('second', pair, n))}
      </div>
    </div>
  )
}
