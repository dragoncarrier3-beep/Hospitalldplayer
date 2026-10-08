import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Activity, ChevronRight, Droplets, HeartPulse, Link2, Pencil, Plus, Stethoscope, Thermometer, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import type { Metric, Observation } from '../data/seed'
import { dateTime, toLocalInput } from '../lib/format'
import { METRICS, METRIC_ORDER, formatValue, sourceLabel, validateReading } from '../lib/metrics'
import LineChart from '../components/LineChart'
import { Badge, Button, Card, EmptyState, Field, Note, ScreenHeader, SectionTitle, Sheet, cx, toast } from '../components/ui'

const ICONS: Record<Metric, typeof Activity> = { bp: Activity, hr: HeartPulse, temp: Thermometer, spo2: Droplets }
const SYMPTOMS = ['Tiredness', 'Nausea', 'Swelling', 'Trouble sleeping', 'Loss of appetite', 'Headache', 'Dizziness', 'Other']

type Draft = { id?: string; metric: Metric; v1: string; v2: string; at: string }

function ReadingSheet({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const { saveObservation, observations } = useStore()
  const [d, setD] = useState<Draft | null>(draft)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(draft)
  if (draft !== key) {
    setKey(draft)
    setD(draft)
    setError(null)
  }
  if (!d) return null
  const m = METRICS[d.metric]

  const save = () => {
    const value = d.v1.trim() === '' ? NaN : Number(d.v1)
    const value2 = d.metric === 'bp' ? (d.v2.trim() === '' ? NaN : Number(d.v2)) : undefined
    const problem = validateReading(d.metric, value, value2, d.at)
    if (problem) return setError(problem)
    const existing = observations.find((o) => o.id === d.id)
    saveObservation({ id: d.id, metric: d.metric, value, value2, at: new Date(d.at).toISOString(), source: existing?.source ?? 'manual', simulated: existing?.simulated })
    toast(d.id ? 'Reading updated.' : 'Reading saved.')
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={`${d.id ? 'Edit' : 'Add'} ${m.label.toLowerCase()}`}>
      <div className="space-y-4">
        {d.metric === 'bp' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Top number" hint="Systolic, mmHg"><input inputMode="numeric" value={d.v1} onChange={(e) => setD({ ...d, v1: e.target.value })} placeholder="120" /></Field>
            <Field label="Bottom number" hint="Diastolic, mmHg"><input inputMode="numeric" value={d.v2} onChange={(e) => setD({ ...d, v2: e.target.value })} placeholder="80" /></Field>
          </div>
        ) : (
          <Field label={`${m.label} (${m.unit})`}><input inputMode="decimal" value={d.v1} onChange={(e) => setD({ ...d, v1: e.target.value })} /></Field>
        )}
        <Field label="Date and time"><input type="datetime-local" value={d.at} max={toLocalInput()} onChange={(e) => setD({ ...d, at: e.target.value })} /></Field>
        {error && <p role="alert" className="rounded-xl bg-softred p-3 font-medium text-danger">{error}</p>}
        <Button full onClick={save}>Save Reading</Button>
      </div>
    </Sheet>
  )
}

const newDraft = (metric: Metric): Draft => ({ metric, v1: '', v2: '', at: toLocalInput() })

