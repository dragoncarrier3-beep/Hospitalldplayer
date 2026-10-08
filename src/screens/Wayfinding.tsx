import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Accessibility, ArrowLeft, ArrowRight, Car, Check, ChevronRight, Footprints, Train } from 'lucide-react'
import { useStore } from '../store'
import FloorMap from '../components/FloorMap'
import { Button, Card, EmptyState, Field, Note, ScreenHeader, SectionTitle, Toggle, cx } from '../components/ui'

const LEGEND = [
  { color: '#E8F7F4', border: '#0E766E', label: 'Your destination' },
  { color: '#EAF4FB', border: '#C5D2DC', label: 'Clinic or ward' },
  { color: '#F1F5F8', border: '#C5D2DC', label: 'Service' },
  { color: '#FBF1E3', border: '#C5D2DC', label: 'Entrance' },
  { color: '#E6E9F5', border: '#C5D2DC', label: 'Lift or stairs' },
]

export default function Wayfinding() {
  const [params, setParams] = useSearchParams()
  const { locations, routes } = useStore()
  const destinations = locations.filter((l) => l.destination)
  const dest = params.get('to') ?? 'clinic-a'
  const [accessible, setAccessible] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [floor, setFloor] = useState<0 | 1>(0)

  const route = routes.find((r) => r.destinationId === dest && r.accessible === accessible) ?? routes.find((r) => r.destinationId === dest)
  const step = route?.steps[stepIndex]

  useEffect(() => setStepIndex(0), [dest, accessible])
  useEffect(() => {
    if (step) setFloor(step.floor)
  }, [step])

  const meters = route?.steps.reduce((n, s) => n + s.meters, 0) ?? 0
  const minutes = Math.max(1, Math.round(meters / (accessible ? 50 : 70)) + (route?.steps.some((s) => s.floor === 1) ? 1 : 0))
  const start = locations.find((l) => l.id === route?.startId)
  const last = route ? stepIndex === route.steps.length - 1 : false

  return (
    <div className="pb-6">
      <ScreenHeader title="Find My Clinic" subtitle="Step-by-step directions inside the hospital." />
      <div className="space-y-4 px-4">
        <Card className="space-y-4">
          <Field label="Where are you going?">
            <select value={dest} onChange={(e) => setParams({ to: e.target.value }, { replace: true })}>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Accessibility size={22} className="text-blue" aria-hidden />
              <div>
                <p className="font-semibold text-ink">Step-free route</p>
                <p className="text-sm text-muted">Avoids stairs and uses lifts.</p>
              </div>
            </div>
            <Toggle checked={accessible} onChange={setAccessible} label="Step-free route" />
          </div>
        </Card>

        {!route ? (
          <EmptyState title="No directions available yet" body="Directions to this location have not been added. Please ask at Reception." />
        ) : (
          <>
            <Card>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted">Starting from</p>
                  <p className="font-semibold text-navy">{start?.name}</p>
                </div>
                <p className="flex items-center gap-1.5 rounded-full bg-softblue px-3 py-1.5 text-sm font-semibold text-navy">
                  <Footprints size={16} aria-hidden /> About {minutes} min · {meters} m
                </p>
              </div>
              {route.accessible && !accessible && <p className="mt-2 text-sm text-tealdark">This route is already step-free.</p>}

              <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-bg p-1" role="group" aria-label="Floor">
                {([0, 1] as const).map((f) => (
                  <button key={f} aria-pressed={floor === f} onClick={() => setFloor(f)} className={cx('min-h-[2.75rem] rounded-lg text-sm font-semibold', floor === f ? 'bg-white text-navy shadow' : 'text-muted')}>
                    {f === 0 ? 'Ground Floor' : 'First Floor'}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-bg p-1.5">
                <FloorMap floor={floor} locations={locations} route={route} stepIndex={stepIndex} />
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink" aria-label="Map legend">
                {LEGEND.map((l) => (
                  <li key={l.label} className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded" style={{ background: l.color, border: `1.5px solid ${l.border}` }} /> {l.label}
                  </li>
                ))}
                <li className="flex items-center gap-1.5"><span className="h-1 w-5 rounded-full bg-blue" /> Your route</li>
              </ul>
            </Card>

            <Card className="!bg-navy text-white">
              <p className="text-sm font-semibold text-white/80">Step {stepIndex + 1} of {route.steps.length}</p>
              <p className="mt-1 text-lg font-semibold leading-snug" aria-live="polite">{step?.instruction}</p>
              <div className="mt-4 flex gap-2.5">
                <Button variant="secondary" className="!px-4" disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)} aria-label="Previous step"><ArrowLeft size={20} aria-hidden /></Button>
                {last ? (
                  <Button variant="secondary" full onClick={() => setStepIndex(0)}><Check size={20} aria-hidden /> Arrived · Start again</Button>
                ) : (
                  <Button variant="secondary" full onClick={() => setStepIndex(stepIndex + 1)}>Next Step <ArrowRight size={20} aria-hidden /></Button>
                )}
              </div>
            </Card>

            <div>
              <SectionTitle>All steps</SectionTitle>
              <ol className="space-y-2">
                {route.steps.map((s, i) => (
                  <li key={s.id}>
                    <button onClick={() => setStepIndex(i)} aria-current={i === stepIndex ? 'step' : undefined} className={cx('flex w-full items-start gap-3 rounded-2xl p-3.5 text-left', i === stepIndex ? 'bg-softblue ring-2 ring-blue' : 'bg-white shadow-card')}>
                      <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold', i < stepIndex ? 'bg-tealdark text-white' : i === stepIndex ? 'bg-blue text-white' : 'bg-bg text-muted')}>
                        {i < stepIndex ? <Check size={16} aria-label="Done" /> : i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block font-medium text-ink">{s.instruction}</span>
                        <span className="text-sm text-muted">{s.floor === 0 ? 'Ground Floor' : 'First Floor'}{s.meters ? ` · about ${s.meters} m` : ''}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}

        <div>
          <SectionTitle>Parking and travel</SectionTitle>
          <div className="space-y-2">
            {[{ to: '/guidance/guide-001', icon: Car, label: 'Parking at the hospital' }, { to: '/guidance/guide-002', icon: Train, label: 'Travelling to the hospital' }].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card hover:bg-softblue/40">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-softblue text-blue"><Icon size={20} aria-hidden /></span>
                <span className="flex-1 font-semibold text-navy">{label}</span>
                <ChevronRight size={20} className="text-muted" aria-hidden />
              </Link>
            ))}
          </div>
        </div>

        <Note tone="amber">This is a fictional demonstration map, not a real hospital floor plan. Distances and times are sample route data. The app does not track your position inside the building.</Note>
      </div>
    </div>
  )
}
