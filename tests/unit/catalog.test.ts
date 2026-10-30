import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CHEERS, HADITH, PICS, QUESTIONS, QUIZ_ID, RETRIES, SAY, SAY_SPOKEN, TOPICS, audioCues, clip, roundClips, type Question } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLAN } from '../../src/domain/round'

const DIACRITICS = /[ً-ْٰ]/
const byKey = (key: string) => QUESTIONS.find((q) => q.key === key)!
const right = (q: Question) => q.options.find((o) => o.id === q.answer)!
const allOptions = (q: Question) => [...q.options, ...(q.draw ? [...q.draw.right, ...q.draw.wrong] : []), ...(q.pictureDraw ? [...q.pictureDraw.good, ...q.pictureDraw.bad] : [])]
const allArt = (q: Question) => [...allOptions(q).map((o) => o.art), ...q.pairs.flatMap((p) => [p.first, p.second])]

describe('question bank', () => {
  it('uses the permanent quiz id', () => {
    expect(QUIZ_ID).toBe('islamic-grade1')
  })

  it('keeps every published question key', () => {
    const keys = new Set(QUESTIONS.map((q) => q.key))
    const permanent = fs.readFileSync('integration/seed-islamic-grade1.sql', 'utf8').match(/'[a-z]+:[a-z0-9-]+'/g) ?? []
    expect(permanent.length).toBe(QUESTIONS.length)
    for (const key of permanent) expect(keys.has(key.slice(1, -1)), key).toBe(true)
  })

  it('has unique, well-formed permanent keys', () => {
    const keys = QUESTIONS.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const q of QUESTIONS) expect(q.key).toMatch(new RegExp(`^${q.topic}:${q.format}-[a-z0-9-]+$`))
  })

  it('covers the five lessons of the first book with a big enough bank for fresh rounds', () => {
    expect(TOPICS.map((t) => t.id)).toEqual(['rabbi', 'arkan', 'ibada', 'rasul', 'walidain'])
    expect(TOPICS.map((t) => t.field)).toEqual(['العقيدة', 'الحديث', 'الفقه', 'السيرة', 'التهذيب'])
    for (const topic of TOPICS) expect(QUESTIONS.filter((q) => q.topic === topic.id).length, topic.id).toBeGreaterThanOrEqual(PRACTICE_SIZE + 4)
  })

  it('has every style of the school model tests, enough of each for the mock test', () => {
    for (const format of ['cloze', 'tf', 'choose', 'picture', 'match', 'circle', 'mark', 'order'] as const) {
      const needed = TEST_PLAN.filter((entry) => entry.formats.length === 1 && entry.formats[0] === format).length
      expect(QUESTIONS.filter((q) => q.format === format).length, format).toBeGreaterThanOrEqual(Math.max(3, needed * 3))
    }
  })

  it("prints the exam's own instruction above every question", () => {
    for (const q of QUESTIONS) {
      expect(q.instruction, q.key).toMatch(/^(أكمل|ضع|صل|حوّط|ميّز|أعد)/)
      // Printed like the paper: no vowel marks, only the shadda of «حوّط» and «صلّ».
      expect(q.instruction, q.key).not.toMatch(/[\u064B-\u0650\u0652\u0670]/)
    }
    for (const q of QUESTIONS.filter((entry) => entry.format === 'tf')) expect(q.instruction).toBe(SAY.tf)
    for (const q of QUESTIONS.filter((entry) => entry.format === 'match')) expect(q.instruction, q.key).toMatch(/^صل/)
  })

  it('gives every choice question one right answer among two to four distinct options', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'pick')) {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size, q.key).toBe(ids.length)
      expect(ids, q.key).toContain(q.answer)
      expect(q.options.length, q.key).toBeGreaterThanOrEqual(2)
      expect(q.options.length, q.key).toBeLessThanOrEqual(4)
      expect(q.explain.length, q.key).toBeGreaterThan(0)
    }
  })

  it('never offers a right answer among the wrong ones of a drawn question', () => {
    for (const q of QUESTIONS.filter((entry) => entry.draw)) {
      const wrong = new Set(q.draw!.wrong.map((o) => o.label))
      for (const option of q.draw!.right) expect(wrong.has(option.label), `${q.key}: ${option.label}`).toBe(false)
      expect(q.draw!.wrong.length, q.key).toBeGreaterThanOrEqual(q.draw!.count)
    }
  })

  it('judges ✓ and ✗ statements, with both kinds in every lesson', () => {
    for (const topic of TOPICS) {
      const statements = QUESTIONS.filter((q) => q.topic === topic.id && q.format === 'tf')
      expect(statements.some((q) => q.answer === 'yes'), topic.id).toBe(true)
      expect(statements.some((q) => q.answer === 'no'), topic.id).toBe(true)
      for (const q of statements) expect(q.options.map((o) => o.id), q.key).toEqual(['yes', 'no'])
    }
  })

  it('has well-formed picture boards: right pictures to circle or tick, and others that are not', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'circle' || entry.kind === 'mark')) {
      const draw = q.pictureDraw!
      expect(draw.goodCount, q.key).toBeGreaterThanOrEqual(1)
      expect(draw.badCount, q.key).toBeGreaterThanOrEqual(1)
      expect(draw.good.length, q.key).toBeGreaterThanOrEqual(draw.goodCount)
      expect(draw.bad.length, q.key).toBeGreaterThanOrEqual(draw.badCount)
      const good = new Set(draw.good.map((o) => o.id))
      for (const option of draw.bad) expect(good.has(option.id), `${q.key}: ${option.id}`).toBe(false)
      expect(q.good.every((id) => good.has(id)), q.key).toBe(true)
    }
  })

  it('joins three or more pairs on every «صل» board', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'match')) {
      expect(q.pairs.length, q.key).toBeGreaterThanOrEqual(3)
      expect(Math.min(q.pairCount ?? q.pairs.length, q.pairs.length), q.key).toBeGreaterThanOrEqual(3)
      expect(new Set(q.pairs.map((p) => p.second)).size, q.key).toBe(q.pairs.length)
    }
  })

  it('orders three to five items', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'order')) {
      expect(q.options.length, q.key).toBeGreaterThanOrEqual(3)
      expect(q.options.length, q.key).toBeLessThanOrEqual(5)
      expect(q.fixedOrder, q.key).toBe(true)
    }
    expect(byKey('arkan:order-pillars').options.map((o) => o.label)).toEqual(['الشَّهادَتانِ', 'إِقامَةُ الصَّلاةِ', 'إيتاءُ الزَّكاةِ', 'حَجُّ البَيْتِ', 'صَوْمُ رَمَضانَ'])
  })

  it('uses only the book pictures that exist, and every one of them', () => {
    const used = new Set(QUESTIONS.flatMap(allArt).filter((art) => art.startsWith('pic:')).map((art) => art.slice(4)))
    expect([...used].sort()).toEqual(Object.keys(PICS).sort())
    const files = fs.readdirSync('public/pics').map((name) => name.replace(/\.jpg$/, ''))
    expect(files.sort()).toEqual(Object.keys(PICS).sort())
  })

  it('has adaptive difficulty in the Hub range with skill tags', () => {
    for (const q of QUESTIONS) {
      expect(q.difficulty, q.key).toBeGreaterThanOrEqual(5)
      expect(q.difficulty, q.key).toBeLessThanOrEqual(45)
      expect(q.skills[0], q.key).toBe(q.topic)
      expect(q.skills, q.key).toContain(`format_${q.format}`)
    }
  })
})

