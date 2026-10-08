import type { HospitalLocation, NavRoute } from '../data/seed'

const FILL: Record<HospitalLocation['kind'], string> = {
  clinic: '#EAF4FB',
  service: '#F1F5F8',
  entrance: '#FBF1E3',
  transit: '#E6E9F5',
  outside: '#EEF2F5',
}

function wrap(name: string, max: number) {
  const lines: string[] = []
  for (const word of name.split(' ')) {
    const last = lines[lines.length - 1]
    if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word
    else lines.push(word)
  }
  return lines
}

const path = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ')

export default function FloorMap({ floor, locations, route, stepIndex }: { floor: 0 | 1; locations: HospitalLocation[]; route?: NavRoute; stepIndex: number }) {
  const rooms = locations.filter((l) => l.floor === floor || (floor === 1 && (l.id === 'lift-a' || l.id === 'stairs')))
  const steps = route?.steps ?? []
  const current = steps[stepIndex]
  const marker = current && current.floor === floor ? current.pts[current.pts.length - 1] : null
  const start = steps[0] && steps[0].floor === floor ? steps[0].pts[0] : null

  return (
    <svg viewBox={`0 0 340 ${floor === 0 ? 262 : 216}`} className="w-full" role="img" aria-label={`Fictional demonstration map, ${floor === 0 ? 'ground floor' : 'first floor'}. The step-by-step directions below describe the same route in text.`}>
      <rect x="8" y="8" width="324" height="200" rx="10" fill="#FFFFFF" stroke="#C5D2DC" strokeWidth="1.5" />
      {rooms.map((l) => {
        const isDest = route?.destinationId === l.id
        const lines = wrap(l.name, Math.max(8, Math.floor(l.w / 6.6)))
        const cy = l.y + l.h / 2 - ((lines.length - 1) * 11.5) / 2 + (l.kind === 'entrance' ? 7 : 0)
        return (
          <g key={l.id}>
            <rect x={l.x} y={l.y} width={l.w} height={l.h} rx="6" fill={isDest ? '#E8F7F4' : FILL[l.kind]} stroke={isDest ? '#0E766E' : '#C5D2DC'} strokeWidth={isDest ? 2.5 : 1} />
            {lines.map((line, i) => (
              <text key={i} x={l.x + l.w / 2} y={cy + i * 11.5 + 3.5} textAnchor="middle" fontSize="10.5" fontWeight={isDest ? 700 : 600} fill={isDest ? '#0A5D57' : '#182B3A'}>
                {line}
              </text>
            ))}
          </g>
        )
      })}
      {steps.map((s, i) =>
        s.floor !== floor || s.pts.length < 2 ? null : (
          <polyline key={s.id} points={path(s.pts)} fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={i <= stepIndex ? '#1769AA' : '#8FB6D6'} strokeWidth={i === stepIndex ? 5 : 3.5} strokeDasharray={i > stepIndex ? '2 7' : undefined} />
        ),
      )}
      {start && <circle cx={start[0]} cy={start[1]} r="5" fill="#fff" stroke="#1769AA" strokeWidth="3" />}
      {marker && (
        <g>
          <circle cx={marker[0]} cy={marker[1]} r="11" fill="#1769AA" fillOpacity="0.2" />
          <circle cx={marker[0]} cy={marker[1]} r="6" fill="#12365A" stroke="#fff" strokeWidth="2" />
        </g>
      )}
    </svg>
  )
}
