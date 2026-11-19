// Content for «التربية الإسلامية - الأول الابتدائي»: practice for the school's second test card
// («اختبار مادة التربية الإسلامية والقرآن الكريم للصف الأول الابتدائي»):
//
//   التربية الإسلامية — Tuesday 24 November 2026, unit three of the Ministry book, section two:
//     khaliq — «اللهُ تعالى الخالقُ المصوِّر» (العقيدة, pp. 110–119)
//     iman   — «أركان الإيمان» (الحديث الشريف, pp. 120–127)
//     tawhid — «كلمة التوحيد»، حديث «ما من عبد قال: لا إله إلا الله» (pp. 128–135)
//   القرآن الكريم — Wednesday 25 November 2026, unit three of the Quran book:
//     masad  — «سورة المسد» (lesson 7, pp. 57–62)
//     nasr   — «سورة النصر» (lesson 8, pp. 63–67)
//
// The questions copy the school's paper styles and the books' own activities and evaluations
// («أكمل…»، «ضع علامة…»، «صل…»، «حوّط…»، «لوّن…»، «أكمل أرقام الآيات»), so a child who cannot read
// well yet recognises the exam. Hadith wording is the book's; the Quran text comes from Tanzil
// (src/data/quran.ts) and is heard only in Sheikh Mishary Alafasy's recitation, never a speech
// engine. Pictures are the books' own illustrations (public/pics/) or emoji.
// Voices: Maryam (Kuwaiti, no diacritics) says what to do and cheers; Layla (Modern Standard
// Arabic, with diacritics) reads the hadiths, the sentences and the written choices.
// Question keys are permanent Hub ids. This file is self-contained so Node scripts can import it.

import { FAJR_FIRST_WORD, MASAD, NASR, type Surah } from './quran.ts'

export const QUIZ_ID = 'islamic-grade1'

export type Subject = 'islamic' | 'quran'
export type TopicId = 'khaliq' | 'iman' | 'tawhid' | 'masad' | 'nasr'

/** How the child answers: one choice, a «صل» board, circling, marks under pictures, an order, or the surah's star. */
export type QuestionKind = 'pick' | 'match' | 'circle' | 'mark' | 'order' | 'hub'

/** The paper's question styles: each has its instruction, its spoken lines and its place in a mock test. */
export type Format =
  | 'cloze' // أكمل الحديث / الدعاء
  | 'tf' // ضع علامة (✓) أو (✗)
  | 'choose' // حوّط الإجابة الصحيحة
  | 'fill' // لوّن / ظلّل الإجابة
  | 'picture' // حوّط الصورة
  | 'tick' // ضع علامة (✓) تحت الصورة
  | 'match' // صل
  | 'circle' // ضع دائرة حول الصور
  | 'mark' // ✓ أسفل… و✗ أسفل…
  | 'colour' // لوّن البرية بالأخضر والبحرية بالأزرق
  | 'order' // أعد ترتيب الكلمات
  | 'ayat' // أكمل أرقام الآيات
  | 'hub' // صل السورة بمكملاتها
  | 'verse' // أكمل كتابة الآية
  | 'next' // الآية التي بعدها
  | 'listen' // استمع، ثم حوّط اسم السورة
  | 'letter' // حرف التجويد
  | 'meaning' // معاني المفردات

/**
 * What a tile shows:
 *   pic:<id>       one of the books' pictures      txt:<text>   a word or a short sentence
 *   qw:<text>      a word of the Quran (Uthmani)    aya:<s>:<n>  a whole verse with its number
 *   big:<letter>   a large letter                   tf:<yes|no>  the ✓ or ✗ mark
 * Anything else is an emoji.
 */
export type ArtRef = string
export type Random = () => number

const DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
/** A number in the book's digits. */
export const A = (value: number) => String(value).replace(/\d/g, (d) => DIGITS[Number(d)]!)

export const SURAHS: Record<'masad' | 'nasr', Surah> = { masad: MASAD, nasr: NASR }

/** The verse's text from Tanzil. */
export function verse(surah: Surah, n: number): string {
  return surah.verses[n - 1]!
}

/** A verse split at its last word, for «أكمل كتابة الآية». */
export function lastWord(text: string): { before: string; word: string } {
  const at = text.lastIndexOf(' ')
  return { before: text.slice(0, at), word: text.slice(at + 1) }
}

// ── The books' pictures ───────────────────────────────────────────────────
/** Cropped from the books; the name is what the picture shows, as the book says it. */
export const PICS = {
  // Islamic education book, section two
  'creator-earth': 'الأَرْضُ وَالسَّماءُ',
  'creator-river': 'الأَمْطارُ وَالأَنْهارُ',
  'creator-animals': 'الحَيَواناتُ وَالنَّباتاتُ',
  'sea-life': 'الأَسْماكُ',
  flowers: 'الزُّهورُ',
  birds: 'الطُّيورُ',
  // From book one (the first test's pictures)
  'pray-rug': 'الصَّلاةُ',
  sujood: 'السُّجودُ',
  'quran-read': 'قِراءَةُ القُرْآنِ',
  'quran-girl': 'قِراءَةُ القُرْآنِ',
  'dua-girl': 'الدُّعاءُ',
  'give-poor': 'مُساعَدَةُ الفَقيرِ',
  'animal-kind': 'الرِّفْقُ بِالحَيَوانِ',
  hajj: 'الحَجُّ',
  'help-elder': 'مُساعَدَةُ المُحْتاجِ',
  'father-mosque': 'الذَّهابُ لِلْمَسْجِدِ',
  iftar: 'الصِّيامُ',
  'kids-mock': 'السُّخْرِيَةُ مِنَ الآخَرينَ',
  'litter-walk': 'رَمْيُ القُمامَةِ في الطَّريقِ',
  'car-litter': 'رَمْيُ القُمامَةِ مِنَ السَّيّارَةِ',
  'hit-cat': 'إيذاءُ الحَيَوانِ',
  'kids-fight': 'الشِّجارُ',
  // Quran book, unit three
  fire: 'نارٌ ذاتُ لَهَبٍ',
  rope: 'حَبْلٌ مِنْ مَسَدٍ',
  kaaba: 'الكَعْبَةُ المُشَرَّفَةُ',
  madinah: 'المَسْجِدُ النَّبَوِيُّ',
  crowds: 'جَماعاتٌ كَثيرَةٌ',
  'one-pilgrim': 'رَجُلٌ واحِدٌ',
  'few-pilgrims': 'ثَلاثَةُ رِجالٍ',
} as const
export type PicId = keyof typeof PICS

