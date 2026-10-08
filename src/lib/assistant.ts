import type { GuidanceArticle } from '../data/seed'

// Deterministic, retrieval-only assistant. It never generates text: every answer is the
// approved summary of a published guidance article, or a fixed safety message.

export type Reply =
  | { kind: 'answer'; text: string; articleId: string; title: string; ref: string; lastReviewed: string }
  | { kind: 'referral'; urgent: boolean; text: string }
  | { kind: 'none'; text: string }

export const NO_ANSWER = "I couldn't find an approved answer to that question. Please contact your hospital care team."

export const URGENT_TEXT =
  'I can’t help with medical emergencies. If you or someone else is seriously ill or in danger, call 999 now. For urgent medical help that is not an emergency, call NHS 111.'

export const CLINICAL_TEXT =
  'I can only share practical hospital information, so I can’t give medical advice or tell you what to do about symptoms, medicines or readings. Please follow the individual instructions from your hospital and contact your care team if you are unsure. For urgent medical help call NHS 111. In an emergency call 999.'

const URGENT = /(chest pain|can'?t breathe|cannot breathe|difficulty breathing|struggling to breathe|unconscious|collaps|severe bleeding|bleeding heavily|won'?t stop bleeding|stroke|heart attack|suicid|overdose|passed out)/

const CLINICAL = /(diagnos|infect|\bpus\b|swollen|swelling|fever|\brash\b|dizz|bleed|vomit|nause|symptom|\bdose\b|dosage|antibiotic|painkiller|ibuprofen|paracetamol|prescri|side effect|blood clot|\bpain\b|painful|\bhurts?\b|\bsore\b|is (it|this|that|my [a-z ]+) normal|too (high|low)|what does my|should i (stop|take|skip|change)|can i (stop|take|skip)|wound look)/

const STOP = new Set(
  'a about after am an and are at be before can could do does for get have how i in is it me my need of on or should the there to what when where which who will with you your hospital please tell'.split(' '),
)

const stem = (w: string) => {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3)
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

const normalise = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' -]/g, ' ').replace(/\s+/g, ' ').trim()

export const tokens = (s: string) => normalise(s).split(' ').filter((w) => w && !STOP.has(w)).map(stem)

export function score(query: string, a: GuidanceArticle) {
  const q = normalise(query)
  const qt = tokens(query)
  let s = 0
  for (const kw of a.keywords) {
    const k = normalise(kw)
    if (k.includes(' ') ? q.includes(k) : qt.includes(stem(k))) s += 3
  }
  const title = new Set(tokens(a.title))
  for (const t of qt) if (title.has(t)) s += 2
  if (a.questions.some((x) => normalise(x) === q)) s += 10
  return s
}

export function answer(query: string, guidance: GuidanceArticle[]): Reply {
  const q = normalise(query)
  if (URGENT.test(q)) return { kind: 'referral', urgent: true, text: URGENT_TEXT }
  if (CLINICAL.test(q)) return { kind: 'referral', urgent: false, text: CLINICAL_TEXT }

  let best: GuidanceArticle | null = null
  let bestScore = 0
  for (const a of guidance) {
    if (!a.published) continue
    const s = score(query, a)
    if (s > bestScore) {
      best = a
      bestScore = s
    }
  }
  if (!best || bestScore < 3) return { kind: 'none', text: NO_ANSWER }
  return { kind: 'answer', text: best.summary, articleId: best.id, title: best.title, ref: best.ref, lastReviewed: best.lastReviewed }
}
