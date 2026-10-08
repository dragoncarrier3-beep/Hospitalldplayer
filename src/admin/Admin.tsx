import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { BookOpen, CalendarDays, ClipboardList, ExternalLink, HeartPulse, Image, LayoutDashboard, ListChecks, LogOut, MapPinned, Pencil, Plus, ScrollText, ShieldAlert, Trash2 } from 'lucide-react'
import { STAFF_ACCOUNTS, useStore } from '../store'
import { uid, type Appointment, type ChecklistItem, type GuidanceArticle, type HospitalLocation, type PhotoStatus } from '../data/seed'
import { clock, dateTime, fullDate } from '../lib/format'
import { METRICS, formatValue, sourceLabel } from '../lib/metrics'
import { Badge, Button, Field, Sheet, Toaster, Toggle, cx, toast } from '../components/ui'

const NAV = [
  { to: '', label: 'Overview', icon: LayoutDashboard },
  { to: 'appointments', label: 'Appointments', icon: CalendarDays },
  { to: 'locations', label: 'Hospital Locations', icon: MapPinned },
  { to: 'checklists', label: 'Preparation Checklists', icon: ListChecks },
  { to: 'guidance', label: 'Hospital Guidance', icon: BookOpen },
  { to: 'submissions', label: 'Recovery Submissions', icon: HeartPulse },
  { to: 'photos', label: 'Wound Photos', icon: Image },
  { to: 'audit', label: 'Audit Log', icon: ScrollText },
]

const useCanEdit = () => useStore((s) => !!s.staff?.canEdit)

function Page({ title, intro, action, children }: { title: string; intro: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{title}</h1>
          <p className="mt-1 text-muted">{intro}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[40rem] text-left text-[0.9375rem]">
        <thead className="border-b border-line bg-bg text-sm text-muted">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line [&_td]:px-4 [&_td]:py-3 [&_td]:align-top">{children}</tbody>
      </table>
    </div>
  )
}

function EditButton({ onClick, label = 'Edit' }: { onClick: () => void; label?: string }) {
  const canEdit = useCanEdit()
  return (
    <Button small variant="outline" disabled={!canEdit} title={canEdit ? undefined : 'Your role is read-only'} onClick={onClick}>
      <Pencil size={15} aria-hidden /> {label}
    </Button>
  )
}

function SignIn() {
  const signInStaff = useStore((s) => s.signInStaff)
  return (
    <div className="grid min-h-screen place-items-center bg-[#E3EBF2] p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-softred text-danger"><ShieldAlert size={28} aria-hidden /></span>
        <h1 className="mt-4 text-2xl font-bold text-navy">Staff admin</h1>
        <p className="mt-1 text-muted">This area is for staff accounts only. Choose a demo account to sign in. No password is needed in this demonstration.</p>
        <div className="mt-6 space-y-3">
          {STAFF_ACCOUNTS.map((s) => (
            <button key={s.name} onClick={() => signInStaff(s)} className="flex w-full items-center gap-3 rounded-2xl border border-line p-4 text-left hover:bg-softblue">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-navy font-bold text-white">{s.name.split(' ').map((n) => n[0]).join('')}</span>
              <span className="flex-1"><span className="block font-semibold text-navy">{s.name}</span><span className="text-sm text-muted">{s.role} · {s.canEdit ? 'can edit' : 'view only'}</span></span>
            </button>
          ))}
        </div>
        <p className="mt-6 rounded-xl bg-softamber p-3 text-sm text-[#7A470B]">Demonstration only — synthetic data, fictional staff.</p>
        <Link to="/" className="mt-4 block text-center font-semibold text-blue underline">Back to the patient app</Link>
      </div>
    </div>
  )
}

