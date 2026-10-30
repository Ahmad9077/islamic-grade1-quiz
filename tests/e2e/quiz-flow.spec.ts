import { expect, test } from '@playwright/test'
import { PICS, QUESTIONS, TOPICS } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_SIZE } from '../../src/domain/round'
import { answer, current, noHorizontalScroll, start } from './helpers'

test('home lists the five lessons of the first book and the mock test, in Arabic RTL', async ({ page }) => {
  await start(page)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.topic-card')).toHaveCount(5)
  await expect(page.locator('.topic-card-title')).toHaveText(TOPICS.map((topic) => topic.title))
  await expect(page.locator('.topic-card-field')).toHaveText(['العقيدة', 'الحديث', 'الفقه', 'السيرة', 'التهذيب'])
  await expect(page.locator('.test-banner')).toBeVisible()
  await expect(page.locator('.preview-badge').first()).toBeVisible()
  await noHorizontalScroll(page)
})

test("a lesson starts straight away with the exam's heading and instruction", async ({ page }) => {
  await start(page)
  await page.locator('.topic-card[data-topic="rabbi"]').click()
  await expect(page.locator('section.question')).toBeVisible()
  await expect(page.locator('.paper-pill')).toHaveText(/السؤال الأول/)
  const { question } = await current(page)
  await expect(page.locator('.instruction')).toHaveText(question.instruction)
  // The five common instruction lines are read aloud and can be replayed; the others are read on screen.
  await expect(page.locator('.paper-head button')).toHaveCount(question.ask.length > 0 ? 1 : 0)
})

test('a full round gives feedback, stars and a review of misses', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.topic-card[data-topic="arkan"]').click()
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
  await expect(page.locator('.topic-card[data-topic="arkan"] .star-icon.is-filled')).toHaveCount(2)
})

test('the mock test follows the school paper: the hadith first, then two numbered ✓/✗ sentences', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  await page.locator('.test-banner').click()
  const topics = new Set<string>()
  for (let n = 0; n < TEST_SIZE; n += 1) {
    const { question } = await current(page)
    if (n === 0) {
      expect(question.format).toBe('cloze')
      await expect(page.locator('.paper-pill')).toHaveText(/السؤال الأول/)
      await expect(page.locator('.hadith-blank')).toBeVisible()
    }
    if (n === 1 || n === 2) {
      expect(question.format).toBe('tf')
      await expect(page.locator('.paper-pill')).toHaveText(/السؤال الثاني/)
      await expect(page.locator('.statement-number')).toHaveText(n === 1 ? '١' : '٢')
    }
    const answered = await answer(page, true)
    topics.add(answered.topic)
    if (n === 0) await expect(page.locator('.hadith-blank .ink-word')).toBeVisible()
    if (n === 1) await expect(page.locator('.statement-slot .ink-mark')).toBeVisible()
    await page.locator('.next-button').click()
  }
  expect(topics.size).toBeGreaterThanOrEqual(4)
  await expect(page.locator('.results-number')).toHaveText('٨')
})

test('«صح» comes before «خطأ», on the right where reading starts', async ({ page }) => {
  test.setTimeout(120_000)
  await start(page)
  let seen = 0
  for (let round = 0; round < 4 && seen === 0; round += 1) {
    await page.locator('.topic-card[data-topic="walidain"]').click()
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

test("the book's pictures load", async ({ page }) => {
  await start(page)
  const statuses = await page.evaluate(async (ids) => {
    const base = document.baseURI
    return Promise.all(ids.map(async (id) => (await fetch(new URL(`pics/${id}.jpg`, base))).status))
  }, Object.keys(PICS))
  expect(statuses.every((status) => status === 200)).toBe(true)
})

test('every lesson fits the screen, whatever the question style', async ({ page }) => {
  test.setTimeout(240_000)
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
  expect(QUESTIONS.length).toBeGreaterThan(80)
})
