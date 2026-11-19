import { expect, test } from '@playwright/test'
import { TOPICS } from '../../src/data/catalog'
import { answer, current, start } from './helpers'

// Visual review of every question style: GALLERY=1 npx playwright test gallery --project=iphone-webkit
test.skip(!process.env.GALLERY, 'screenshots only on request')

for (const topic of TOPICS) {
  test(`gallery ${topic.id}`, async ({ page }, info) => {
    test.setTimeout(240_000)
    await start(page)
    const seen = new Set<string>()
    for (let round = 0; round < 3; round += 1) {
      await page.locator(`.topic-card[data-topic="${topic.id}"]`).click()
      for (let n = 0; n < 8; n += 1) {
        const { question } = await current(page)
        await page.waitForTimeout(900)
        const fresh = !seen.has(question.format)
        if (fresh) {
          seen.add(question.format)
          await page.screenshot({ path: `${process.env.GALLERY_DIR ?? "test-results/gallery"}/${info.project.name}/${topic.id}-${question.format}-${question.key.replace(/[:/]/g, '_')}.png`, fullPage: true })
        }
        await answer(page, n % 4 !== 3)
        if (fresh) {
          await page.waitForTimeout(900)
          await page.screenshot({ path: `${process.env.GALLERY_DIR ?? "test-results/gallery"}/${info.project.name}/${topic.id}-${question.format}-z-answered.png`, fullPage: true })
        }
        await page.locator('.next-button').click()
      }
      await expect(page.locator('.results-card')).toBeVisible()
      await page.getByRole('button', { name: /الدروس/ }).click()
    }
  })
}
