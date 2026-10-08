import type { Appointment } from '../data/seed'

// Date-only strings are treated as local dates so they don't shift a day in other time zones.
const parse = (iso: string) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00` : iso)
const f = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', o).format(parse(iso))

export const longDate = (iso: string) => f(iso, { weekday: 'long', day: 'numeric', month: 'long' })
export const fullDate = (iso: string) => f(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const shortDate = (iso: string) => f(iso, { day: 'numeric', month: 'short' })
export const clock = (iso: string) => f(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
export const dateTime = (iso: string) => `${f(iso, { weekday: 'short', day: 'numeric', month: 'short' })}, ${clock(iso)}`

export const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString()

export const clock12 = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

export const toLocalInput = (d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function downloadIcs(a: Appointment, location: string) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const start = new Date(a.date)
  const end = new Date(start.getTime() + 60 * 60000)
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//My Hospital Journey Demo//EN', 'BEGIN:VEVENT',
    `UID:${a.id}@my-hospital-journey.demo`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${a.type} (demo)`, `LOCATION:${location}\\, Demo Hospital Campus`,
    'DESCRIPTION:Demonstration appointment. Synthetic data only.', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'demo-appointment.ics'
  link.click()
  URL.revokeObjectURL(url)
}