// ── Clip ids ──────────────────────────────────────────────────────────────
/** A short stable name for a recorded sentence, from its text. */
export function textId(text: string): string {
  let hash = 0x811c9dc5
  for (const char of text) {
    hash ^= char.codePointAt(0)!
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/** Every sentence Layla reads, filled in as the questions are built (id → text). */
const LAYLA = new Map<string, string>()

export const clip = {
  /** Maryam's spoken instruction for a question style: `ar/q/<format>-<n>`. */
  line: (format: Format, n = 0) => `ar/q/${format}-${n + 1}`,
  /** Maryam's line for a moment of the round. */
  ui: (group: ArGroup, n = 0) => `ar/ui/${group}-${n + 1}`,
  /** Layla reading a sentence, a choice or a hadith. */
  say: (text: string) => {
    const words = spoken(text)
    const id = textId(words)
    LAYLA.set(id, words)
    return `fs/s/${id}`
  },
  /** The Alafasy recitation of a verse. */
  aya: (surah: number, n: number) => `quran/${String(surah).padStart(3, '0')}${String(n).padStart(3, '0')}`,
  /** A letter's name, recorded for the Arabic quiz. */
  letter: (id: 'jim' | 'kha' | 'ha') => `fs/name/${id}`,
}

export const BASMALA_CLIP = 'quran/001001'

/** Recitation of the whole surah: the basmala, then every verse. */
export function surahClips(surah: Surah): string[] {
  return [BASMALA_CLIP, ...surah.verses.map((_, n) => clip.aya(surah.number, n + 1))]
}

/**
 * What Layla is given to read: ﷺ and the other ligatures as words, no blanks or brackets.
 * Diacritics stay, so every word keeps its exact sound.
 */
export function spoken(text: string): string {
  return text
    .replace(/ﷺ/g, 'صَلّى اللهُ عَلَيْهِ وَسَلَّمَ')
    .replace(/\.{3,}|…+/g, ' ')
    .replace(/[()«»"]/g, '')
    .replace(/\s+([،.:؟!])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '')
}

/** A recording that is used only if the same words are recorded for another question (no extra cost). */
const IF_RECORDED = '?'
function ifRecorded(text: string): string {
  return `${IF_RECORDED}fs/s/${textId(spoken(text))}`
}

// ── Topics ────────────────────────────────────────────────────────────────
export interface Topic {
  id: TopicId
  subject: Subject
  title: string
  /** The book's field or lesson number, shown on the card like the book's page corner. */
  field: string
  pages: string
  art: ArtRef[]
}

export const TOPICS: Topic[] = [
  { id: 'khaliq', subject: 'islamic', title: 'اللهُ تَعالى الخالِقُ المُصَوِّرُ', field: 'العقيدة', pages: 'ص ١١٠–١١٩', art: ['pic:creator-earth'] },
  { id: 'iman', subject: 'islamic', title: 'أَرْكانُ الإيمانِ', field: 'الحديث الشريف', pages: 'ص ١٢٠–١٢٧', art: ['big:٦'] },
  { id: 'tawhid', subject: 'islamic', title: 'كَلِمَةُ التَّوْحيدِ', field: 'الحديث الشريف', pages: 'ص ١٢٨–١٣٥', art: ['☝️'] },
  { id: 'masad', subject: 'quran', title: 'سورَةُ المَسَدِ', field: 'الدرس السابع', pages: 'ص ٥٧–٦٢', art: ['pic:rope'] },
  { id: 'nasr', subject: 'quran', title: 'سورَةُ النَّصْرِ', field: 'الدرس الثامن', pages: 'ص ٦٣–٦٧', art: ['pic:madinah'] },
]

export const SUBJECTS: Record<Subject, { title: string; date: string; topics: TopicId[] }> = {
  islamic: { title: 'التربية الإسلامية', date: 'الثلاثاء ٢٤ نوفمبر', topics: ['khaliq', 'iman', 'tawhid'] },
  quran: { title: 'القرآن الكريم', date: 'الأربعاء ٢٥ نوفمبر', topics: ['masad', 'nasr'] },
}

export function subjectOf(topic: TopicId): Subject {
  return TOPICS.find((entry) => entry.id === topic)!.subject
}

// ── The paper's instruction lines ─────────────────────────────────────────
// As printed on the school's model papers and in the books' evaluations.
export const SAY = {
  hadith: 'أكمل الحديث الشريف بالكلمة المناسبة بين القوسين.',
  dua: 'أكمل الدعاء بالكلمة المناسبة بين القوسين.',
  tf: 'ضع علامة (✓) أمام العبارة الصحيحة، وعلامة (✗) أمام العبارة الخاطئة.',
  choose: 'حوّط الإجابة الصحيحة بين القوسين.',
  complete: 'أكمل الجملة بالكلمة المناسبة.',
  match: 'صل بين العبارة وما يناسبها.',
  meaning: 'صل الكلمة بمعناها.',
  verse: 'أكمل كتابة الآية من الخيارات الآتية.',
  next: 'أكمل السورة: حوّط الآية التي بعدها.',
  listen: 'استمع إلى الآية، ثم حوّط اسم السورة.',
} as const

/**
 * How Maryam says what to do, a few ways for every style, so the child hears it afresh.
 * No «…» (the voice reads it as a sigh), no diacritics, Kuwaiti words, and none speaks to a girl or a boy.
 */
export const ASK_LINES = {
  cloze: ['الحديث ناقصه كلمة، نختار الكلمة اللي تكمله.', 'نسمع الكلمتين، وأي وحدة تكمل الحديث صح؟', 'نكمل الحديث الشريف بالكلمة المناسبة.'],
  tf: ['نسمع الجملة زين، صح ولا خطأ؟', 'إذا الجملة صحيحة نحط صح، وإذا غلط نحط خطأ.', 'جملة وحدة، ونحكم عليها بعلامة.'],
  choose: ['نسمع السؤال، ونحط دائرة على الجواب الصح.', 'شنو الجواب المناسب؟ نختاره من الخيارات.', 'ناخذ وقتنا، ونختار الجواب الصحيح.'],
  fill: ['نلون الجواب الصحيح بلون حلو.', 'أي وحدة هي الصح؟ نلونها.'],
  picture: ['نطالع الصور زين، ونحط دائرة على الصورة الصح.', 'صورة وحدة بس تناسب السؤال، وينها؟'],
  tick: ['نحط علامة صح تحت الصورة المناسبة.', 'أي صورة تناسب؟ تحتها نحط صح.'],
  match: ['نبدا من اليمين، ونوصل كل وحدة باللي يناسبها.', 'كل كلمة لها شريك، نوصلهم مع بعض.', 'نختار من المجموعة ألف، وبعدين شريكها من المجموعة باء.'],
  circle: ['يمكن أكثر من صورة صح، نحط دائرة على كل وحدة.', 'ندور كل الصور الصح، وبعدين نضغط تحقق.'],
  mark: ['كل صورة تاخذ علامة، صح أو خطأ.', 'نطالع كل صورة بروحها، ونحط تحتها العلامة المناسبة.'],
  colour: ['اللي يعيش في البر نلونه أخضر، واللي يعيش في البحر نلونه أزرق.', 'البر أخضر والبحر أزرق، يلا نلون!'],
  order: ['نرتب الكلمات، ونسوي منها جملة.', 'أي كلمة تجي أول؟ نرتبهم وحدة وحدة.'],
  ayat: ['نرتب آيات السورة، من الآية الأولى للأخيرة.', 'أي آية تجي أول؟ نعطي كل آية رقمها.'],
  hub: ['نوصل اسم السورة بالكلمات اللي تناسبها.', 'شنو يناسب هالسورة؟ نوصله بخط.'],
  verse: ['الآية ناقصها كلمة، نختار الكلمة اللي تكملها.', 'نتذكر الآية زين، شنو الكلمة الناقصة؟', 'نكمل كتابة الآية من الخيارات.'],
  next: ['نسمع الآية، وأي آية تجي بعدها؟', 'نكمل السورة، شنو الآية اللي بعد هذي؟'],
  listen: ['نسمع التلاوة زين، هذي من أي سورة؟', 'نسمع الآية، ونختار اسم سورتها.'],
  letter: ['ندور الحرف اللي تعلمناه في السورة.', 'نطالع زين، ونحط دائرة على الجواب.'],
  meaning: ['شنو معنى هالكلمة؟ نختار المعنى الصح.', 'كل كلمة لها معنى، نختار معناها.'],
} as const satisfies Record<Format, readonly string[]>

// ── Questions ─────────────────────────────────────────────────────────────
export interface Option {
  id: string
  art: ArtRef
  label: string
  /** Printed under a picture, as the papers name some of their pictures. */
  caption?: string
  /** Read while the tile lights up: Layla for written choices, Alafasy for a verse. */
  clip?: string
}

export interface Pair {
  id: string
  /** Group (أ), on the right where Arabic reading starts; chosen first. */
  first: ArtRef
  /** Group (ب): the partner that answers it. */
  second: ArtRef
  label: string
}

/** A hadith or a supplication with one word left out, written the way the book prints it. */
export interface Cloze {
  lead: string
  before: string
  after: string
  /** The whole text, read by Layla once the answer is in. */
  whole: string
}

/** A verse with its last word left out («أكمل كتابة الآية»). */
export interface VerseGap {
  surah: number
  n: number
  before: string
}

/** New answers for every round: one right answer from `right`, and `count` wrong ones from `wrong`. */
export interface Draw {
  right: Option[]
  wrong: Option[]
  count: number
  explain?: (right: Option) => string
}

/** New pictures for every round: `goodCount` from `good` and `badCount` from `bad`. */
export interface PictureDraw {
  good: Option[]
  bad: Option[]
  goodCount: number
  badCount: number
}

export interface Question {
  key: string
  topic: TopicId
  kind: QuestionKind
  format: Format
  /** The exam's instruction line. */
  instruction: string
  /** The question itself, when there is more than the instruction (a sentence, a question). */
  prompt: string
  /** The prompt in the Quran's script (a word of the surah), shown large. */
  quranWord?: string
  cloze?: Cloze
  verseGap?: VerseGap
  /** A verse shown (and recited) as the question: «الآية التي بعدها», «استمع». */
  aya?: { surah: number; n: number; hidden?: boolean }
  /** Spoken question: Maryam's line (filled in each round), then what Layla or Alafasy read. */
  ask: string[]
  /** pick: the choices · circle and mark: the pictures · order: the items in their right order. */
  options: Option[]
  /** «صح» stays before «خطأ», numbers stay in order, and an order question keeps its items' given order as the answer. */
  fixedOrder?: boolean
  pairs: Pair[]
  /** pick: the right option. */
  answer: string
  /** circle, hub: the options to choose · mark: the pictures that take ✓ (or green). */
  good: string[]
  /** How the mark question marks a picture: ✓/✗ like the exam, or the book's two colours. */
  marks?: 'tick' | 'colour'
  /** The middle of the «صل السورة بمكملاتها» star. */
  hubCenter?: string
  /** What a pick paints: a pen ring (default), a colour fill («لوّن», «ظلّل»), or a ✓ box under a picture. */
  pickStyle?: 'ring' | 'fill' | 'tick'
  /** The line shown after the answer. */
  explain: string
  /** Heard after the answer: the whole hadith, the verse, or the sentence that explains it. */
  after: string[]
  draw?: Draw
  pictureDraw?: PictureDraw
  /** match: how many of the pairs one round shows. */
  pairCount?: number
  difficulty: number
  skills: string[]
  /** Text the help line under the instruction shows: Maryam's line of this round. */
  help?: string
}

const d = (difficulty: number) => difficulty

function base(key: string, topic: TopicId, kind: QuestionKind, format: Format, instruction: string, prompt: string, skills: string[], difficulty: number) {
  return {
    key: `${topic}:${key}`,
    topic,
    kind,
    format,
    instruction,
    prompt,
    // The first cue is Maryam's line for the style; voiceQuestion() picks it for each round.
    ask: [clip.line(format)] as string[],
    options: [] as Option[],
    pairs: [] as Pair[],
    answer: '',
    good: [] as string[],
    after: [] as string[],
    skills: [topic, `format_${format}`, ...skills],
    difficulty,
  }
}

const YES: Option = { id: 'yes', art: 'tf:yes', label: 'صح' }
const NO: Option = { id: 'no', art: 'tf:no', label: 'خطأ' }

/** A written choice, read by Layla. */
const txt = (id: string, text: string, say: string = text): Option => ({ id, art: `txt:${text}`, label: text, clip: clip.say(say) })
/** A word of the Quran: shown in its script, never voiced by the speech engine. */
const qw = (id: string, text: string): Option => ({ id, art: `qw:${text}`, label: text })
const pic = (id: PicId, caption = false): Option => ({ id, art: `pic:${id}`, label: PICS[id], ...(caption ? { caption: PICS[id] } : {}) })
const pics = (ids: PicId[], caption = false) => ids.map((id) => pic(id, caption))
const emoji = (id: string, art: string, label: string): Option => ({ id, art, label })
const slug = (n: number) => `o${n + 1}`

/** What Layla reads for a prompt: up to its blank, so the choices finish the sentence. */
function promptCue(prompt: string): string[] {
  const head = prompt.split(/\.{3,}|…/)[0]!.trim()
  return head ? [clip.say(head)] : []
}

/** «ضع علامة (✓) أو (✗)»: one sentence, judged true or false. `fact` is the true sentence. */
function tf(topic: TopicId, key: string, sentence: string, truth: boolean, fact: string, difficulty: number, skill = 'statement'): Question {
  const q = base(`tf-${key}`, topic, 'pick', 'tf', SAY.tf, sentence, [skill], difficulty)
  return {
    ...q,
    ask: [...q.ask, clip.say(sentence)],
    options: [YES, NO],
    fixedOrder: true,
    answer: truth ? 'yes' : 'no',
    explain: fact,
    after: truth ? [] : [ifRecorded(fact)],
  }
}

/** «حوّط الإجابة الصحيحة»: a question with written choices; the first choice is right. */
function choose(
  topic: TopicId,
  key: string,
  prompt: string,
  right: string,
  wrong: string[],
  fact: string,
  difficulty: number,
  skill: string,
  extra: { instruction?: string; format?: Format; pickStyle?: Question['pickStyle']; fixedOrder?: boolean; shown?: string[] } = {},
): Question {
  const options = (extra.shown ?? [right, ...wrong]).map((text, n) => txt(slug(n), text))
  const q = base(`${extra.format ?? 'choose'}-${key}`, topic, 'pick', extra.format ?? 'choose', extra.instruction ?? SAY.choose, prompt, [skill], difficulty)
  return {
    ...q,
    ask: [...q.ask, ...promptCue(prompt)],
    options,
    answer: options.find((option) => option.label === right)!.id,
    explain: fact,
    after: [],
    ...(extra.pickStyle ? { pickStyle: extra.pickStyle } : {}),
    ...(extra.fixedOrder ? { fixedOrder: true } : {}),
  }
}

/** «لوّن عدد…»: numbers in the book's digits, kept in order; the chosen one is painted. */
function count(topic: TopicId, key: string, instruction: string, right: number, choices: number[], fact: string, difficulty: number, skill: string): Question {
  const options = choices.map((value) => ({ id: `n${value}`, art: `big:${A(value)}`, label: A(value) }))
  const q = base(`fill-${key}`, topic, 'pick', 'fill', instruction, '', [skill], difficulty)
  return { ...q, ask: [...q.ask, clip.say(instruction)], options, answer: `n${right}`, fixedOrder: true, pickStyle: 'fill', explain: fact }
}

/** «أكمل الحديث / الدعاء»: the first place `missing` appears is left blank; the right word is the first choice. */
function cloze(topic: TopicId, key: string, source: keyof typeof HADITH, missing: string, wrong: string, fact: string, difficulty: number, skill: string): Question {
  const { lead, text } = HADITH[source]
  const at = text.indexOf(missing)
  if (at < 0) throw new Error(`«${missing}» is not in ${source}`)
  const options = [txt('o1', missing), txt('o2', wrong)]
  const whole = `${lead} ${text}`
  return {
    ...base(`cloze-${key}`, topic, 'pick', 'cloze', source === 'dua' ? SAY.dua : SAY.hadith, '', [skill], difficulty),
    cloze: { lead, before: text.slice(0, at), after: text.slice(at + missing.length), whole },
    options,
    answer: 'o1',
    explain: fact,
    after: [clip.say(whole)],
  }
}

/** «حوّط الصورة»: one right picture among pictures that are not. */
function picture(topic: TopicId, key: string, instruction: string, right: PicId[], wrong: PicId[], wrongCount: number, fact: (right: Option) => string, difficulty: number, skill: string, say: string = instruction): Question {
  const draw: Draw = { right: pics(right), wrong: pics(wrong), count: wrongCount, explain: fact }
  const q = base(`picture-${key}`, topic, 'pick', 'picture', instruction, '', [skill], difficulty)
  return withDraw({ ...q, ask: [...q.ask, clip.say(say)] }, draw)
}

/** «ضع علامة (✓) تحت الصورة التي تدل على نوع السورة»: Makkah or Madinah. */
function surahType(topic: 'masad' | 'nasr', makki: boolean, difficulty: number): Question {
  const name = topic === 'masad' ? 'المَسَدِ' : 'النَّصْرِ'
  const instruction = `ضع علامة (✓) تحت الصورة التي تدل على نوع سورة ${topic === 'masad' ? 'المسد' : 'النصر'}.`
  const options: Option[] = [
    { id: 'makki', art: 'pic:kaaba', label: 'مَكِّيَّةٌ', caption: 'مَكِّيَّةٌ' },
    { id: 'madani', art: 'pic:madinah', label: 'مَدَنِيَّةٌ', caption: 'مَدَنِيَّةٌ' },
  ]
  const q = base('tick-type', topic, 'pick', 'tick', instruction, '', ['surah_type'], difficulty)
  return {
    ...q,
    ask: [...q.ask, clip.say(`سورَةُ ${name}، مَكِّيَّةٌ أَمْ مَدَنِيَّةٌ؟`)],
    options,
    fixedOrder: true,
    pickStyle: 'tick',
    answer: makki ? 'makki' : 'madani',
    explain: `سورَةُ ${name} ${makki ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}`,
  }
}

/** «ضع دائرة حول الصور»: every right picture is circled, and nothing else. */
function circle(topic: TopicId, key: string, instruction: string, good: Option[], bad: Option[], goodCount: number, badCount: number, fact: string, difficulty: number, skill: string, say: string = instruction): Question {
  const pictureDraw: PictureDraw = { good, bad, goodCount, badCount }
  const q = base(`circle-${key}`, topic, 'circle', 'circle', instruction, '', [skill], difficulty)
  return withPictures({ ...q, ask: [...q.ask, clip.say(say)], explain: fact, after: [] }, pictureDraw)
}

/** «ضع علامة (✓) أسفل… و(✗) أسفل…», or the two colours of «لوّن»: every picture gets its mark. */
function mark(topic: TopicId, key: string, instruction: string, good: Option[], bad: Option[], goodCount: number, badCount: number, fact: string, difficulty: number, skill: string, marks: 'tick' | 'colour' = 'tick', say?: string): Question {
  const pictureDraw: PictureDraw = { good, bad, goodCount, badCount }
  const format: Format = marks === 'colour' ? 'colour' : 'mark'
  const q = base(`${format}-${key}`, topic, 'mark', format, instruction, '', [skill], difficulty)
  return withPictures({ ...q, ask: say ? [...q.ask, clip.say(say)] : q.ask, marks, explain: fact, after: [] }, pictureDraw)
}

/** «صل»: group (أ) on the right, group (ب) on the left. */
function match(topic: TopicId, key: string, instruction: string, pairs: [ArtRef, ArtRef, string][], fact: string, difficulty: number, skill: string, pairCount?: number): Question {
  return {
    ...base(`match-${key}`, topic, 'match', 'match', instruction, '', [skill], difficulty),
    pairs: pairs.map(([first, second, label], n) => ({ id: `p${n + 1}`, first, second, label })),
    ...(pairCount ? { pairCount } : {}),
    explain: fact,
  }
}

/** «أعد الترتيب»: the items are given in their right order. */
function order(topic: TopicId, key: string, instruction: string, items: Option[], fact: string, difficulty: number, skill: string): Question {
  return { ...base(`order-${key}`, topic, 'order', 'order', instruction, '', [skill], difficulty), options: items, fixedOrder: true, explain: fact, after: [ifRecorded(fact)] }
}

/** «أكمل أرقام الآيات»: the surah's verses, numbered in their order; the recitation follows. */
function ayat(topic: 'masad' | 'nasr', difficulty: number): Question {
  const surah = SURAHS[topic]
  const name = topic === 'masad' ? 'المسد' : 'النصر'
  const items = surah.verses.map((text, n) => ({ id: `v${n + 1}`, art: `aya:${surah.number}:${n + 1}`, label: text, clip: clip.aya(surah.number, n + 1) }))
  return {
    ...base('ayat-order', topic, 'order', 'ayat', `أكمل أرقام الآيات من سورة ${name}.`, '', ['verse_order', 'memorise'], difficulty),
    options: items,
    fixedOrder: true,
    explain: `سورَةُ ${topic === 'masad' ? 'المَسَدِ' : 'النَّصْرِ'} ${A(surah.verses.length)} آياتٍ، نَحْفَظُها بِتَرْتيبِها`,
    after: surahClips(surah).slice(1),
  }
}

/** «أكمل كتابة الآية»: the verse's last word, among the other verses' last words. */
function verseGap(topic: 'masad' | 'nasr', n: number, difficulty: number, wrongWords?: string[]): Question {
  const surah = SURAHS[topic]
  const { before, word } = lastWord(verse(surah, n))
  const others = wrongWords ?? surah.verses.map((text) => lastWord(text).word).filter((other) => other !== word)
  const draw: Draw = { right: [qw('o1', word)], wrong: others.map((other, k) => qw(`o${k + 2}`, other)), count: Math.min(2, others.length) }
  const q = base(`verse-${n}`, topic, 'pick', 'verse', SAY.verse, '', ['verse_complete', 'memorise'], difficulty)
  return withDraw(
    { ...q, verseGap: { surah: surah.number, n, before }, explain: `الآيَةُ ${A(n)} مِنْ سورَةِ ${topic === 'masad' ? 'المَسَدِ' : 'النَّصْرِ'}`, after: [clip.aya(surah.number, n)] },
    draw,
  )
}

/** «حوّط الآية التي بعدها»: verse n is heard and shown; the next verse is among the others. */
function nextVerse(topic: 'masad' | 'nasr', n: number, difficulty: number): Question {
  const surah = SURAHS[topic]
  const right = n + 1
  const others = surah.verses.map((_, k) => k + 1).filter((k) => k !== right && k !== n)
  const option = (k: number): Option => ({ id: `v${k}`, art: `aya:${surah.number}:${k}`, label: verse(surah, k), clip: clip.aya(surah.number, k) })
  const draw: Draw = { right: [option(right)], wrong: others.map(option), count: Math.min(2, others.length), explain: () => `بَعْدَ الآيَةِ ${A(n)} تَأْتي الآيَةُ ${A(right)}` }
  const q = base(`next-${n}`, topic, 'pick', 'next', SAY.next, '', ['verse_next', 'memorise'], difficulty)
  return withDraw({ ...q, aya: { surah: surah.number, n }, ask: [...q.ask, clip.aya(surah.number, n)] }, draw)
}

/** «استمع إلى الآية، ثم حوّط اسم السورة»: the verse is only heard, not shown. */
function listen(topic: 'masad' | 'nasr', n: number, difficulty: number): Question {
  const surah = SURAHS[topic]
  const options = [txt('masad', 'سورَةُ المَسَدِ'), txt('nasr', 'سورَةُ النَّصْرِ')]
  const q = base(`listen-${n}`, topic, 'pick', 'listen', SAY.listen, '', ['surah_by_ear'], difficulty)
  return {
    ...q,
    aya: { surah: surah.number, n, hidden: true },
    ask: [...q.ask, clip.aya(surah.number, n)],
    options,
    fixedOrder: true,
    answer: topic,
    explain: `هذِهِ الآيَةُ ${A(n)} مِنْ سورَةِ ${topic === 'masad' ? 'المَسَدِ' : 'النَّصْرِ'}`,
    after: [],
  }
}

/** «أفهم معاني المفردات»: the word as the surah writes it; its meaning among the others. */
function meaning(topic: 'masad' | 'nasr', key: string, word: string, right: string, wrong: string[], difficulty: number): Question {
  const options = [right, ...wrong].map((text, n) => txt(slug(n), text))
  const q = base(`meaning-${key}`, topic, 'pick', 'meaning', 'حوّط معنى الكلمة.', '', ['word_meaning'], difficulty)
  return { ...q, quranWord: word, options, answer: 'o1', explain: `مَعْنى (${word}): ${right}`, after: [] }
}

/** «صل سورة … بمكملاتها الصحيحة»: the surah in the middle, its facts around it. */
function hub(topic: 'masad' | 'nasr', difficulty: number): Question {
  const makki = topic === 'masad'
  const verses = SURAHS[topic].verses.length
  const options = [txt('makki', 'مَكِّيَّةٌ'), txt('madani', 'مَدَنِيَّةٌ'), txt('a5', `آياتُها (${A(5)})`, 'آياتُها خَمْسٌ'), txt('a3', `آياتُها (${A(3)})`, 'آياتُها ثَلاثٌ')]
  const name = topic === 'masad' ? 'المَسَدِ' : 'النَّصْرِ'
  const q = base('hub-facts', topic, 'hub', 'hub', `صل سورة ${topic === 'masad' ? 'المسد' : 'النصر'} بمكملاتها الصحيحة.`, '', ['surah_type', 'verse_count'], difficulty)
  return {
    ...q,
    ask: [...q.ask, clip.say(`سورَةُ ${name}`)],
    hubCenter: `سورَةُ ${name}`,
    options,
    fixedOrder: true,
    good: [makki ? 'makki' : 'madani', verses === 5 ? 'a5' : 'a3'],
    explain: `سورَةُ ${name} ${makki ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}، وَآياتُها ${A(verses)}`,
  }
}

/** «أتقن أحكام التجويد»: the lesson's letter. */
function letter(topic: 'masad' | 'nasr', key: string, instruction: string, options: Option[], answer: string, fact: string, sound: string[], difficulty: number): Question {
  const q = base(`letter-${key}`, topic, 'pick', 'letter', instruction, '', ['tajweed_letter'], difficulty)
  return { ...q, ask: [...q.ask, ...sound], options, answer, explain: fact }
}

function withDraw(question: ReturnType<typeof base> & { explain?: string; aya?: Question['aya']; verseGap?: VerseGap }, draw: Draw): Question {
  const right = draw.right[0]!
  return {
    ...question,
    options: [right, ...draw.wrong.filter((option) => option.id !== right.id).slice(0, draw.count)],
    answer: right.id,
    explain: question.explain ?? draw.explain?.(right) ?? '',
    draw,
  }
}

function withPictures(question: ReturnType<typeof base> & { explain: string; marks?: 'tick' | 'colour' }, pictureDraw: PictureDraw): Question {
  const good = pictureDraw.good.slice(0, pictureDraw.goodCount)
  const bad = pictureDraw.bad.slice(0, pictureDraw.badCount)
  return { ...question, options: [...good, ...bad], good: good.map((option) => option.id), pictureDraw }
}

// ── The hadiths and the supplication, as the book prints them ─────────────
export const HADITH = {
  /** صحيح مسلم — lesson «أركان الإيمان» (p. 121). */
  iman: {
    lead: 'عَنْ عُمَرَ بْنِ الخَطّابِ رَضِيَ اللهُ عَنْهُ قالَ: جاءَ جِبْريلُ عَلَيْهِ السَّلامُ إِلى النَّبِيِّ ﷺ وَسَأَلَهُ: فَأَخْبِرْني عَنِ الإيمانِ، قالَ:',
    text: 'أَنْ تُؤْمِنَ بِاللهِ وَمَلائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَاليَوْمِ الآخِرِ، وَتُؤْمِنَ بِالقَدَرِ خَيْرِهِ وَشَرِّهِ',
  },
  /** صحيح البخاري — lesson «كلمة التوحيد» (p. 129). */
  tawhid: {
    lead: 'قالَ رَسولُ اللهِ ﷺ:',
    text: 'ما مِنْ عَبْدٍ قالَ: لا إِلَهَ إِلّا اللهُ، ثُمَّ ماتَ عَلى ذَلِكَ إِلّا دَخَلَ الجَنَّةَ',
  },
  /** مسند الإمام أحمد — the supplication of «الله تعالى الخالق المصور» (p. 115). */
  dua: {
    lead: 'نَدْعو اللهَ تَعالى الخالِقَ المُصَوِّرَ:',
    text: 'اللَّهُمَّ أَحْسَنْتَ خَلْقي فَأَحْسِنْ خُلُقي',
  },
} as const

const MEANING_KHALIQ = 'الَّذي أَوْجَدَ الأَشْياءَ مِنَ العَدَمِ'
const MEANING_MUSAWWIR = 'الَّذي أَعْطى كُلَّ مَخْلوقٍ شَكْلَهُ وَصورَتَهُ وَهَيْئَتَهُ الخاصَّةَ'
const MEANING_TAWHID = 'لا مَعْبودَ يَسْتَحِقُّ العِبادَةَ إِلّا اللهُ تَعالى وَحْدَهُ'
const MEANING_IMAN = 'ما اسْتَقَرَّ في القَلْبِ وَصَدَّقَهُ العَمَلُ'

const LAND = [
  emoji('camel', '🐪', 'الجَمَلُ'),
  emoji('cow', '🐄', 'البَقَرَةُ'),
  emoji('cat', '🐈', 'القِطَّةُ'),
  emoji('lion', '🦁', 'الأَسَدُ'),
  emoji('elephant', '🐘', 'الفيلُ'),
  emoji('rabbit', '🐇', 'الأَرْنَبُ'),
  emoji('horse', '🐎', 'الحِصانُ'),
  emoji('giraffe', '🦒', 'الزَّرافَةُ'),
]
const SEA = [
  emoji('fish', '🐟', 'السَّمَكَةُ'),
  emoji('dolphin', '🐬', 'الدُّلْفينُ'),
  emoji('octopus', '🐙', 'الأُخْطُبوطُ'),
  emoji('shark', '🦈', 'القِرْشُ'),
  emoji('whale', '🐳', 'الحوتُ'),
  emoji('tropical', '🐠', 'السَّمَكَةُ المُلَوَّنَةُ'),
]
const LIVING = [
  emoji('dolphin', '🐬', 'الدُّلْفينُ'),
  emoji('bird', '🐦', 'العُصْفورُ'),
  emoji('palm', '🌴', 'النَّخْلَةُ'),
  emoji('flower', '🌻', 'الزَّهْرَةُ'),
  emoji('cat', '🐈', 'القِطَّةُ'),
  emoji('child', '👦', 'الطِّفْلُ'),
  emoji('fish', '🐟', 'السَّمَكَةُ'),
]
const NON_LIVING = [
  emoji('rock', '🪨', 'الصَّخْرَةُ'),
  emoji('ball', '⚽', 'الكُرَةُ'),
  emoji('car', '🚗', 'السَّيّارَةُ'),
  emoji('house', '🏠', 'البَيْتُ'),
  emoji('chair', '🪑', 'الكُرْسِيُّ'),
  emoji('teddy', '🧸', 'الدُّبُّ اللُّعْبَةُ'),
]

/** The book's pictures of worship that bring us to Paradise (p. 131), and behaviour that is not worship. */
const WORSHIP: PicId[] = ['pray-rug', 'quran-read', 'give-poor', 'animal-kind', 'hajj', 'sujood', 'dua-girl', 'help-elder', 'father-mosque', 'iftar']
const NOT_WORSHIP: PicId[] = ['kids-mock', 'litter-walk', 'car-litter', 'hit-cat', 'kids-fight']

/** The six pillars of faith as the hadith lists them (p. 123). */
const PILLARS = ['الإيمانُ بِاللهِ', 'وَمَلائِكَتِهِ', 'وَكُتُبِهِ', 'وَرُسُلِهِ', 'وَاليَوْمِ الآخِرِ', 'وَالقَدَرِ خَيْرِهِ وَشَرِّهِ']

const CREATOR: { id: PicId; says: string }[] = [
  { id: 'creator-earth', says: 'اللهُ تَعالى خالِقُ الأَرْضِ وَالسَّماءِ وَما فيهِما' },
  { id: 'creator-river', says: 'اللهُ تَعالى أَنْزَلَ الأَمْطارَ وَفَجَّرَ الأَنْهارَ' },
  { id: 'creator-animals', says: 'اللهُ تَعالى خالِقُ الحَيَواناتِ وَالنَّباتاتِ فَأَبْدَعَ فيها' },
]

const [M1, M2, M3, , M5] = MASAD.verses.map((text) => text.split(' '))

const BUILT: Question[] = [
  // 1. اللهُ تعالى الخالقُ المصوِّر ─────────────────────────────────────────
  choose('khaliq', 'who', 'الخالِقُ المُصَوِّرُ هُوَ ...... عَزَّ وَجَلَّ.', 'اللهُ', ['الإِنْسانُ'], 'الخالِقُ المُصَوِّرُ هُوَ اللهُ عَزَّ وَجَلَّ', d(10), 'creator', { instruction: SAY.complete }),
  choose('khaliq', 'best-form', 'خَلَقَ اللهُ تَعالى الإِنْسانَ في أَحْسَنِ ......', 'صورَةٍ', ['لُعْبَةٍ'], 'خَلَقَ اللهُ تَعالى الإِنْسانَ في أَحْسَنِ صورَةٍ', d(15), 'musawwir', { instruction: SAY.complete }),
  choose('khaliq', 'earth', 'مَنْ خَلَقَ الأَرْضَ وَالسَّماءَ؟', 'اللهُ تَعالى', ['الإِنْسانُ'], 'اللهُ تَعالى خالِقُ الأَرْضِ وَالسَّماءِ وَما فيهِما', d(10), 'creator'),
  choose('khaliq', 'khaliq-meaning', 'مَعْنى الخالِقِ:', MEANING_KHALIQ, [MEANING_MUSAWWIR], `الخالِقُ: ${MEANING_KHALIQ}`, d(30), 'names_meaning'),
  choose('khaliq', 'musawwir-meaning', 'مَعْنى المُصَوِّرِ:', MEANING_MUSAWWIR, [MEANING_KHALIQ], `المُصَوِّرُ: ${MEANING_MUSAWWIR}`, d(30), 'names_meaning'),
  tf('khaliq', 'all-things', 'اللهُ تَعالى خالِقُ كُلِّ شَيْءٍ.', true, 'اللهُ تَعالى خالِقُ كُلِّ شَيْءٍ', d(10)),
  tf('khaliq', 'best-form', 'خَلَقَ اللهُ تَعالى الإِنْسانَ في أَحْسَنِ صورَةٍ.', true, 'خَلَقَ اللهُ تَعالى الإِنْسانَ في أَحْسَنِ صورَةٍ', d(10)),
  tf('khaliq', 'people-made', 'الإِنْسانُ هُوَ الَّذي خَلَقَ الأَرْضَ وَالسَّماءَ.', false, 'اللهُ تَعالى خالِقُ الأَرْضِ وَالسَّماءِ وَما فيهِما', d(15)),
  tf('khaliq', 'khaliq', 'الخالِقُ: الَّذي أَوْجَدَ الأَشْياءَ مِنَ العَدَمِ.', true, `الخالِقُ: ${MEANING_KHALIQ}`, d(20), 'names_meaning'),
  tf('khaliq', 'same-colours', 'الأَسْماكُ وَالطُّيورُ وَالزُّهورُ لَها لَوْنٌ واحِدٌ.', false, 'اللهُ تَعالى أَبْدَعَ في تَصْويرِ الكائِناتِ: صُوَرُها مُتَنَوِّعَةٌ وَأَلْوانُها كَثيرَةٌ', d(20), 'musawwir'),
  tf('khaliq', 'thank', 'نَشْكُرُ اللهَ تَعالى عَلى خَلْقِنا في أَحْسَنِ صورَةٍ.', true, 'نَشْكُرُ اللهَ تَعالى عَلى خَلْقِنا في أَحْسَنِ صورَةٍ', d(10), 'value'),
  tf('khaliq', 'rain', 'اللهُ تَعالى أَنْزَلَ الأَمْطارَ وَفَجَّرَ الأَنْهارَ.', true, 'اللهُ تَعالى أَنْزَلَ الأَمْطارَ وَفَجَّرَ الأَنْهارَ', d(10)),
  cloze('khaliq', 'dua-khalq', 'dua', 'خَلْقي', 'بَيْتي', 'اللَّهُمَّ أَحْسَنْتَ خَلْقي فَأَحْسِنْ خُلُقي', d(20), 'dua'),
  cloze('khaliq', 'dua-khuluq', 'dua', 'خُلُقي', 'ثَوْبي', 'اللَّهُمَّ أَحْسَنْتَ خَلْقي فَأَحْسِنْ خُلُقي', d(25), 'dua'),
  match(
    'khaliq',
    'names',
    'صل بين الصفة ومعناها.',
    [
      ['txt:الخالِقُ', `txt:${MEANING_KHALIQ}`, 'الخالِقُ'],
      ['txt:المُصَوِّرُ', `txt:${MEANING_MUSAWWIR}`, 'المُصَوِّرُ'],
    ],
    `الخالِقُ: ${MEANING_KHALIQ}، وَالمُصَوِّرُ: ${MEANING_MUSAWWIR}`,
    d(30),
    'names_meaning',
  ),
  match('khaliq', 'creation', 'صل الصورة بما يناسبها.', CREATOR.map(({ id, says }) => [`pic:${id}`, `txt:${says.replace('اللهُ تَعالى ', '')}`, PICS[id]]), 'اللهُ تَعالى خالِقُ كُلِّ شَيْءٍ', d(25), 'creator'),
  ...CREATOR.map(({ id, says }) =>
    picture('khaliq', id.replace('creator-', ''), `حوّط الصورة الدالة على أن ${says.replace('اللهُ تَعالى', 'الله تعالى')}.`.replace(/[ً-ِْ]/g, ''), [id], CREATOR.filter((other) => other.id !== id).map((other) => other.id), 2, () => says, d(15), 'creator', says),
  ),
  mark('khaliq', 'land-sea', 'لوّن المخلوقات البرية باللون الأخضر، والمخلوقات البحرية باللون الأزرق.', LAND, SEA, 2, 2, 'مِنْ مَخْلوقاتِ اللهِ تَعالى ما يَعيشُ في البَرِّ، وَما يَعيشُ في البَحْرِ', d(15), 'classify', 'colour'),
  circle('khaliq', 'living', 'حوّط الكائنات الحية في الصورة.', LIVING, NON_LIVING, 3, 2, 'الإِنْسانُ وَالحَيَوانُ وَالنَّباتُ كائِناتٌ حَيَّةٌ خَلَقَها اللهُ تَعالى', d(20), 'living'),
  order('khaliq', 'all-things', 'أعد ترتيب الكلمات لتكوّن جملة.', [txt('w1', 'اللهُ تَعالى'), txt('w2', 'خالِقُ'), txt('w3', 'كُلِّ شَيْءٍ')], 'اللهُ تَعالى خالِقُ كُلِّ شَيْءٍ', d(20), 'creator'),
  order('khaliq', 'dua', 'أعد ترتيب الكلمات لتكوّن جملة.', [txt('w1', 'أَدْعو'), txt('w2', 'اللهَ تَعالى'), txt('w3', 'خالِقي')], 'أَدْعو اللهَ تَعالى خالِقي', d(15), 'value'),

  // 2. أركان الإيمان ─────────────────────────────────────────────────────────
  cloze('iman', 'allah', 'iman', 'بِاللهِ', 'بِالنّاسِ', 'أَنْ تُؤْمِنَ بِاللهِ: أَوَّلُ أَرْكانِ الإيمانِ', d(15), 'hadith_iman'),
  cloze('iman', 'angels', 'iman', 'وَمَلائِكَتِهِ', 'وَبُيوتِهِ', 'الإيمانُ بِالمَلائِكَةِ رُكْنٌ مِنْ أَرْكانِ الإيمانِ', d(20), 'hadith_iman'),
  cloze('iman', 'books', 'iman', 'وَكُتُبِهِ', 'وَدَفاتِرِهِ', 'الإيمانُ بِالكُتُبِ رُكْنٌ مِنْ أَرْكانِ الإيمانِ', d(20), 'hadith_iman'),
  cloze('iman', 'messengers', 'iman', 'وَرُسُلِهِ', 'وَأَصْدِقائِهِ', 'الإيمانُ بِالرُّسُلِ رُكْنٌ مِنْ أَرْكانِ الإيمانِ', d(20), 'hadith_iman'),
  cloze('iman', 'last-day', 'iman', 'وَاليَوْمِ الآخِرِ', 'وَيَوْمِ العيدِ', 'الإيمانُ بِاليَوْمِ الآخِرِ رُكْنٌ مِنْ أَرْكانِ الإيمانِ', d(25), 'hadith_iman'),
  cloze('iman', 'qadar', 'iman', 'بِالقَدَرِ', 'بِاللَّعِبِ', 'وَتُؤْمِنَ بِالقَدَرِ خَيْرِهِ وَشَرِّهِ: آخِرُ أَرْكانِ الإيمانِ', d(25), 'hadith_iman'),
  choose('iman', 'count', 'عَدَدُ أَرْكانِ الإيمانِ:', 'سِتَّةٌ', ['خَمْسَةٌ', 'سَبْعَةٌ'], 'أَرْكانُ الإيمانِ سِتَّةٌ', d(10), 'pillars_count'),
  count('iman', 'count', 'لوّن عدد أركان الإيمان.', 6, [3, 6], 'أَرْكانُ الإيمانِ سِتَّةٌ', d(10), 'pillars_count'),
  choose('iman', 'asker', 'السّائِلُ في قِصَّةِ حَديثِ الإيمانِ هُوَ:', 'جِبْريلُ عَلَيْهِ السَّلامُ', ['عُمَرُ بْنُ الخَطّابِ رَضِيَ اللهُ عَنْهُ'], 'السّائِلُ هُوَ جِبْريلُ عَلَيْهِ السَّلامُ، وَراوي الحَديثِ عُمَرُ بْنُ الخَطّابِ رَضِيَ اللهُ عَنْهُ', d(25), 'iman_story'),
  choose('iman', 'first-question', 'السُّؤالُ الأَوَّلُ كانَ عَنِ:', 'الإِسْلامِ', ['الإيمانِ'], 'سَأَلَ جِبْريلُ عَلَيْهِ السَّلامُ أَوَّلًا عَنِ الإِسْلامِ، ثُمَّ عَنِ الإيمانِ', d(30), 'iman_story'),
  choose('iman', 'second-question', 'السُّؤالُ الثّاني كانَ عَنِ:', 'الإيمانِ', ['الإِسْلامِ'], 'سَأَلَ جِبْريلُ عَلَيْهِ السَّلامُ أَوَّلًا عَنِ الإِسْلامِ، ثُمَّ عَنِ الإيمانِ', d(30), 'iman_story'),
  choose('iman', 'heart', 'الإيمانُ: ما اسْتَقَرَّ في ......', 'القَلْبِ', ['اليَدِ'], `الإيمانُ: ${MEANING_IMAN}`, d(20), 'iman_meaning', { instruction: SAY.complete }),
  choose('iman', 'values', 'الإيمانُ يَغْرِسُ فينا ......', 'القِيَمَ', ['الكَسَلَ'], 'الإيمانُ يَغْرِسُ فينا القِيَمَ كَالصِّدْقِ وَالمَحَبَّةِ وَالتَّعاوُنِ، فَنَعيشُ في أَمْنٍ وَسَلامٍ', d(20), 'iman_kuwait', { instruction: SAY.complete }),
  tf('iman', 'six', 'أَرْكانُ الإيمانِ سِتَّةٌ.', true, 'أَرْكانُ الإيمانِ سِتَّةٌ', d(10), 'pillars_count'),
  tf('iman', 'five', 'أَرْكانُ الإيمانِ خَمْسَةٌ.', false, 'أَرْكانُ الإيمانِ سِتَّةٌ، وَأَرْكانُ الإِسْلامِ خَمْسَةٌ', d(15), 'pillars_count'),
  tf('iman', 'angels', 'الإيمانُ بِالمَلائِكَةِ مِنْ أَرْكانِ الإيمانِ.', true, 'الإيمانُ بِالمَلائِكَةِ مِنْ أَرْكانِ الإيمانِ', d(15), 'pillars_names'),
  tf('iman', 'last-day', 'الإيمانُ بِاليَوْمِ الآخِرِ مِنْ أَرْكانِ الإيمانِ.', true, 'الإيمانُ بِاليَوْمِ الآخِرِ مِنْ أَرْكانِ الإيمانِ', d(15), 'pillars_names'),
  tf('iman', 'meaning', 'الإيمانُ: ما اسْتَقَرَّ في القَلْبِ وَصَدَّقَهُ العَمَلُ.', true, `الإيمانُ: ${MEANING_IMAN}`, d(20), 'iman_meaning'),
  tf('iman', 'kuwait', 'الإيمانُ يَغْرِسُ فينا القِيَمَ، فَنَعيشُ في أَمْنٍ وَسَلامٍ في بَلَدِنا الكُوَيْتِ.', true, 'الإيمانُ يَغْرِسُ فينا القِيَمَ، فَنَعيشُ في أَمْنٍ وَسَلامٍ في بَلَدِنا الكُوَيْتِ', d(20), 'iman_kuwait'),
  tf('iman', 'asker-omar', 'السّائِلُ في قِصَّةِ حَديثِ الإيمانِ هُوَ عُمَرُ بْنُ الخَطّابِ رَضِيَ اللهُ عَنْهُ.', false, 'السّائِلُ هُوَ جِبْريلُ عَلَيْهِ السَّلامُ', d(30), 'iman_story'),
  {
    ...order('iman', 'pillars', 'رتّب أركان الإيمان كما في الحديث الشريف.', PILLARS.map((text, n) => txt(`r${n + 1}`, text)), 'أَنْ تُؤْمِنَ بِاللهِ وَمَلائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَاليَوْمِ الآخِرِ، وَتُؤْمِنَ بِالقَدَرِ خَيْرِهِ وَشَرِّهِ', d(35), 'pillars_order'),
    after: [clip.say(`${HADITH.iman.lead} ${HADITH.iman.text}`)],
  },
  match(
    'iman',
    'story',
    'صل بين العبارة وما يناسبها.',
    [
      ['txt:السّائِلُ في القِصَّةِ', 'txt:جِبْريلُ عَلَيْهِ السَّلامُ', 'السّائِلُ في القِصَّةِ'],
      ['txt:السُّؤالُ الأَوَّلُ', 'txt:عَنِ الإِسْلامِ', 'السُّؤالُ الأَوَّلُ'],
      ['txt:السُّؤالُ الثّاني', 'txt:عَنِ الإيمانِ', 'السُّؤالُ الثّاني'],
    ],
    'سَأَلَ جِبْريلُ عَلَيْهِ السَّلامُ النَّبِيَّ ﷺ عَنِ الإِسْلامِ، ثُمَّ عَنِ الإيمانِ',
    d(30),
    'iman_story',
  ),
  circle(
    'iman',
    'pillars',
    'ضع دائرة حول أركان الإيمان.',
    ['الإيمانُ بِالمَلائِكَةِ', 'الإيمانُ بِالكُتُبِ', 'الإيمانُ بِالرُّسُلِ', 'الإيمانُ بِاليَوْمِ الآخِرِ', 'الإيمانُ بِالقَدَرِ'].map((text, n) => txt(`g${n + 1}`, text)),
    ['صَوْمُ رَمَضانَ', 'إيتاءُ الزَّكاةِ', 'حَجُّ البَيْتِ'].map((text, n) => txt(`b${n + 1}`, text)),
    2,
    2,
    'أَرْكانُ الإيمانِ سِتَّةٌ: الإيمانُ بِاللهِ وَمَلائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَاليَوْمِ الآخِرِ وَالقَدَرِ. أَمّا الصَّوْمُ وَالزَّكاةُ وَالحَجُّ فَمِنْ أَرْكانِ الإِسْلامِ',
    d(35),
    'pillars_names',
  ),

  // 3. كلمة التوحيد ──────────────────────────────────────────────────────────
  cloze('tawhid', 'janna', 'tawhid', 'الجَنَّةَ', 'النّارَ', 'مَنْ قالَ لا إِلَهَ إِلّا اللهُ، ثُمَّ ماتَ عَلى ذَلِكَ دَخَلَ الجَنَّةَ', d(15), 'hadith_tawhid'),
  cloze('tawhid', 'kalima', 'tawhid', 'لا إِلَهَ إِلّا اللهُ', 'سُبْحانَ اللهِ', 'كَلِمَةُ التَّوْحيدِ: لا إِلَهَ إِلّا اللهُ', d(20), 'hadith_tawhid'),
  cloze('tawhid', 'died', 'tawhid', 'ماتَ', 'نامَ', 'ثُمَّ ماتَ عَلى ذَلِكَ إِلّا دَخَلَ الجَنَّةَ', d(25), 'hadith_tawhid'),
  cloze('tawhid', 'servant', 'tawhid', 'عَبْدٍ', 'بَيْتٍ', 'ما مِنْ عَبْدٍ قالَ: لا إِلَهَ إِلّا اللهُ', d(25), 'hadith_tawhid'),
  choose('tawhid', 'kalima', 'كَلِمَةُ التَّوْحيدِ:', 'لا إِلَهَ إِلّا اللهُ', ['سُبْحانَ اللهِ وَبِحَمْدِهِ', 'صَلّى اللهُ عَلَيْهِ وَسَلَّمَ'], 'كَلِمَةُ التَّوْحيدِ: لا إِلَهَ إِلّا اللهُ', d(10), 'kalima'),
  choose('tawhid', 'meaning', 'مَعْنى كَلِمَةِ التَّوْحيدِ:', MEANING_TAWHID, [MEANING_KHALIQ], `مَعْنى لا إِلَهَ إِلّا اللهُ: ${MEANING_TAWHID}`, d(25), 'kalima_meaning'),
  choose('tawhid', 'reward', 'العَمَلُ بِكَلِمَةِ التَّوْحيدِ جَزاؤُهُ ......', 'الجَنَّةُ', ['النّارُ'], 'العَمَلُ بِكَلِمَةِ التَّوْحيدِ جَزاؤُهُ الجَنَّةُ', d(15), 'kalima_virtue', { instruction: SAY.complete }),
  choose('tawhid', 'key', 'كَلِمَةُ التَّوْحيدِ مِفْتاحُ ......', 'الإِسْلامِ', ['البَيْتِ'], 'كَلِمَةُ التَّوْحيدِ: أَصْلُ العِبادَةِ، وَمِفْتاحُ الإِسْلامِ، وَسَبَبٌ لِدُخولِ الجَنَّةِ', d(20), 'kalima_virtue', { instruction: SAY.complete }),
  tf('tawhid', 'is-kalima', 'لا إِلَهَ إِلّا اللهُ هِيَ كَلِمَةُ التَّوْحيدِ.', true, 'لا إِلَهَ إِلّا اللهُ هِيَ كَلِمَةُ التَّوْحيدِ', d(10), 'kalima'),
  tf('tawhid', 'not-tasbih', 'كَلِمَةُ التَّوْحيدِ: سُبْحانَ اللهِ وَبِحَمْدِهِ.', false, 'كَلِمَةُ التَّوْحيدِ: لا إِلَهَ إِلّا اللهُ', d(15), 'kalima'),
  tf('tawhid', 'root', 'كَلِمَةُ التَّوْحيدِ أَصْلُ العِبادَةِ.', true, 'كَلِمَةُ التَّوْحيدِ أَصْلُ العِبادَةِ', d(15), 'kalima_virtue'),
  tf('tawhid', 'paradise', 'العِباداتُ وَالطّاعاتُ تُدْخِلُ المُسْلِمَ الجَنَّةَ.', true, 'العِباداتُ وَالطّاعاتُ تُدْخِلُ المُسْلِمَ الجَنَّةَ', d(15), 'worship'),
  tf('tawhid', 'meaning', 'مَعْنى لا إِلَهَ إِلّا اللهُ: لا مَعْبودَ يَسْتَحِقُّ العِبادَةَ إِلّا اللهُ تَعالى وَحْدَهُ.', true, `مَعْنى لا إِلَهَ إِلّا اللهُ: ${MEANING_TAWHID}`, d(25), 'kalima_meaning'),
  match(
    'tawhid',
    'virtues',
    'صل لتتعرف على فضائل كلمة التوحيد.',
    [
      ['txt:أَصْلُ', 'txt:العِبادَةِ', 'أَصْلُ'],
      ['txt:مِفْتاحُ', 'txt:الإِسْلامِ', 'مِفْتاحُ'],
      ['txt:سَبَبٌ لِدُخولِ', 'txt:الجَنَّةِ', 'سَبَبٌ لِدُخولِ'],
    ],
    'كَلِمَةُ التَّوْحيدِ: أَصْلُ العِبادَةِ، وَمِفْتاحُ الإِسْلامِ، وَسَبَبٌ لِدُخولِ الجَنَّةِ',
    d(25),
    'kalima_virtue',
  ),
  match(
    'tawhid',
    'concepts',
    'صل بين الكلمة ومفهومها.',
    [
      ['txt:الخالِقُ', `txt:${MEANING_KHALIQ}`, 'الخالِقُ'],
      ['txt:المُصَوِّرُ', `txt:${MEANING_MUSAWWIR}`, 'المُصَوِّرُ'],
      ['txt:التَّوْحيدُ', `txt:${MEANING_TAWHID}`, 'التَّوْحيدُ'],
    ],
    `التَّوْحيدُ: ${MEANING_TAWHID}`,
    d(35),
    'kalima_meaning',
  ),
  order('tawhid', 'meaning', 'أعد ترتيب الكلمات لتكوّن جملة.', [txt('w1', 'لا مَعْبودَ'), txt('w2', 'يَسْتَحِقُّ العِبادَةَ'), txt('w3', 'إِلّا اللهُ')], 'لا مَعْبودَ يَسْتَحِقُّ العِبادَةَ إِلّا اللهُ', d(25), 'kalima_meaning'),
  circle('tawhid', 'worship', 'حوّط العبادات التي تدخلنا الجنة.', pics(WORSHIP), pics(NOT_WORSHIP), 2, 2, 'العِباداتُ وَالطّاعاتُ تُدْخِلُ المُسْلِمَ الجَنَّةَ: الصَّلاةُ، وَقِراءَةُ القُرْآنِ، وَالصَّدَقَةُ، وَالرِّفْقُ بِالحَيَوانِ', d(15), 'worship', 'العِباداتُ وَالطّاعاتُ تُدْخِلُ المُسْلِمَ الجَنَّةَ.'),
  mark('tawhid', 'worship', 'ضع علامة (✓) أسفل العبادة التي تدخلنا الجنة، وعلامة (✗) أسفل غيرها.', pics(WORSHIP), pics(NOT_WORSHIP), 2, 1, 'العِباداتُ وَالطّاعاتُ تُدْخِلُ المُسْلِمَ الجَنَّةَ', d(15), 'worship', 'tick', 'العِباداتُ وَالطّاعاتُ تُدْخِلُ المُسْلِمَ الجَنَّةَ.'),

  // 4. سورة المسد ───────────────────────────────────────────────────────────
  ayat('masad', d(35)),
  ...[1, 2, 3, 4, 5].map((n) => verseGap('masad', n, d(n === 5 ? 15 : 25))),
  ...[1, 2, 3, 4].map((n) => nextVerse('masad', n, d(30))),
  listen('masad', 1, d(15)),
  listen('masad', 5, d(20)),
  meaning('masad', 'tabbat', M1![0]!, 'هَلَكَتْ', ['جَماعاتٌ', 'اللّيفُ'], d(20)),
  meaning('masad', 'aghna', `${M2![0]} ${M2![1]}`, 'ما نَفَعَ', ['هَلَكَتْ', 'في عُنُقِها'], d(25)),
  meaning('masad', 'lahab', `${M3![2]} ${M3![3]}`, 'ذاتَ اشْتِعالٍ', ['ما نَفَعَ', 'الفَوْزُ'], d(25)),
  meaning('masad', 'jid', M5![1]!, 'في عُنُقِها', ['ذاتَ اشْتِعالٍ', 'هَلَكَتْ'], d(25)),
  meaning('masad', 'masad', 'مَسَدٍ', 'اللّيفُ', ['جَماعاتٌ', 'ما نَفَعَ'], d(25)),
  match(
    'masad',
    'meaning-words',
    SAY.meaning,
    [
      [`qw:${M1![0]}`, 'txt:هَلَكَتْ', M1![0]!],
      [`qw:${M2![0]} ${M2![1]}`, 'txt:ما نَفَعَ', `${M2![0]} ${M2![1]}`],
      [`qw:${M3![2]} ${M3![3]}`, 'txt:ذاتَ اشْتِعالٍ', `${M3![2]} ${M3![3]}`],
      [`qw:${M5![1]}`, 'txt:في عُنُقِها', M5![1]!],
      ['qw:مَسَدٍ', 'txt:اللّيفُ', 'مَسَدٍ'],
    ],
    'تَبَّتْ: هَلَكَتْ، ما أَغْنى: ما نَفَعَ، ذاتَ لَهَبٍ: ذاتَ اشْتِعالٍ، جيدِها: في عُنُقِها، مَسَدٍ: اللّيفُ',
    d(30),
    'word_meaning',
    3,
  ),
  match(
    'masad',
    'pictures',
    'صل الصورة بالآية الدالة عليها.',
    [
      ['pic:fire', 'aya:111:3', PICS.fire],
      ['pic:rope', 'aya:111:5', PICS.rope],
    ],
    'سَيَصْلى نارًا ذاتَ لَهَبٍ: النّارُ، وَفي جيدِها حَبْلٌ مِنْ مَسَدٍ: الحَبْلُ',
    d(20),
    'verse_picture',
  ),
  surahType('masad', true, d(15)),
  count('masad', 'verses', 'لوّن عدد آيات سورة المسد.', 5, [3, 4, 5], 'سورَةُ المَسَدِ خَمْسُ آياتٍ', d(15), 'verse_count'),
  hub('masad', d(25)),
  choose('masad', 'place-masad', 'ظلّل الخيار الذي يبيّن مكان ذكر كلمة (مَسَدٍ) في السورة الكريمة.', 'آخِرُ السّورَةِ', ['أَوَّلُ السّورَةِ', 'وَسَطُ السّورَةِ'], 'كَلِمَةُ مَسَدٍ في آخِرِ آيَةٍ مِنَ السّورَةِ', d(25), 'word_place', { instruction: 'ظلّل الخيار الصحيح.', format: 'fill', pickStyle: 'fill', fixedOrder: true, shown: ['أَوَّلُ السّورَةِ', 'وَسَطُ السّورَةِ', 'آخِرُ السّورَةِ'] }),
  choose('masad', 'place-tabbat', 'ظلّل الخيار الذي يبيّن مكان ذكر كلمة (تَبَّتْ) في السورة الكريمة.', 'أَوَّلُ السّورَةِ', ['وَسَطُ السّورَةِ', 'آخِرُ السّورَةِ'], 'تَبْدَأُ السّورَةُ بِكَلِمَةِ تَبَّتْ', d(20), 'word_place', { instruction: 'ظلّل الخيار الصحيح.', format: 'fill', pickStyle: 'fill', fixedOrder: true, shown: ['أَوَّلُ السّورَةِ', 'وَسَطُ السّورَةِ', 'آخِرُ السّورَةِ'] }),
  choose('masad', 'about', 'نَزَلَتْ سورَةُ المَسَدِ في:', 'عَمِّ النَّبِيِّ ﷺ أَبي لَهَبٍ وَزَوْجَتِهِ', ['أَصْحابِ النَّبِيِّ ﷺ'], 'نَزَلَتْ في عَمِّ النَّبِيِّ ﷺ أَبي لَهَبٍ وَزَوْجَتِهِ، دِفاعًا عَنِ النَّبِيِّ ﷺ', d(20), 'occasion'),
  choose('masad', 'salawat', 'نَقولُ عِنْدَ ذِكْرِ اسْمِ النَّبِيِّ:', 'صَلّى اللهُ عَلَيْهِ وَسَلَّمَ', ['رَضِيَ اللهُ عَنْهُ'], 'نَقولُ عِنْدَ ذِكْرِ اسْمِ النَّبِيِّ: صَلّى اللهُ عَلَيْهِ وَسَلَّمَ، حُبًّا لَهُ', d(10), 'value'),
  tf('masad', 'makki', 'سورَةُ المَسَدِ مَكِّيَّةٌ.', true, 'سورَةُ المَسَدِ مَكِّيَّةٌ', d(15), 'surah_type'),
  tf('masad', 'three', 'عَدَدُ آياتِ سورَةِ المَسَدِ ثَلاثُ آياتٍ.', false, 'عَدَدُ آياتِ سورَةِ المَسَدِ خَمْسُ آياتٍ', d(15), 'verse_count'),
  tf('masad', 'harm', 'كانَ أَبو لَهَبٍ وَامْرَأَتُهُ مِنْ أَشَدِّ النّاسِ إيذاءً لِلرَّسولِ ﷺ.', true, 'كانَ أَبو لَهَبٍ وَامْرَأَتُهُ مِنْ أَشَدِّ النّاسِ إيذاءً لِلرَّسولِ ﷺ', d(25), 'overall_meaning'),
  letter(
    'masad',
    'jim',
    'حوّط حرف الجيم (ج).',
    [
      { id: 'jim', art: 'big:ج', label: 'ج' },
      { id: 'kha', art: 'big:خ', label: 'خ' },
      { id: 'ha', art: 'big:ح', label: 'ح' },
    ],
    'jim',
    'حَرْفُ الجيمِ: جَ جُ جِ، كَما في كَلِمَةِ جيدِها',
    [clip.letter('jim')],
    d(15),
  ),
  letter('masad', 'jim-word', 'حوّط الكلمة التي فيها حرف الجيم (ج).', [qw('o1', M5![1]!), qw('o2', M5![2]!), qw('o3', M3![3]!)], 'o1', 'حَرْفُ الجيمِ في كَلِمَةِ جيدِها', [clip.letter('jim')], d(20)),

  // 5. سورة النصر ───────────────────────────────────────────────────────────
  ayat('nasr', d(30)),
  verseGap('nasr', 1, d(15), [FAJR_FIRST_WORD]),
  verseGap('nasr', 2, d(25)),
  verseGap('nasr', 3, d(25)),
  ...[1, 2].map((n) => nextVerse('nasr', n, d(25))),
  listen('nasr', 1, d(15)),
  listen('nasr', 3, d(20)),
  meaning('nasr', 'nasr', 'نَصْرُ', 'الفَوْزُ', ['جَماعاتٌ', 'هَلَكَتْ'], d(15)),
  meaning('nasr', 'afwaj', 'أَفْوَاجًا', 'جَماعاتٌ', ['الفَوْزُ', 'اللّيفُ'], d(15)),
  match(
    'nasr',
    'meaning-words',
    SAY.meaning,
    [
      ['qw:نَصْرُ', 'txt:الفَوْزُ', 'نَصْرُ'],
      ['qw:أَفْوَاجًا', 'txt:جَماعاتٌ', 'أَفْوَاجًا'],
    ],
    'نَصْرُ: الفَوْزُ، وَأَفْواجًا: جَماعاتٌ',
    d(15),
    'word_meaning',
  ),
  picture('nasr', 'afwaj', 'حوّط الصورة المناسبة لكلمة (أفواجا).', ['crowds'], ['one-pilgrim', 'few-pilgrims'], 2, () => 'أَفْواجًا: جَماعاتٌ كَثيرَةٌ', d(15), 'word_meaning'),
  surahType('nasr', false, d(15)),
  count('nasr', 'verses', 'لوّن عدد آيات سورة النصر.', 3, [3, 4, 5], 'سورَةُ النَّصْرِ ثَلاثُ آياتٍ', d(10), 'verse_count'),
  hub('nasr', d(25)),
  choose('nasr', 'command', 'بِماذا أَمَرَ اللهُ تَعالى رَسولَهُ ﷺ عِنْدَ فَتْحِ مَكَّةَ؟', 'بِالحَمْدِ وَالتَّسْبيحِ وَالاسْتِغْفارِ', ['بِالنَّوْمِ وَالرّاحَةِ'], 'أَمَرَ اللهُ تَعالى رَسولَهُ ﷺ بِالحَمْدِ وَالتَّسْبيحِ وَالاسْتِغْفارِ عِنْدَ فَتْحِ مَكَّةَ، وَدُخولِ النّاسِ في دينِ اللهِ تَعالى بِأَعْدادٍ كَبيرَةٍ', d(25), 'overall_meaning'),
  choose('nasr', 'glad-tidings', 'بِماذا بَشَّرَ اللهُ تَعالى نَبِيَّنا مُحَمَّدًا ﷺ؟', 'بِفَتْحِ مَكَّةَ', ['بِنُزولِ المَطَرِ'], 'كانَتِ البِشارَةُ في سورَةِ النَّصْرِ: بَشَّرَ اللهُ تَعالى نَبِيَّنا ﷺ بِفَتْحِ مَكَّةَ قَبْلَ وُقوعِهِ', d(25), 'occasion'),
  choose('nasr', 'dhikr', 'أُكْثِرُ مِنْ قَوْلِ:', 'سُبْحانَ اللهِ، الحَمْدُ لِلّهِ، أَسْتَغْفِرُ اللهَ', ['الكَلامِ السَّيِّئِ'], 'أُكْثِرُ مِنْ قَوْلِ: سُبْحانَ اللهِ، الحَمْدُ لِلّهِ، أَسْتَغْفِرُ اللهَ', d(10), 'value'),
  tf('nasr', 'madani', 'سورَةُ النَّصْرِ مَدَنِيَّةٌ.', true, 'سورَةُ النَّصْرِ مَدَنِيَّةٌ', d(15), 'surah_type'),
  tf('nasr', 'makki', 'سورَةُ النَّصْرِ مَكِّيَّةٌ.', false, 'سورَةُ النَّصْرِ مَدَنِيَّةٌ', d(20), 'surah_type'),
  tf('nasr', 'three', 'عَدَدُ آياتِ سورَةِ النَّصْرِ ثَلاثُ آياتٍ.', true, 'عَدَدُ آياتِ سورَةِ النَّصْرِ ثَلاثُ آياتٍ', d(10), 'verse_count'),
  tf('nasr', 'afwaj', 'مَعْنى أَفْواجًا: جَماعاتٌ.', true, 'مَعْنى أَفْواجًا: جَماعاتٌ', d(20), 'word_meaning'),
  letter(
    'nasr',
    'kha',
    'حوّط حرف الخاء (خ).',
    [
      { id: 'jim', art: 'big:ج', label: 'ج' },
      { id: 'kha', art: 'big:خ', label: 'خ' },
      { id: 'ha', art: 'big:ح', label: 'ح' },
    ],
    'kha',
    'حَرْفُ الخاءِ: خَ خُ خِ، كَما في كَلِمَةِ يَدْخُلونَ',
    [clip.letter('kha')],
    d(15),
  ),
  letter('nasr', 'kha-word', 'حوّط الكلمة التي فيها حرف الخاء (خ).', (() => {
    const words = NASR.verses[1]!.split(' ')
    return [qw('o1', words[2]!), qw('o2', words[1]!), qw('o3', words[4]!)]
  })(), 'o1', 'حَرْفُ الخاءِ في كَلِمَةِ يَدْخُلونَ', [clip.letter('kha')], d(20)),
]

/** The questions, with each «if recorded» explanation kept only when those words are recorded anyway. */
export const QUESTIONS: Question[] = BUILT.map((question) => ({
  ...question,
  after: question.after.flatMap((cue) => (cue.startsWith(IF_RECORDED) ? (LAYLA.has(cue.slice(IF_RECORDED.length + 'fs/s/'.length)) ? [cue.slice(IF_RECORDED.length)] : []) : [cue])),
}))

// ── Maryam's lines for the moments of a round ─────────────────────────────
/** Several ways for each moment, dealt so none comes twice running. No «…», Kuwaiti words, nobody addressed as a girl or a boy. */
export const AR_LINES = {
  welcome: ['هلا والله! نختار درس ونبدا.', 'حياكم! وين نبدا اليوم؟', 'يلا، أي درس نختار؟'],
  'intro-islamic': ['نموذج اختبار التربية الإسلامية، أسئلته مثل ورقة المدرسة، يلا نبدا!', 'هذا مثل اختبار يوم الثلاثا، نحله مع بعض.'],
  'intro-quran': ['نموذج اختبار القرآن الكريم، أسئلة من سورة المسد وسورة النصر.', 'نتدرب على اختبار يوم الأربعا، يلا نبدا!'],
  review: ['خلنا نشوف الجواب مع بعض.', 'نتعلمها الحين، والمرة الياية تصير أسهل.'],
  again: ['نجرب وحدة غيرها!', 'نحاول مرة ثانية!'],
  'done-great': ['نتيجة حلوة وايد، ما شاء الله!', 'خلصنا الجولة بنتيجة تفرح!'],
  'done-good': ['مع التدريب نصير أشطر!', 'حلو، نعيدها مرة ثانية ونتحسن.'],
} as const
export type ArGroup = keyof typeof AR_LINES

/** Cheers for a right answer: Kuwaiti only, never English. */
export const CHEER_LINES = [
  'يا سلام عالشطارة!',
  'بالضبط!',
  'زين جذي!',
  'الله الله!',
  'أحسنتوا!',
  'مية مية!',
  'عاشت الأيادي!',
  'حلوة هذي!',
  'جواب يبرد القلب!',
  'ذيب!',
  'ما شاء الله تبارك الله!',
  'هذا الجواب!',
] as const

/** On the third and the fifth right answer running. */
export const STREAK_LINES = {
  3: ['ثلاثة صح، ماشين صح!', 'ثلاثة على التوالي، حلو!'],
  5: ['خمسة صح ورا بعض، شي يرفع الراس!', 'خمسة على التوالي، ما شاء الله!'],
} as const

/** A kind word after a wrong choice; the right answer is shown under it. */
export const RETRY_LINES = ['عادي، هذا الجواب الصح.', 'بسيطة، نشوف الجواب الصحيح.', 'محاولة طيبة، والجواب الصح هذا.', 'نتعلم منها، وهذا هو الجواب.'] as const

export interface Line {
  text: string
  clip: string
}

export function arLines(group: ArGroup): Line[] {
  return AR_LINES[group].map((text, n) => ({ text, clip: clip.ui(group, n) }))
}

export const CHEERS: Line[] = CHEER_LINES.map((text, n) => ({ text, clip: `ar/ui/cheer-${n + 1}` }))
export const RETRIES: Line[] = RETRY_LINES.map((text, n) => ({ text, clip: `ar/ui/retry-${n + 1}` }))
export const STREAKS: Record<number, Line[]> = Object.fromEntries(
  Object.entries(STREAK_LINES).map(([streak, lines]) => [streak, lines.map((text, n) => ({ text, clip: `ar/ui/streak-${streak}-${n + 1}` }))]),
)

/** The text shown for a spoken line. */
export function shown(text: string): string {
  return text.trim()
}

// ── Recording list ────────────────────────────────────────────────────────
export interface AudioCue {
  id: string
  text: string
  /** `ar`: Maryam, Kuwaiti, without diacritics · `fs`: Layla, Modern Standard Arabic, with diacritics. */
  voice: 'ar' | 'fs'
}

export function bare(text: string): string {
  return text.replace(/[ً-ْٰ]/g, '')
}

/** Everything Layla reads: the sentences, the written choices, the hadiths and the explanations heard after an answer. */
export function laylaTexts(): { id: string; text: string }[] {
  return [...LAYLA.entries()].map(([id, text]) => ({ id: `fs/s/${id}`, text }))
}

export function audioCues(): AudioCue[] {
  const maryam: AudioCue[] = [
    ...(Object.keys(ASK_LINES) as Format[]).flatMap((format) => ASK_LINES[format].map((text, n): AudioCue => ({ id: clip.line(format, n), text, voice: 'ar' }))),
    ...(Object.keys(AR_LINES) as ArGroup[]).flatMap((group) => arLines(group).map((line): AudioCue => ({ id: line.clip, text: line.text, voice: 'ar' }))),
    ...CHEERS.map((line): AudioCue => ({ id: line.clip, text: line.text, voice: 'ar' })),
    ...Object.values(STREAKS).flatMap((lines) => lines.map((line): AudioCue => ({ id: line.clip, text: line.text, voice: 'ar' }))),
    ...RETRIES.map((line): AudioCue => ({ id: line.clip, text: line.text, voice: 'ar' })),
  ]
  const layla = laylaTexts().map(({ id, text }): AudioCue => ({ id, text, voice: 'fs' }))
  return [...maryam, ...layla]
}

/** Every clip a question needs. */
export function questionClips(question: Question): string[] {
  const options = [...question.options, ...(question.draw?.right ?? []), ...(question.draw?.wrong ?? [])]
  return [...question.ask.slice(1), ...options.flatMap((option) => (option.clip ? [option.clip] : [])), ...question.after]
}

/** Every clip a round needs, so it can be loaded before the first question. */
export function roundClips(questions: Question[]): string[] {
  const formats = new Set(questions.map((question) => question.format))
  return [
    ...questions.flatMap(questionClips),
    ...[...formats].flatMap((format) => ASK_LINES[format].map((_, n) => clip.line(format, n))),
    ...arLines('review').map((line) => line.clip),
    ...arLines('again').map((line) => line.clip),
    ...CHEERS.map((line) => line.clip),
    ...RETRIES.map((line) => line.clip),
    ...Object.values(STREAKS).flatMap((lines) => lines.map((line) => line.clip)),
    ...arLines('done-great').map((line) => line.clip),
    ...arLines('done-good').map((line) => line.clip),
  ]
}

function pickSome<T>(items: readonly T[], howMany: number, random: Random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy.slice(0, howMany)
}

/** A copy of the question for one round: drawn questions get this round's answers and pictures. */
export function dressQuestion(question: Question, random: Random = Math.random): Question {
  const { draw, pictureDraw, pairCount } = question
  if (draw) {
    const right = draw.right[Math.floor(random() * draw.right.length)]!
    const wrong = pickSome(
      draw.wrong.filter((option) => option.id !== right.id),
      draw.count,
      random,
    )
    return { ...question, options: [right, ...wrong], answer: right.id, explain: draw.explain ? draw.explain(right) : question.explain }
  }
  if (pictureDraw) {
    const good = pickSome(pictureDraw.good, pictureDraw.goodCount, random)
    const bad = pickSome(pictureDraw.bad, pictureDraw.badCount, random)
    return { ...question, options: pickSome([...good, ...bad], good.length + bad.length, random), good: good.map((option) => option.id) }
  }
  if (pairCount && pairCount < question.pairs.length) {
    const chosen = new Set(pickSome(question.pairs, pairCount, random).map((pair) => pair.id))
    return { ...question, pairs: question.pairs.filter((pair) => chosen.has(pair.id)) }
  }
  return question
}
