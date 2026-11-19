import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  AR_LINES,
  ASK_LINES,
  CHEERS,
  HADITH,
  PICS,
  QUESTIONS,
  QUIZ_ID,
  RETRIES,
  STREAKS,
  SURAHS,
  TOPICS,
  audioCues,
  clip,
  laylaTexts,
  questionClips,
  roundClips,
  type Format,
  type Question,
} from '../../src/data/catalog'
import { MASAD, NASR } from '../../src/data/quran'
import { PRACTICE_SIZE, TEST_PLANS } from '../../src/domain/round'

const byKey = (key: string) => QUESTIONS.find((q) => q.key === key)!
const right = (q: Question) => q.options.find((o) => o.id === q.answer)!
const allOptions = (q: Question) => [...q.options, ...(q.draw ? [...q.draw.right, ...q.draw.wrong] : []), ...(q.pictureDraw ? [...q.pictureDraw.good, ...q.pictureDraw.bad] : [])]
const allArt = (q: Question) => [...allOptions(q).map((o) => o.art), ...q.pairs.flatMap((p) => [p.first, p.second])]
const tanzil = (n: number) => JSON.parse(fs.readFileSync(`src/data/tanzil/${n}.json`, 'utf8')) as { name: string; verses: { text: string }[] }

describe('question bank', () => {
  it('uses the permanent quiz id', () => {
    expect(QUIZ_ID).toBe('islamic-grade1')
  })

  it('has unique, well-formed permanent keys', () => {
    const keys = QUESTIONS.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const q of QUESTIONS) expect(q.key, q.key).toMatch(new RegExp(`^${q.topic}:${q.format}-[a-z0-9-]+$`))
  })

  it('matches the Hub seed key for key', () => {
    const seeded = fs.readFileSync('integration/seed-islamic-grade1.sql', 'utf8').match(/\('islamic-grade1', '([a-z]+:[a-z0-9-]+)'/g) ?? []
    expect(seeded.map((row) => row.split("'")[3]).sort()).toEqual(QUESTIONS.map((q) => q.key).sort())
  })

  it("covers the school card's five lessons, three for Tuesday and two for Wednesday", () => {
    expect(TOPICS.map((t) => [t.id, t.subject])).toEqual([
      ['khaliq', 'islamic'],
      ['iman', 'islamic'],
      ['tawhid', 'islamic'],
      ['masad', 'quran'],
      ['nasr', 'quran'],
    ])
    for (const topic of TOPICS) expect(QUESTIONS.filter((q) => q.topic === topic.id).length, topic.id).toBeGreaterThanOrEqual(PRACTICE_SIZE + 8)
  })

  it('has enough questions of every style for both mock tests', () => {
    for (const [subject, plan] of Object.entries(TEST_PLANS)) {
      const pool = QUESTIONS.filter((q) => TOPICS.find((t) => t.id === q.topic)!.subject === subject)
      const needed = new Map<string, number>()
      for (const entry of plan) needed.set(entry.formats.join('|'), (needed.get(entry.formats.join('|')) ?? 0) + 1)
      for (const [formats, count] of needed) expect(pool.filter((q) => formats.split('|').includes(q.format)).length, `${subject} ${formats}`).toBeGreaterThanOrEqual(count * 2)
    }
  })

  it("prints the paper's own instruction above every question", () => {
    for (const q of QUESTIONS) {
      expect(q.instruction, q.key).toMatch(/^(أكمل|ضع|صل|حوّط|لوّن|ظلّل|رتّب|أعد|استمع)/)
      // Printed like the paper: no vowel marks, only the shadda of «حوّط», «لوّن», «ظلّل»…
      expect(q.instruction.replace(/\(.*?\)/g, ''), q.key).not.toMatch(/[ً-ِْٰ]/)
    }
  })

  it('gives every choice question one right answer among two to four distinct options', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'pick')) {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size, q.key).toBe(ids.length)
      expect(ids, q.key).toContain(q.answer)
      expect(q.options.length, q.key).toBeGreaterThanOrEqual(2)
      expect(q.options.length, q.key).toBeLessThanOrEqual(4)
      expect(q.explain.length, q.key).toBeGreaterThan(0)
      expect(q.difficulty, q.key).toBeGreaterThanOrEqual(5)
      expect(q.difficulty, q.key).toBeLessThanOrEqual(45)
      expect(q.skills[0], q.key).toBe(q.topic)
      expect(q.skills, q.key).toContain(`format_${q.format}`)
    }
  })

  it('uses only pictures that exist', () => {
    for (const q of QUESTIONS) {
      for (const art of allArt(q).filter((a) => a.startsWith('pic:'))) {
        const id = art.slice(4)
        expect(Object.keys(PICS), q.key).toContain(id)
        expect(fs.existsSync(`public/pics/${id}.jpg`), id).toBe(true)
      }
    }
    for (const id of Object.keys(PICS)) expect(fs.existsSync(`public/pics/${id}.jpg`), id).toBe(true)
  })

  it('gives every board what it needs', () => {
    for (const q of QUESTIONS) {
      if (q.kind === 'circle' || q.kind === 'mark') expect(q.pictureDraw!.goodCount + q.pictureDraw!.badCount, q.key).toBeGreaterThanOrEqual(3)
      if (q.kind === 'hub') expect(q.good.length, q.key).toBe(2)
      if (q.kind === 'match') expect(q.pairs.length, q.key).toBeGreaterThanOrEqual(2)
      if (q.kind === 'order') expect(q.options.length, q.key).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('the books', () => {
  it('keeps the hadiths and the supplication word for word as the book prints them', () => {
    expect(HADITH.iman.text).toBe('أَنْ تُؤْمِنَ بِاللهِ وَمَلائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَاليَوْمِ الآخِرِ، وَتُؤْمِنَ بِالقَدَرِ خَيْرِهِ وَشَرِّهِ')
    expect(HADITH.tawhid.text).toBe('ما مِنْ عَبْدٍ قالَ: لا إِلَهَ إِلّا اللهُ، ثُمَّ ماتَ عَلى ذَلِكَ إِلّا دَخَلَ الجَنَّةَ')
    expect(HADITH.dua.text).toBe('اللَّهُمَّ أَحْسَنْتَ خَلْقي فَأَحْسِنْ خُلُقي')
  })

  it('leaves out one word of a hadith, and the right word puts it back exactly', () => {
    const texts = Object.values(HADITH).map((h) => h.text as string)
    for (const q of QUESTIONS.filter((entry) => entry.format === 'cloze')) {
      const { before, after } = q.cloze!
      expect(texts, q.key).toContain(`${before}${right(q).label}${after}`)
      expect(q.options.find((o) => o.id !== q.answer)!.label, q.key).not.toBe(right(q).label)
    }
  })

  it('never writes a wrong choice that would turn the word of tawhid into something else', () => {
    for (const q of QUESTIONS) for (const o of allOptions(q)) expect(o.label, q.key).not.toMatch(/^إِلّا (?!اللهُ)/)
  })

  it('has the Quran text exactly as Tanzil gives it (the Hub uses the same files)', () => {
    expect(MASAD.verses).toEqual(tanzil(111).verses.map((v) => v.text))
    expect(NASR.verses).toEqual(tanzil(110).verses.map((v) => v.text))
    expect(SURAHS.masad.verses).toHaveLength(5)
    expect(SURAHS.nasr.verses).toHaveLength(3)
    const hub = (n: number) => JSON.parse(fs.readFileSync(`../quizzes-hub/quran/data/${n}.json`, 'utf8')) as { verses: { text: string }[] }
    if (fs.existsSync('../quizzes-hub/quran/data/111.json')) {
      expect(MASAD.verses).toEqual(hub(111).verses.map((v) => v.text))
      expect(NASR.verses).toEqual(hub(110).verses.map((v) => v.text))
    }
  })

  it('completes a verse only with words that are in the Quran, and the right word gives back the verse', () => {
    const allWords = new Set([...MASAD.verses, ...NASR.verses, 'وَٱلْفَجْرِ'].flatMap((v) => v.split(' ')))
    for (const q of QUESTIONS.filter((entry) => entry.format === 'verse')) {
      const surah = q.verseGap!.surah === 111 ? MASAD : NASR
      expect(`${q.verseGap!.before} ${right(q).label}`, q.key).toBe(surah.verses[q.verseGap!.n - 1])
      for (const o of allOptions(q)) expect(allWords.has(o.label), `${q.key} ${o.label}`).toBe(true)
    }
  })

  it('shows verse choices as whole Tanzil verses, never with their numbers', () => {
    for (const q of QUESTIONS) {
      for (const o of allOptions(q).filter((entry) => entry.art.startsWith('aya:'))) {
        const [, s, n] = o.art.split(':')
        const surah = Number(s) === 111 ? MASAD : NASR
        expect(o.label, q.key).toBe(surah.verses[Number(n) - 1])
        expect(o.clip, q.key).toBe(clip.aya(Number(s), Number(n)))
      }
    }
  })

  it('answers as the books do', () => {
    expect(right(byKey('iman:choose-count')).label).toBe('سِتَّةٌ')
    expect(right(byKey('tawhid:choose-kalima')).label).toBe('لا إِلَهَ إِلّا اللهُ')
    expect(byKey('masad:tick-type').answer).toBe('makki')
    expect(byKey('nasr:tick-type').answer).toBe('madani')
    expect(right(byKey('masad:fill-verses')).label).toBe('٥')
    expect(right(byKey('nasr:fill-verses')).label).toBe('٣')
    expect(byKey('masad:hub-facts').good.sort()).toEqual(['a5', 'makki'])
    expect(byKey('nasr:hub-facts').good.sort()).toEqual(['a3', 'madani'])
    expect(right(byKey('masad:fill-place-masad')).label).toBe('آخِرُ السّورَةِ')
    expect(right(byKey('masad:meaning-tabbat')).label).toBe('هَلَكَتْ')
    expect(right(byKey('nasr:meaning-afwaj')).label).toBe('جَماعاتٌ')
    expect(byKey('nasr:verse-1').options.map((o) => o.label).sort()).toEqual(['وَٱلْفَتْحُ', 'وَٱلْفَجْرِ'].sort())
  })
})

describe('narration', () => {
  const cues = audioCues()
  const ids = new Set(cues.map((c) => c.id))
  const recorded = (id: string) => ids.has(id) || id.startsWith('quran/') || id.startsWith('fs/name/')

  it('never sends the Quran to a speech engine', () => {
    const quranWords = [...MASAD.verses, ...NASR.verses]
    for (const cue of cues) for (const verse of quranWords) expect(cue.text, cue.id).not.toContain(verse)
    for (const cue of cues) expect(cue.text, cue.id).not.toMatch(/\u0671|\u06E5|\u06ED/)
  })

  it('has a recording for every clip a question plays', () => {
    for (const q of QUESTIONS) for (const id of [...q.ask.slice(1), ...questionClips(q)]) expect(recorded(id), `${q.key} ${id}`).toBe(true)
    for (const id of roundClips(QUESTIONS)) expect(recorded(id), id).toBe(true)
  })

  it('has the bundled recitation and letter names', () => {
    for (const q of QUESTIONS) for (const id of questionClips(q).filter((c) => c.startsWith('quran/') || c.startsWith('fs/name/'))) expect(fs.existsSync(`public/audio/${id}.mp3`), id).toBe(true)
  })

  it("keeps Maryam's lines Kuwaiti, cheerful and free of sighs", () => {
    const maryam = cues.filter((c) => c.voice === 'ar')
    for (const cue of maryam) {
      expect(cue.text, cue.id).not.toMatch(/…|\.\./)
      expect(cue.text, cue.id).not.toMatch(/[ً-ْ]/)
      expect(cue.text, cue.id).not.toMatch(/أوه|آه|همم|فديت|نحوط|ذبيت|سيكل/)
      expect(cue.text, cue.id).not.toMatch(/[a-z]/i)
    }
    // Many ways for every moment and style, none said twice.
    for (const format of Object.keys(ASK_LINES) as Format[]) expect(ASK_LINES[format].length, format).toBeGreaterThanOrEqual(2)
    expect(CHEERS.length).toBeGreaterThanOrEqual(12)
    expect(RETRIES.length).toBeGreaterThanOrEqual(4)
    expect(Object.keys(STREAKS)).toEqual(['3', '5'])
    for (const group of Object.keys(AR_LINES) as (keyof typeof AR_LINES)[]) expect(AR_LINES[group].length, group).toBeGreaterThanOrEqual(2)
    const texts = maryam.map((c) => c.text)
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('never copies a line from the other Hub quizzes', () => {
    const others = new Set<string>()
    for (const repo of ['arabic-grade1-quiz', 'english-grade1-quiz', 'math-grade1-quiz', 'science-grade1-quiz', 'social-grade1-quiz']) {
      const path = `../${repo}/public/audio/manifest.json`
      if (!fs.existsSync(path)) continue
      const manifest = JSON.parse(fs.readFileSync(path, 'utf8')) as { clips: Record<string, { text: string }> }
      for (const [id, entry] of Object.entries(manifest.clips)) if (id.startsWith('ar/')) others.add(entry.text.replace(/[^\p{L}\s]/gu, '').trim())
    }
    for (const cue of cues.filter((c) => c.voice === 'ar')) expect(others.has(cue.text.replace(/[^\p{L}\s]/gu, '').trim()), cue.text).toBe(false)
  })

  it("reads Layla's sentences with their vowels, and the Prophet's name with the salawat in words", () => {
    for (const { text } of laylaTexts()) {
      expect(text).not.toMatch(/ﷺ|…|\.\.\./)
      expect(text).not.toMatch(/\.$/)
    }
    expect(laylaTexts().map((entry) => entry.text)).toContain('قالَ رَسولُ اللهِ صَلّى اللهُ عَلَيْهِ وَسَلَّمَ: ما مِنْ عَبْدٍ قالَ: لا إِلَهَ إِلّا اللهُ، ثُمَّ ماتَ عَلى ذَلِكَ إِلّا دَخَلَ الجَنَّةَ')
  })
})
