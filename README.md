# التربية الإسلامية - الأول الابتدائي

A test-only practice site (no learn cards) for the first Grade 1 Islamic education test (Tuesday
3 November 2026). The school's card: every lesson of the first book (١-١), which is units 1 and 2
of the Ministry book «التربية الإسلامية» (Grade 1, term 1, 2026/2027, section one).

| Lesson | Field | What the questions cover |
| --- | --- | --- |
| رَبُّنا اللهُ تَعالى · تَوْحيدُ اللهِ تَعالى | العقيدة | ربي/نبيي/ديني, Allah hears and sees us, the Creator, Al-Fatiha in every prayer, worship and du'a for Allah alone, the hadith «رضيت بالله ربًّا…» |
| أَرْكانُ الإِسْلامِ | الحديث | the hadith «بني الإسلام على خمس», the five pillars, their pictures and their order |
| العِبادَةُ طاعَةٌ لِلّهِ تَعالى | الفقه | the meaning of worship, its forms, worship is the road to Paradise |
| الرَّسولُ مُحَمَّدٌ ﷺ | السيرة | misguidance before Islam, the Prophet's virtues, love and «صلى الله عليه وسلم», good and bad behaviour |
| حُبُّ الوالِدَيْنِ · بِرُّ الوالِدَيْنِ | التهذيب | the parents' status and virtue, the meaning, signs and fruits of بر, the lesson's hadiths and du'a |

The user sent the school's model tests (ten papers) and asked for the same styles of question,
because first graders cannot read well yet. Every question shows the paper's own instruction line
and heading («السؤال الأول :»), and is answered the way the paper is marked:

- «أكمل الحديث الشريف بالكلمة المناسبة بين القوسين» — the chosen word is written into the hadith
- «ضع علامة (✓) أمام العبارة الصحيحة…» — the ✓ or ✗ is written between the brackets
- «صل بين العبارة وما يناسبها» — group (أ) and group (ب), joined dot to dot with a line
- «حوّط الإجابة الصحيحة» and «حوّط الصورة…» — a pen ring round the choice
- «ضع دائرة حول الصورتين…» — circle every right picture, then «تحقّق»
- «ضع علامة (✓) أسفل… و(✗) أسفل…» — a mark under every picture (🙂/☹️ where the book uses faces)
- «أعد الترتيب» — the pillars in the order of the hadith, and short sentences from the book

95 questions. The mock test («نموذج الاختبار», 8 questions) is laid out like the school's model:
the hadith first, two numbered ✓/✗ sentences, a «صل» board, two «حوّط» questions, then pictures.
Many questions draw new answers, pictures or pairs every round. Hadith wording is the book's; no
Quran verses are quoted. The pictures in `public/pics/` are cropped from the book.

Audio (Maryam, Kuwaiti): the five most common instruction lines of the paper are read aloud when a
question opens, with a button to hear them again («أكمل الحديث…», «أكمل الدعاء…», «ضع علامة صح…»,
«حوّط الإجابة…», «صل بين العبارة…»), recorded on 30 October 2026 from the credits left before the
2 November reset (216 characters). Other instructions, the sentences and the choices are read on
screen. The cheers, kind words, test introduction and results are the math quiz's clips (same text
and hash). `python3 scripts/generate-audio.py --dry-run` shows what a new recording would cost.

## Status
Published 30 October 2026 at https://haya-nt3lm.com/islamic-grade1-quiz/ and registered in the Hub (migration 023).
Not assigned to any account.

## Development
```bash
npm install
npm run dev            # preview mode at http://127.0.0.1:4201
npm run check          # lint, types, unit tests, seed check, preview build
npx playwright test    # iPhone/iPad WebKit + desktop Chromium flows and Hub contract
npm run build:hub      # production Hub build into dist-hub/ (base /islamic-grade1-quiz/)
```

- Content, hadith texts and permanent question keys: `src/data/catalog.ts`
- Hub seed: `npm run generate:hub-seed` → `integration/seed-islamic-grade1.sql`
