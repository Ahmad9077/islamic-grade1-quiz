// Content for «التربية الإسلامية - الأول الابتدائي» — the first Islamic education test.
// The school's card: every lesson of the first book (١-١), that is units 1 and 2 of the Ministry
// book «التربية الإسلامية» (Grade 1, term 1, 2026/2027, section one):
//   rabbi    — «ربنا الله تعالى» and «توحيد الله تعالى» (العقيدة)
//   arkan    — «أركان الإسلام» (الحديث)
//   ibada    — «العبادة طاعة لله تعالى» (الفقه)
//   rasul    — «الرسول محمد ﷺ هادي البشرية» (السيرة)
//   walidain — «حب الوالدين» and «بر الوالدين» (التهذيب)
//
// The user sent the school's model tests and asked for the same styles of question, because a
// first grader cannot read well yet: each question carries the exam's own instruction line
// («أكمل الحديث الشريف…», «ضع علامة…», «صل…», «حوّط…»), so the child learns to recognise it.
// Hadith wording is the book's. Pictures are the book's own illustrations (public/pics/).
// Questions with a draw take new answers or pictures every round, so attempts keep changing.
// Voice: Maryam's shared phrases, and the five most common instruction lines (SAY_SPOKEN).
// Question keys are permanent Hub ids.
// This file is self-contained so Node scripts can import it directly.

export const QUIZ_ID = 'islamic-grade1'

export type TopicId = 'rabbi' | 'arkan' | 'ibada' | 'rasul' | 'walidain'

/** How the child answers: one choice, a «صل» board, circling pictures, ✓/✗ under pictures, or an order. */
export type QuestionKind = 'pick' | 'match' | 'circle' | 'mark' | 'order'

/** The paper test's question styles, used to build the mock test like the school's model. */
export type Format = 'cloze' | 'tf' | 'choose' | 'picture' | 'match' | 'circle' | 'mark' | 'order'

/**
 * What a tile shows:
 *   pic:<id>     one of the book's pictures          txt:<text>   a word or a short sentence
 *   tf:<yes|no>  the ✓ or ✗ mark
 * Anything else is an emoji.
 */
export type ArtRef = string

const DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
/** A number in the book's digits. */
export const A = (value: number) => String(value).replace(/\d/g, (d) => DIGITS[Number(d)]!)

// ── The book's pictures ───────────────────────────────────────────────────
/** Cropped from the book; the name is what the picture shows, as the book says it. */
export const PICS = {
  'pillar-shahada': 'الشَّهادَتانِ',
  'pillar-salah': 'إِقامَةُ الصَّلاةِ',
  'pillar-zakat': 'إيتاءُ الزَّكاةِ',
  'pillar-hajj': 'حَجُّ البَيْتِ',
  'pillar-sawm': 'صَوْمُ رَمَضانَ',
  'quran-girl': 'قِراءَةُ القُرْآنِ',
  'dua-girl': 'الدُّعاءُ',
  sujood: 'السُّجودُ',
  iftar: 'الصِّيامُ',
  'pray-rug': 'الصَّلاةُ',
  'litter-walk': 'رَمْيُ القُمامَةِ في الطَّريقِ',
  'give-poor': 'مُساعَدَةُ الفَقيرِ',
  'kids-fight': 'الشِّجارُ',
  'clean-beach': 'إِماطَةُ الأَذى',
  'animal-kind': 'الرِّفْقُ بِالحَيَوانِ',
  hijab: 'الحِجابُ',
  hajj: 'الحَجُّ',
  'quran-read': 'قِراءَةُ القُرْآنِ',
  'help-elder': 'مُساعَدَةُ المُحْتاجِ',
  'father-mosque': 'الذَّهابُ لِلْمَسْجِدِ',
  'kids-mock': 'السُّخْرِيَةُ مِنَ الآخَرينَ',
  idols: 'عِبادَةُ الأَصْنامِ',
  torture: 'تَعْذيبُ الضُّعَفاءِ',
  injustice: 'الظُّلْمُ',
  handshake: 'المُصافَحَةُ',
  studying: 'المُذاكَرَةُ',
  'car-litter': 'رَمْيُ القُمامَةِ مِنَ السَّيّارَةِ',
  'help-fallen': 'مُساعَدَةُ صَديقي',
  'prophet-pray': 'الصَّلاةُ',
  'prophet-give': 'الصَّدَقَةُ',
  'hit-cat': 'إيذاءُ الحَيَوانِ',
  care: 'الرِّعايَةُ وَالعِنايَةُ',
  needs: 'تَوْفيرُ الاحْتِياجاتِ',
  teach: 'التَّرْبِيَةُ وَالتَّعْليمُ',
  safety: 'الشُّعورُ بِالأَمانِ',
  sweep: 'مُساعَدَةُ أُمّي',
  'angry-father': 'عِصْيانُ أَبي',
  'dua-parents': 'الدُّعاءُ لِوالِدَيَّ',
} as const
export type PicId = keyof typeof PICS

// ── Clip ids ──────────────────────────────────────────────────────────────
export const clip = {
  ui: (id: UiClip) => `ar/ui/${id}`,
  say: (id: keyof typeof SAY) => `ar/say/${id}`,
}

// ── Explanations ──────────────────────────────────────────────────────────
/** One way to explain an answer: shown on screen, and spoken when a clip exists. */
export interface Explanation {
  text: string
  clips: string[]
}

const says = (...lines: string[]): Explanation[] => lines.map((text) => ({ text, clips: [] }))

// ── Topics ────────────────────────────────────────────────────────────────
export interface Topic {
  id: TopicId
  title: string
  /** The book's field for these lessons, shown on the card like the book's page corner. */
  field: string
  art: ArtRef[]
}

export const TOPICS: Topic[] = [
  { id: 'rabbi', title: 'رَبُّنا اللهُ تَعالى', field: 'العقيدة', art: ['pic:dua-girl'] },
  { id: 'arkan', title: 'أَرْكانُ الإِسْلامِ', field: 'الحديث', art: ['pic:pillar-hajj'] },
  { id: 'ibada', title: 'العِبادَةُ', field: 'الفقه', art: ['pic:quran-read'] },
  { id: 'rasul', title: 'الرَّسولُ مُحَمَّدٌ ﷺ', field: 'السيرة', art: ['pic:father-mosque'] },
  { id: 'walidain', title: 'حُبُّ الوالِدَيْنِ وَبِرُّهُما', field: 'التهذيب', art: ['pic:safety'] },
]

// ── The exam's instruction lines (as printed on the school's model tests) ──
export const SAY = {
  hadith: 'أكمل الحديث الشريف بالكلمة المناسبة بين القوسين.',
  dua: 'أكمل الدعاء بالكلمة المناسبة بين القوسين.',
  tf: 'ضع علامة (✓) أمام العبارة الصحيحة، وعلامة (✗) أمام العبارة الخاطئة.',
  choose: 'حوّط الإجابة الصحيحة بين القوسين.',
  match: 'صل بين العبارة وما يناسبها.',
} as const

/**
 * The same lines as Maryam reads them (the user allowed these five from the credits left before
 * the 2 November reset): the marks are said as words, and a vowel or a shadda is kept only where
 * the word could be misread («حوّط», and «صِل» that must not sound like «صلِّ»).
 */
