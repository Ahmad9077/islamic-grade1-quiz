import { expect, type Page } from '@playwright/test'
import { QUESTIONS, type Question } from '../../src/data/catalog'

export async function start(page: Page, path = '/') {
  await page.goto(path)
  await page.getByRole('button', { name: /هيا نبدأ/ }).click()
  await expect(page.locator('.home')).toBeVisible()
}

const lastKey = new WeakMap<Page, string>()

/** The question on screen, once the previous one has finished leaving. */
export async function current(page: Page) {
  const previous = lastKey.get(page)
  const section = previous ? page.locator(`section.question:not([data-question-key="${previous}"])`) : page.locator('section.question')
  await expect(section).toHaveCount(1)
  await expect(page.locator('section.question')).toHaveCount(1)
  const key = await section.getAttribute('data-question-key')
  const question = QUESTIONS.find((q) => q.key === key)
  if (!key || !question) throw new Error(`Unknown question on screen: ${key}`)
  return { section, question, key }
}

/** Answers the visible question; `correct` answers it right, otherwise makes one mistake. */
export async function answer(page: Page, correct: boolean): Promise<Question> {
  const { section, question, key } = await current(page)
  lastKey.set(page, key)
  const shownIds = (selector: string) => section.locator(selector).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-option') ?? ''))

  if (question.kind === 'match') {
    const shown = await section.locator('.match-first').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-pair') ?? ''))
    if (!correct) {
      await section.locator(`.match-first[data-pair="${shown[0]}"]`).click()
      await section.locator(`.match-second[data-pair="${shown[1]}"]`).click()
      await expect(section.locator('.match-item.shake')).toHaveCount(2)
    }
    for (const id of shown) {
      await section.locator(`.match-first[data-pair="${id}"]`).click()
      await section.locator(`.match-second[data-pair="${id}"]`).click()
    }
    await expect(section.locator('.match-line')).toHaveCount(shown.length)
  } else if (question.kind === 'circle') {
    // Pictures are drawn afresh every round: read them on screen.
    const good = new Set(question.pictureDraw!.good.map((o) => o.id))
    const shown = await shownIds('.picture-button')
    const picks = correct ? shown.filter((id) => good.has(id)) : [shown.find((id) => !good.has(id))!]
    for (const id of picks) await section.locator(`.picture-button[data-option="${id}"]`).click()
    await section.locator('.check-button').click()
  } else if (question.kind === 'mark') {
    const good = new Set(question.pictureDraw!.good.map((o) => o.id))
    const shown = await shownIds('.mark-cell')
    for (const [n, id] of shown.entries()) {
      const truth = good.has(id)
      const yes = correct || n > 0 ? truth : !truth
      await section.locator(`.mark-cell[data-option="${id}"] [data-mark="${yes ? 'yes' : 'no'}"]`).click()
    }
    await section.locator('.check-button').click()
  } else if (question.kind === 'order') {
    const ids = question.options.map((o) => o.id)
    if (!correct) {
      await section.locator(`.order-item[data-option="${ids[1]}"]`).click()
      await expect(section.locator('.order-item.shake')).toHaveCount(1)
    }
    for (const id of ids) await section.locator(`.order-item[data-option="${id}"]`).click()
  } else {
    // Drawn questions get new answers every round: read the choices on screen.
    const shown = await shownIds('.option')
    const rightIds = new Set(question.draw ? question.draw.right.map((o) => o.id) : [question.answer])
    const id = correct ? shown.find((option) => rightIds.has(option)) : shown.find((option) => !rightIds.has(option))
    if (!id) throw new Error(`No ${correct ? 'right' : 'wrong'} choice on screen for ${question.key}`)
    await section.locator(`.option[data-option="${id}"]`).click()
  }
  await expect(page.locator('.feedback')).toBeVisible()
  return question
}

export async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}