export function Health() {
  const { observations, symptomLogs, connection } = useStore()
  const [draft, setDraft] = useState<Draft | null>(null)
  return (
    <div className="pb-6">
      <ScreenHeader title="Record My Health" subtitle="Your readings, in one place." />
      <div className="space-y-3 px-4">
        {METRIC_ORDER.map((metric) => {
          const Icon = ICONS[metric]
          const o = observations.filter((x) => x.metric === metric).sort((a, b) => b.at.localeCompare(a.at))[0]
          return (
            <Card key={metric}>
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-softblue text-blue"><Icon size={22} aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{METRICS[metric].label}</p>
                  {o ? (
                    <>
                      <p className="text-2xl font-bold text-navy">{formatValue(o)} <span className="text-sm font-medium text-muted">{METRICS[metric].unit}</span></p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">{dateTime(o.at)} <Badge tone={o.source === 'manual' ? 'grey' : 'teal'}>{sourceLabel(o)}</Badge></p>
                    </>
                  ) : (
                    <p className="text-muted">No readings yet</p>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button small variant="secondary" onClick={() => setDraft(newDraft(metric))}><Plus size={18} aria-hidden /> Add Reading</Button>
                <Link to={`/recovery/health/${metric}`} className="inline-flex min-h-[2.75rem] items-center justify-center gap-1 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy hover:bg-softblue">History <ChevronRight size={16} aria-hidden /></Link>
              </div>
            </Card>
          )
        })}

        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-softblue text-blue"><Stethoscope size={22} aria-hidden /></span>
            <div className="flex-1">
              <p className="font-semibold text-ink">Symptoms</p>
              <p className="text-muted">{symptomLogs.length} {symptomLogs.length === 1 ? 'entry' : 'entries'} recorded</p>
            </div>
          </div>
          <Link to="/recovery/health/symptoms" className="mt-3 inline-flex min-h-[2.75rem] w-full items-center justify-center gap-1 rounded-xl bg-softblue px-3 text-sm font-semibold text-navy">Record or view symptoms <ChevronRight size={16} aria-hidden /></Link>
        </Card>

        <Link to="/recovery/connect" className="flex items-center gap-3 rounded-2xl bg-softteal p-4">
          <Link2 size={22} className="text-tealdark" aria-hidden />
          <span className="flex-1"><span className="block font-semibold text-tealdark">Connect Health Data</span><span className="text-sm text-ink">{connection.status === 'connected' ? 'Connected (simulated)' : 'Import readings automatically'}</span></span>
          <ChevronRight size={20} className="text-tealdark" aria-hidden />
        </Link>
        <Note>These are sample values, not personal targets or medical advice. The app records your readings. It does not judge whether they are normal.</Note>
      </div>
      <ReadingSheet draft={draft} onClose={() => setDraft(null)} />
    </div>
  )
}

export function MetricDetail() {
  const { metric } = useParams()
  if (metric === 'symptoms') return <Symptoms />
  if (!METRIC_ORDER.includes(metric as Metric)) return <Navigate to="/recovery/health" replace />
  return <MetricHistory metric={metric as Metric} />
}

function MetricHistory({ metric }: { metric: Metric }) {
  const { observations, deleteObservation, saveObservation } = useStore()
  const [days, setDays] = useState<7 | 30>(7)
  const [draft, setDraft] = useState<Draft | null>(null)
  const m = METRICS[metric]
  const all = observations.filter((o) => o.metric === metric).sort((a, b) => a.at.localeCompare(b.at))
  const to = Date.now()
  const from = to - days * 86400000
  const inRange = all.filter((o) => new Date(o.at).getTime() >= from)
  const pts = (pick: (o: Observation) => number) => inRange.map((o) => ({ t: new Date(o.at).getTime(), v: pick(o) }))
  const series =
    metric === 'bp'
      ? [{ label: 'Top (systolic)', color: '#1769AA', points: pts((o) => o.value) }, { label: 'Bottom (diastolic)', color: '#0E766E', points: pts((o) => o.value2 ?? 0) }]
      : [{ label: m.label, color: '#1769AA', points: pts((o) => o.value) }]

  const remove = (o: Observation) => {
    deleteObservation(o.id)
    toast('Reading deleted.', 'success', { label: 'Undo', run: () => saveObservation({ ...o, id: undefined }) })
  }

  return (
    <div className="pb-6">
      <ScreenHeader title={m.label} subtitle={`Measured in ${m.unit}`} />
      <div className="space-y-4 px-4">
        <Card>
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-bg p-1" role="group" aria-label="Period">
            {([7, 30] as const).map((d) => (
              <button key={d} aria-pressed={days === d} onClick={() => setDays(d)} className={cx('min-h-[2.75rem] rounded-lg text-sm font-semibold', days === d ? 'bg-white text-navy shadow' : 'text-muted')}>
                Last {d} days
              </button>
            ))}
          </div>
          <LineChart series={series} unit={m.unit} decimals={m.decimals} from={from} to={to} />
          <p className="mt-2 text-xs text-muted">Tap the chart to see a reading. The app does not interpret these values.</p>
        </Card>

        <Button full onClick={() => setDraft(newDraft(metric))}><Plus size={20} aria-hidden /> Add Reading</Button>

        <div>
          <SectionTitle>All readings</SectionTitle>
          {all.length === 0 ? (
            <EmptyState title="No readings yet" body="Add your first reading to start your history." />
          ) : (
            <ul className="space-y-2">
              {[...all].reverse().map((o) => (
                <Card as="li" key={o.id} className="flex items-center gap-2 !py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-navy">{formatValue(o)} <span className="text-sm font-medium text-muted">{m.unit}</span></p>
                    <p className="flex flex-wrap items-center gap-2 text-sm text-muted">{dateTime(o.at)} <Badge tone={o.source === 'manual' ? 'grey' : 'teal'}>{sourceLabel(o)}</Badge></p>
                  </div>
                  <button aria-label={`Edit reading from ${dateTime(o.at)}`} onClick={() => setDraft({ id: o.id, metric, v1: String(o.value), v2: String(o.value2 ?? ''), at: toLocalInput(new Date(o.at)) })} className="grid h-11 w-11 place-items-center rounded-full text-blue hover:bg-softblue"><Pencil size={18} /></button>
                  <button aria-label={`Delete reading from ${dateTime(o.at)}`} onClick={() => remove(o)} className="grid h-11 w-11 place-items-center rounded-full text-danger hover:bg-softred"><Trash2 size={18} /></button>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ReadingSheet draft={draft} onClose={() => setDraft(null)} />
    </div>
  )
}

function Symptoms() {
  const { symptomLogs, addSymptomLog } = useStore()
  const [picked, setPicked] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    if (picked.length === 0 && !note.trim()) return setError('Choose at least one symptom or add a note.')
    addSymptomLog(picked, note.trim())
    setPicked([])
    setNote('')
    setError(null)
    toast('Symptoms saved.')
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Symptoms" subtitle="Record anything you have noticed." />
      <div className="space-y-4 px-4">
        <Card className="space-y-4">
          <fieldset>
            <legend className="mb-2 font-semibold text-ink">What have you noticed?</legend>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const on = picked.includes(s)
                return (
                  <button key={s} role="checkbox" aria-checked={on} onClick={() => setPicked(on ? picked.filter((x) => x !== s) : [...picked, s])} className={cx('min-h-[2.75rem] rounded-full border-2 px-4 text-sm font-semibold', on ? 'border-navy bg-navy text-white' : 'border-line bg-white text-ink')}>
                    {s}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <Field label="Notes (optional)" error={error}><textarea rows={2} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} /></Field>
          <Button full onClick={save}>Save Symptoms</Button>
        </Card>
        <Note tone="amber">This list is a record for you and your care team. It is not checked automatically. If you are worried, contact your care team or NHS 111. In an emergency call 999.</Note>
        <div>
          <SectionTitle>History</SectionTitle>
          {symptomLogs.length === 0 ? (
            <EmptyState title="Nothing recorded yet" body="Your symptom entries will appear here." />
          ) : (
            <ul className="space-y-2">
              {[...symptomLogs].sort((a, b) => b.at.localeCompare(a.at)).map((l) => (
                <Card as="li" key={l.id} className="!py-3">
                  <p className="text-sm text-muted">{dateTime(l.at)}</p>
                  <p className="font-semibold text-ink">{l.symptoms.join(', ') || 'Note only'}</p>
                  {l.note && <p className="text-sm text-ink">“{l.note}”</p>}
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