export const SAY_SPOKEN: Record<keyof typeof SAY, string> = {
  hadith: 'أكمل الحديث الشريف بالكلمة المناسبة بين القوسين.',
  dua: 'أكمل الدعاء بالكلمة المناسبة بين القوسين.',
  tf: 'ضع علامة صح أمام العبارة الصحيحة، وعلامة خطأ أمام العبارة الخاطئة.',
  choose: 'حوّط الإجابة الصحيحة بين القوسين.',
  match: 'صِل بين العبارة وما يناسبها.',
}

/** The recorded instruction line for a question, when its instruction is one of the five. */
function spoken(instruction: string): string[] {
  const id = (Object.keys(SAY) as (keyof typeof SAY)[]).find((key) => SAY[key] === instruction)
  return id ? [clip.say(id)] : []
}

// ── Questions ─────────────────────────────────────────────────────────────
export interface Option {
  id: string
  art: ArtRef
  label: string
  /** Printed under a picture, as on the model tests that name their pictures. */
  caption?: string
  /** Read while the tile lights up; absent when hearing it would give the answer away. */
  clip?: string
}

export interface Pair {
  id: string
  /** Group (أ), on the right where Arabic reading starts; chosen first. */
  first: ArtRef
  /** Group (ب): the partner that answers it. */
  second: ArtRef
  label: string
  clip?: string
}

/** A hadith or a supplication with one word left out, written the way the book prints it. */
export interface Cloze {
  lead: string
  before: string
  after: string
}

/** New answers for every round: one right answer from `right`, and `count` wrong ones from `wrong`. */
export interface Draw {
  right: Option[]
  wrong: Option[]
  count: number
  explain?: (right: Option) => Explanation[]
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
  cloze?: Cloze
  /** Spoken question: the exam's instruction line, when it is one of the recorded five. */
  ask: string[]
  /** pick: the choices · circle and mark: the pictures · order: the items in their right order. */
  options: Option[]
  /** «صح» stays before «خطأ», and an order question keeps its items' given order as the answer. */
  fixedOrder?: boolean
  pairs: Pair[]
  /** pick: the right option. */
  answer: string
  /** circle: the pictures to circle · mark: the pictures that take ✓. */
  good: string[]
  /** How the mark question marks a picture: ✓/✗ like the exam, or the book's faces. */
  marks?: 'tick' | 'face'
  explain: Explanation[]
  draw?: Draw
  pictureDraw?: PictureDraw
  /** match: how many of the pairs one round shows. */
  pairCount?: number
  difficulty: number
  skills: string[]
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
    ask: spoken(instruction),
    options: [] as Option[],
    pairs: [] as Pair[],
    answer: '',
    good: [] as string[],
    skills: [topic, `format_${format}`, ...skills],
    difficulty,
  }
}

const YES: Option = { id: 'yes', art: 'tf:yes', label: 'صح' }
const NO: Option = { id: 'no', art: 'tf:no', label: 'خطأ' }

const txt = (id: string, text: string): Option => ({ id, art: `txt:${text}`, label: text })
const pic = (id: PicId, caption = false): Option => ({ id, art: `pic:${id}`, label: PICS[id], ...(caption ? { caption: PICS[id] } : {}) })
const pics = (ids: PicId[], caption = false) => ids.map((id) => pic(id, caption))
const slug = (n: number) => `o${n + 1}`

/** «ضع علامة (✓) أو (✗)»: one sentence, judged true or false. */
function tf(topic: TopicId, key: string, sentence: string, truth: boolean, fact: string, difficulty: number, skill = 'statement'): Question {
  return {
    ...base(`tf-${key}`, topic, 'pick', 'tf', SAY.tf, sentence, [skill], difficulty),
    options: [YES, NO],
    fixedOrder: true,
    answer: truth ? 'yes' : 'no',
    explain: says(fact),
  }
}

/** «حوّط الإجابة الصحيحة»: a question with written choices; the first choice is right. */
function choose(topic: TopicId, key: string, prompt: string, right: string, wrong: string[], fact: string, difficulty: number, skill: string, instruction: string = SAY.choose): Question {
  const options = [right, ...wrong].map((text, n) => txt(slug(n), text))
  return { ...base(`choose-${key}`, topic, 'pick', 'choose', instruction, prompt, [skill], difficulty), options, answer: options[0]!.id, explain: says(fact) }
}

/** Like `choose`, with a new right answer and new wrong ones every round. */
function choosePool(topic: TopicId, key: string, prompt: string, right: string[], wrong: string[], count: number, fact: (right: string) => string, difficulty: number, skill: string): Question {
  const draw: Draw = {
    right: right.map((text, n) => txt(`r${n + 1}`, text)),
    wrong: wrong.map((text, n) => txt(`w${n + 1}`, text)),
    count,
    explain: (option) => says(fact(option.label)),
  }
  return withDraw({ ...base(`choose-${key}`, topic, 'pick', 'choose', SAY.choose, prompt, [skill], difficulty) }, draw)
}

/** «أكمل الحديث»: the first place `missing` appears is left blank; the right word is the first choice. */
function cloze(topic: TopicId, key: string, source: keyof typeof HADITH, missing: string, wrong: string, fact: string, difficulty: number, skill: string): Question {
  const { lead, text } = HADITH[source]
  const marked = text.replace(missing, `[[${missing}]]`)
  const [before = '', rest = ''] = marked.split('[[')
  const after = rest.split(']]')[1] ?? ''
  const options = [txt('o1', missing), txt('o2', wrong)]
  return {
    ...base(`cloze-${key}`, topic, 'pick', 'cloze', source === 'duaBirr' ? SAY.dua : SAY.hadith, '', [skill], difficulty),
    cloze: { lead, before, after },
    options,
    answer: 'o1',
    explain: says(fact),
  }
}

/** «حوّط الصورة»: one right picture among pictures that are not. */
function picture(topic: TopicId, key: string, instruction: string, right: PicId[], wrong: PicId[], count: number, fact: (right: Option) => string, difficulty: number, skill: string): Question {
  const draw: Draw = { right: pics(right), wrong: pics(wrong), count, explain: (option) => says(fact(option)) }
  return withDraw({ ...base(`picture-${key}`, topic, 'pick', 'picture', instruction, '', [skill], difficulty) }, draw)
}

/** «ضع دائرة حول الصور»: every right picture is circled, and nothing else. */
function circle(topic: TopicId, key: string, instruction: string, good: PicId[], bad: PicId[], goodCount: number, badCount: number, fact: string, difficulty: number, skill: string, captions = false): Question {
  const pictureDraw: PictureDraw = { good: pics(good, captions), bad: pics(bad, captions), goodCount, badCount }
  return withPictures({ ...base(`circle-${key}`, topic, 'circle', 'circle', instruction, '', [skill], difficulty), explain: says(fact) }, pictureDraw)
}

/** «ضع علامة (✓) أسفل… و(✗) أسفل…»: every picture gets its mark. */
function mark(topic: TopicId, key: string, instruction: string, good: PicId[], bad: PicId[], goodCount: number, badCount: number, fact: string, difficulty: number, skill: string, marks: 'tick' | 'face' = 'tick'): Question {
  const pictureDraw: PictureDraw = { good: pics(good), bad: pics(bad), goodCount, badCount }
  return withPictures({ ...base(`mark-${key}`, topic, 'mark', 'mark', instruction, '', [skill], difficulty), marks, explain: says(fact) }, pictureDraw)
}

/** «صل»: group (أ) on the right, group (ب) on the left. */
function match(topic: TopicId, key: string, instruction: string, pairs: [ArtRef, ArtRef, string][], fact: string, difficulty: number, skill: string, pairCount?: number): Question {
  return {
    ...base(`match-${key}`, topic, 'match', 'match', instruction, '', [skill], difficulty),
    pairs: pairs.map(([first, second, label], n) => ({ id: `p${n + 1}`, first, second, label })),
    ...(pairCount ? { pairCount } : {}),
    explain: says(fact),
  }
}

