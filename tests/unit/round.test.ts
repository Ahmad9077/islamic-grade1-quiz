import { describe, expect, it } from 'vitest'
import { QUESTIONS, TOPICS, subjectOf } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLANS, arrangeOptions, buildPractice, buildTest, orderQuestions, starsFor, testSize, testSlot } from '../../src/domain/round'

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

describe('rounds', () => {
  it('builds a lesson round from that lesson only, with varied styles', () => {
    for (const topic of TOPICS) {
      for (let n = 1; n <= 20; n += 1) {
        const round = buildPractice(topic.id, [], [], seeded(n))
        expect(round).toHaveLength(PRACTICE_SIZE)
        expect(new Set(round.map((q) => q.key)).size).toBe(PRACTICE_SIZE)
        expect(round.every((q) => q.topic === topic.id)).toBe(true)
        const counts = new Map<string, number>()
        for (const q of round) counts.set(q.format, (counts.get(q.format) ?? 0) + 1)
        expect(Math.max(...counts.values())).toBeLessThanOrEqual(2)
        for (let k = 1; k < round.length; k += 1) expect(round[k]!.format, `${topic.id} ${k}`).not.toBe(round[k - 1]!.format)
      }
    }
  })

  it('builds each mock test from its own subject, following its plan', () => {
    for (const subject of ['islamic', 'quran'] as const) {
      for (let n = 1; n <= 20; n += 1) {
        const test = buildTest(subject, [], [], seeded(n))
        expect(test).toHaveLength(testSize(subject))
        expect(test.every((q) => subjectOf(q.topic) === subject)).toBe(true)
        test.forEach((q, k) => expect(TEST_PLANS[subject][k]!.formats, `${subject} ${k}`).toContain(q.format))
        const topics = new Set(test.map((q) => q.topic))
        expect(topics.size).toBe(subject === 'islamic' ? 3 : 2)
      }
    }
  })

  it('opens the Islamic paper with the hadith and the Quran paper with completing a verse', () => {
    expect(TEST_PLANS.islamic[0]!.formats).toEqual(['cloze'])
    expect(TEST_PLANS.quran[0]!.formats).toEqual(['verse'])
    expect(testSlot('islamic', 0)).toEqual({ slot: 1, part: 1, parts: 2 })
    expect(testSlot('islamic', 3)).toEqual({ slot: 2, part: 2, parts: 2 })
    expect(testSlot('quran', 2)).toEqual({ slot: 2, part: 1, parts: 1 })
  })

  it('gives every question a spoken line, and no line of a style twice in a round', () => {
    for (let n = 1; n <= 10; n += 1) {
      const round = buildTest('islamic', [], [], seeded(n))
      const said = new Map<string, string[]>()
      for (const q of round) {
        expect(q.ask[0]).toMatch(new RegExp(`^ar/q/${q.format}-\\d$`))
        expect(q.help).toBeTruthy()
        const list = said.get(q.format) ?? []
        expect(list).not.toContain(q.ask[0])
        said.set(q.format, [...list, q.ask[0]!])
      }
    }
  })

  it('puts Hub-preferred questions first and recent ones last', () => {
    const pool = QUESTIONS.filter((q) => q.topic === 'iman')
    const ordered = orderQuestions(pool, [pool[5]!.key], [pool[0]!.key], seeded(3))
    expect(ordered[0]!.key).toBe(pool[5]!.key)
    expect(ordered.at(-1)!.key).toBe(pool[0]!.key)
  })

  it('keeps ✓ before ✗, numbers in order, and never shows an order question already solved', () => {
    for (const q of QUESTIONS) {
      for (let n = 1; n <= 5; n += 1) {
        const shown = arrangeOptions(q, seeded(n))
        if (q.fixedOrder && q.kind === 'pick') expect(shown.map((o) => o.id)).toEqual(q.options.map((o) => o.id))
        if (q.kind === 'order') expect(shown.map((o) => o.id)).not.toEqual(q.options.map((o) => o.id))
      }
    }
  })

  it('gives stars for the share of right answers', () => {
    expect(starsFor(8, 8)).toBe(3)
    expect(starsFor(5, 8)).toBe(2)
    expect(starsFor(3, 8)).toBe(1)
  })
})
