import { expect, test } from '@playwright/test'
import { PICS, QUESTIONS, SUBJECTS, TOPICS } from '../../src/data/catalog'
import { PRACTICE_SIZE, testSize } from '../../src/domain/round'
import { answer, current, noHorizontalScroll, start } from './helpers'

test('home has the two subjects of the school card, each with its day, its lessons and its mock test', async ({ page }) => {
  await start(page)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.subject-block')).toHaveCount(2)
  await expect(page.locator('.section-date')).toHaveText([SUBJECTS.islamic.date, SUBJECTS.quran.date])
  await expect(page.locator('.subject-islamic .topic-card')).toHaveCount(3)
  await expect(page.locator('.subject-quran .topic-card')).toHaveCount(2)
  await expect(page.locator('.topic-card-title')).toHaveText(TOPICS.map((topic) => topic.title))
  await expect(page.locator('.test-banner')).toHaveCount(2)
  await expect(page.locator('.source-note')).toContainText('tanzil.net')
  await expect(page.locator('.preview-badge').first()).toBeVisible()
  await noHorizontalScroll(page)
})

test("a lesson starts straight away with the paper's heading, its instruction and a spoken help line", async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="khaliq"]').click()
  await expect(page.locator('section.question')).toBeVisible()
  await expect(page.locator('.paper-pill')).toHaveText(/السؤال الأول/)
  const { question } = await current(page)
  await expect(page.locator('.instruction')).toHaveText(question.instruction)
  await expect(page.locator('.help-line')).not.toBeEmpty()
  await expect(page.locator('.help-line .speaker-button')).toBeVisible()
})

test('a full round gives feedback, stars and a review of misses', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.topic-card[data-topic="iman"]').click()
  for (let n = 0; n < PRACTICE_SIZE; n += 1) {
    const correct = n !== 2 && n !== 5
    const question = await answer(page, correct)
    await expect(page.locator(correct ? '.feedback-good' : '.feedback-miss')).toBeVisible()
    if (!correct && question.kind === 'pick') await expect(page.locator('.option.is-reveal')).toHaveCount(1)
    await noHorizontalScroll(page)
    await page.locator('.next-button').click()
  }
  await expect(page.locator('.results-card')).toBeVisible()
  await expect(page.locator('.results-number')).toHaveText('٦')
  await expect(page.locator('.review-item')).toHaveCount(2)
  await page.getByRole('button', { name: /الدروس/ }).click()
  await expect(page.locator('.topic-card[data-topic="iman"] .star-icon.is-filled')).toHaveCount(2)
})

test('the Islamic mock test opens with the hadith, then two numbered ✓/✗ sentences', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.test-banner[data-test="islamic"]').click()
  const topics = new Set<string>()
  for (let n = 0; n < testSize('islamic'); n += 1) {
    const { question } = await current(page)
    if (n === 0) {
      expect(question.format).toBe('cloze')
      await expect(page.locator('.paper-pill')).toHaveText(/السؤال الأول/)
      await expect(page.locator('.hadith-blank')).toBeVisible()
    }
    if (n === 2 || n === 3) {
      expect(question.format).toBe('tf')
      await expect(page.locator('.paper-pill')).toHaveText(/السؤال الثاني/)
      await expect(page.locator('.statement-number')).toHaveText(n === 2 ? '١' : '٢')
    }
    const answered = await answer(page, true)
    topics.add(answered.topic)
    if (n === 0) await expect(page.locator('.hadith-blank .ink-word')).toBeVisible()
    await page.locator('.next-button').click()
  }
  expect(topics).toEqual(new Set(['khaliq', 'iman', 'tawhid']))
  await expect(page.locator('.results-number')).toHaveText('٩')
})

test('the Quran mock test opens with completing a verse, and keeps to the two surahs', async ({ page }) => {
  test.setTimeout(150_000)
  await start(page)
  await page.locator('.test-banner[data-test="quran"]').click()
  const topics = new Set<string>()
  for (let n = 0; n < testSize('quran'); n += 1) {
    const { question } = await current(page)
    if (n === 0) {
      expect(question.format).toBe('verse')
      await expect(page.locator('.verse-card .verse-blank')).toBeVisible()
      await expect(page.locator('.verse-card .aya-marker')).toBeVisible()
    }
    if (n === 2) {
      expect(question.format).toBe('ayat')
      await expect(page.locator('.order-verses .order-item')).toHaveCount(question.options.length)
    }
    const answered = await answer(page, true)
    topics.add(answered.topic)
    if (n === 0) await expect(page.locator('.verse-blank .ink-word')).toBeVisible()
    await noHorizontalScroll(page)
    await page.locator('.next-button').click()
  }
  expect(topics).toEqual(new Set(['masad', 'nasr']))
  await expect(page.locator('.results-number')).toHaveText('٨')
})

test('«صح» comes before «خطأ», on the right where reading starts', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  let seen = 0
  for (let round = 0; round < 4 && seen === 0; round += 1) {
    await page.locator('.topic-card[data-topic="tawhid"]').click()
    for (let n = 0; n < PRACTICE_SIZE; n += 1) {
      const { question } = await current(page)
      if (question.format === 'tf') {
        const ids = await page.locator('section.question .option').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-option')))
        expect(ids).toEqual(['yes', 'no'])
        const [yes, no] = await Promise.all([page.locator('.option[data-option="yes"]').boundingBox(), page.locator('.option[data-option="no"]').boundingBox()])
        expect(yes!.x).toBeGreaterThan(no!.x)
        seen += 1
      }
      await answer(page, true)
      await page.locator('.next-button').click()
    }
    await expect(page.locator('.results-card')).toBeVisible()
    await page.getByRole('button', { name: /الدروس/ }).click()
  }
  expect(seen).toBeGreaterThan(0)
})

test("the books' pictures, the recitation and the Quran font load", async ({ page }) => {
  await start(page)
  const statuses = await page.evaluate(async (paths) => {
    const base = document.baseURI
    return Promise.all(paths.map(async (path) => (await fetch(new URL(path, base))).status))
  }, [...Object.keys(PICS).map((id) => `pics/${id}.jpg`), 'audio/quran/001001.mp3', 'audio/quran/110001.mp3', 'audio/quran/111005.mp3', 'audio/fs/name/jim.mp3', 'audio/fs/name/kha.mp3'])
  expect(statuses.every((status) => status === 200)).toBe(true)
})

test('every lesson fits the screen, whatever the question style', async ({ page }) => {
  test.setTimeout(300_000)
  await start(page)
  const kinds = new Set<string>()
  for (const topic of TOPICS) {
    await page.locator(`.topic-card[data-topic="${topic.id}"]`).click()
    for (let n = 0; n < PRACTICE_SIZE; n += 1) {
      await current(page)
      await noHorizontalScroll(page)
      const question = await answer(page, n % 3 !== 1)
      kinds.add(question.kind)
      await noHorizontalScroll(page)
      await page.locator('.next-button').click()
    }
    await expect(page.locator('.results-card')).toBeVisible()
    await page.getByRole('button', { name: /الدروس/ }).click()
  }
  expect(kinds.size).toBeGreaterThanOrEqual(4)
  expect(QUESTIONS.length).toBeGreaterThan(100)
})
