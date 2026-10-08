import { describe, expect, it } from 'vitest'
import { answer, NO_ANSWER } from './assistant'
import { createSeed } from '../data/seed'
import { validateReading } from './metrics'

const { guidance } = createSeed()
const titleFor = (q: string) => {
  const r = answer(q, guidance)
  return r.kind === 'answer' ? r.title : r.kind
}

describe('Ask Hospital retrieval', () => {
  it('answers practical questions from the matching guidance with a citation', () => {
    expect(titleFor('Where can I park?')).toBe('Parking at Demo Hospital Campus')
    expect(titleFor('How do I find Outpatients Clinic A?')).toBe('Finding Outpatients Clinic A')
    expect(titleFor('What should I bring to my appointment?')).toBe('What to bring to your appointment')
    expect(titleFor('Who should I contact about my recovery?')).toBe('Recovery support and who to contact')
    const r = answer('where do i park', guidance)
    expect(r.kind === 'answer' && r.ref).toBe('DEMO-GUIDE-001')
  })

  it('never gives fasting times, only the approved "follow your instructions" guidance', () => {
    const r = answer('Can I drink water before surgery?', guidance)
    expect(r.kind === 'answer' && r.title).toBe('Eating and drinking before your procedure')
    expect(r.text).toMatch(/follow the individual instructions/i)
    expect(r.text).not.toMatch(/\d+\s*(hours?|am|pm)/i)
  })

  it('refers clinical questions to the care team instead of answering', () => {
    for (const q of ['Is my wound infected?', 'Should I take my blood pressure tablets tomorrow?', 'What dose of paracetamol can I have?', 'Is my heart rate normal?']) {
      const r = answer(q, guidance)
      expect(r.kind, q).toBe('referral')
    }
    const urgent = answer('I have chest pain', guidance)
    expect(urgent.kind === 'referral' && urgent.urgent).toBe(true)
    expect(urgent.text).toMatch(/999/)
  })

  it('says so when there is no approved answer, and ignores unpublished guidance', () => {
    expect(answer('What is the wifi password?', guidance).text).toBe(NO_ANSWER)
    const unpublished = guidance.map((g) => (g.id === 'guide-001' ? { ...g, published: false } : g))
    expect(answer('Where can I park?', unpublished).kind).not.toBe('answer')
  })

  it('uses edited guidance text straight away', () => {
    const edited = guidance.map((g) => (g.id === 'guide-001' ? { ...g, summary: 'Parking has moved to Car Park B.' } : g))
    expect(answer('Where can I park?', edited).text).toBe('Parking has moved to Car Park B.')
  })
})

describe('health reading validation', () => {
  it('accepts plausible readings and rejects typing mistakes', () => {
    expect(validateReading('bp', 122, 78)).toBeNull()
    expect(validateReading('bp', 78, 122)).not.toBeNull()
    expect(validateReading('bp', 122)).not.toBeNull()
    expect(validateReading('hr', 720)).not.toBeNull()
    expect(validateReading('temp', 36.7)).toBeNull()
    expect(validateReading('spo2', 101)).not.toBeNull()
    expect(validateReading('hr', NaN)).not.toBeNull()
    expect(validateReading('hr', 70, undefined, new Date(Date.now() + 3600_000).toISOString())).not.toBeNull()
  })
})