function Overview() {
  const { guidance, photos, checkins, observations, audit } = useStore()
  const stats = [
    { label: 'Published guidance', value: guidance.filter((g) => g.published).length, to: 'guidance' },
    { label: 'Photos awaiting review', value: photos.filter((p) => p.status !== 'Reviewed').length, to: 'photos' },
    { label: 'Recovery check-ins', value: checkins.length, to: 'submissions' },
    { label: 'Health readings', value: observations.length, to: 'submissions' },
  ]
  return (
    <Page title="Overview" intro="A basic staff view for the demonstration. This is not a clinical dashboard.">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="rounded-2xl bg-white p-5 shadow-card hover:bg-softblue/40">
            <p className="text-3xl font-bold text-navy">{s.value}</p>
            <p className="mt-1 text-muted">{s.label}</p>
          </Link>
        ))}
      </div>
      <h2 className="mb-3 mt-8 text-lg font-bold text-navy">Recent activity</h2>
      <AuditTable rows={audit.slice(0, 6)} />
    </Page>
  )
}

function Appointments() {
  const { appointments, updateAppointment } = useStore()
  const [edit, setEdit] = useState<Appointment | null>(null)
  return (
    <Page title="Appointments" intro="Demo appointments shown to the patient. Preparation notes and what-to-bring lists can be edited.">
      <Table head={['Appointment', 'Date and time', 'Location', 'Status', '']}>
        {appointments.map((a) => (
          <tr key={a.id}>
            <td className="font-semibold text-navy">{a.type}</td>
            <td>{fullDate(a.date)}, {clock(a.date)}</td>
            <td>{a.clinic}</td>
            <td><Badge tone={a.status === 'Completed' ? 'grey' : 'teal'}>{a.status}</Badge></td>
            <td className="text-right"><EditButton onClick={() => setEdit(a)} /></td>
          </tr>
        ))}
      </Table>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={`Edit ${edit?.type ?? ''}`}>
        {edit && (
          <div className="space-y-4">
            <Field label="Preparation notes"><textarea rows={4} value={edit.prepNotes} onChange={(e) => setEdit({ ...edit, prepNotes: e.target.value })} /></Field>
            <Field label="What to bring" hint="One item per line"><textarea rows={4} value={edit.bring.join('\n')} onChange={(e) => setEdit({ ...edit, bring: e.target.value.split('\n') })} /></Field>
            <Button full onClick={() => { updateAppointment(edit.id, { prepNotes: edit.prepNotes.trim(), bring: edit.bring.map((b) => b.trim()).filter(Boolean) }); setEdit(null); toast('Appointment updated.') }}>Save changes</Button>
          </div>
        )}
      </Sheet>
    </Page>
  )
}

