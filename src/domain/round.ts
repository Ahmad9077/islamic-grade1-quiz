import { QUESTIONS, dressQuestion, type Format, type Option, type Question, type TopicId } from '../data/catalog'

export const PRACTICE_SIZE = 8

/**
 * The mock test, laid out like the school's model papers: the hadith first, then ✓/✗ sentences,
 * a «صل» board, «حوّط» questions, and the picture questions. Each entry is one question of the
 * test, and `slot` is the paper's «السؤال الأول، الثاني…» it belongs to.
 */
export const TEST_PLAN: { slot: number; formats: Format[] }[] = [
  { slot: 1, formats: ['cloze'] },
  { slot: 2, formats: ['tf'] },
  { slot: 2, formats: ['tf'] },
  { slot: 3, formats: ['match'] },
  { slot: 4, formats: ['choose'] },
  { slot: 4, formats: ['choose'] },
  { slot: 5, formats: ['circle', 'mark'] },
  { slot: 6, formats: ['picture', 'order'] },
]
export const TEST_SIZE = TEST_PLAN.length

export type Random = () => number

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}

/** Hub-preferred keys first (in plan order), then questions not seen recently, then the rest. */
export function orderQuestions(
  pool: readonly Question[],
  preferredKeys: readonly string[],
  recentKeys: readonly string[],
  random: Random = Math.random,
): Question[] {
  const byKey = new Map(pool.map((question) => [question.key, question]))
  const preferred = preferredKeys.map((key) => byKey.get(key)).filter((q): q is Question => Boolean(q))
  const used = new Set(preferred.map((question) => question.key))
  const recent = new Set(recentKeys)
  const rest = shuffle(pool.filter((question) => !used.has(question.key)), random)
  const fresh = rest.filter((question) => !recent.has(question.key))
  const stale = rest.filter((question) => recent.has(question.key))
  return [...preferred, ...fresh, ...stale]
}

export function questionsFor(topic: TopicId): Question[] {
  return QUESTIONS.filter((question) => question.topic === topic)
}

export function buildPractice(
  topic: TopicId,
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const ordered = orderQuestions(questionsFor(topic), preferredKeys, recentKeys, random)
  // At most two of any one style, so a lesson round shows the paper's different questions.
  const counts = new Map<Format, number>()
  const chosen: Question[] = []
  for (const question of ordered) {
    if (chosen.length >= PRACTICE_SIZE) break
    const seen = counts.get(question.format) ?? 0
    if (seen >= 2) continue
    counts.set(question.format, seen + 1)
    chosen.push(question)
  }
  for (const question of ordered) if (chosen.length < PRACTICE_SIZE && !chosen.includes(question)) chosen.push(question)
  return mixKinds(chosen, random).map((question) => dressQuestion(question, random))
}

/** One question per entry of the plan, spreading the five lessons as evenly as the plan allows. */
export function buildTest(
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const ordered = orderQuestions(QUESTIONS, preferredKeys, recentKeys, random)
  const picked: Question[] = []
  const perTopic = new Map<TopicId, number>()
  for (const entry of TEST_PLAN) {
    const candidates = ordered.filter((question) => entry.formats.includes(question.format) && !picked.includes(question))
    const least = Math.min(...candidates.map((question) => perTopic.get(question.topic) ?? 0))
    const pick = candidates.find((question) => (perTopic.get(question.topic) ?? 0) === least) ?? candidates[0]!
    picked.push(pick)
    perTopic.set(pick.topic, (perTopic.get(pick.topic) ?? 0) + 1)
  }
  return picked.map((question) => dressQuestion(question, random))
}

/** The paper's question number for a test question. */
export function testSlot(index: number): { slot: number; part: number; parts: number } {
  const entry = TEST_PLAN[index]
  if (!entry) return { slot: index + 1, part: 1, parts: 1 }
  const same = TEST_PLAN.filter((other) => other.slot === entry.slot)
  return { slot: entry.slot, part: TEST_PLAN.slice(0, index + 1).filter((other) => other.slot === entry.slot).length, parts: same.length }
}

/** Avoid runs of the same question style so a round keeps changing pace. */
function mixKinds(questions: Question[], random: Random): Question[] {
  const result: Question[] = []
  const pool = shuffle(questions, random)
  while (pool.length > 0) {
    const last = result.at(-1)
    const index = pool.findIndex((question) => question.format !== last?.format)
    const pickIndex = index === -1 ? 0 : index
    result.push(...pool.splice(pickIndex, 1))
  }
  return result
}

/** Choices are shuffled every time; «صح» stays before «خطأ». */
export function arrangeOptions(question: Question, random: Random = Math.random): Option[] {
  if (question.kind === 'pick') return question.fixedOrder ? [...question.options] : shuffle(question.options, random)
  if (question.kind === 'order') {
    // Never leave the items already in their right order.
    let order = shuffle(question.options, random)
    for (let tries = 0; tries < 8 && order.every((option, n) => option.id === question.options[n]!.id); tries += 1) order = shuffle(question.options, random)
    return order
  }
  return [...question.options]
}

export function starsFor(score: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1
  const ratio = score / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.6) return 2
  return 1
}