/** «أعد الترتيب»: the items are given in their right order. */
function order(topic: TopicId, key: string, instruction: string, items: Option[], fact: string, difficulty: number, skill: string): Question {
  return { ...base(`order-${key}`, topic, 'order', 'order', instruction, '', [skill], difficulty), options: items, fixedOrder: true, explain: says(fact) }
}

function withDraw(question: ReturnType<typeof base> & { explain?: Explanation[] }, draw: Draw): Question {
  const right = draw.right[0]!
  return {
    ...question,
    options: [right, ...draw.wrong.filter((option) => option.id !== right.id).slice(0, draw.count)],
    answer: right.id,
    explain: question.explain ?? draw.explain?.(right) ?? [],
    draw,
  }
}

function withPictures(question: ReturnType<typeof base> & { explain: Explanation[]; marks?: 'tick' | 'face' }, pictureDraw: PictureDraw): Question {
  const good = pictureDraw.good.slice(0, pictureDraw.goodCount)
  const bad = pictureDraw.bad.slice(0, pictureDraw.badCount)
  return { ...question, options: [...good, ...bad], good: good.map((option) => option.id), pictureDraw }
}

// ── The hadiths and the supplication, as the book prints them ─────────────
export const HADITH = {
  /** سنن أبي داود — lessons «ربنا الله تعالى» and «توحيد الله تعالى». */
  rida: {
    lead: 'قالَ رَسولُ اللهِ ﷺ:',
    text: 'مَنْ قالَ رَضيتُ بِاللهِ رَبًّا، وَبِالإِسْلامِ دينًا، وَبِمُحَمَّدٍ رَسولًا، وَجَبَتْ لَهُ الجَنَّةُ',
  },
  /** صحيح البخاري — lesson «أركان الإسلام». */
  arkan: {
    lead: 'قالَ رَسولُ اللهِ ﷺ:',
    text: 'بُنِيَ الإِسْلامُ عَلى خَمْسٍ: شَهادَةِ أَنْ لا إِلَهَ إِلّا اللهُ وَأَنَّ مُحَمَّدًا رَسولُ اللهِ، وَإِقامِ الصَّلاةِ، وَإيتاءِ الزَّكاةِ، وَالحَجِّ، وَصَوْمِ رَمَضانَ',
  },
  /** سنن الترمذي — lesson «حب الوالدين». */
  ridaWalidain: {
    lead: 'قالَ رَسولُ اللهِ ﷺ:',
    text: 'رِضى اللهِ في رِضى الوالِدَيْنِ، وَسَخَطُ اللهِ في سَخَطِ الوالِدَيْنِ',
  },
  /** سنن الترمذي — lesson «بر الوالدين». */
  awsat: {
    lead: 'قالَ رَسولُ اللهِ ﷺ:',
    text: 'الوالِدُ أَوْسَطُ أَبْوابِ الجَنَّةِ',
  },
  /** The lesson's supplication — «بر الوالدين». */
  duaBirr: {
    lead: 'نَدْعو اللهَ تَعالى:',
    text: 'اللَّهُمَّ اجْعَلْنا مِنَ البارّينَ بِوالِدَيْنا، وَارْزُقْنا الجَنَّةَ',
  },
} as const

const SHAHADA = 'شَهادَةِ أَنْ لا إِلَهَ إِلّا اللهُ وَأَنَّ مُحَمَّدًا رَسولُ اللهِ'

const PILLARS: PicId[] = ['pillar-shahada', 'pillar-salah', 'pillar-zakat', 'pillar-hajj', 'pillar-sawm']
/** The pillars after «عن», as an instruction line prints them. */
const PILLAR_AFTER_AN: Record<string, string> = {
  'pillar-shahada': 'الشهادتين',
  'pillar-salah': 'إقامة الصلاة',
  'pillar-zakat': 'إيتاء الزكاة',
  'pillar-hajj': 'حج البيت',
  'pillar-sawm': 'صوم رمضان',
}
/** The same, with the book's vowels, for the line under the answer. */
const PILLAR_OF: Record<string, string> = {
  'pillar-shahada': 'الشَّهادَتَيْنِ',
  'pillar-salah': 'إِقامَةِ الصَّلاةِ',
  'pillar-zakat': 'إيتاءِ الزَّكاةِ',
  'pillar-hajj': 'حَجِّ البَيْتِ',
  'pillar-sawm': 'صَوْمِ رَمَضانَ',
}
const WORSHIP: PicId[] = ['father-mosque', 'help-elder', 'quran-read', 'hajj', 'animal-kind', 'pray-rug', 'give-poor', 'sujood', 'quran-girl', 'dua-girl', 'clean-beach', 'iftar', 'hijab']
const NOT_WORSHIP: PicId[] = ['kids-mock', 'litter-walk', 'car-litter', 'hit-cat', 'kids-fight']

const PROPHET_SENT = ['شاهِدًا', 'مُبَشِّرًا', 'نَذيرًا', 'داعِيًا إِلى اللهِ', 'سِراجًا مُنيرًا']

