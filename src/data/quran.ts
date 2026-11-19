// The Quran text of the two surahs, verbatim from Tanzil (Uthmani, version 1.1) — the same files
// the Hub's Quran pages use (quizzes-hub/quran/data). Copied unchanged; a unit test checks every
// verse against src/data/tanzil/*.json. Text: Tanzil Project, tanzil.net (CC BY 3.0, see
// src/data/tanzil/TANZIL-LICENSE.txt). It must never be edited by hand, shortened or voiced by a
// speech engine: the verses are heard only in Sheikh Mishary Rashid Alafasy's recitation.

export interface Surah {
  number: number
  name: string
  verses: readonly string[]
}

export const MASAD: Surah = {
  number: 111,
  name: 'المسد',
  verses: [
    'تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ',
    'مَآ أَغْنَىٰ عَنْهُ مَالُهُۥ وَمَا كَسَبَ',
    'سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ',
    'وَٱمْرَأَتُهُۥ حَمَّالَةَ ٱلْحَطَبِ',
    'فِى جِيدِهَا حَبْلٌ مِّن مَّسَدٍۭ',
  ],
}

export const NASR: Surah = {
  number: 110,
  name: 'النصر',
  verses: [
    'إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ',
    'وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا',
    'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ إِنَّهُۥ كَانَ تَوَّابًۢا',
  ],
}

/** Al-Fajr 89:1, the wrong choice the book itself prints beside «وَٱلْفَتْحُ» (p. 70). */
export const FAJR_FIRST_WORD = 'وَٱلْفَجْرِ'
export const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