function Locations() {
  const { locations, routes, updateLocation, updateRouteStep } = useStore()
  const canEdit = useCanEdit()
  const [edit, setEdit] = useState<HospitalLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  return (
    <Page title="Hospital Locations" intro="Fictional demonstration map. Edit location names and the wording of each direction step.">
      <Table head={['Location', 'Floor', 'Description', '']}>
        {locations.map((l) => (
          <tr key={l.id}>
            <td className="font-semibold text-navy">{l.name}</td>
            <td>{l.floor === 0 ? 'Ground' : 'First'}</td>
            <td>{l.description}</td>
            <td className="text-right"><EditButton onClick={() => { setError(null); setEdit(l) }} /></td>
          </tr>
        ))}
      </Table>
      <h2 className="mb-3 mt-8 text-lg font-bold text-navy">Routes and direction steps</h2>
      <div className="space-y-3">
        {routes.map((r) => (
          <details key={r.id} className="rounded-2xl bg-white p-4 shadow-card">
            <summary className="cursor-pointer font-semibold text-navy">{r.summary} {r.accessible && <Badge tone="teal">Step-free</Badge>}</summary>
            <ol className="mt-3 space-y-2">
              {r.steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-softblue text-sm font-bold text-navy">{i + 1}</span>
                  <input aria-label={`Step ${i + 1} instruction`} defaultValue={s.instruction} disabled={!canEdit} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== s.instruction) { updateRouteStep(r.id, s.id, v); toast('Direction step saved.') } else e.target.value = s.instruction }} />
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title="Edit location">
        {edit && (
          <div className="space-y-4">
            <Field label="Name" error={error}><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Description"><textarea rows={3} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <Button full onClick={() => { if (!edit.name.trim()) return setError('Enter a name.'); updateLocation(edit.id, { name: edit.name.trim(), description: edit.description.trim() }); setEdit(null); toast('Location updated.') }}>Save changes</Button>
          </div>
        )}
      </Sheet>
    </Page>
  )
}

function Checklists() {
  const { checklist, saveChecklistItem, deleteChecklistItem } = useStore()
  const canEdit = useCanEdit()
  const [edit, setEdit] = useState<{ categoryId: string; item: ChecklistItem; isNew: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)
  return (
    <Page title="Preparation Checklists" intro="The surgery preparation checklist template shown to patients. Use clinician-approved wording only.">
      <div className="space-y-6">
        {checklist.map((c) => (
          <section key={c.id} className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-navy">{c.title}</h2>
              <Button small disabled={!canEdit} onClick={() => { setError(null); setEdit({ categoryId: c.id, item: { id: uid(), title: '', detail: '' }, isNew: true }) }}><Plus size={16} aria-hidden /> Add item</Button>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {c.items.map((i) => (
                <li key={i.id} className="flex items-start gap-3 py-3">
                  <div className="flex-1"><p className="font-semibold text-ink">{i.title}</p><p className="text-sm text-muted">{i.detail}</p></div>
                  <EditButton onClick={() => { setError(null); setEdit({ categoryId: c.id, item: i, isNew: false }) }} />
                  <Button small variant="ghost" className="!text-danger" disabled={!canEdit} aria-label={`Delete ${i.title}`} onClick={() => { if (confirm(`Delete “${i.title}”?`)) { deleteChecklistItem(c.id, i.id); toast('Checklist item deleted.') } }}><Trash2 size={16} /></Button>
                </li>
              ))}
              {c.items.length === 0 && <li className="py-3 text-muted">No items in this section.</li>}
            </ul>
          </section>
        ))}
      </div>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? 'New checklist item' : 'Edit checklist item'}>
        {edit && (
          <div className="space-y-4">
            <Field label="Title" error={error}><input value={edit.item.title} onChange={(e) => setEdit({ ...edit, item: { ...edit.item, title: e.target.value } })} /></Field>
            <Field label="Details shown to the patient"><textarea rows={4} value={edit.item.detail} onChange={(e) => setEdit({ ...edit, item: { ...edit.item, detail: e.target.value } })} /></Field>
            <Button full onClick={() => { if (!edit.item.title.trim()) return setError('Enter a title.'); saveChecklistItem(edit.categoryId, { ...edit.item, title: edit.item.title.trim(), detail: edit.item.detail.trim() }); setEdit(null); toast('Checklist saved.') }}>Save item</Button>
          </div>
        )}
      </Sheet>
    </Page>
  )
}

