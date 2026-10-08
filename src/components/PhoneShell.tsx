import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarDays, ExternalLink, Fingerprint, HeartPulse, Home, MessageCircleQuestion, RotateCcw, UserRound, WifiOff } from 'lucide-react'
import { create } from 'zustand'
import { useStore } from '../store'
import { Button, Toaster, cx, toast } from './ui'

export const useLock = create<{ locked: boolean; setLocked: (v: boolean) => void }>((set) => ({ locked: false, setLocked: (locked) => set({ locked }) }))

const TABS = [
  { to: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
  { to: '/visits', label: 'My Visits', icon: CalendarDays, match: (p: string) => /^\/(visits|wayfinding|surgery)/.test(p) },
  { to: '/recovery', label: 'Recovery', icon: HeartPulse, match: (p: string) => p.startsWith('/recovery') },
  { to: '/ask', label: 'Ask Hospital', icon: MessageCircleQuestion, match: (p: string) => /^\/(ask|guidance)/.test(p) },
  { to: '/profile', label: 'Profile', icon: UserRound, match: (p: string) => /^\/(profile|reminders)/.test(p) },
]

const WALKTHROUGH = [
  'Continue as Demo Patient (Alex Morgan)',
  'Open the appointment and “What to Bring”',
  'Get Directions and step through the route',
  'Tick off items in the Surgery Checklist',
  'Create a reminder and send a test',
  'Submit a recovery check-in and a blood pressure reading',
  'Try the simulated health import and photo upload',
  'Ask “Where can I park?”, then a medical question',
  'Open Staff Admin, review the photo, edit a guidance article',
  'Ask again in the app to see the updated answer',
]

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

// Fires enabled reminders at their set time while the preview is open.
function useReminderClock() {
  useEffect(() => {
    const tick = () => {
      const s = useStore.getState()
      if (!s.patientSignedIn) return
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      for (const r of s.reminders) {
        if (!r.enabled || r.time !== hhmm) continue
        if (r.lastFired && now.getTime() - new Date(r.lastFired).getTime() < 61_000) continue
        s.fireReminder(r.id)
        toast(`Reminder: ${r.title}`, 'info')
      }
    }
    const t = setInterval(tick, 20_000)
    return () => clearInterval(t)
  }, [])
}

export default function PhoneShell() {
  const { pathname } = useLocation()
  const scroller = useRef<HTMLElement>(null)
  const online = useOnline()
  const { settings, resetDemo, patientSignedIn } = useStore()
  const { locked, setLocked } = useLock()
  const showNav = patientSignedIn && pathname !== '/welcome'
  useReminderClock()

  useEffect(() => {
    scroller.current?.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.textScale * 100}%`
    return () => {
      document.documentElement.style.fontSize = ''
    }
  }, [settings.textScale])

  return (
    <div className={cx('min-h-[100dvh] bg-[#E3EBF2] lg:flex lg:items-center lg:justify-center lg:gap-12 lg:p-6', settings.reduceMotion && 'reduce-motion')}>
      <aside className="hidden w-[22rem] shrink-0 lg:block" style={{ fontSize: 16 }}>
        <p className="text-sm font-semibold uppercase tracking-wide text-tealdark">Demonstration concept</p>
        <h1 className="mt-1 text-3xl font-bold text-navy">My Hospital Journey</h1>
        <p className="mt-1 text-lg text-muted">Your visit. Your care. Your recovery.</p>
        <p className="mt-4 rounded-xl bg-white/70 p-3 text-sm text-ink">
          Interactive web preview using 100% synthetic data. Not an official NHS or hospital product, and not connected to any hospital system.
        </p>
        <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-navy">Suggested walkthrough</h2>
        <ol className="mt-2 space-y-1.5 text-sm text-ink">
          {WALKTHROUGH.map((w, i) => (
            <li key={w} className="flex gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">{i + 1}</span>
              {w}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/admin" target="_blank" className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white hover:bg-[#0E2B48]">
            Open Staff Admin <ExternalLink size={16} aria-hidden />
          </Link>
          <Button
            small
            variant="outline"
            onClick={() => {
              resetDemo()
              toast('Demo data reset.')
            }}
          >
            <RotateCcw size={16} aria-hidden /> Reset demo
          </Button>
        </div>
      </aside>

      <div className="relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-bg sm:my-4 sm:h-[min(844px,calc(100dvh-2rem))] sm:w-[390px] sm:rounded-[2.75rem] sm:border-[10px] sm:border-[#0C2238] sm:shadow-2xl lg:mx-0 lg:my-0">
        <div className="flex shrink-0 items-center justify-center gap-1.5 bg-softamber px-3 py-1.5 text-center text-xs font-semibold text-[#7A470B]">
          Demonstration only — no real patient data.
        </div>
        {!online && (
          <div role="status" className="flex shrink-0 items-center justify-center gap-2 bg-navy px-3 py-2 text-sm font-medium text-white">
            <WifiOff size={16} aria-hidden /> You are offline. Your saved information is still available.
          </div>
        )}
        <main ref={scroller} className="no-scrollbar flex-1 overflow-y-auto">
          <Outlet />
        </main>
        {showNav && (
          <nav aria-label="Main" className="grid shrink-0 grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
            {TABS.map(({ to, label, icon: Icon, match }) => {
              const active = match(pathname)
              return (
                <NavLink key={to} to={to} aria-current={active ? 'page' : undefined} className={cx('flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 px-0.5 text-center text-[0.6875rem] font-semibold leading-tight', active ? 'text-blue' : 'text-muted')}>
                  <span className={cx('grid h-7 w-12 place-items-center rounded-full', active && 'bg-softblue')}>
                    <Icon size={20} aria-hidden />
                  </span>
                  {label}
                </NavLink>
              )
            })}
          </nav>
        )}
        <div id="phone-overlay" className="pointer-events-none absolute inset-0 z-40" />
        <Toaster />
        {locked && (
          <div role="dialog" aria-modal="true" aria-label="App locked" className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-navy p-8 text-center text-white">
            <Fingerprint size={64} aria-hidden />
            <h2 className="text-2xl font-bold">App locked</h2>
            <p className="text-white/80">On a phone, Face ID, Touch ID or fingerprint unlocks the app. This web preview simulates that step.</p>
            <Button variant="secondary" onClick={() => setLocked(false)}>
              Unlock (simulated)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
