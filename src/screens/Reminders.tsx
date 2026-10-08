import { useState } from 'react'
import { Bell, BellOff, BellRing, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { uid, type Reminder } from '../data/seed'
import { clock12, dateTime } from '../lib/format'
import { Badge, Button, Card, EmptyState, Field, Note, ScreenHeader, Sheet, Toggle, cx, toast } from '../components/ui'

const TYPES: Reminder['type'][] = ['Appointment', 'Checklist', 'Recovery check-in', 'Health reading', 'Guidance']
const blank = (): Reminder => ({ id: uid(), title: '', type: 'Health reading', time: '09:00', repeat: 'Daily', enabled: true })
const supported = typeof window !== 'undefined' && 'Notification' in window

export default function Reminders() {
  const { reminders, notifications, saveReminder, deleteReminder, fireReminder, markRead } = useStore()
  const [tab, setTab] = useState<'reminders' | 'history'>('reminders')
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permission, setPermission] = useState<string>(supported ? Notification.permission : 'unsupported')
  const unread = notifications.filter((n) => !n.read).length
  const isNew = editing ? !reminders.some((r) => r.id === editing.id) : false

  const ask = async () => {
    try {
      setPermission(await Notification.requestPermission())
    } catch {
      setPermission('denied')
    }
  }

  const test = (r: Reminder) => {
    fireReminder(r.id)
    toast(`Reminder: ${r.title}`, 'info')
    if (supported && Notification.permission === 'granted') {
      try {
        new Notification('My Hospital Journey (demo)', { body: r.title })
      } catch { /* some browsers only allow notifications from a service worker */ }
    }
  }

  const save = () => {
    if (!editing) return
    if (!editing.title.trim()) return setError('Enter what you want to be reminded about.')
    saveReminder({ ...editing, title: editing.title.trim() })
    toast(isNew ? 'Reminder created.' : 'Reminder updated.')
    setEditing(null)
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Reminders" subtitle="Choose what you are reminded about, and when." />
      <div className="space-y-4 px-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 shadow-card" role="tablist">
          {(['reminders', 'history'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cx('min-h-[2.75rem] rounded-lg text-sm font-semibold', tab === t ? 'bg-navy text-white' : 'text-muted')}>
              {t === 'reminders' ? 'My reminders' : `History${unread ? ` (${unread} new)` : ''}`}
            </button>
          ))}
        </div>

        {tab === 'reminders' ? (
          <>
            {permission === 'default' && (
              <Card className="flex items-center gap-3">
                <BellRing size={24} className="shrink-0 text-blue" aria-hidden />
                <p className="flex-1 text-sm text-ink">Allow notifications so reminders can appear outside the app.</p>
                <Button small onClick={ask}>Allow</Button>
              </Card>
            )}
            {permission === 'denied' && <Note tone="amber" icon={<BellOff size={18} aria-hidden />}>Notifications are blocked for this site. Reminders will still appear inside the app. You can allow notifications in your browser settings.</Note>}
            {permission === 'unsupported' && <Note tone="amber">This browser does not support notifications. Reminders will appear inside the app.</Note>}
            {permission === 'granted' && <Note tone="teal" icon={<Bell size={18} aria-hidden />}>Notifications are allowed on this device.</Note>}

            {reminders.length === 0 && <EmptyState title="No reminders yet" body="Add a reminder to help you stay on track." />}
            <ul className="space-y-3">
              {reminders.map((r) => (
                <Card as="li" key={r.id}>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={cx('font-semibold', r.enabled ? 'text-ink' : 'text-muted')}>{r.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                        <Badge tone={r.enabled ? 'blue' : 'grey'}>{r.type}</Badge> {r.repeat} at {clock12(r.time)}
                      </p>
                    </div>
                    <Toggle checked={r.enabled} onChange={(enabled) => saveReminder({ ...r, enabled })} label={`${r.title} reminder`} />
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    <Button small variant="ghost" onClick={() => { setError(null); setEditing(r) }}><Pencil size={16} aria-hidden /> Edit</Button>
                    <Button small variant="ghost" onClick={() => test(r)}><Send size={16} aria-hidden /> Send test now</Button>
                  </div>
                </Card>
              ))}
            </ul>
            <Button full onClick={() => { setError(null); setEditing(blank()) }}><Plus size={20} aria-hidden /> Add Reminder</Button>
            <Note>Web preview: reminders fire while this page is open, and “Send test now” simulates one. The phone app uses the device's local notifications.</Note>
          </>
        ) : (
          <>
            {unread > 0 && <Button small variant="outline" onClick={() => markRead()}>Mark all as read</Button>}
            {notifications.length === 0 && <EmptyState title="No notifications yet" body="Reminders you receive will be listed here." />}
            <ul className="space-y-2.5">
              {notifications.map((n) => (
                <Card as="li" key={n.id} className={cx('flex items-start gap-3', !n.read && 'ring-2 ring-blue/40')}>
                  <span className={cx('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', n.read ? 'bg-line' : 'bg-blue')} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{n.title}</p>
                    <p className="text-sm text-muted">{dateTime(n.at)} · {n.read ? 'Read' : 'Unread'}</p>
                  </div>
                  {!n.read && <Button small variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>}
                </Card>
              ))}
            </ul>
          </>
        )}
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={isNew ? 'New reminder' : 'Edit reminder'}>
        {editing && (
          <div className="space-y-4">
            <Field label="Remind me to" error={error}>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="For example, record my blood pressure" />
            </Field>
            <Field label="Type">
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as Reminder['type'] })}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time"><input type="time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value || '09:00' })} /></Field>
              <Field label="Repeat">
                <select value={editing.repeat} onChange={(e) => setEditing({ ...editing, repeat: e.target.value as Reminder['repeat'] })}>
                  <option>Daily</option>
                  <option>Once</option>
                </select>
              </Field>
            </div>
            <Button full onClick={save}>Save Reminder</Button>
            {!isNew && (
              <Button full variant="ghost" className="!text-danger" onClick={() => { deleteReminder(editing.id); setEditing(null); toast('Reminder deleted.') }}>
                <Trash2 size={18} aria-hidden /> Delete reminder
              </Button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}
