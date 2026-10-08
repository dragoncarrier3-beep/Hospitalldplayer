import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Camera, CheckCircle2, ChevronRight, ClipboardCheck, LifeBuoy, Link2, Phone } from 'lucide-react'
import { useStore } from '../store'
import { CARE_TEAM_PHONE } from '../data/seed'
import { dateTime, isToday } from '../lib/format'
import { METRICS, METRIC_ORDER, formatValue } from '../lib/metrics'
import { Badge, Button, Card, EmptyState, Field, Note, ScreenHeader, SectionTitle, Sheet, cx } from '../components/ui'

export function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Need medical help?">
      <div className="space-y-3">
        <div className="rounded-xl bg-softred p-4">
          <p className="font-bold text-danger">In an emergency, call 999</p>
          <p className="mt-1 text-sm text-ink">If you or someone else is seriously ill or their life is at risk.</p>
        </div>
        <div className="rounded-xl bg-softamber p-4">
          <p className="font-bold text-[#7A470B]">For urgent medical help, call NHS 111</p>
          <p className="mt-1 text-sm text-ink">If you need help now but it is not an emergency. Available 24 hours a day.</p>
        </div>
        <div className="rounded-xl bg-softblue p-4">
          <p className="flex items-center gap-2 font-bold text-navy"><Phone size={18} aria-hidden /> Your care team: {CARE_TEAM_PHONE}</p>
          <p className="mt-1 text-sm text-ink">For questions about your recovery, Monday to Friday, 8am to 6pm. Fictional demo number.</p>
        </div>
        <p className="text-sm text-muted">This app does not assess your symptoms and is not monitored for emergencies. Call buttons are switched off in this demo.</p>
      </div>
    </Sheet>
  )
}

