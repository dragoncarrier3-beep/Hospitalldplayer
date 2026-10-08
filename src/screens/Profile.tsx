import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, BookOpen, ChevronRight, Fingerprint, HeartPulse, Info, Lock, LogOut, RotateCcw, ShieldCheck, Type, UserRound, Wind } from 'lucide-react'
import { useStore } from '../store'
import { PATIENT } from '../data/seed'
import { useLock } from '../components/PhoneShell'
import { Button, Card, Note, ScreenHeader, SectionTitle, Sheet, Toggle, cx, toast } from '../components/ui'

const SIZES = [{ v: 1, label: 'Standard' }, { v: 1.15, label: 'Large' }, { v: 1.3, label: 'Larger' }]

function Row({ icon: Icon, label, sub, right, to, onClick }: { icon: typeof Bell; label: string; sub?: string; right?: ReactNode; to?: string; onClick?: () => void }) {
  const inner = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-softblue text-blue"><Icon size={20} aria-hidden /></span>
      <span className="min-w-0 flex-1 text-left"><span className="block font-semibold text-ink">{label}</span>{sub && <span className="block text-sm text-muted">{sub}</span>}</span>
      {right ?? <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden />}
    </>
  )
  const cls = 'flex min-h-[3.5rem] w-full items-center gap-3 py-2'
  if (to) return <Link to={to} className={cls}>{inner}</Link>
  if (onClick) return <button onClick={onClick} className={cls}>{inner}</button>
  return <div className={cls}>{inner}</div>
}

export default function Profile() {
  const nav = useNavigate()
  const { settings, setSettings, signOutPatient, resetDemo, connection } = useStore()
  const setLocked = useLock((s) => s.setLocked)
  const [sheet, setSheet] = useState<'privacy' | 'about' | null>(null)

  return (
    <div className="pb-6">
      <ScreenHeader back={false} title="Profile" />
      <div className="space-y-4 px-4">
        <Card className="flex items-center gap-4 !p-5">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy text-white"><UserRound size={32} aria-hidden /></span>
          <div>
            <p className="text-xl font-bold text-navy">{PATIENT.name}</p>
            <p className="text-muted">{PATIENT.accountType} · {PATIENT.id}</p>
            <p className="text-sm text-muted">{PATIENT.hospital}</p>
          </div>
        </Card>
        <Note tone="amber"><strong>Demo Mode</strong> — No real hospital records connected.</Note>

        <div>
          <SectionTitle>Accessibility</SectionTitle>
          <Card className="divide-y divide-line !py-2">
            <div className="py-3">
              <p className="mb-2 flex items-center gap-2 font-semibold text-ink"><Type size={20} className="text-blue" aria-hidden /> Text size</p>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-bg p-1" role="radiogroup" aria-label="Text size">
                {SIZES.map((s) => (
                  <button key={s.v} role="radio" aria-checked={settings.textScale === s.v} onClick={() => setSettings({ textScale: s.v })} className={cx('min-h-[2.75rem] rounded-lg text-sm font-semibold', settings.textScale === s.v ? 'bg-white text-navy shadow' : 'text-muted')}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <Row icon={Wind} label="Reduce motion" sub="Turn off animations" right={<Toggle checked={settings.reduceMotion} onChange={(v) => setSettings({ reduceMotion: v })} label="Reduce motion" />} />
          </Card>
        </div>

        <div>
          <SectionTitle>Preferences</SectionTitle>
          <Card className="divide-y divide-line !py-2">
            <Row icon={Bell} label="Notifications and reminders" to="/reminders" />
            <Row icon={HeartPulse} label="Health data permissions" sub={connection.status === 'connected' ? 'Connected (simulated)' : 'Not connected'} to="/recovery/connect" />
            <Row icon={BookOpen} label="Hospital guidance" to="/guidance" />
          </Card>
        </div>

        <div>
          <SectionTitle>Security</SectionTitle>
          <Card className="divide-y divide-line !py-2">
            <Row icon={Fingerprint} label="Biometric unlock" sub="Face ID, Touch ID or fingerprint. Simulated in this preview." right={<Toggle checked={settings.biometric} onChange={(v) => setSettings({ biometric: v })} label="Biometric unlock" />} />
            <Row icon={Lock} label="Lock app now" sub="Preview the lock screen" onClick={() => setLocked(true)} />
          </Card>
          <p className="mt-2 px-1 text-sm text-muted">The phone app locks automatically after a period of inactivity and stores your session in the device's secure storage.</p>
        </div>

        <div>
          <SectionTitle>About</SectionTitle>
          <Card className="divide-y divide-line !py-2">
            <Row icon={ShieldCheck} label="Privacy information" onClick={() => setSheet('privacy')} />
            <Row icon={Info} label="About the app" onClick={() => setSheet('about')} />
            <Row icon={RotateCcw} label="Reset demo data" sub="Restore the original sample data" onClick={() => { resetDemo(); nav('/welcome') }} />
          </Card>
        </div>

        <Button full variant="outline" onClick={() => { signOutPatient(); nav('/welcome'); toast('You have signed out.', 'info') }}><LogOut size={20} aria-hidden /> Sign out</Button>
      </div>

      <Sheet open={sheet === 'privacy'} onClose={() => setSheet(null)} title="Privacy information">
        <div className="space-y-3 text-ink">
          <p>This demonstration uses synthetic data only. Alex Morgan is a fictional patient.</p>
          <p>Anything you enter is stored in this browser on this device. It is not sent to a server, a hospital or any third party. “Reset demo data” removes it.</p>
          <p>Ask Hospital matches your question against approved guidance inside the app. Questions are not sent to an external AI service.</p>
          <p className="text-sm text-muted">A production version would need a Data Protection Impact Assessment and clinical safety assessment led by the hospital before any real patient uses it.</p>
        </div>
      </Sheet>
      <Sheet open={sheet === 'about'} onClose={() => setSheet(null)} title="About the app">
        <div className="space-y-3 text-ink">
          <p><strong>My Hospital Journey</strong> — Your visit. Your care. Your recovery.</p>
          <p>Version 0.1 (demonstration concept). This is not an official NHS or hospital product and has not been clinically approved.</p>
          <p>It does not replace the NHS App, which you use for booking, letters and records.</p>
        </div>
      </Sheet>
    </div>
  )
}