describe('the book', () => {
  it("keeps the hadiths word for word as the book prints them", () => {
    expect(HADITH.rida.text).toBe('مَنْ قالَ رَضيتُ بِاللهِ رَبًّا، وَبِالإِسْلامِ دينًا، وَبِمُحَمَّدٍ رَسولًا، وَجَبَتْ لَهُ الجَنَّةُ')
    expect(HADITH.arkan.text).toBe(
      'بُنِيَ الإِسْلامُ عَلى خَمْسٍ: شَهادَةِ أَنْ لا إِلَهَ إِلّا اللهُ وَأَنَّ مُحَمَّدًا رَسولُ اللهِ، وَإِقامِ الصَّلاةِ، وَإيتاءِ الزَّكاةِ، وَالحَجِّ، وَصَوْمِ رَمَضانَ',
    )
    expect(HADITH.ridaWalidain.text).toBe('رِضى اللهِ في رِضى الوالِدَيْنِ، وَسَخَطُ اللهِ في سَخَطِ الوالِدَيْنِ')
    expect(HADITH.awsat.text).toBe('الوالِدُ أَوْسَطُ أَبْوابِ الجَنَّةِ')
    expect(HADITH.duaBirr.text).toBe('اللَّهُمَّ اجْعَلْنا مِنَ البارّينَ بِوالِدَيْنا، وَارْزُقْنا الجَنَّةَ')
  })

  it('leaves out one word of a hadith, and the right word puts it back exactly', () => {
    const texts = Object.values(HADITH).map((h) => h.text as string)
    for (const q of QUESTIONS.filter((entry) => entry.format === 'cloze')) {
      const { before, after, lead } = q.cloze!
      expect(texts, q.key).toContain(`${before}${right(q).label}${after}`)
      expect(lead, q.key).toMatch(/:$/)
      expect(q.options.find((o) => o.id !== q.answer)!.label, q.key).not.toBe(right(q).label)
    }
  })

  it('quotes no Quran verses, only the lessons and their hadiths', () => {
    for (const q of QUESTIONS) {
      const text = [q.instruction, q.prompt, ...allOptions(q).map((o) => o.label), ...q.pairs.map((p) => p.first + p.second), ...q.explain.map((e) => e.text)].join(' ')
      expect(text, q.key).not.toMatch(/[﴿﴾]/)
    }
  })

  it('answers the three basic questions as the book does', () => {
    expect(right(byKey('rabbi:choose-who-lord')).label).toBe('رَبِّيَ اللهُ تَعالى')
    expect(right(byKey('rabbi:choose-who-prophet')).label).toBe('نَبِيِّي مُحَمَّدٌ ﷺ')
    expect(right(byKey('rabbi:choose-what-religion')).label).toBe('ديني الإِسْلامُ')
    expect(right(byKey('rabbi:choose-fatiha')).label).toBe('الفاتِحَةِ')
  })

  it('counts five pillars and puts them in the order of the hadith', () => {
    expect(right(byKey('arkan:choose-count')).label).toBe('خَمْسَةٌ')
    expect(byKey('arkan:tf-four').answer).toBe('no')
    expect(right(byKey('arkan:choose-first')).label).toBe('الشَّهادَتانِ')
  })

  it('judges pictures as the book does', () => {
    const goodOf = (key: string) => byKey(key).pictureDraw!.good.map((o) => o.id)
    const badOf = (key: string) => byKey(key).pictureDraw!.bad.map((o) => o.id)
    expect(badOf('rasul:mark-behaviour')).toContain('car-litter')
    expect(goodOf('rasul:mark-behaviour')).toEqual(expect.arrayContaining(['handshake', 'studying', 'help-fallen']))
    expect(goodOf('rasul:circle-before-islam')).toEqual(['idols', 'torture', 'injustice'])
    expect(badOf('ibada:mark-faces')).toContain('kids-mock')
    expect(goodOf('walidain:circle-love')).toEqual(['sweep', 'dua-parents'])
  })
})