export const QUESTIONS: Question[] = [
  // 1. ربنا الله تعالى · توحيد الله تعالى ───────────────────────────────────
  cloze('rabbi', 'rida-janna', 'rida', 'الجَنَّةُ', 'النّارُ', 'مَنْ رَضِيَ بِاللهِ رَبًّا وَبِالإِسْلامِ دينًا وَبِمُحَمَّدٍ ﷺ رَسولًا وَجَبَتْ لَهُ الجَنَّةُ', d(15), 'hadith_rida'),
  cloze('rabbi', 'rida-rasul', 'rida', 'رَسولًا', 'نَبِيًّا', 'في الحَديثِ: «وَبِمُحَمَّدٍ رَسولًا»', d(30), 'hadith_rida'),
  cloze('rabbi', 'rida-allah', 'rida', 'بِاللهِ', 'بِالنّاسِ', 'رَضيتُ بِاللهِ رَبًّا: اللهُ تَعالى رَبّي', d(20), 'hadith_rida'),
  cloze('rabbi', 'rida-islam', 'rida', 'وَبِالإِسْلامِ', 'وَبِالنّاسِ', 'رَضيتُ بِالإِسْلامِ دينًا: الإِسْلامُ ديني', d(20), 'hadith_rida'),
  choose('rabbi', 'who-lord', 'مَنْ رَبُّكَ؟', 'رَبِّيَ اللهُ تَعالى', ['نَبِيِّي مُحَمَّدٌ ﷺ', 'ديني الإِسْلامُ'], 'رَبِّيَ اللهُ تَعالى، وَنَبِيِّي مُحَمَّدٌ ﷺ، وَديني الإِسْلامُ', d(10), 'lord_prophet_religion'),
  choose('rabbi', 'who-prophet', 'مَنْ نَبِيُّكَ؟', 'نَبِيِّي مُحَمَّدٌ ﷺ', ['رَبِّيَ اللهُ تَعالى', 'ديني الإِسْلامُ'], 'نَبِيِّي مُحَمَّدٌ ﷺ', d(10), 'lord_prophet_religion'),
  choose('rabbi', 'what-religion', 'ما دينُكَ؟', 'ديني الإِسْلامُ', ['رَبِّيَ اللهُ تَعالى', 'نَبِيِّي مُحَمَّدٌ ﷺ'], 'ديني الإِسْلامُ', d(10), 'lord_prophet_religion'),
  choose('rabbi', 'fatiha', 'نَقْرَأُ سورَةَ ...... في كُلِّ صَلاةٍ.', 'الفاتِحَةِ', ['النّاسِ', 'الفَلَقِ'], 'نَقْرَأُ سورَةَ الفاتِحَةِ في كُلِّ صَلاةٍ', d(20), 'fatiha'),
  choose('rabbi', 'dua-alone', 'نَدْعو ...... وَحْدَهُ لا شَريكَ لَهُ.', 'اللهَ تَعالى', ['الأَصْنامَ'], 'الدُّعاءُ لِلّهِ تَعالى وَحْدَهُ لا شَريكَ لَهُ', d(15), 'tawheed'),
  choose('rabbi', 'love-root', 'حُبُّ اللهِ تَعالى أَصْلُ ......', 'العِبادَةِ', ['اللَّعِبِ'], 'حُبُّ اللهِ تَعالى أَصْلُ العِبادَةِ', d(25), 'tawheed'),
  tf('rabbi', 'lord-messenger', 'اللهُ تَعالى رَبّي، وَمُحَمَّدٌ ﷺ رَسولي.', true, 'صَحيحٌ: اللهُ تَعالى رَبّي، وَمُحَمَّدٌ ﷺ رَسولي', d(10)),
  tf('rabbi', 'hears-sees', 'اللهُ تَعالى لا يَسْمَعُني وَلا يَراني.', false, 'خَطَأٌ: اللهُ تَعالى يَسْمَعُني وَيَراني', d(15)),
  tf('rabbi', 'in-the-sky', 'اللهُ رَبّي في السَّماءِ، يَرانا وَيَسْمَعُنا.', true, 'صَحيحٌ: اللهُ رَبّي في السَّماءِ، يَرانا وَيَسْمَعُنا', d(15)),
  tf('rabbi', 'worship-alone', 'نَعْبُدُ اللهَ تَعالى وَحْدَهُ وَلا نَعْبُدُ سِواهُ.', true, 'صَحيحٌ: نَعْبُدُ اللهَ وَحْدَهُ وَنَشْهَدُ أَنْ لا إِلَهَ إِلّا اللهُ', d(15)),
  tf('rabbi', 'believer-worships', 'المُؤْمِنُ المُوَحِّدُ لا يَعْبُدُ اللهَ تَعالى.', false, 'خَطَأٌ: المُؤْمِنُ المُوَحِّدُ يَعْبُدُ اللهَ تَعالى وَيُحِبُّهُ', d(20)),
  tf('rabbi', 'creator', 'اللهُ رَبّي: الخالِقُ المالِكُ المُدَبِّرُ لِجَميعِ المَخْلوقاتِ.', true, 'صَحيحٌ: اللهُ تَعالى خَلَقَ كُلَّ شَيْءٍ، وَيَمْلِكُهُ، وَيُدَبِّرُ أَمْرَهُ', d(25)),
  tf('rabbi', 'fatiha', 'نَقْرَأُ سورَةَ الفاتِحَةِ في كُلِّ صَلاةٍ.', true, 'صَحيحٌ: نَقْرَأُ سورَةَ الفاتِحَةِ في كُلِّ صَلاةٍ', d(15)),
  picture('rabbi', 'worship-alone', 'حوّط العبادة التي نؤديها لله تعالى وحده.', ['pray-rug', 'sujood', 'dua-girl', 'quran-girl', 'iftar'], ['litter-walk', 'kids-fight', 'car-litter'], 2, (right) => `${right.label}: عِبادَةٌ نُؤَدّيها لِلّهِ تَعالى وَحْدَهُ`, d(15), 'worship_pictures'),
  mark('rabbi', 'tawheed', 'ضع علامة (✓) أسفل الصورة الدالة على توحيد المسلم لله تعالى، وعلامة (✗) أسفل غيرها.', ['quran-girl', 'dua-girl', 'sujood', 'pray-rug'], ['kids-fight', 'kids-mock'], 2, 1, 'المُسْلِمُ يَعْبُدُ اللهَ وَحْدَهُ: يُصَلّي، وَيَدْعوهُ، وَيَقْرَأُ القُرْآنَ', d(20), 'worship_pictures'),
  match('rabbi', 'lord-prophet-religion', SAY.match, [['txt:اللهُ تَعالى', 'txt:رَبّي', 'اللهُ تَعالى'], ['txt:مُحَمَّدٌ ﷺ', 'txt:رَسولي', 'مُحَمَّدٌ ﷺ'], ['txt:الإِسْلامُ', 'txt:ديني', 'الإِسْلامُ']], 'اللهُ تَعالى رَبّي، وَمُحَمَّدٌ ﷺ رَسولي، وَالإِسْلامُ ديني', d(15), 'lord_prophet_religion'),
  match('rabbi', 'tawheed-sentences', 'صل جمل المجموعة (أ) بما يناسبها من المجموعة (ب).', [['txt:نَعْبُدُ اللهَ', 'txt:وَنَدْعوهُ', 'نَعْبُدُ اللهَ'], ['txt:أَنا مُسْلِمٌ', 'txt:مُوَحِّدٌ', 'أَنا مُسْلِمٌ'], ['txt:نَشْهَدُ أَنْ لا إِلَهَ', 'txt:إِلّا اللهُ', 'نَشْهَدُ أَنْ لا إِلَهَ']], 'نَعْبُدُ اللهَ وَنَدْعوهُ · أَنا مُسْلِمٌ مُوَحِّدٌ · نَشْهَدُ أَنْ لا إِلَهَ إِلّا اللهُ', d(30), 'tawheed'),
  order('rabbi', 'train', 'أعد ترتيب الكلمات لتكوّن جملة.', [txt('w1', 'المُؤْمِنُ'), txt('w2', 'المُوَحِّدُ'), txt('w3', 'يُحِبُّ رَبَّهُ')], 'المُؤْمِنُ المُوَحِّدُ يُحِبُّ رَبَّهُ', d(30), 'tawheed'),

  // 2. أركان الإسلام ────────────────────────────────────────────────────────
  cloze('arkan', 'salah', 'arkan', 'الصَّلاةِ', 'الدِّراسَةِ', 'الصَّلاةُ رُكْنٌ مِنْ أَرْكانِ الإِسْلامِ: وَإِقامِ الصَّلاةِ', d(15), 'hadith_arkan'),
  cloze('arkan', 'zakat', 'arkan', 'الزَّكاةِ', 'الدِّراسَةِ', 'الزَّكاةُ رُكْنٌ مِنْ أَرْكانِ الإِسْلامِ: وَإيتاءِ الزَّكاةِ', d(20), 'hadith_arkan'),
  cloze('arkan', 'shahada', 'arkan', SHAHADA, 'بِرِّ الوالِدَيْنِ', 'أَوَّلُ أَرْكانِ الإِسْلامِ الشَّهادَتانِ', d(25), 'hadith_arkan'),
  cloze('arkan', 'five', 'arkan', 'خَمْسٍ', 'أَرْبَعٍ', 'بُنِيَ الإِسْلامُ عَلى خَمْسٍ: أَرْكانُ الإِسْلامِ خَمْسَةٌ', d(15), 'hadith_arkan'),
  cloze('arkan', 'hajj', 'arkan', 'وَالحَجِّ', 'وَاللَّعِبِ', 'الحَجُّ رُكْنٌ مِنْ أَرْكانِ الإِسْلامِ', d(15), 'hadith_arkan'),
  choose('arkan', 'count', 'أَرْكانُ الإِسْلامِ ......', 'خَمْسَةٌ', ['أَرْبَعَةٌ', 'ثَلاثَةٌ'], 'أَرْكانُ الإِسْلامِ خَمْسَةٌ', d(10), 'pillars_count'),
  choose('arkan', 'first', 'أَوَّلُ رُكْنٍ مِنْ أَرْكانِ الإِسْلامِ:', 'الشَّهادَتانِ', ['الحَجُّ', 'صَوْمُ رَمَضانَ'], 'أَوَّلُ الأَرْكانِ: شَهادَةُ أَنْ لا إِلَهَ إِلّا اللهُ وَأَنَّ مُحَمَّدًا رَسولُ اللهِ', d(25), 'pillars_order'),
  choose('arkan', 'prayers', 'نُصَلّي في اليَوْمِ وَاللَّيْلَةِ ...... مَرّاتٍ.', 'خَمْسَ', ['ثَلاثَ', 'عَشْرَ'], 'الصَّلاةُ عِمادُ الدّينِ: نُصَلّي خَمْسَ مَرّاتٍ في اليَوْمِ وَاللَّيْلَةِ', d(20), 'pillars_meaning'),
  choose('arkan', 'zakat-for', 'نُعْطي الزَّكاةَ لِـ......', 'الفُقَراءِ', ['الأَغْنِياءِ'], 'الزَّكاةُ: حَقٌّ مِنْ مالِ الأَغْنِياءِ نُعْطيهِ لِلْفُقَراءِ', d(20), 'pillars_meaning'),
  choose('arkan', 'hajj-where', 'نَحُجُّ إِلى ......', 'مَكَّةَ المُكَرَّمَةِ', ['الحَديقَةِ'], 'الحَجُّ في مَكَّةَ المُكَرَّمَةِ، مَرَّةً في العُمُرِ لِمَنِ اسْتَطاعَ', d(15), 'pillars_meaning'),
  choose('arkan', 'fasting-month', 'نَصومُ شَهْرَ ......', 'رَمَضانَ', ['العيدِ'], 'نَصومُ شَهْرَ رَمَضانَ: شَهْرَ الرَّحْمَةِ وَالقُرْآنِ', d(15), 'pillars_meaning'),
  tf('arkan', 'four', 'أَرْكانُ الإِسْلامِ أَرْبَعَةٌ.', false, 'خَطَأٌ: أَرْكانُ الإِسْلامِ خَمْسَةٌ', d(10), 'pillars_count'),
  tf('arkan', 'five', 'أَرْكانُ الإِسْلامِ خَمْسَةٌ.', true, 'صَحيحٌ: أَرْكانُ الإِسْلامِ خَمْسَةٌ', d(10), 'pillars_count'),
  tf('arkan', 'ramadan', 'مِنْ أَرْكانِ الإِسْلامِ صَوْمُ رَمَضانَ.', true, 'صَحيحٌ: صَوْمُ رَمَضانَ رُكْنٌ مِنْ أَرْكانِ الإِسْلامِ', d(15), 'pillars_names'),
  tf('arkan', 'salah', 'الصَّلاةُ رُكْنٌ مِنْ أَرْكانِ الإِسْلامِ.', true, 'صَحيحٌ: الصَّلاةُ رُكْنٌ مِنْ أَرْكانِ الإِسْلامِ', d(10), 'pillars_names'),
  tf('arkan', 'football', 'اللَّعِبُ بِالكُرَةِ رُكْنٌ مِنْ أَرْكانِ الإِسْلامِ.', false, 'خَطَأٌ: أَرْكانُ الإِسْلامِ: الشَّهادَتانِ، وَالصَّلاةُ، وَالزَّكاةُ، وَالحَجُّ، وَصَوْمُ رَمَضانَ', d(10), 'pillars_names'),
  tf('arkan', 'five-prayers', 'نُصَلّي خَمْسَ مَرّاتٍ في اليَوْمِ وَاللَّيْلَةِ.', true, 'صَحيحٌ: نُصَلّي خَمْسَ مَرّاتٍ في اليَوْمِ وَاللَّيْلَةِ', d(15), 'pillars_meaning'),
  ...PILLARS.map((id) =>
    picture('arkan', id.replace('pillar-', ''), `حوّط الصورة المعبرة عن ${PILLAR_AFTER_AN[id]}.`, [id], PILLARS.filter((other) => other !== id), 2, () => `هذِهِ صورَةُ ${PILLAR_OF[id]}`, d(15), 'pillars_pictures'),
  ),
  circle('arkan', 'two-pillars', 'ضع دائرة حول الصورتين اللتين تدلان على ركنين من أركان الإسلام.', PILLARS, ['kids-mock', 'studying', 'handshake'], 2, 1, 'أَرْكانُ الإِسْلامِ: الشَّهادَتانِ، وَالصَّلاةُ، وَالزَّكاةُ، وَالحَجُّ، وَصَوْمُ رَمَضانَ', d(20), 'pillars_pictures', true),
  match('arkan', 'pillar-pictures', 'صل بين أركان الإسلام والصورة المعبرة عنها.', PILLARS.map((id) => [`txt:${PICS[id]}`, `pic:${id}`, PICS[id]]), 'لِكُلِّ رُكْنٍ صورَتُهُ: الشَّهادَتانِ، الصَّلاةُ، الزَّكاةُ، الحَجُّ، الصَّوْمُ', d(25), 'pillars_pictures', 4),
  order('arkan', 'pillars', 'أعد ترتيب أركان الإسلام كما وردت في حديث الدرس.', pics(PILLARS, true), 'الشَّهادَتانِ، ثُمَّ الصَّلاةُ، ثُمَّ الزَّكاةُ، ثُمَّ الحَجُّ، ثُمَّ صَوْمُ رَمَضانَ', d(35), 'pillars_order'),

  // 3. العبادة طاعة لله تعالى ───────────────────────────────────────────────
  choose('ibada', 'meaning', 'العِبادَةُ هِيَ كُلُّ ...... نَقومُ بِها لِلّهِ تَعالى وَحْدَهُ.', 'طاعَةٍ', ['لُعْبَةٍ'], 'العِبادَةُ: كُلُّ طاعَةٍ نَقومُ بِها لِلّهِ تَعالى وَحْدَهُ', d(20), 'worship_meaning'),
  choose('ibada', 'road', 'الطّاعَةُ طَريقُ المُسْلِمِ إِلى ......', 'الجَنَّةِ', ['النّارِ'], 'الطّاعَةُ طَريقُ المُسْلِمِ إِلى الجَنَّةِ', d(10), 'worship_reward'),
  choose('ibada', 'reward', 'جَزاءُ المُسْلِمِ الطّائِعِ لِلّهِ تَعالى:', 'الجَنَّةُ', ['النّارُ'], 'جَزاءُ المُسْلِمِ الطّائِعِ لِلّهِ تَعالى الجَنَّةُ', d(10), 'worship_reward'),
  choosePool(
    'ibada',
    'forms',
    'مِنْ صُوَرِ العِبادَةِ:',
    ['الصَّلاةُ', 'الصِّيامُ', 'قِراءَةُ القُرْآنِ', 'مُساعَدَةُ الآخَرينَ', 'إِماطَةُ الأَذى عَنِ الطَّريقِ', 'الرِّفْقُ بِالحَيَوانِ'],
    ['رَمْيُ القُمامَةِ في الطَّريقِ', 'إيذاءُ الحَيَوانِ', 'السُّخْرِيَةُ مِنَ الآخَرينَ'],
    2,
    (right) => `${right}: مِنْ صُوَرِ العِبادَةِ`,
    d(15),
    'worship_forms',
  ),
  tf('ibada', 'prayer-fasting', 'الصَّلاةُ وَالصِّيامُ مِنْ صُوَرِ العِبادَةِ.', true, 'صَحيحٌ: الصَّلاةُ وَالصِّيامُ مِنْ صُوَرِ العِبادَةِ', d(10), 'worship_forms'),
  tf('ibada', 'road-fire', 'الطّاعَةُ طَريقُ المُسْلِمِ إِلى النّارِ.', false, 'خَطَأٌ: الطّاعَةُ طَريقُ المُسْلِمِ إِلى الجَنَّةِ', d(15), 'worship_reward'),
  tf('ibada', 'fire-reward', 'النّارُ جَزاءُ المُسْلِمِ الطّائِعِ لِلّهِ تَعالى.', false, 'خَطَأٌ: جَزاءُ المُسْلِمِ الطّائِعِ لِلّهِ تَعالى الجَنَّةُ', d(15), 'worship_reward'),
  tf('ibada', 'harm-road', 'إِماطَةُ الأَذى عَنِ الطَّريقِ عِبادَةٌ.', true, 'صَحيحٌ: إِماطَةُ الأَذى عَنِ الطَّريقِ طاعَةٌ لِلّهِ تَعالى', d(20), 'worship_forms'),
  tf('ibada', 'animals', 'الرِّفْقُ بِالحَيَوانِ مِنَ العِبادَةِ.', true, 'صَحيحٌ: الرِّفْقُ بِالحَيَوانِ مِنْ صُوَرِ العِبادَةِ', d(15), 'worship_forms'),
  tf('ibada', 'obey-janna', 'طاعَةُ اللهِ تَعالى وَرَسولِهِ ﷺ سَبَبٌ لِدُخولِ الجَنَّةِ.', true, 'صَحيحٌ: طاعَةُ اللهِ تَعالى وَرَسولِهِ ﷺ سَبَبٌ لِدُخولِنا الجَنَّةَ', d(15), 'worship_reward'),
  picture('ibada', 'worship', 'حوّط العمل الدال على العبادة.', WORSHIP, NOT_WORSHIP, 2, (right) => `${right.label}: عِبادَةٌ وَطاعَةٌ لِلّهِ تَعالى`, d(10), 'worship_pictures'),
  circle('ibada', 'worship', 'حوّط العبادات التي نؤديها لله تعالى وحده.', ['pray-rug', 'give-poor', 'quran-read', 'father-mosque', 'sujood'], ['litter-walk', 'hit-cat', 'car-litter'], 2, 1, 'الصَّلاةُ وَالصَّدَقَةُ وَقِراءَةُ القُرْآنِ عِباداتٌ نُؤَدّيها لِلّهِ تَعالى وَحْدَهُ', d(20), 'worship_pictures'),
  mark('ibada', 'faces', 'ميّز العمل الدال على العبادة بوضع 🙂 والعمل الذي لا يدل على العبادة بوضع ☹️.', ['father-mosque', 'help-elder', 'quran-read', 'animal-kind'], ['kids-mock', 'litter-walk'], 2, 1, 'الذَّهابُ لِلْمَسْجِدِ وَمُساعَدَةُ المُحْتاجِ عِبادَةٌ، وَالسُّخْرِيَةُ مِنَ الآخَرينَ لَيْسَتْ عِبادَةً', d(15), 'worship_pictures', 'face'),
  order('ibada', 'road', 'أعد ترتيب الكلمات لتكوّن جملة.', [txt('w1', 'العِبادَةُ'), txt('w2', 'طَريقٌ'), txt('w3', 'إِلى الجَنَّةِ')], 'العِبادَةُ طَريقٌ إِلى الجَنَّةِ', d(25), 'worship_reward'),

  // 4. الرسول محمد ﷺ هادي البشرية ──────────────────────────────────────────
  choose('rasul', 'salawat', 'ماذا أَقولُ عِنْدَ ذِكْرِ الرَّسولِ مُحَمَّدٍ ﷺ؟', 'صَلّى اللهُ عَلَيْهِ وَسَلَّمَ', ['جَلَّ جَلالُهُ'], 'عِنْدَ ذِكْرِ الرَّسولِ مُحَمَّدٍ نَقولُ: صَلّى اللهُ عَلَيْهِ وَسَلَّمَ', d(15), 'love_prophet'),
  choosePool('rasul', 'sent-as', 'أَرْسَلَ اللهُ تَعالى الرَّسولَ مُحَمَّدًا ﷺ ......', PROPHET_SENT, ['ظالِمًا'], 1, (right) => `أَرْسَلَهُ اللهُ ${right}: شاهِدًا وَمُبَشِّرًا وَنَذيرًا وَداعِيًا إِلى اللهِ وَسِراجًا مُنيرًا`, d(20), 'prophet_virtue'),
  choosePool('rasul', 'before-islam', 'مِنْ مَظاهِرِ الضَّلالِ قَبْلَ الإِسْلامِ:', ['عِبادَةُ الأَصْنامِ', 'تَعْذيبُ الضُّعَفاءِ', 'الظُّلْمُ'], ['الصَّلاةُ', 'بِرُّ الوالِدَيْنِ'], 1, (right) => `${right}: مِنْ مَظاهِرِ الضَّلالِ قَبْلَ الإِسْلامِ`, d(20), 'before_islam'),
  tf('rasul', 'love-salawat', 'الرَّسولُ مُحَمَّدٌ ﷺ نُحِبُّهُ وَنُصَلّي عَلَيْهِ كُلَّما ذُكِرَ اسْمُهُ.', true, 'صَحيحٌ: نُحِبُّ رَسولَنا مُحَمَّدًا ﷺ وَنُصَلّي عَلَيْهِ كُلَّما ذُكِرَ اسْمُهُ', d(10), 'love_prophet'),
  tf('rasul', 'idols', 'عِبادَةُ الأَصْنامِ مِنَ السُّلوكِيّاتِ الصَّحيحَةِ.', false, 'خَطَأٌ: عِبادَةُ الأَصْنامِ مِنْ مَظاهِرِ الضَّلالِ قَبْلَ الإِسْلامِ', d(15), 'before_islam'),
  tf('rasul', 'ignorance', 'كانَ النّاسُ في ضَلالٍ وَجَهْلٍ قَبْلَ الإِسْلامِ.', true, 'صَحيحٌ: وَجاءَ الرَّسولُ ﷺ فَقَضى عَلى مَظاهِرِ الضَّلالِ', d(20), 'before_islam'),
  tf('rasul', 'mercy', 'أَرْسَلَ اللهُ الرَّسولَ مُحَمَّدًا ﷺ رَحْمَةً لِلْعالَمينَ.', true, 'صَحيحٌ: أَرْسَلَهُ اللهُ تَعالى رَحْمَةً لِلْعالَمينَ', d(15), 'prophet_virtue'),
  tf('rasul', 'injustice', 'الظُّلْمُ مِنَ السُّلوكِيّاتِ الصَّحيحَةِ.', false, 'خَطَأٌ: الظُّلْمُ مِنْ مَظاهِرِ الضَّلالِ قَبْلَ الإِسْلامِ', d(15), 'before_islam'),
  tf('rasul', 'bringer', 'الرَّسولُ مُحَمَّدٌ ﷺ مُبَشِّرٌ وَنَذيرٌ.', true, 'صَحيحٌ: أَرْسَلَهُ اللهُ شاهِدًا وَمُبَشِّرًا وَنَذيرًا', d(20), 'prophet_virtue'),
  picture('rasul', 'guided', 'حوّط الأمر الذي هدانا إليه الرسول محمد ﷺ.', ['prophet-pray', 'prophet-give', 'help-fallen', 'handshake'], ['hit-cat', 'car-litter', 'kids-mock'], 2, (right) => `${right.label}: مِمّا هَدانا إِلَيْهِ الرَّسولُ ﷺ`, d(15), 'prophet_guidance'),
  circle('rasul', 'before-islam', 'حوّط صور مظاهر الضلال قبل الإسلام.', ['idols', 'torture', 'injustice'], ['hajj', 'father-mosque', 'quran-read'], 2, 1, 'مِنْ مَظاهِرِ الضَّلالِ قَبْلَ الإِسْلامِ: عِبادَةُ الأَصْنامِ، وَتَعْذيبُ الضُّعَفاءِ، وَالظُّلْمُ', d(25), 'before_islam'),
  mark('rasul', 'behaviour', 'ضع علامة (✓) أسفل السلوكيات الإيجابية، وعلامة (✗) أسفل السلوكيات السلبية.', ['handshake', 'studying', 'help-fallen', 'help-elder'], ['car-litter', 'hit-cat', 'kids-fight', 'kids-mock'], 3, 1, 'المُصافَحَةُ وَالمُذاكَرَةُ وَمُساعَدَةُ الآخَرينَ سُلوكٌ إيجابِيٌّ، وَرَمْيُ القُمامَةِ وَالإيذاءُ سُلوكٌ سَلْبِيٌّ', d(20), 'prophet_guidance'),
  match('rasul', 'model-one', SAY.match, [['txt:رَبّي', 'txt:اللهُ تَعالى', 'رَبّي'], ['txt:بِرُّ الوالِدَيْنِ', 'txt:الإِحْسانُ إِلَيْهِما', 'بِرُّ الوالِدَيْنِ'], ['txt:أَرْسَلَ اللهُ الرَّسولَ مُحَمَّدًا ﷺ', 'txt:مُبَشِّرًا وَنَذيرًا', 'أَرْسَلَ اللهُ الرَّسولَ مُحَمَّدًا ﷺ'], ['txt:الحَجُّ', 'txt:مِنْ أَرْكانِ الإِسْلامِ', 'الحَجُّ']], 'رَبِّيَ اللهُ تَعالى · بِرُّ الوالِدَيْنِ الإِحْسانُ إِلَيْهِما · أَرْسَلَ اللهُ مُحَمَّدًا ﷺ مُبَشِّرًا وَنَذيرًا · الحَجُّ مِنْ أَرْكانِ الإِسْلامِ', d(30), 'review', 3),
  order('rasul', 'salawat', 'أعد ترتيب الكلمات لتكوّن جملة.', [txt('w1', 'أُصَلّي'), txt('w2', 'عَلى رَسولي'), txt('w3', 'مُحَمَّدٍ ﷺ')], 'أُصَلّي عَلى رَسولي مُحَمَّدٍ ﷺ', d(25), 'love_prophet'),

  // 5. حب الوالدين · بر الوالدين ───────────────────────────────────────────
  cloze('walidain', 'rida', 'ridaWalidain', 'الوالِدَيْنِ', 'الأَصْدِقاءِ', 'رِضى اللهِ في رِضى الوالِدَيْنِ', d(20), 'hadith_parents'),
  cloze('walidain', 'awsat', 'awsat', 'الجَنَّةِ', 'المَدْرَسَةِ', 'الوالِدُ أَوْسَطُ أَبْوابِ الجَنَّةِ', d(20), 'hadith_parents'),
  cloze('walidain', 'dua', 'duaBirr', 'بِوالِدَيْنا', 'بِأَصْدِقائِنا', 'اللَّهُمَّ اجْعَلْنا مِنَ البارّينَ بِوالِدَيْنا، وَارْزُقْنا الجَنَّةَ', d(25), 'dua_parents'),
  choose('walidain', 'status', 'مَنْزِلَةُ الوالِدَيْنِ في الإِسْلامِ:', 'عَظيمَةٌ', ['صَغيرَةٌ'], 'مَنْزِلَةُ الوالِدَيْنِ في الإِسْلامِ عَظيمَةٌ، فَقَدْ أَوْصانا اللهُ بِهِما', d(10), 'parents_status'),
  choose('walidain', 'birr-meaning', '', 'الإِحْسانُ', ['العُقوقُ'], 'بِرُّ الوالِدَيْنِ هُوَ الإِحْسانُ إِلَيْهِما، وَبِهِ نَتَقَرَّبُ إِلى اللهِ تَعالى', d(15), 'birr_meaning', 'حوّط الكلمة الدالة على معنى برّ الوالدين.'),
  choosePool('walidain', 'birr-signs', 'مِنْ مَظاهِرِ بِرِّ الوالِدَيْنِ:', ['الطّاعَةُ', 'الدُّعاءُ لَهُما', 'التَّأَدُّبُ مَعَهُما', 'الرَّحْمَةُ بِهِما'], ['العُقوقُ', 'الكَلامُ الخَشِنُ مَعَهُما'], 1, (right) => `${right}: مِنْ مَظاهِرِ بِرِّ الوالِدَيْنِ`, d(15), 'birr_signs'),
  choosePool('walidain', 'birr-fruit', 'مِنْ ثَمَراتِ بِرِّ الوالِدَيْنِ:', ['التَّوْفيقُ في الدُّنْيا', 'دُخولُ الجَنَّةِ'], ['دُخولُ النّارِ'], 1, () => 'ثَمَراتُ بِرِّ الوالِدَيْنِ: التَّوْفيقُ في الدُّنْيا وَدُخولُ الجَنَّةِ', d(20), 'birr_fruit'),
  choose('walidain', 'situation', 'أَيُّ عَمَلٍ فيهِ بِرٌّ بِالوالِدَيْنِ؟', 'أُقَبِّلُ رَأْسَ والِدَيَّ', ['أَتَظاهَرُ بِالنَّوْمِ إِذا ناداني أَبي'], 'تَقْبيلُ رَأْسِ الوالِدَيْنِ مِنْ بِرِّهِما', d(10), 'birr_signs'),
  tf('walidain', 'harsh', 'أَقولُ لِوالِدَيَّ كَلامًا خَشِنًا.', false, 'خَطَأٌ: أَتَأَدَّبُ مَعَ والِدَيَّ قَوْلًا وَفِعْلًا', d(10), 'birr_signs'),
  tf('walidain', 'janna', 'بِرُّ الوالِدَيْنِ سَبَبٌ في دُخولِ الجَنَّةِ.', true, 'صَحيحٌ: بِرُّ الوالِدَيْنِ سَبَبٌ في دُخولِ الجَنَّةِ', d(10), 'birr_fruit'),
  tf('walidain', 'kiss-head', 'أُقَبِّلُ رَأْسَ والِدَيَّ عِنْدَ العَوْدَةِ مِنَ المَدْرَسَةِ.', true, 'صَحيحٌ: تَقْبيلُ رَأْسِ الوالِدَيْنِ مِنْ بِرِّهِما', d(10), 'birr_signs'),
  tf('walidain', 'disobey', 'عُقوقُ الوالِدَيْنِ يُقَرِّبُنا إِلى اللهِ تَعالى.', false, 'خَطَأٌ: بِرُّ الوالِدَيْنِ هُوَ الَّذي يُقَرِّبُنا إِلى اللهِ تَعالى', d(20), 'birr_meaning'),
  tf('walidain', 'status', 'مَنْزِلَةُ الوالِدَيْنِ عَظيمَةٌ في الإِسْلامِ.', true, 'صَحيحٌ: مَنْزِلَةُ الوالِدَيْنِ في الإِسْلامِ عَظيمَةٌ', d(10), 'parents_status'),
  tf('walidain', 'dua', 'أَدْعو لِوالِدَيَّ.', true, 'صَحيحٌ: الدُّعاءُ لِلْوالِدَيْنِ مِنْ بِرِّهِما', d(10), 'birr_signs'),
  tf('walidain', 'care', 'أَبي وَأُمّي يَهْتَمّانِ بِطَعامي وَشَرابي.', true, 'صَحيحٌ: الوالِدانِ يَرْعَيانِنا وَيُوَفِّرانِ لَنا ما نَحْتاجُ', d(10), 'parents_virtue'),
  picture('walidain', 'love', 'حوّط الصورة المعبرة عن حب الوالدين وطاعتهما.', ['sweep', 'dua-parents'], ['angry-father'], 1, (right) => `${right.label}: مِنْ حُبِّ الوالِدَيْنِ وَطاعَتِهِما`, d(10), 'birr_pictures'),
  circle('walidain', 'love', 'ضع دائرة حول الصورتين المعبرتين عن حب الوالدين وطاعتهما.', ['sweep', 'dua-parents'], ['angry-father', 'kids-fight'], 2, 1, 'مُساعَدَةُ أُمّي وَالدُّعاءُ لِوالِدَيَّ مِنْ حُبِّهِما وَطاعَتِهِما', d(15), 'birr_pictures'),
  match('walidain', 'virtues', 'صل فضل الوالدين في حياتي بالصورة المعبرة عنه.', (['care', 'needs', 'teach', 'safety'] as PicId[]).map((id) => [`txt:${PICS[id]}`, `pic:${id}`, PICS[id]]), 'أُمّي وَأَبي فَضْلُكُما عَظيمٌ: الرِّعايَةُ، وَتَوْفيرُ الاحْتِياجاتِ، وَالتَّرْبِيَةُ وَالتَّعْليمُ، وَالشُّعورُ بِالأَمانِ', d(25), 'parents_virtue', 3),
  match('walidain', 'sentences', 'صل بين العبارات الآتية بالكلمة المناسبة.', [['txt:أَمَرَنا اللهُ تَعالى بِـ', 'txt:بِرِّ الوالِدَيْنِ', 'أَمَرَنا اللهُ تَعالى بِـ'], ['txt:بِرُّ الوالِدَيْنِ سَبَبٌ لِـ', 'txt:دُخولِ الجَنَّةِ', 'بِرُّ الوالِدَيْنِ سَبَبٌ لِـ'], ['txt:مَنْزِلَةُ الوالِدَيْنِ', 'txt:عَظيمَةٌ', 'مَنْزِلَةُ الوالِدَيْنِ']], 'أَمَرَنا اللهُ بِبِرِّ الوالِدَيْنِ · بِرُّهُما سَبَبٌ لِدُخولِ الجَنَّةِ · مَنْزِلَتُهُما عَظيمَةٌ', d(25), 'birr_meaning'),
  order('walidain', 'kiss-head', 'أعد ترتيب الكلمات لتكوّن جملة.', [txt('w1', 'أُقَبِّلُ'), txt('w2', 'رَأْسَ'), txt('w3', 'والِدَيَّ')], 'أُقَبِّلُ رَأْسَ والِدَيَّ', d(20), 'birr_signs'),
]