function Guidance() {
  const { guidance, saveGuidance, deleteGuidance } = useStore()
  const canEdit = useCanEdit()
  const [edit, setEdit] = useState<GuidanceArticle | null>(null)
  const [keywords, setKeywords] = useState('')
  const [error, setError] = useState<string | null>(null)
  const isNew = edit ? !guidance.some((g) => g.id === edit.id) : false
  const today = new Date().toISOString().slice(0, 10)

  const open = (a: GuidanceArticle) => {
    setError(null)
    setKeywords(a.keywords.join(', '))
    setEdit(a)
  }
  const create = () => {
    const n = Math.max(0, ...guidance.map((g) => Number(g.ref.replace(/\D/g, '')) || 0)) + 1
    const ref = `DEMO-GUIDE-${String(n).padStart(3, '0')}`
    open({ id: uid(), ref, title: '', category: 'General', summary: '', body: '', keywords: [], questions: [], lastReviewed: today, published: false })
  }
  const save = () => {
    if (!edit) return
    if (!edit.title.trim() || !edit.summary.trim()) return setError('Enter a title and a short answer.')
    saveGuidance({ ...edit, title: edit.title.trim(), summary: edit.summary.trim(), body: edit.body.trim() || edit.summary.trim(), keywords: keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean), lastReviewed: today })
    setEdit(null)
    toast('Guidance saved. Ask Hospital now uses this version.')
  }

  return (
    <Page title="Hospital Guidance" intro="The approved knowledge base. Ask Hospital answers only from published entries, and quotes the short answer word for word." action={<Button disabled={!canEdit} onClick={create}><Plus size={18} aria-hidden /> New guidance</Button>}>
      <Table head={['Reference', 'Title', 'Category', 'Last reviewed', 'Published', '']}>
        {guidance.map((g) => (
          <tr key={g.id}>
            <td className="whitespace-nowrap text-muted">{g.ref}</td>
            <td className="font-semibold text-navy">{g.title}</td>
            <td>{g.category}</td>
            <td className="whitespace-nowrap">{g.lastReviewed}</td>
            <td>
              <span className="flex items-center gap-2">
                {canEdit ? <Toggle checked={g.published} label={`Publish ${g.title}`} onChange={(published) => { saveGuidance({ ...g, published }); toast(published ? 'Published.' : 'Unpublished. Patients can no longer see it.', 'info') }} /> : <Badge tone={g.published ? 'teal' : 'grey'}>{g.published ? 'Published' : 'Draft'}</Badge>}
              </span>
            </td>
            <td>
              <span className="flex justify-end gap-1">
                <EditButton onClick={() => open(g)} />
                <Button small variant="ghost" className="!text-danger" disabled={!canEdit} aria-label={`Delete ${g.title}`} onClick={() => { if (confirm(`Delete “${g.title}”? This cannot be undone.`)) { deleteGuidance(g.id); toast('Guidance deleted.') } }}><Trash2 size={16} /></Button>
              </span>
            </td>
          </tr>
        ))}
      </Table>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={isNew ? 'New guidance' : `Edit ${edit?.ref ?? ''}`}>
        {edit && (
          <div className="space-y-4">
            <Field label="Title" error={error}><input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
            <Field label="Category"><input value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></Field>
            <Field label="Short answer" hint="Ask Hospital shows this text exactly as written."><textarea rows={4} value={edit.summary} onChange={(e) => setEdit({ ...edit, summary: e.target.value })} /></Field>
            <Field label="Full guidance" hint="Leave a blank line between paragraphs."><textarea rows={6} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} /></Field>
            <Field label="Search keywords" hint="Separated by commas. These decide which questions find this entry."><input value={keywords} onChange={(e) => setKeywords(e.target.value)} /></Field>
            <label className="flex items-center justify-between gap-3">
              <span className="font-semibold text-ink">Published</span>
              <Toggle checked={edit.published} label="Published" onChange={(published) => setEdit({ ...edit, published })} />
            </label>
            <Button full onClick={save}>Save guidance</Button>
          </div>
        )}
      </Sheet>
    </Page>
  )
}

function Submissions() {
  const { checkins, observations } = useStore()
  const readings = [...observations].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 30)
  return (
    <Page title="Recovery Submissions" intro="Synthetic check-ins and readings submitted from the patient app. Shown as recorded, with no automatic assessment.">
      <h2 className="mb-3 text-lg font-bold text-navy">Daily check-ins</h2>
      <Table head={['Submitted', 'Feeling', 'Pain (0–10)', 'Mobility', 'Notes']}>
        {[...checkins].sort((a, b) => b.at.localeCompare(a.at)).map((c) => (
          <tr key={c.id}>
            <td className="whitespace-nowrap">{dateTime(c.at)}</td>
            <td>{c.feeling}</td>
            <td>{c.pain}</td>
            <td>{c.mobility}</td>
            <td>{c.notes || '—'}</td>
          </tr>
        ))}
      </Table>
      <h2 className="mb-3 mt-8 text-lg font-bold text-navy">Latest health readings</h2>
      <Table head={['Recorded', 'Measurement', 'Value', 'Source']}>
        {readings.map((o) => (
          <tr key={o.id}>
            <td className="whitespace-nowrap">{dateTime(o.at)}</td>
            <td>{METRICS[o.metric].label}</td>
            <td className="font-semibold text-navy">{formatValue(o)} {METRICS[o.metric].unit}</td>
            <td>{sourceLabel(o)}</td>
          </tr>
        ))}
      </Table>
    </Page>
  )
}

const STATUSES: PhotoStatus[] = ['Submitted', 'Awaiting Review', 'Reviewed']

