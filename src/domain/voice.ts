import { ASK_LINES, CHEERS, RETRIES, STREAKS, arLines, clip, shown, type ArGroup, type Line, type Question, type Random } from '../data/catalog'
import { deck } from './variety'

/**
 * The question with its style's next line: said aloud first and shown under the instruction.
 * `avoid` holds the lines of this style already said in the round.
 */
export function voiceQuestion(question: Question, random: Random = Math.random, avoid: readonly number[] = []): { question: Question; line: number } {
  const texts = ASK_LINES[question.format]
  const n = deck(`ask:${question.format}`, texts.map((_, k) => k)).next(random, avoid)
  return { question: { ...question, ask: [clip.line(question.format, n), ...question.ask.slice(1)], help: shown(texts[n]!) }, line: n }
}

/** Gives every question of a round its spoken line, so no line of a style comes twice in one round. */
export function dressRound(questions: Question[], random: Random = Math.random): Question[] {
  const said = new Map<string, number[]>()
  return questions.map((question) => {
    const avoid = said.get(question.format) ?? []
    const { question: voiced, line } = voiceQuestion(question, random, avoid)
    said.set(question.format, [...avoid, line])
    return voiced
  })
}

/** One of Maryam's lines for a moment, never the one said last time. */
export function sayLine(group: ArGroup, random: Random = Math.random): Line {
  return deck(`ar:${group}`, arLines(group)).next(random)
}

/** The cheer for a right answer: a streak cheer on the third and fifth right answer running, otherwise any cheer. */
export function cheerFor(streak: number, random: Random = Math.random): Line {
  const streakLines = STREAKS[streak]
  if (streakLines) return deck(`streak:${streak}`, streakLines).next(random)
  return deck('cheer', CHEERS).next(random)
}

/** The kind word after a wrong choice. */
export function kindWord(random: Random = Math.random): Line {
  return deck('retry', RETRIES).next(random)
}

/** The line at the end of a round. */
export function doneLine(great: boolean, random: Random = Math.random): Line {
  return sayLine(great ? 'done-great' : 'done-good', random)
}
