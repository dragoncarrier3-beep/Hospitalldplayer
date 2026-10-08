import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { useStore } from '../store'
import { SOURCE_NAME } from '../data/seed'
import { fullDate } from '../lib/format'
import { Badge, Button, Card, EmptyState, ScreenHeader, Synthetic } from '../components/ui'

export function GuidanceList() {
  const guidance = useStore((s) => s.guidance)
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const list = guidance.filter((a) => a.published && (!term || `${a.title} ${a.category} ${a.summary} ${a.keywords.join(' ')}`.toLowerCase().includes(term)))
  return (
    <div className="pb-6">
      <ScreenHeader title="Hospital guidance" subtitle="The approved information Ask Hospital uses." />
      <div className="space-y-3 px-4">
        <div className="relative">
          <Search size={20} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" aria-hidden />
          <input aria-label="Search guidance" className="!pl-11" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guidance" />
        </div>
        {list.length === 0 ? (
          <EmptyState title="No guidance found" body={term ? `Nothing matches “${q}”. Try a different word, or contact your hospital care team.` : 'No guidance has been published yet.'} />
        ) : (
          <ul className="space-y-2.5">
            {list.map((a) => (
              <li key={a.id}>
                <Link to={`/guidance/${a.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card hover:bg-softblue/40">
                  <span className="min-w-0 flex-1">
                    <Badge>{a.category}</Badge>
                    <span className="mt-1 block font-semibold text-navy">{a.title}</span>
                    <span className="text-sm text-muted">{a.ref}</span>
                  </span>
                  <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Synthetic>All guidance in this demo is fictional example content.</Synthetic>
      </div>
    </div>
  )
}

export function GuidanceView() {
  const { id } = useParams()
  const nav = useNavigate()
  const a = useStore((s) => s.guidance.find((x) => x.id === id && x.published))
  if (!a) {
    return (
      <div>
        <ScreenHeader title="Guidance" />
        <div className="px-4"><EmptyState title="This guidance is no longer available" body="It may have been updated or withdrawn by the hospital." action={<Button onClick={() => nav('/guidance')}>Browse guidance</Button>} /></div>
      </div>
    )
  }
  return (
    <div className="pb-6">
      <ScreenHeader title={a.title} />
      <div className="space-y-4 px-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{a.category}</Badge>
          <Badge tone="grey">{a.ref}</Badge>
        </div>
        <Card className="space-y-3 !p-5">
          <p className="text-lg font-semibold text-navy">{a.summary}</p>
          {a.body.split('\n\n').map((p, i) => <p key={i} className="whitespace-pre-line text-ink">{p}</p>)}
        </Card>
        <Card>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">Source</dt><dd className="text-right font-medium text-ink">{SOURCE_NAME}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Reference</dt><dd className="font-medium text-ink">{a.ref}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Last reviewed</dt><dd className="font-medium text-ink">{fullDate(a.lastReviewed)}</dd></div>
          </dl>
        </Card>
        <Synthetic />
      </div>
    </div>
  )
}