function Photos() {
  const { photos, setPhotoStatus } = useStore()
  const canEdit = useCanEdit()
  return (
    <Page title="Wound Photos" intro="Demo photo submissions. A member of staff sets the status. Nothing here is analysed by software.">
      {photos.length === 0 && <p className="rounded-2xl bg-white p-6 text-muted shadow-card">No photos have been submitted.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((p) => (
          <article key={p.id} className="rounded-2xl bg-white p-4 shadow-card">
            <img src={p.dataUrl} alt="Submitted demo photo" className="h-48 w-full rounded-xl bg-bg object-contain" />
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-sm text-muted">Alex Morgan · {dateTime(p.at)}</p>
              <Badge tone={p.status === 'Reviewed' ? 'teal' : p.status === 'Awaiting Review' ? 'amber' : 'blue'}>{p.status}</Badge>
            </div>
            <p className="mt-1 text-ink">{p.note ? `“${p.note}”` : 'No note added.'}</p>
            {p.reviewedBy && <p className="mt-1 text-sm text-muted">Reviewed by {p.reviewedBy}{p.reviewedAt ? `, ${dateTime(p.reviewedAt)}` : ''}</p>}
            <div className="mt-3">
              <Field label="Review status">
                <select value={p.status} disabled={!canEdit} onChange={(e) => { setPhotoStatus(p.id, e.target.value as PhotoStatus); toast(`Status changed to ${e.target.value}.`) }}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </article>
        ))}
      </div>
    </Page>
  )
}

function AuditTable({ rows }: { rows: ReturnType<typeof useStore.getState>['audit'] }) {
  return (
    <Table head={['When', 'Who', 'Role', 'Action', 'Detail']}>
      {rows.map((e) => (
        <tr key={e.id}>
          <td className="whitespace-nowrap">{dateTime(e.at)}</td>
          <td className="font-semibold text-navy">{e.actor}</td>
          <td>{e.role}</td>
          <td>{e.action} · {e.entity}</td>
          <td>{e.detail}</td>
        </tr>
      ))}
    </Table>
  )
}

function Audit() {
  const audit = useStore((s) => s.audit)
  return (
    <Page title="Audit Log" intro="Who changed or submitted what, and when. Newest first.">
      <AuditTable rows={audit} />
    </Page>
  )
}

export default function Admin() {
  const { staff, signOutStaff } = useStore()
  useEffect(() => {
    document.title = 'Staff Admin — My Hospital Journey Demo'
    return () => {
      document.title = 'My Hospital Journey — Demo'
    }
  }, [])

  if (!staff) return <><SignIn /><Toaster fixed /></>

  return (
    <div className="min-h-screen bg-bg lg:flex">
      <aside className="shrink-0 bg-navy text-white lg:min-h-screen lg:w-72">
        <div className="p-5">
          <p className="text-lg font-bold">My Hospital Journey</p>
          <p className="text-sm text-white/75">Staff admin · demonstration</p>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={label} to={to} end={to === ''} className={({ isActive }) => cx('flex min-h-[2.75rem] shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 font-medium', isActive ? 'bg-white text-navy' : 'text-white/90 hover:bg-white/10')}>
              <Icon size={19} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
          <p className="rounded-full bg-softamber px-3 py-1 text-sm font-semibold text-[#7A470B]">Demonstration only — synthetic data</p>
          <div className="flex items-center gap-3">
            <div className="text-right"><p className="font-semibold text-navy">{staff.name}</p><p className="text-sm text-muted">{staff.role}{staff.canEdit ? '' : ' · view only'}</p></div>
            <Link to="/" target="_blank" className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-navy hover:bg-softblue">Patient app <ExternalLink size={15} aria-hidden /></Link>
            <Button small variant="outline" onClick={signOutStaff}><LogOut size={16} aria-hidden /> Sign out</Button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-5 lg:p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="locations" element={<Locations />} />
            <Route path="checklists" element={<Checklists />} />
            <Route path="guidance" element={<Guidance />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="photos" element={<Photos />} />
            <Route path="audit" element={<Audit />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster fixed />
    </div>
  )
}
