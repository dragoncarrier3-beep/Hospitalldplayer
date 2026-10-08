import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Bell, CalendarDays, CalendarPlus, Check, ChevronRight, Clock, ListChecks, MapPin, MapPinned, Phone } from 'lucide-react'
import { useStore } from '../store'
import { uid } from '../data/seed'
import { clock, downloadIcs, fullDate, longDate } from '../lib/format'
import { Badge, Button, Card, EmptyState, ScreenHeader, SectionTitle, Synthetic, toast } from '../components/ui'

export function Visits() {
  const { appointments } = useStore()
  const upcoming = appointments.filter((a) => a.status !== 'Completed')
  const past = appointments.filter((a) => a.status === 'Completed')
  const Row = ({ id, type, date, clinic, status }: (typeof appointments)[number]) => (
    <li>
      <Link to={`/visits/${id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card hover:bg-softblue/40">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-softblue text-center leading-none text-navy">
          <span>
            <span className="block text-lg font-bold">{new Date(date).getDate()}</span>
            <span className="text-xs font-semibold uppercase">{new Date(date).toLocaleString('en-GB', { month: 'short' })}</span>
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-navy">{type}</span>
          <span className="block text-sm text-muted">{clock(date)} · {clinic}</span>
          <span className="mt-1 block"><Badge tone={status === 'Completed' ? 'grey' : status === 'Upcoming' ? 'teal' : 'blue'}>{status}</Badge></span>
        </span>
        <ChevronRight size={22} className="shrink-0 text-muted" aria-hidden />
      </Link>
    </li>
  )
  return (
    <div className="pb-6">
      <ScreenHeader back={false} title="My Visits" subtitle="Your appointments at Demo Hospital Campus." />
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/wayfinding" className="flex items-center gap-2.5 rounded-2xl bg-softblue p-4 font-semibold text-navy"><MapPinned size={22} aria-hidden /> Find My Clinic</Link>
          <Link to="/surgery" className="flex items-center gap-2.5 rounded-2xl bg-softteal p-4 font-semibold text-tealdark"><ListChecks size={22} aria-hidden /> Surgery Checklist</Link>
        </div>
        <SectionTitle>Upcoming</SectionTitle>
        {upcoming.length ? <ul className="space-y-3">{upcoming.map((a) => <Row key={a.id} {...a} />)}</ul> : <EmptyState title="No upcoming appointments" body="New appointments will appear here." />}
        {past.length > 0 && (
          <>
            <SectionTitle>Past</SectionTitle>
            <ul className="space-y-3">{past.map((a) => <Row key={a.id} {...a} />)}</ul>
          </>
        )}
        <div className="mt-5"><Synthetic>Demonstration appointments. Booking, letters and records stay in the NHS App.</Synthetic></div>
      </div>
    </div>
  )
}

export function VisitDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const bringRef = useRef<HTMLDivElement>(null)
  const { appointments, locations, reminders, saveReminder } = useStore()
  const a = appointments.find((x) => x.id === id)

  useEffect(() => {
    if (params.get('focus') === 'bring') bringRef.current?.scrollIntoView({ block: 'start' })
  }, [params])

  if (!a) {
    return (
      <div>
        <ScreenHeader title="Appointment" />
        <div className="px-4"><EmptyState title="We couldn't find that appointment" body="It may have been changed or removed." action={<Button onClick={() => nav('/visits')}>Back to My Visits</Button>} /></div>
      </div>
    )
  }

  const location = locations.find((l) => l.id === a.locationId)
  const reminderTitle = `Upcoming appointment: ${a.type}`
  const hasReminder = reminders.some((r) => r.title === reminderTitle && r.enabled)

  const setReminder = () => {
    if (hasReminder) return nav('/reminders')
    const existing = reminders.find((r) => r.title === reminderTitle)
    saveReminder(existing ? { ...existing, enabled: true } : { id: uid(), title: reminderTitle, type: 'Appointment', time: '09:00', repeat: 'Once', enabled: true })
    toast('Reminder set for 9:00 AM. You can change it in Reminders.', 'success', { label: 'Edit', run: () => nav('/reminders') })
  }

  return (
    <div className="pb-6">
      <ScreenHeader title={a.type} subtitle="Appointment details" />
      <div className="space-y-4 px-4">
        <Card className="!p-5">
          <Badge tone={a.status === 'Completed' ? 'grey' : 'teal'}>{a.status}</Badge>
          <dl className="mt-3 space-y-3">
            {[
              { icon: CalendarDays, k: 'Date', v: fullDate(a.date) },
              { icon: Clock, k: 'Time', v: `${clock(a.date)} · please arrive 15 minutes early` },
              { icon: MapPin, k: 'Location', v: `${a.clinic}, ${location ? (location.floor === 0 ? 'Ground Floor' : 'First Floor') : ''}` },
              { icon: MapPinned, k: 'Hospital', v: 'Demo Hospital Campus' },
              { icon: Phone, k: 'Contact', v: `${a.contact} (fictional number)` },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-softblue text-blue"><Icon size={20} aria-hidden /></span>
                <div><dt className="text-sm text-muted">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>
              </div>
            ))}
          </dl>
        </Card>

        {a.status !== 'Completed' && (
          <div className="grid grid-cols-2 gap-2.5">
            <Button className="col-span-2" onClick={() => nav(`/wayfinding?to=${a.locationId}`)}><MapPinned size={20} aria-hidden /> Get Directions</Button>
            <Button small variant="secondary" onClick={() => { downloadIcs(a, a.clinic); toast('Calendar file downloaded. Open it to add the appointment.') }}><CalendarPlus size={18} aria-hidden /> Add to Calendar</Button>
            <Button small variant="secondary" onClick={setReminder}><Bell size={18} aria-hidden /> {hasReminder ? 'Edit Reminder' : 'Set Reminder'}</Button>
            <Button small variant="outline" className="col-span-2" onClick={() => nav('/surgery')}><ListChecks size={18} aria-hidden /> View Preparation Checklist</Button>
          </div>
        )}

        <Card>
          <h2 className="text-lg font-bold text-navy">Preparation notes</h2>
          <p className="mt-2 text-ink">{a.prepNotes}</p>
        </Card>

        <div ref={bringRef} className="scroll-mt-4">
          <Card>
            <h2 className="text-lg font-bold text-navy">What to bring</h2>
            <ul className="mt-3 space-y-2.5">
              {a.bring.map((b) => (
                <li key={b} className="flex items-center gap-3 text-ink">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-softteal text-tealdark"><Check size={16} aria-hidden /></span>
                  {b}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <Synthetic />
      </div>
    </div>
  )
}
