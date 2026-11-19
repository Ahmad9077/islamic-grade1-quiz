import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Art, AyaMarker } from '../art/Art'
import { celebrate } from '../art/confetti'
import { useNarrator } from '../audio/NarratorContext'
import type { Cue } from '../audio/player'
import { sfx } from '../audio/sfx'
import { CHEERS, SURAHS, clip, roundClips, verse, type Line as Spoken, type Option, type Pair, type Question, type Subject } from '../data/catalog'
import { TONES, toneStyle, type ToneId } from '../data/tones'
import { arabicNumber } from '../domain/format'
import { arrangeOptions, shuffle, testSlot } from '../domain/round'
import { cheerFor, kindWord, sayLine } from '../domain/voice'
import type { Attempt } from '../hub/bridge'
import { ArrowIcon, BigButton, CloseButton, SpeakerButton, StarIcon, order } from './ui'

// Narration starts once the question has settled on screen.
const ASK_DELAY_MS = 380

const ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر']

export interface Round {
  id: number
  kind: 'practice' | 'test'
  subject: Subject
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

const surahOf = (number: number) => (number === SURAHS.masad.number ? SURAHS.masad : SURAHS.nasr)

export function QuizScreen({ round, intro, onExit, onFinish }: QuizScreenProps) {
  const narrator = useNarrator()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('asking')
  const [chosen, setChosen] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [speakingOption, setSpeakingOption] = useState<string | null>(null)
  // What was said after the answer: the cheer or the kind word, then what «إعادة» replays.
  const [said, setSaid] = useState<{ line: Spoken; replay: Cue[] }>({ line: CHEERS[0]!, replay: [] })
  const streak = useRef(0)
  const [confirmExit, setConfirmExit] = useState(false)
  const tileRefs = useRef(new Map<string, HTMLElement>())
  const optionsRef = useRef<HTMLDivElement>(null)

  const question = round.questions[index]!
  const options = useMemo(() => arrangeOptions(question), [question])
  const correctOption = question.options.find((option) => option.id === question.answer)
  const tone = round.kind === 'test' ? question.topic : round.tone
  const afterCues: Cue[] = question.after.map((id, n) => ({ clip: id, gap: n === 0 ? 450 : 250 }))
  // The question, then each written choice (or verse) while its tile lights up.
  const askCues = useMemo<Cue[]>(
    () => [
      ...question.ask.map((id, n) => ({ clip: id, gap: n === 0 ? 0 : 200, onStart: () => setSpeakingOption(null) })),
      ...(question.kind === 'pick' ? options : []).flatMap((option) => (option.clip ? [{ clip: option.clip, gap: 320, onStart: () => setSpeakingOption(option.id) }] : [])),
    ],
    [question, options],
  )

  // Load every clip of the round up front, so no question waits for its audio.
  useEffect(() => {
    narrator.preload(roundClips(round.questions))
  }, [narrator, round.questions])

  useEffect(() => {
    const opening = intro && index === 0 ? [{ clip: intro }, ...askCues.map((cue, n) => (n === 0 ? { ...cue, gap: 500 } : cue))] : askCues
    if (opening.length === 0) return
    const timer = window.setTimeout(() => {
      void narrator.play(opening).then(() => setSpeakingOption(null))
    }, ASK_DELAY_MS)
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

  function replayQuestion() {
    void narrator.play(askCues).then(() => setSpeakingOption(null))
  }

  function settle(correct: boolean, chosenId: string, anchor?: HTMLElement | null) {
    setPhase('answered')
    setSpeakingOption(null)
    setAttempts((list) => [...list, { questionKey: question.key, chosen: chosenId, correct }])
    if (correct) {
      sfx.correct()
      streak.current += 1
      const line = cheerFor(streak.current)
      setSaid({ line, replay: afterCues })
      celebrate(anchor ?? undefined, TONES[tone].tone)
      void narrator.play([{ clip: line.clip, gap: 300 }, ...afterCues])
    } else {
      sfx.wrong()
      streak.current = 0
      const line = question.kind === 'pick' ? kindWord() : sayLine('review')
      // A written right answer is read after the kind word; then the hadith, the verse or the sentence.
      const reveal: Cue[] = question.kind === 'pick' && correctOption?.clip && !correctOption.art.startsWith('aya:') ? [{ clip: correctOption.clip, gap: 160 }] : []
      setSaid({ line, replay: [...reveal, ...afterCues] })
      void narrator.play([{ clip: line.clip, gap: 450 }, ...reveal, ...afterCues])
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

  const tryAgain = () => {
    sfx.wrong()
    void narrator.play([{ clip: sayLine('again').clip }])
  }

  const lastCorrect = attempts.at(-1)?.correct ?? false
  const answered = phase === 'answered'
  const register = (id: string) => (node: HTMLElement | null) => {
    if (node) tileRefs.current.set(id, node)
    else tileRefs.current.delete(id)
  }

  // The paper's heading: «السؤال الأول :» in the mock test, the question's number in a lesson.
  const slot = round.kind === 'test' ? testSlot(round.subject, index) : null
  const heading = slot ? `السؤال ${ORDINALS[slot.slot - 1] ?? arabicNumber(slot.slot)}` : `السؤال ${ORDINALS[index] ?? arabicNumber(index + 1)}`
  const part = slot && slot.parts > 1 ? slot.part : null
  const tfMark = question.format === 'tf' && answered ? question.answer : null
  const pickStyle = question.pickStyle ?? 'ring'
  const optionState = (option: Option) => {
    const isChosen = chosen === option.id
    const isAnswer = option.id === question.answer
    if (!answered) return speakingOption === option.id ? 'is-speaking' : ''
    return isChosen ? (isAnswer ? 'is-correct' : 'is-wrong') : isAnswer ? 'is-reveal' : 'is-dim'
  }

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
          <p className="help-line">
            <SpeakerButton onClick={replayQuestion} label="إعادة السؤال" />
            <span>{question.help}</span>
          </p>
        </div>

        {question.cloze ? (
          <div className="hadith-card pop" style={order(0, { '--base-delay': '80ms' })}>
            <p className="hadith-lead">{question.cloze.lead}</p>
            <p className="hadith-text">
              <Gap
                before={`«${question.cloze.before}`}
                after={`${question.cloze.after}»`}
                blank={<span className={`hadith-blank ${answered ? 'is-filled' : ''}`}>{answered ? <span className="ink-word">{correctOption?.label}</span> : '\u00a0'}</span>}
              />
            </p>
          </div>
        ) : null}

        {question.verseGap ? (
          <div className="verse-card pop" style={order(0, { '--base-delay': '80ms' })}>
            <p className="verse-lead">قالَ تَعالى:</p>
            <p className="verse-text" lang="ar">
              <Gap
                before={`﴿${question.verseGap.before} `}
                after="﴾ "
                blank={<span className={`verse-blank ${answered ? 'is-filled' : ''}`}>{answered ? <span className="ink-word quran-ink">{correctOption?.label}</span> : '\u00a0'}</span>}
              />
              <AyaMarker n={question.verseGap.n} />
            </p>
          </div>
        ) : null}

        {question.aya && !question.aya.hidden ? (
          <div className="verse-card pop" style={order(0, { '--base-delay': '80ms' })}>
            <p className="verse-text" lang="ar">
              ﴿{verse(surahOf(question.aya.surah), question.aya.n)}﴾ <AyaMarker n={question.aya.n} />
            </p>
            <p className="verse-then">ما الآية التي بعدها؟</p>
          </div>
        ) : null}

        {question.aya?.hidden ? (
          <div className="listen-card pop" style={order(0, { '--base-delay': '80ms' })}>
            <button type="button" className="listen-button press" onClick={() => void narrator.play([{ clip: clip.aya(question.aya!.surah, question.aya!.n) }])}>
              <span className="listen-icon" aria-hidden="true">
                🎧
              </span>
              <span>استمع إلى الآية</span>
            </button>
            <p className="listen-reader">بصوت الشيخ مشاري العفاسي</p>
          </div>
        ) : null}

        {question.quranWord ? (
          <div className="word-card pop" style={order(0, { '--base-delay': '80ms' })}>
            <span className="word-quran" lang="ar">
              {question.quranWord}
            </span>
            <span className="word-ask">مَعْناها:</span>
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
            className={`options pick-${pickStyle} holds-${optionKind(options[0]?.art ?? '')} count-${options.length} ${options.some((option) => option.art.startsWith('txt:') && option.label.length > 16) ? 'has-long' : ''}`}
          >
            {options.map((option, n) => {
              const state = optionState(option)
              const marked = chosen === option.id || (answered && option.id === question.answer)
              return (
                <div key={option.id} className="option-slot rise" style={order(n, { '--base-delay': '140ms' })}>
                  <button
                    ref={register(option.id)}
                    type="button"
                    className={`option ${optionKind(option.art)} ${state} ${pickStyle === 'fill' && marked ? 'is-painted' : ''}`}
                    onClick={() => answer(option)}
                    disabled={answered}
                    aria-label={option.label}
                    data-option={option.id}
                  >
                    <span className="option-art" aria-hidden="true">
                      <Art art={option.art} />
                    </span>
                    {pickStyle === 'ring' && marked ? <InkRing tone={state === 'is-wrong' ? 'miss' : 'good'} /> : null}
                  </button>
                  {option.caption ? <span className="option-caption">{option.caption}</span> : null}
                  {pickStyle === 'tick' ? (
                    <span className={`tick-box ${marked ? `is-ticked ${state === 'is-wrong' ? 'tick-miss' : 'tick-good'}` : ''}`} aria-hidden="true">
                      {marked ? <span className="ink-mark pop">✓</span> : null}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : null}

        {question.kind === 'match' ? (
          <div ref={optionsRef} className="match-wrap">
            <MatchBoard question={question} locked={answered} onHit={() => sfx.tap()} onMiss={tryAgain} onDone={(mistakes, board) => settle(mistakes === 0, `mistakes:${mistakes}`, board)} />
          </div>
        ) : null}

        {question.kind === 'circle' ? (
          <div ref={optionsRef}>
            <CircleBoard question={question} options={options} locked={answered} onCheck={(picked, board) => settle(sameSet(picked, question.good), picked.join(',') || 'none', board)} />
          </div>
        ) : null}

        {question.kind === 'hub' ? (
          <div ref={optionsRef}>
            <HubBoard question={question} options={options} locked={answered} onCheck={(picked, board) => settle(sameSet(picked, question.good), picked.join(',') || 'none', board)} />
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
              onHit={(option) => {
                sfx.tap()
                if (option.clip) void narrator.play([{ clip: option.clip, gap: 120 }])
              }}
              onMiss={tryAgain}
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
                <p className="feedback-title">{said.line.text}</p>
              ) : question.kind !== 'pick' ? (
                <p className="feedback-title">{said.line.text}</p>
              ) : (
                <>
                  <p className="feedback-encourage">{said.line.text}</p>
                  {correctOption ? (
                    <span className={`feedback-answer ${optionKind(correctOption.art)}`} aria-label={correctOption.label}>
                      <Art art={correctOption.art} />
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </div>
          {question.explain ? (
            <ul className="feedback-facts">
              <li className="feedback-fact">{question.explain}</li>
            </ul>
          ) : null}
          <div className="feedback-actions">
            {said.replay.length > 0 ? <SpeakerButton onClick={() => void narrator.play(said.replay)} label="إعادة" /> : <span />}
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

// ── «صل سورة … بمكملاتها الصحيحة» ───────────────────────────────────────────
interface HubBoardProps {
  question: Question
  options: Option[]
  locked: boolean
  onCheck: (picked: string[], board: HTMLElement | null) => void
}

/** The book's star: the surah in the middle, four facts around it, joined to the middle with a line. */
function HubBoard({ question, options, locked, onCheck }: HubBoardProps) {
  const [picked, setPicked] = useState<string[]>([])
  const [lines, setLines] = useState<{ id: string; x1: number; y1: number; x2: number; y2: number }[]>([])
  const boardRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLSpanElement>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())
  const shown = locked ? [...new Set([...picked, ...question.good])] : picked

  useLayoutEffect(() => {
    function measure() {
      const board = boardRef.current?.getBoundingClientRect()
      const center = centerRef.current?.getBoundingClientRect()
      if (!board || !center) return
      setLines(
        shown.flatMap((id) => {
          const box = refs.current.get(id)?.getBoundingClientRect()
          if (!box) return []
          return [
            {
              id,
              x1: center.left + center.width / 2 - board.left,
              y1: center.top + center.height / 2 - board.top,
              x2: box.left + box.width / 2 - board.left,
              y2: box.top + box.height / 2 - board.top,
            },
          ]
        }),
      )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `shown` follows picked and locked
  }, [picked, locked])

  function toggle(id: string) {
    if (locked) return
    sfx.tap()
    setPicked((list) => (list.includes(id) ? list.filter((other) => other !== id) : [...list, id]))
  }

  const lineState = (id: string) => (locked ? (question.good.includes(id) ? (picked.includes(id) ? 'is-correct' : 'is-reveal') : 'is-wrong') : '')

  return (
    <div className="hub-wrap">
      <div ref={boardRef} className="hub-board">
        <svg className="hub-lines" aria-hidden="true">
          {lines.map((line) => (
            <line key={line.id} className={`hub-line ${lineState(line.id)}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
          ))}
        </svg>
        <span ref={centerRef} className="hub-center pop">
          {question.hubCenter}
        </span>
        {options.map((option, n) => {
          const isPicked = picked.includes(option.id)
          const isGood = question.good.includes(option.id)
          const state = locked ? (isPicked ? (isGood ? 'is-correct' : 'is-wrong') : isGood ? 'is-reveal' : 'is-dim') : isPicked ? 'is-picked' : ''
          return (
            <button
              key={option.id}
              ref={(node) => {
                if (node) refs.current.set(option.id, node)
                else refs.current.delete(option.id)
              }}
              type="button"
              className={`hub-item hub-item-${n + 1} rise ${state}`}
              style={order(n, { '--base-delay': '160ms' })}
              onClick={() => toggle(option.id)}
              disabled={locked}
              aria-pressed={isPicked}
              aria-label={option.label}
              data-option={option.id}
            >
              <Art art={option.art} />
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

/**
 * A sentence with its missing word: the blank stays on one line with the word before it, so a
 * line break can never move it away from its place in the right-to-left text.
 */
function Gap({ before, after, blank }: { before: string; after: string; blank: ReactNode }) {
  const trimmed = before.trimEnd()
  const at = trimmed.lastIndexOf(' ')
  const head = at < 0 ? '' : trimmed.slice(0, at + 1)
  const word = at < 0 ? trimmed : trimmed.slice(at + 1)
  return (
    <>
      {head}
      <span className="gap-keep">
        {word} {blank}
      </span>
      {after}
    </>
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
  const colours = question.marks === 'colour'
  const glyph = (yes: boolean) => (colours ? '' : yes ? '✓' : '✗')
  const word = (yes: boolean) => (colours ? (yes ? 'أخضر' : 'أزرق') : yes ? 'صح' : 'خطأ')

  function choose(id: string, yes: boolean) {
    if (locked) return
    sfx.tap()
    setMarks((current) => ({ ...current, [id]: yes }))
  }

  const done = options.every((option) => option.id in marks)

  return (
    <div ref={boardRef} className={`picture-board mark-board count-${options.length} ${colours ? 'uses-colours' : ''}`}>
      <div className="picture-grid">
        {options.map((option, n) => {
          const mine = marks[option.id]
          const truth = question.good.includes(option.id)
          const state = locked ? (mine === truth ? 'is-correct' : 'is-wrong') : ''
          const paint = colours && mine !== undefined ? `paint-${mine ? 'green' : 'blue'}` : ''
          return (
            <div key={option.id} className={`mark-cell rise ${state} ${paint}`} style={order(n, { '--base-delay': '140ms' })} data-option={option.id}>
              <PictureTile option={option} />
              {colours ? null : (
                <span className="mark-slot" aria-hidden="true">
                  (<span className={`slot-mark ${mine !== undefined ? 'ink-mark' : ''} ${mine === undefined ? '' : `mark-${mine ? 'yes' : 'no'}`}`}>{mine === undefined ? '' : glyph(mine)}</span>)
                </span>
              )}
              {locked ? (
                mine !== truth ? <span className={`mark-truth ${colours ? `truth-${truth ? 'green' : 'blue'}` : ''}`}>{colours ? (truth ? 'برّي' : 'بحري') : glyph(truth)}</span> : null
              ) : (
                <span className="mark-choices">
                  {[true, false].map((yes) => (
                    <button
                      key={String(yes)}
                      type="button"
                      className={`mark-choice press mark-choice-${yes ? 'yes' : 'no'} ${colours ? `crayon crayon-${yes ? 'green' : 'blue'}` : ''} ${mine === yes ? 'is-on' : ''}`}
                      onClick={() => choose(option.id, yes)}
                      aria-label={`${option.label}: ${word(yes)}`}
                      aria-pressed={mine === yes}
                      data-mark={yes ? 'yes' : 'no'}
                    >
                      {colours ? <span className="crayon-tip" aria-hidden="true" /> : glyph(yes)}
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
  onHit: (option: Option) => void
  onMiss: () => void
  onDone: (mistakes: number, board: HTMLElement | null) => void
}

function OrderBoard({ question, options, locked, onHit, onMiss, onDone }: OrderBoardProps) {
  const [placed, setPlaced] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [shaking, setShaking] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const words = !options.some((option) => option.art.startsWith('pic:'))
  const verses = question.format === 'ayat'

  function tap(option: Option) {
    if (locked || placed.includes(option.id)) return
    const expected = question.options[placed.length]
    if (option.id === expected?.id) {
      onHit(option)
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
    <div ref={boardRef} className={`order-board ${verses ? 'order-verses' : words ? 'order-words' : 'order-pictures'}`}>
      {verses ? null : (
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
      )}
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
              {verses ? (
                <>
                  <span className="order-verse">
                    <Art art={option.art} />
                  </span>
                  <span className="order-bracket" aria-hidden="true">
                    (<span className={at >= 0 ? 'ink-mark pop' : ''}>{at >= 0 ? arabicNumber(at + 1) : '\u00a0'}</span>)
                  </span>
                </>
              ) : words ? (
                <span className="order-text">{option.label}</span>
              ) : (
                <PictureTile option={option} />
              )}
              {at >= 0 && !verses ? <span className="order-badge pop">{arabicNumber(at + 1)}</span> : null}
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