// ── Narration ─────────────────────────────────────────────────────────────
// Maryam's shared phrases from the math quiz: the same text, so the same recording.
export const UI_CLIPS = {
  welcome: 'هلا! نختار درس ونبدأ.',
  'test-intro': 'هذا اختبار تجريبي… فيه أسئلة من كل الدروس. يلا نبدأ!',
  'match-wrong': 'لا… نجرب مرة ثانية.',
  review: 'خلنا نتذكر مع بعض…',
  'done-great': 'واو! نتيجة رائعة!',
  'done-good': 'حلو! نتدرب مرة ثانية… ونصير أقوى.',
  'cheer-1': 'كفو!',
  'cheer-2': 'ما شاء الله! صح.',
  'cheer-3': 'واو! جواب صح!',
  'cheer-4': 'برافو! جواب ممتاز.',
  'cheer-5': 'الله! جواب حلو.',
  'cheer-6': 'تمام التمام!',
  'cheer-7': 'عفية!',
  'cheer-8': 'صح! رائع.',
  'cheer-9': 'زين! جواب صحيح.',
  'cheer-10': 'يا سلام! صح.',
  'retry-1': 'مو مشكلة… الجواب الصح…',
  'retry-2': 'قربنا! الجواب الصح…',
  'retry-3': 'خلنا نتعلمها مع بعض… الجواب الصح…',
  'retry-4': 'محاولة حلوة! الجواب الصح…',
  'retry-5': 'نشوف مع بعض… الجواب الصح…',
} as const
export type UiClip = keyof typeof UI_CLIPS

