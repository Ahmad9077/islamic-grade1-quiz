# التربية الإسلامية - الأول الابتدائي

A test-only practice site for the school's second test card «اختبار مادة التربية الإسلامية والقرآن الكريم
للصف الأول الابتدائي». It has two subjects, each with its own lessons and mock test:

| Day | Subject | Lesson | Book |
| --- | --- | --- | --- |
| Tue 24 Nov 2026 | التربية الإسلامية | «اللهُ تعالى الخالقُ المصوِّر» (العقيدة) | section two, unit 3, pp. 110–119 |
| | | «أركان الإيمان» (الحديث: «أن تؤمن بالله وملائكته…») | pp. 120–127 |
| | | «كلمة التوحيد» (الحديث: «ما من عبد قال: لا إله إلا الله…») | pp. 128–135 |
| Wed 25 Nov 2026 | القرآن الكريم | «سورة المسد» (lesson 7) | Quran book, unit 3, pp. 57–62 |
| | | «سورة النصر» (lesson 8) | pp. 63–67 |

The books are the Ministry's Grade 1 term 1 books, saved in iCloud `Claude/Books/` («Islamic Education
Grade 1 - Term 1» PDF page = printed + 3 for section two; «Quran Grade 1 - Term 1» PDF page = printed + 1).

The questions copy the school papers' styles and the books' own activities and evaluations, each under its
printed instruction and «السؤال الأول :» heading: complete the hadith or the du'a, ✓/✗ sentences, «حوّط»
choices, «صل» boards, circling and marking pictures, «لوّن» (numbers, and land creatures green / sea
creatures blue), «رتّب» words and the six pillars of faith, and for the Quran: complete the verse, number
the verses, the next verse, listen and name the surah, word meanings, Makki or Madani, the number of
verses, «صل سورة … بمكملاتها» (the book's star), where a word comes in the surah, the reason it came
down, and the lesson's tajweed letter (ج, خ). 119 questions; the old book-one questions were removed.

The Quran text is Tanzil's (Uthmani 1.1, the same files as the Hub's Quran pages), copied verbatim into
`src/data/quran.ts` and checked against `src/data/tanzil/*.json` by a unit test. The verses are heard only
in Sheikh Mishary Rashid Alafasy's recitation (`public/audio/quran/`, from verses.quran.com as the Hub
uses); no Quran text is ever sent to a speech engine. Font: Scheherazade New (OFL, `public/fonts/`).

Voices (ElevenLabs eleven_v4, 19 November 2026, about 1,490 credits): Maryam (Kuwaiti, no diacritics) says
what to do in several ways per style and cheers (Kuwaiti only, none copied from the other quizzes, no «…»),
dealt from decks so nothing repeats; Layla (Modern Standard Arabic, with diacritics) reads the two hadiths,
the du'a, the sentences and the written choices. The letter names «حرف الجيم / الخاء» are the Arabic quiz's
earlier recordings. Every clip was checked with local whisper and the breath scan (`scripts/check-*.py`).

## Status
Preview built 19 November 2026 (branch `test-2026-11-24`). Not published, not registered, not assigned.

## Development
```bash
npm install
npm run dev            # preview mode at http://127.0.0.1:4201
npm run check          # lint, types, unit tests, seed check, preview build
npx playwright test    # iPhone/iPad WebKit + desktop Chromium flows and Hub contract
GALLERY=1 npx playwright test gallery --project=iphone-webkit   # a screenshot of every question style
npm run build:hub      # production Hub build into dist-hub/ (base /islamic-grade1-quiz/)
python3 scripts/generate-audio.py --dry-run   # what a new recording would cost
```

- Content, hadith texts and permanent question keys: `src/data/catalog.ts`
- Hub seed: `npm run generate:hub-seed` → `integration/seed-islamic-grade1.sql`
