import { Link, useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, Check, ChevronRight, Circle, CircleDot, Clock, HeartPulse, ListChecks, MapPin, MapPinned, MessageCircleQuestion } from 'lucide-react'
import { useStore } from '../store'
import { PATIENT } from '../data/seed'
import { clock, clock12, longDate } from '../lib/format'
import { Badge, Button, Card, EmptyState, SectionTitle, cx } from '../components/ui'

const QUICK = [
  { to: '/wayfinding', label: 'Find My Clinic', icon: MapPinned, tone: 'bg-softblue text-blue' },
  { to: '/surgery', label: 'Surgery Checklist', icon: ListChecks, tone: 'bg-softteal text-tealdark' },
  { to: '/recovery/health', label: 'Record My Health', icon: HeartPulse, tone: 'bg-softteal text-tealdark' },
  { to: '/ask', label: 'Ask Hospital', icon: MessageCircleQuestion, tone: 'bg-softblue text-blue' },
]

type Stage = { label: string; status: 'Complete' | 'In Progress' | 'Upcoming' | 'Not Started'; to: string }

export default function Home() {
  const nav = useNavigate()
  const { appointments, checklist, checklistDone, reminders, notifications } = useStore()
  const next = appointments.find((a) => a.status === 'Upcoming')
  const unread = notifications.filter((n) => !n.read).length
  const total = checklist.reduce((n, c) => n + c.items.length, 0)
  const done = checklist.reduce((n, c) => n + c.items.filter((i) => checklistDone[i.id]).length, 0)
  const nextReminder = reminders.filter((r) => r.enabled).sort((a, b) => a.time.localeCompare(b.time))[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const journey: Stage[] = [
    { label: 'Appointment Scheduled', status: 'Complete', to: '/visits' },
    { label: 'Pre-operative Assessment', status: 'Upcoming', to: next ? `/visits/${next.id}` : '/visits' },
    { label: 'Surgery Preparation', status: total > 0 && done === total ? 'Complete' : 'In Progress', to: '/surgery' },
    { label: 'Surgery Day', status: 'Upcoming', to: '/visits/appt-2' },
    { label: 'Recovery at Home', status: 'Not Started', to: '/recovery' },
  ]

  return (
    <div className="pb-6">
      <div className="rounded-b-[2rem] bg-gradient-to-br from-navy to-blue px-5 pb-20 pt-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, {PATIENT.firstName}</h1>
            <p className="mt-1 text-white/85">Here's what's coming up in your care journey.</p>
          </div>
          <Link to="/reminders" aria-label={`Reminders, ${unread} unread`} className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 hover:bg-white/25">
            <Bell size={22} aria-hidden />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-bold text-navy">{unread}</span>}
          </Link>
        </div>
      </div>

      <div className="-mt-14 px-4">
        {next ? (
          <Card className="!p-5">
            <Badge tone="teal">Next appointment</Badge>
            <h2 className="mt-2 text-xl font-bold text-navy">{next.type}</h2>
            <dl className="mt-3 space-y-2 text-[0.9375rem] text-ink">
              <div className="flex items-center gap-2.5"><CalendarDays size={18} className="text-blue" aria-hidden /><dt className="sr-only">Date</dt><dd>{longDate(next.date)}</dd></div>
              <div className="flex items-center gap-2.5"><Clock size={18} className="text-blue" aria-hidden /><dt className="sr-only">Time</dt><dd>{clock(next.date)}</dd></div>
              <div className="flex items-center gap-2.5"><MapPin size={18} className="text-blue" aria-hidden /><dt className="sr-only">Location</dt><dd>{next.clinic}</dd></div>
            </dl>
            <div className="mt-4 space-y-2">
              <Button full onClick={() => nav(`/visits/${next.id}`)}>View Appointment</Button>
              <div className="grid grid-cols-2 gap-2">
                <Button small variant="secondary" onClick={() => nav(`/wayfinding?to=${next.locationId}`)}>Get Directions</Button>
                <Button small variant="secondary" onClick={() => nav(`/visits/${next.id}?focus=bring`)}>What to Bring</Button>
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState title="No upcoming appointment" body="When an appointment is booked for you, it will appear here." />
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {QUICK.map(({ to, label, icon: Icon, tone }) => (
            <Link key={to} to={to} className="flex min-h-[6.5rem] flex-col justify-between rounded-2xl bg-white p-4 shadow-card hover:bg-softblue/40">
              <span className={cx('grid h-11 w-11 place-items-center rounded-xl', tone)}><Icon size={24} aria-hidden /></span>
              <span className="mt-2 font-semibold leading-tight text-navy">{label}</span>
            </Link>
          ))}
        </div>

        <Link to="/reminders" className="mt-4 flex items-center gap-3 rounded-2xl bg-softteal p-4 hover:bg-[#DAF1EC]">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-tealdark"><Bell size={22} aria-hidden /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-tealdark">Your next preparation reminder</span>
            <span className="block font-semibold text-ink">{nextReminder ? nextReminder.title : 'No reminders switched on'}</span>
            {nextReminder && <span className="block text-sm text-muted">{nextReminder.repeat} at {clock12(nextReminder.time)}</span>}
          </span>
          <ChevronRight size={22} className="shrink-0 text-tealdark" aria-hidden />
        </Link>

        <SectionTitle>My Care Journey</SectionTitle>
        <Card>
          <ol>
            {journey.map((s, i) => (
              <li key={s.label}>
                <Link to={s.to} className="flex gap-3 rounded-xl py-1 hover:bg-softblue/40">
                  <span className="flex flex-col items-center">
                    <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full', s.status === 'Complete' ? 'bg-tealdark text-white' : s.status === 'In Progress' ? 'bg-blue text-white' : s.status === 'Upcoming' ? 'border-2 border-blue bg-white text-blue' : 'border-2 border-line bg-white text-muted')}>
                      {s.status === 'Complete' ? <Check size={18} aria-hidden /> : s.status === 'In Progress' ? <CircleDot size={18} aria-hidden /> : <Circle size={10} aria-hidden />}
                    </span>
                    {i < journey.length - 1 && <span className={cx('my-1 w-0.5 flex-1', s.status === 'Complete' ? 'bg-tealdark' : 'bg-line')} style={{ minHeight: 18 }} />}
                  </span>
                  <span className="flex flex-1 flex-wrap items-center justify-between gap-x-2 gap-y-1 pb-4 pt-1">
                    <span className="font-semibold text-ink">{s.label}</span>
                    <Badge tone={s.status === 'Complete' ? 'teal' : s.status === 'Not Started' ? 'grey' : 'blue'}>{s.status}</Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {total > 0 && <p className="text-sm text-muted">Surgery preparation: {done} of {total} checklist items complete.</p>}
        </Card>
      </div>
    </div>
  )
}
