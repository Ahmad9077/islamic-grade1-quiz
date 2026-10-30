import type { TopicId } from './catalog'

export type ToneId = TopicId | 'test'

// Each lesson keeps the colour of its field in the book: teal for العقيدة, coral for الحديث,
// berry for الفقه, blue for السيرة and green for التهذيب. The mock test takes the Kaaba's gold.
export const TONES: Record<ToneId, { tone: string; tint: string; deep: string }> = {
  rabbi: { tone: '#169a91', tint: '#d8f2ef', deep: '#0d6862' },
  arkan: { tone: '#df5f58', tint: '#fbe3e1', deep: '#a8352f' },
  ibada: { tone: '#b3336d', tint: '#f6dfea', deep: '#7f1f4b' },
  rasul: { tone: '#2c6cc0', tint: '#dde9f9', deep: '#1b4a87' },
  walidain: { tone: '#2c8a4b', tint: '#dcf0e2', deep: '#1c6033' },
  test: { tone: '#c8891c', tint: '#fbefd6', deep: '#8a5a0a' },
}

export function toneStyle(id: ToneId): Record<string, string> {
  const { tone, tint, deep } = TONES[id]
  return { '--tone': tone, '--tint': tint, '--deep': deep }
}
