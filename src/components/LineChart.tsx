import { useMemo, useState } from 'react'
import { dateTime, shortDate } from '../lib/format'

export type Series = { label: string; color: string; points: { t: number; v: number }[] }

const W = 340
const H = 190
const PAD = { l: 34, r: 12, t: 12, b: 26 }

function niceRange(min: number, max: number) {
  const span = Math.max(max - min, 1)
  const raw = span / 3
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw
  const lo = Math.floor((min - step * 0.25) / step) * step
  const hi = Math.ceil((max + step * 0.25) / step) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + step / 1000; v += step) ticks.push(Number(v.toFixed(4)))
  return { lo, hi, ticks }
}

export default function LineChart({ series, unit, decimals = 0, from, to }: { series: Series[]; unit: string; decimals?: number; from: number; to: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const all = series.flatMap((s) => s.points)
  const times = useMemo(() => Array.from(new Set(all.map((p) => p.t))).sort((a, b) => a - b), [all])

  if (all.length === 0) {
    return <p className="rounded-xl bg-bg p-6 text-center text-sm text-muted">No readings in this period yet. Add a reading to see your chart.</p>
  }

  const { lo, hi, ticks } = niceRange(Math.min(...all.map((p) => p.v)), Math.max(...all.map((p) => p.v)))
  const x = (t: number) => PAD.l + ((t - from) / Math.max(to - from, 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b)
  const sel = hover ?? times[times.length - 1]
  const selValues = series.map((s) => s.points.find((p) => p.t === sel)?.v).filter((v): v is number => v !== undefined)

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    setHover(times.reduce((best, t) => (Math.abs(x(t) - px) < Math.abs(x(best) - px) ? t : best), times[0]))
  }

  const summary = series
    .map((s) => {
      const vs = s.points.map((p) => p.v)
      return `${s.label}: ${s.points.length} readings, lowest ${Math.min(...vs).toFixed(decimals)}, highest ${Math.max(...vs).toFixed(decimals)} ${unit}`
    })
    .join('. ')

  return (
    <figure>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-lg font-bold text-navy">
          {selValues.map((v) => v.toFixed(decimals)).join('/')} <span className="text-sm font-medium text-muted">{unit}</span>
        </p>
        <p className="text-sm text-muted">{dateTime(new Date(sel).toISOString())}</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-pan-y" role="img" aria-label={`Chart. ${summary}`} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#DCE5EC" strokeWidth="1" />
            <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5B6C7B">
              {t.toFixed(decimals)}
            </text>
          </g>
        ))}
        <text x={PAD.l} y={H - 6} fontSize="11" fill="#5B6C7B">{shortDate(new Date(from).toISOString())}</text>
        <text x={W - PAD.r} y={H - 6} fontSize="11" fill="#5B6C7B" textAnchor="end">{shortDate(new Date(to).toISOString())}</text>
        <line x1={x(sel)} x2={x(sel)} y1={PAD.t} y2={H - PAD.b} stroke="#12365A" strokeOpacity="0.25" strokeWidth="1" />
        {series.map((s) => (
          <g key={s.label}>
            <polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={s.points.map((p) => `${x(p.t)},${y(p.v)}`).join(' ')} />
            {s.points.map((p) => (
              <circle key={p.t} cx={x(p.t)} cy={y(p.v)} r={p.t === sel ? 5 : 3} fill={p.t === sel ? s.color : '#fff'} stroke={s.color} strokeWidth="2" />
            ))}
          </g>
        ))}
      </svg>
      {series.length > 1 && (
        <div className="mt-1 flex gap-4 text-sm text-ink">
          {series.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <span className="h-1 w-5 rounded-full" style={{ background: s.color }} /> {s.label}
            </span>
          ))}
        </div>
      )}
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  )
}
