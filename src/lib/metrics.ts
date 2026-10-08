import type { Metric, Observation, Source } from '../data/seed'

export const METRICS: Record<Metric, { label: string; unit: string; step: number; decimals: number }> = {
  bp: { label: 'Blood pressure', unit: 'mmHg', step: 1, decimals: 0 },
  hr: { label: 'Heart rate', unit: 'bpm', step: 1, decimals: 0 },
  temp: { label: 'Temperature', unit: '°C', step: 0.1, decimals: 1 },
  spo2: { label: 'Oxygen saturation', unit: '%', step: 1, decimals: 0 },
}

export const METRIC_ORDER: Metric[] = ['bp', 'hr', 'temp', 'spo2']

export const SOURCE_LABEL: Record<Source, string> = { manual: 'Manual', apple: 'Apple Health', healthconnect: 'Health Connect' }

export const sourceLabel = (o: Pick<Observation, 'source' | 'simulated'>) => SOURCE_LABEL[o.source] + (o.simulated ? ' (simulated)' : '')

export const formatValue = (o: Pick<Observation, 'metric' | 'value' | 'value2'>) =>
  o.metric === 'bp' ? `${o.value}/${o.value2}` : o.value.toFixed(METRICS[o.metric].decimals)

// Plausibility limits only. These catch typing mistakes; they are not clinical thresholds.
const LIMITS: Record<Metric, [number, number]> = { bp: [50, 260], hr: [20, 250], temp: [30, 45], spo2: [50, 100] }

export function validateReading(metric: Metric, value: number, value2?: number, at?: string): string | null {
  if (!Number.isFinite(value)) return 'Enter a number.'
  const [lo, hi] = LIMITS[metric]
  if (value < lo || value > hi) return `Enter a value between ${lo} and ${hi}.`
  if (metric === 'bp') {
    if (value2 === undefined || !Number.isFinite(value2)) return 'Enter both blood pressure numbers.'
    if (value2 < 30 || value2 > 160) return 'Enter a lower number between 30 and 160.'
    if (value2 >= value) return 'The top number should be higher than the bottom number.'
  }
  if (at) {
    const t = new Date(at).getTime()
    if (Number.isNaN(t)) return 'Enter a valid date and time.'
    if (t > Date.now() + 60_000) return 'The date and time cannot be in the future.'
  }
  return null
}