export function Recovery() {
  const nav = useNavigate()
  const [help, setHelp] = useState(false)
  const { checkins, observations, photos } = useStore()
  const sorted = [...checkins].sort((a, b) => b.at.localeCompare(a.at))
  const today = sorted.find((c) => isToday(c.at))
  const first = sorted[sorted.length - 1]
  const day = first ? Math.floor((Date.now() - new Date(first.at).setHours(0, 0, 0, 0)) / 86400000) + 1 : 1
  const latest = (m: (typeof METRIC_ORDER)[number]) => observations.filter((o) => o.metric === m).sort((a, b) => b.at.localeCompare(a.at))[0]

  return (
    <div className="pb-6">
      <ScreenHeader back={false} title="Your recovery journey" subtitle="Keep track of how you are doing at home." />
      <div className="space-y-4 px-4">
        <Note tone="amber">Recovery preview. Sample data is shown as if your procedure has already happened, so you can explore this part of the app.</Note>

        <Card className="!bg-gradient-to-br !from-tealdark !to-teal !p-5 text-white">
          <p className="text-sm font-semibold text-white/90">Recovery</p>
          <p className="text-3xl font-bold">Day {day}</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 p-3">
            {today ? <CheckCircle2 size={22} aria-hidden /> : <ClipboardCheck size={22} aria-hidden />}
            <p className="flex-1 font-semibold">{today ? "Today's check-in is saved" : "Today's check-in is not done yet"}</p>
          </div>
          <Button full variant="secondary" className="mt-3" onClick={() => nav('/recovery/checkin')}>{today ? 'Add another check-in' : 'Start Daily Check-in'}</Button>
        </Card>

        <button onClick={() => setHelp(true)} className="flex w-full items-center gap-3 rounded-2xl border-2 border-danger bg-white p-4 text-left">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-softred text-danger"><LifeBuoy size={24} aria-hidden /></span>
          <span className="flex-1"><span className="block font-bold text-danger">Need medical help?</span><span className="text-sm text-ink">Who to contact, including 111 and 999.</span></span>
          <ChevronRight size={22} className="text-danger" aria-hidden />
        </button>

        <div>
          <SectionTitle action={<Link to="/recovery/health" className="text-sm font-semibold text-blue underline">View all</Link>}>Health readings</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {METRIC_ORDER.map((m) => {
              const o = latest(m)
              return (
                <Link key={m} to={`/recovery/health/${m}`} className="rounded-2xl bg-white p-4 shadow-card hover:bg-softblue/40">
                  <p className="text-sm font-medium text-muted">{METRICS[m].label}</p>
                  <p className="mt-1 text-2xl font-bold text-navy">{o ? formatValue(o) : '—'} <span className="text-sm font-medium text-muted">{METRICS[m].unit}</span></p>
                </Link>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-muted">Sample values. The app does not judge whether a reading is normal.</p>
        </div>

        <div className="space-y-2.5">
          {[
            { to: '/recovery/health', icon: Activity, label: 'Record My Health', sub: 'Add or review your readings' },
            { to: '/recovery/connect', icon: Link2, label: 'Connect Health Data', sub: 'Apple Health and Health Connect' },
            { to: '/recovery/photo', icon: Camera, label: 'Share a recovery photo', sub: `${photos.length} submitted` },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link key={to + label} to={to} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card hover:bg-softblue/40">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-softteal text-tealdark"><Icon size={22} aria-hidden /></span>
              <span className="flex-1"><span className="block font-semibold text-navy">{label}</span><span className="text-sm text-muted">{sub}</span></span>
              <ChevronRight size={20} className="text-muted" aria-hidden />
            </Link>
          ))}
        </div>

        <div>
          <SectionTitle>Recovery history</SectionTitle>
          {sorted.length === 0 ? (
            <EmptyState title="No check-ins yet" body="Your daily check-ins will appear here." />
          ) : (
            <ul className="space-y-2.5">
              {sorted.map((c) => (
                <Card as="li" key={c.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{dateTime(c.at)}</p>
                    <Badge tone="blue">Feeling: {c.feeling}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">Pain {c.pain}/10 · {c.mobility}</p>
                  {c.notes && <p className="mt-1 text-sm text-ink">“{c.notes}”</p>}
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
      <HelpSheet open={help} onClose={() => setHelp(false)} />
    </div>
  )
}

const FEELINGS = ['Very well', 'Well', 'About the same', 'Not so well', 'Concerned']
const MOBILITY = ['Walking normally', 'Walking with some difficulty', 'Limited movement']

function Choice({ legend, options, value, onChange, columns = 1 }: { legend: string; options: string[]; value: string | null; onChange: (v: string) => void; columns?: number }) {
  return (
    <fieldset>
      <legend className="mb-2 text-lg font-bold text-navy">{legend}</legend>
      <div role="radiogroup" className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <button key={o} role="radio" aria-checked={value === o} onClick={() => onChange(o)} className={cx('min-h-[3.25rem] rounded-xl border-2 px-3 text-center font-semibold', value === o ? 'border-navy bg-navy text-white' : 'border-line bg-white text-ink')}>
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function CheckIn() {
  const nav = useNavigate()
  const addCheckin = useStore((s) => s.addCheckin)
  const [feeling, setFeeling] = useState<string | null>(null)
  const [pain, setPain] = useState<string | null>(null)
  const [mobility, setMobility] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [help, setHelp] = useState(false)

  const submit = () => {
    if (!feeling || pain === null || !mobility) return setError('Please answer questions 1 to 3 before you submit.')
    addCheckin({ feeling, pain: Number(pain), mobility, notes: notes.trim() })
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-softteal text-tealdark"><CheckCircle2 size={56} aria-hidden /></span>
        <h1 className="text-2xl font-bold text-navy" role="status">Your check-in has been saved.</h1>
        <p className="text-muted">Your answers are stored for your care team. They are not assessed automatically, so please contact someone if you are worried.</p>
        <Button full onClick={() => nav('/recovery')}>Back to Recovery</Button>
        <Button full variant="outline" className="!border-danger !text-danger" onClick={() => setHelp(true)}>Need medical help?</Button>
        <HelpSheet open={help} onClose={() => setHelp(false)} />
      </div>
    )
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Daily check-in" subtitle="It takes about a minute." />
      <div className="space-y-6 px-4">
        <Choice legend="1. How are you feeling today?" options={FEELINGS} value={feeling} onChange={setFeeling} />
        <div>
          <Choice legend="2. Pain level" options={Array.from({ length: 11 }, (_, i) => String(i))} value={pain} onChange={setPain} columns={6} />
          <p className="mt-1.5 flex justify-between text-sm text-muted"><span>0 = no pain</span><span>10 = worst pain</span></p>
        </div>
        <Choice legend="3. Mobility" options={MOBILITY} value={mobility} onChange={setMobility} />
        <Field label="4. Additional notes" hint="Optional. Please don't include personal details in this demo.">
          <textarea rows={3} value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {error && <p role="alert" className="rounded-xl bg-softred p-3 font-medium text-danger">{error}</p>}
        <Button full onClick={submit}>Submit Check-in</Button>
        <Button full variant="outline" className="!border-danger !text-danger" onClick={() => setHelp(true)}>Need medical help?</Button>
      </div>
      <HelpSheet open={help} onClose={() => setHelp(false)} />
    </div>
  )
}