export interface Cheer {
  text: string
  clip: string
}

export const CHEERS: Cheer[] = (Object.keys(UI_CLIPS) as UiClip[])
  .filter((id) => id.startsWith('cheer-'))
  .map((id) => ({ text: UI_CLIPS[id], clip: clip.ui(id) }))

export const RETRIES = (Object.keys(UI_CLIPS) as UiClip[])
  .filter((id) => id.startsWith('retry-'))
  .map((id) => ({ text: UI_CLIPS[id].replace('الجواب الصح…', '').replace('…', '').trim(), clip: clip.ui(id) }))

export interface AudioCue {
  id: string
  text: string
  /** `ar`: Kuwaiti (Maryam), without diacritics. */
  voice: 'ar'
}

export function bare(text: string): string {
  return text.replace(/[ً-ْٰ]/g, '')
}

export function audioCues(): AudioCue[] {
  return [
    ...(Object.keys(UI_CLIPS) as UiClip[]).map((id): AudioCue => ({ id: clip.ui(id), text: bare(UI_CLIPS[id]), voice: 'ar' })),
    ...(Object.keys(SAY_SPOKEN) as (keyof typeof SAY)[]).map((id): AudioCue => ({ id: clip.say(id), text: SAY_SPOKEN[id], voice: 'ar' })),
  ]
}

/** Every clip a round needs, so it can be loaded before the first question. */
export function roundClips(questions: Question[]): string[] {
  return [
    ...questions.flatMap((question) => [
      ...question.ask,
      ...question.options.flatMap((option) => (option.clip ? [option.clip] : [])),
      ...question.pairs.flatMap((pair) => (pair.clip ? [pair.clip] : [])),
      ...question.explain.flatMap((way) => way.clips),
    ]),
    clip.ui('match-wrong'),
    clip.ui('review'),
    ...CHEERS.map((cheer) => cheer.clip),
    ...RETRIES.map((retry) => retry.clip),
    clip.ui('done-great'),
    clip.ui('done-good'),
  ]
}

function pickSome<T>(items: readonly T[], count: number, random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy.slice(0, count)
}

/** A copy of the question for one round: drawn questions get this round's answers and pictures. */
export function dressQuestion(question: Question, random: () => number = Math.random): Question {
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
