import type { Subject, TopicId } from './catalog'

export type ToneId = TopicId | `test-${Subject}`

// Each lesson keeps the colour of its field in the book: teal for العقيدة, coral for الحديث, and
// the Quran book's green for its surahs. The mock tests take the Kaaba's gold and the mushaf's green.
export const TONES: Record<ToneId, { tone: string; tint: string; deep: string }> = {
  khaliq: { tone: '#169a91', tint: '#d8f2ef', deep: '#0d6862' },
  iman: { tone: '#df5f58', tint: '#fbe3e1', deep: '#a8352f' },
  tawhid: { tone: '#b3336d', tint: '#f6dfea', deep: '#7f1f4b' },
  masad: { tone: '#2c8a4b', tint: '#dcf0e2', deep: '#1c6033' },
  nasr: { tone: '#2c6cc0', tint: '#dde9f9', deep: '#1b4a87' },
  'test-islamic': { tone: '#c8891c', tint: '#fbefd6', deep: '#8a5a0a' },
  'test-quran': { tone: '#1f7a63', tint: '#dcefe8', deep: '#0f5240' },
}

export function toneStyle(id: ToneId): Record<string, string> {
  const { tone, tint, deep } = TONES[id]
  return { '--tone': tone, '--tint': tint, '--deep': deep }
}
