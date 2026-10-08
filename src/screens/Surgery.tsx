import { useState } from 'react'
import { CalendarDays, Check, ChevronDown, Phone } from 'lucide-react'
import { useStore } from '../store'
import { CARE_TEAM_PHONE } from '../data/seed'
import { fullDate, shortDate } from '../lib/format'
import { Card, EmptyState, Note, ScreenHeader, SectionTitle, Synthetic, cx, toast } from '../components/ui'

export default function Surgery() {
  const { checklist, checklistDone, toggleChecklist, appointments } = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const procedure = appointments.find((a) => a.type === 'Day Procedure')
  const total = checklist.reduce((n, c) => n + c.items.length, 0)
  const done = checklist.reduce((n, c) => n + c.items.filter((i) => checklistDone[i.id]).length, 0)
  const pct = total ? Math.round((done / total) * 100) : 0
  const C = 2 * Math.PI * 34

  const toggle = (id: string, wasDone: boolean) => {
    toggleChecklist(id)
    toast(wasDone ? 'Marked as not done. Progress saved.' : 'Marked complete. Progress saved.', 'success', { label: 'Undo', run: () => toggleChecklist(id) })
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Preparing for your procedure" subtitle="Your checklist from your care team." />
      <div className="space-y-4 px-4">
        <Card className="flex items-center gap-4 !p-5">
          <svg viewBox="0 0 80 80" className="h-24 w-24 shrink-0" role="img" aria-label={`${pct}% of your checklist complete`}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#E8F7F4" strokeWidth="9" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="#0E766E" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset .4s' }} />
            <text x="40" y="46" textAnchor="middle" fontSize="19" fontWeight="700" fill="#12365A">{pct}%</text>
          </svg>
          <div>
            <p className="text-lg font-bold text-navy">{done} of {total} complete</p>
            <p className="text-muted">{done === total && total > 0 ? 'Everything is ticked off. Well done.' : 'Take it one step at a time.'}</p>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-softblue text-blue"><CalendarDays size={20} aria-hidden /></span>
            <div><p className="text-sm text-muted">Procedure date</p><p className="font-semibold text-ink">{procedure ? fullDate(procedure.date) : 'To be confirmed'}</p></div>
          </div>
          <div className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-softblue text-blue"><Phone size={20} aria-hidden /></span>
            <div><p className="text-sm text-muted">Pre-operative team</p><p className="font-semibold text-ink">{CARE_TEAM_PHONE} <span className="font-normal text-muted">(fictional number)</span></p></div>
          </div>
        </Card>

        <Note>Your written instructions from the hospital are specific to you. This checklist helps you keep track. It does not replace them.</Note>

        {total === 0 && <EmptyState title="No checklist yet" body="Your care team has not added a checklist. Contact the pre-operative team if you expected one." />}

        {checklist.map((cat) => (
          <section key={cat.id}>
            <SectionTitle action={<span className="text-sm font-semibold text-muted">{cat.items.filter((i) => checklistDone[i.id]).length}/{cat.items.length}</span>}>{cat.title}</SectionTitle>
            <ul className="space-y-2.5">
              {cat.items.map((item) => {
                const isDone = !!checklistDone[item.id]
                const isOpen = open === item.id
                return (
                  <li key={item.id} className="rounded-2xl bg-white shadow-card">
                    <div className="flex items-stretch">
                      <button role="checkbox" aria-checked={isDone} aria-label={item.title} onClick={() => toggle(item.id, isDone)} className="grid w-16 shrink-0 place-items-center rounded-l-2xl">
                        <span className={cx('grid h-8 w-8 place-items-center rounded-full border-2 transition-colors', isDone ? 'border-tealdark bg-tealdark text-white' : 'border-[#8A9BA8] bg-white')}>
                          {isDone && <Check size={18} aria-hidden />}
                        </span>
                      </button>
                      <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : item.id)} className="flex min-h-[4rem] flex-1 items-center gap-2 rounded-r-2xl py-3 pr-3 text-left">
                        <span className="flex-1">
                          <span className={cx('block font-semibold', isDone ? 'text-muted line-through' : 'text-ink')}>{item.title}</span>
                          {isDone && <span className="text-sm text-tealdark">Completed {shortDate(checklistDone[item.id])}</span>}
                        </span>
                        <ChevronDown size={20} className={cx('shrink-0 text-muted transition-transform', isOpen && 'rotate-180')} aria-hidden />
                      </button>
                    </div>
                    {isOpen && <p className="fade-in border-t border-line px-4 py-3 text-ink">{item.detail}</p>}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        <Synthetic />
      </div>
    </div>
  )
}