describe('words on screen', () => {
  it('keeps prompts and answers short enough for a six-year-old to follow', () => {
    for (const q of QUESTIONS) {
      if (q.format !== 'cloze') for (const option of allOptions(q).filter((o) => o.art.startsWith('txt:'))) expect(option.label.split(/\s+/).length, `${q.key}: ${option.label}`).toBeLessThanOrEqual(7)
      expect(q.prompt.split(/\s+/).filter(Boolean).length, q.key).toBeLessThanOrEqual(12)
      for (const way of q.explain) expect(way.text.split(/\s+/).length, q.key).toBeLessThanOrEqual(22)
    }
  })

  it('writes ﷺ after the Prophet’s name (hadith text stays as the book prints it)', () => {
    for (const q of QUESTIONS.filter((entry) => entry.format !== 'cloze')) {
      for (const text of [q.prompt, ...allOptions(q).map((o) => o.label)]) {
        if (/(مُحَمَّدٌ|مُحَمَّدًا|مُحَمَّدٍ)(?!\s*ﷺ)/.test(text) && !text.includes('صَلّى اللهُ عَلَيْهِ')) expect.fail(`${q.key}: ${text}`)
      }
    }
  })
})

describe('narration', () => {
  const manifest = JSON.parse(fs.readFileSync('public/audio/manifest.json', 'utf8')) as {
    voices: Record<string, { name: string }>
    clips: Record<string, { text: string; hash: string }>
  }

  it('uses Maryam, the Kuwaiti voice, without diacritics', () => {
    expect(Object.keys(manifest.voices)).toEqual(['ar'])
    expect(manifest.voices.ar!.name).toBe('Maryam Essa - Kuwaiti Calm & Warm')
    // Marks only where a word could be misread: «حوّط», and «صِل» that must not sound like «صلِّ».
    for (const cue of audioCues()) expect(cue.text.replace('حوّط', 'حوط').replace('صِل', 'صل'), cue.id).not.toMatch(DIACRITICS)
  })

  it('has a recorded clip for every cue, and no unused clips', () => {
    const cues = audioCues()
    for (const cue of cues) {
      expect(manifest.clips[cue.id]?.text, cue.id).toBe(cue.text)
      expect(manifest.clips[cue.id]?.hash, cue.id).toMatch(/^[0-9a-f]{16}$/)
      expect(fs.existsSync(`public/audio/${cue.id}.mp3`), cue.id).toBe(true)
    }
    expect(Object.keys(manifest.clips).sort()).toEqual(cues.map((cue) => cue.id).sort())
  })

  it("reads the exam's five most common instruction lines, and nothing else is new", () => {
    expect(audioCues()).toHaveLength(26)
    for (const q of QUESTIONS) {
      const id = (Object.keys(SAY) as (keyof typeof SAY)[]).find((key) => SAY[key] === q.instruction)
      expect(q.ask, q.key).toEqual(id ? [clip.say(id)] : [])
    }
    expect(QUESTIONS.filter((q) => q.ask.length > 0).length).toBeGreaterThanOrEqual(60)
  })

  it('says the instruction lines as they are printed, with the marks said as words', () => {
    for (const id of Object.keys(SAY) as (keyof typeof SAY)[]) {
      const printed = SAY[id].replace('(✓)', 'صح').replace('(✗)', 'خطأ').replace(/\s+/g, ' ')
      expect(SAY_SPOKEN[id].replace('حوّط', 'حوّط').replace('صِل', 'صل'), id).toBe(printed)
    }
  })

  it('has a recording for every clip a round can play', () => {
    const recorded = new Set(audioCues().map((cue) => cue.id))
    for (const id of roundClips(QUESTIONS)) expect(recorded.has(id), id).toBe(true)
    expect(recorded.has(clip.ui('test-intro'))).toBe(true)
  })

  it('has many cheers and kind words', () => {
    expect(CHEERS.length).toBeGreaterThanOrEqual(10)
    expect(RETRIES.length).toBeGreaterThanOrEqual(5)
  })
})
