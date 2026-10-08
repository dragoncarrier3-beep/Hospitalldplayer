import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Download, ShieldCheck, Smartphone, Unplug, XCircle } from 'lucide-react'
import { useStore } from '../store'
import type { Metric } from '../data/seed'
import { dateTime } from '../lib/format'
import { METRICS } from '../lib/metrics'
import { Badge, Button, Card, Note, ScreenHeader, SectionTitle, Sheet, Toggle, toast } from '../components/ui'

const PLATFORMS = {
  apple: { name: 'Apple Health', tech: 'HealthKit', device: 'iPhone' },
  healthconnect: { name: 'Health Connect', tech: 'Health Connect', device: 'Android' },
} as const
type Platform = keyof typeof PLATFORMS
const CATEGORIES: Metric[] = ['hr', 'bp', 'spo2', 'temp']

export default function HealthConnect() {
  const { connection, setConnection, importHealth } = useStore()
  const [asking, setAsking] = useState<Platform | null>(null)
  const [cats, setCats] = useState<Metric[]>(CATEGORIES)
  const connected = connection.status === 'connected' && connection.platform

  const allow = () => {
    if (!asking) return
    setConnection({ platform: asking, status: 'connected', categories: cats, lastSync: undefined })
    toast(`${PLATFORMS[asking].name} connected (simulated).`)
    setAsking(null)
  }
  const deny = () => {
    if (!asking) return
    setConnection({ platform: asking, status: 'denied' })
    setAsking(null)
  }
  const runImport = () => {
    const n = importHealth()
    toast(n ? `${n} simulated readings imported.` : 'No data types are switched on.', n ? 'success' : 'info')
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Connect Health Data" subtitle="Bring in readings so you don't have to type them." />
      <div className="space-y-4 px-4">
        <Note tone="amber" icon={<Smartphone size={18} aria-hidden />}>
          <strong>Health connection preview — simulated data.</strong> A web browser cannot reach Apple Health or Health Connect. The phone app asks for real permission on the device.
        </Note>

        {connection.status === 'denied' && (
          <Note tone="amber" icon={<XCircle size={18} aria-hidden />}>
            Permission was not given, so nothing was imported. You can still add readings by hand, or try connecting again.
          </Note>
        )}

        {connected ? (
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-softteal text-tealdark"><CheckCircle2 size={24} aria-hidden /></span>
              <div className="flex-1">
                <p className="font-bold text-navy">{PLATFORMS[connection.platform!].name}</p>
                <p className="text-sm text-muted">Last sync: {connection.lastSync ? dateTime(connection.lastSync) : 'not yet'}</p>
              </div>
              <Badge tone="teal">Connected (simulated)</Badge>
            </div>
            <div>
              <p className="mb-2 font-semibold text-ink">Data you are sharing</p>
              <ul className="space-y-2">
                {CATEGORIES.map((c) => {
                  const on = connection.categories.includes(c)
                  return (
                    <li key={c} className="flex items-center justify-between gap-3">
                      <span className="text-ink">{METRICS[c].label}</span>
                      <Toggle checked={on} label={`Share ${METRICS[c].label}`} onChange={(v) => setConnection({ categories: v ? [...connection.categories, c] : connection.categories.filter((x) => x !== c) })} />
                    </li>
                  )
                })}
              </ul>
            </div>
            <Button full onClick={runImport}><Download size={20} aria-hidden /> Try Demo Import</Button>
            <Link to="/recovery/health" className="block text-center font-semibold text-blue underline">View my readings</Link>
            <Button full variant="outline" onClick={() => { setConnection({ platform: null, status: 'disconnected', lastSync: undefined }); toast('Disconnected. Imported readings stay in your history.', 'info') }}>
              <Unplug size={18} aria-hidden /> Disconnect
            </Button>
            <p className="text-sm text-muted">On a phone you can also remove access at any time in {connection.platform === 'apple' ? 'Settings → Health → Data Access & Devices' : 'Settings → Health Connect → App permissions'}.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {(Object.keys(PLATFORMS) as Platform[]).map((p) => (
              <Card key={p}>
                <p className="font-bold text-navy">{PLATFORMS[p].name}</p>
                <p className="text-sm text-muted">For {PLATFORMS[p].device}. Uses {PLATFORMS[p].tech}, read-only.</p>
                <Button full variant="secondary" className="mt-3" onClick={() => { setCats(CATEGORIES); setAsking(p) }}>Connect {PLATFORMS[p].name}</Button>
              </Card>
            ))}
          </div>
        )}

        <div>
          <SectionTitle>What we ask for</SectionTitle>
          <Card className="space-y-3">
            <p className="flex gap-2.5 text-ink"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-tealdark" aria-hidden /> The app only reads data. It never writes to your health app.</p>
            <p className="text-ink">We ask for heart rate, blood pressure, oxygen saturation and body temperature. You choose which to share.</p>
            <p className="text-sm text-muted">Some data may be unavailable: a watch may not measure blood pressure or temperature, and some devices record oxygen saturation only during sleep. Anything missing can be added by hand.</p>
          </Card>
        </div>
      </div>

      <Sheet open={!!asking} onClose={() => setAsking(null)} title={asking ? `Allow access to ${PLATFORMS[asking].name}?` : ''}>
        <div className="space-y-4">
          <p className="text-ink">This simulates the permission screen your phone would show. Choose what My Hospital Journey can read.</p>
          <ul className="space-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c} className="flex items-center justify-between gap-3">
                <span className="font-medium text-ink">{METRICS[c].label}</span>
                <Toggle checked={cats.includes(c)} label={`Allow ${METRICS[c].label}`} onChange={(v) => setCats(v ? [...cats, c] : cats.filter((x) => x !== c))} />
              </li>
            ))}
          </ul>
          <Button full onClick={allow} disabled={cats.length === 0}>Allow</Button>
          <Button full variant="outline" onClick={deny}>Don't Allow</Button>
        </div>
      </Sheet>
    </div>
  )
}
