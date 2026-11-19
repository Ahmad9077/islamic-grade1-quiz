import { QUESTIONS, TOPICS, dressQuestion, subjectOf, type Format, type Option, type Question, type Random, type Subject, type TopicId } from '../data/catalog'
import { dressRound } from './voice'
import { shuffle } from './variety'

export { shuffle }
export type { Random }

export const PRACTICE_SIZE = 8

/**
 * The mock tests, laid out like the school's papers. Each entry is one question of the test;
 * `slot` is the paper's «السؤال الأول، الثاني…» it belongs to.
 */
export const TEST_PLANS: Record<Subject, { slot: number; formats: Format[] }[]> = {
  // The Islamic education paper: the hadith first, ✓/✗ sentences, a «صل» board, «حوّط» questions, pictures.
  islamic: [
    { slot: 1, formats: ['cloze'] },
    { slot: 1, formats: ['cloze'] },
    { slot: 2, formats: ['tf'] },
    { slot: 2, formats: ['tf'] },
    { slot: 3, formats: ['match'] },
    { slot: 4, formats: ['choose'] },
    { slot: 4, formats: ['choose'] },
    { slot: 5, formats: ['circle', 'mark', 'colour', 'picture'] },
    { slot: 6, formats: ['order', 'fill'] },
  ],
  // The Quran book's evaluations: complete the verse, number the verses, meanings, the surah's type and facts.
  quran: [
    { slot: 1, formats: ['verse'] },
    { slot: 1, formats: ['verse'] },
    { slot: 2, formats: ['ayat'] },
    { slot: 3, formats: ['match', 'meaning'] },
    { slot: 4, formats: ['tick', 'hub'] },
    { slot: 5, formats: ['fill', 'choose'] },
    { slot: 6, formats: ['tf'] },
    { slot: 7, formats: ['next', 'listen', 'letter'] },
  ],
}

export function testSize(subject: Subject): number {
  return TEST_PLANS[subject].length
}

/** A lesson round: shorter when its questions are long boards. */
export function practiceSize(topic: TopicId): number {
  return Math.min(PRACTICE_SIZE, questionsFor(topic).length)
}

/** Hub-preferred keys first (in plan order), then questions not seen recently, then the rest. */
export function orderQuestions(pool: readonly Question[], preferredKeys: readonly string[], recentKeys: readonly string[], random: Random = Math.random): Question[] {
  const byKey = new Map(pool.map((question) => [question.key, question]))
  const preferred = preferredKeys.map((key) => byKey.get(key)).filter((q): q is Question => Boolean(q))
  const used = new Set(preferred.map((question) => question.key))
  const recent = new Set(recentKeys)
  const rest = shuffle(
    pool.filter((question) => !used.has(question.key)),
    random,
  )
  const fresh = rest.filter((question) => !recent.has(question.key))
  const stale = rest.filter((question) => recent.has(question.key))
  return [...preferred, ...fresh, ...stale]
}

export function questionsFor(topic: TopicId): Question[] {
  return QUESTIONS.filter((question) => question.topic === topic)
}

export function buildPractice(topic: TopicId, preferredKeys: readonly string[] = [], recentKeys: readonly string[] = [], random: Random = Math.random): Question[] {
  const ordered = orderQuestions(questionsFor(topic), preferredKeys, recentKeys, random)
  const size = practiceSize(topic)
  // At most two of any one style, so a lesson round shows the paper's different questions.
  const counts = new Map<Format, number>()
  const chosen: Question[] = []
  for (const question of ordered) {
    if (chosen.length >= size) break
    const seen = counts.get(question.format) ?? 0
    if (seen >= 2) continue
    counts.set(question.format, seen + 1)
    chosen.push(question)
  }
  for (const question of ordered) if (chosen.length < size && !chosen.includes(question)) chosen.push(question)
  return dressRound(
    mixKinds(chosen, random).map((question) => dressQuestion(question, random)),
    random,
  )
}

/** One question per entry of the subject's plan, spreading its lessons as evenly as the plan allows. */
export function buildTest(subject: Subject, preferredKeys: readonly string[] = [], recentKeys: readonly string[] = [], random: Random = Math.random): Question[] {
  const pool = QUESTIONS.filter((question) => subjectOf(question.topic) === subject)
  const ordered = orderQuestions(pool, preferredKeys, recentKeys, random)
  const picked: Question[] = []
  const perTopic = new Map<TopicId, number>()
  for (const entry of TEST_PLANS[subject]) {
    const candidates = ordered.filter((question) => entry.formats.includes(question.format) && !picked.includes(question))
    const least = Math.min(...candidates.map((question) => perTopic.get(question.topic) ?? 0))
    const pick = candidates.find((question) => (perTopic.get(question.topic) ?? 0) === least) ?? candidates[0]!
    picked.push(pick)
    perTopic.set(pick.topic, (perTopic.get(pick.topic) ?? 0) + 1)
  }
  return dressRound(
    picked.map((question) => dressQuestion(question, random)),
    random,
  )
}

/** The paper's question number for a test question. */
export function testSlot(subject: Subject, index: number): { slot: number; part: number; parts: number } {
  const plan = TEST_PLANS[subject]
  const entry = plan[index]
  if (!entry) return { slot: index + 1, part: 1, parts: 1 }
  const same = plan.filter((other) => other.slot === entry.slot)
  return { slot: entry.slot, part: plan.slice(0, index + 1).filter((other) => other.slot === entry.slot).length, parts: same.length }
}

/**
 * Avoid runs of the same question style so a round keeps changing pace: each step takes a style
 * other than the last one, preferring the style with the most questions left, so none bunch up at the end.
 */
function mixKinds(questions: Question[], random: Random): Question[] {
  const result: Question[] = []
  const pool = shuffle(questions, random)
  while (pool.length > 0) {
    const last = result.at(-1)?.format
    const left = new Map<Format, number>()
    for (const question of pool) left.set(question.format, (left.get(question.format) ?? 0) + 1)
    let pickIndex = -1
    for (const [n, question] of pool.entries()) {
      if (question.format === last) continue
      if (pickIndex === -1 || left.get(question.format)! > left.get(pool[pickIndex]!.format)!) pickIndex = n
    }
    result.push(...pool.splice(pickIndex === -1 ? 0 : pickIndex, 1))
  }
  return result
}

/** Choices are shuffled every time; «صح» stays before «خطأ», and numbers stay in order. */
export function arrangeOptions(question: Question, random: Random = Math.random): Option[] {
  if (question.kind === 'pick') return question.fixedOrder ? [...question.options] : shuffle(question.options, random)
  if (question.kind === 'order') {
    // Never leave the items already in their right order.
    let order = shuffle(question.options, random)
    for (let tries = 0; tries < 8 && order.every((option, n) => option.id === question.options[n]!.id); tries += 1) order = shuffle(question.options, random)
    return order
  }
  if (question.kind === 'hub') return shuffle(question.options, random)
  return [...question.options]
}

export function starsFor(score: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1
  const ratio = score / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.6) return 2
  return 1
}

export const TOPIC_IDS = TOPICS.map((topic) => topic.id)
