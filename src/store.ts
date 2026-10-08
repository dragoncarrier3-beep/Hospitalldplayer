import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  createSeed, uid, PATIENT,
  type Appointment, type ChecklistItem, type CheckIn, type GuidanceArticle, type HealthConnection, type HospitalLocation,
  type Metric, type Observation, type PhotoStatus, type Reminder, type SeedData, type Source,
} from './data/seed'
import type { Reply } from './lib/assistant'

export type Staff = { name: string; role: string; canEdit: boolean }
export const STAFF_ACCOUNTS: Staff[] = [
  { name: 'Jordan Lee', role: 'Demo Care Coordinator', canEdit: true },
  { name: 'Sam Rivers', role: 'Demo Read-only Reviewer', canEdit: false },
]

export type ChatMessage = { id: string; from: 'user' | 'assistant'; text: string; at: string; reply?: Reply }
export type Settings = { textScale: number; reduceMotion: boolean; biometric: boolean }

type State = SeedData & {
  onboarded: boolean
  patientSignedIn: boolean
  staff: Staff | null
  settings: Settings
  chat: ChatMessage[]

  signInPatient: () => void
  signOutPatient: () => void
  signInStaff: (s: Staff) => void
  signOutStaff: () => void
  resetDemo: () => void
  setSettings: (p: Partial<Settings>) => void

  toggleChecklist: (id: string) => void
  saveReminder: (r: Reminder) => void
  deleteReminder: (id: string) => void
  fireReminder: (id: string) => void
  markRead: (id?: string) => void
  addCheckin: (c: Omit<CheckIn, 'id' | 'at'>) => void
  saveObservation: (o: Omit<Observation, 'id'> & { id?: string }) => void
  deleteObservation: (id: string) => void
  addSymptomLog: (symptoms: string[], note: string) => void
  setConnection: (c: Partial<HealthConnection>) => void
  importHealth: () => number
  addPhoto: (dataUrl: string, note: string) => void
  addChat: (m: Omit<ChatMessage, 'id' | 'at'>) => void
  clearChat: () => void

  setPhotoStatus: (id: string, status: PhotoStatus) => void
  saveGuidance: (a: GuidanceArticle) => void
  deleteGuidance: (id: string) => void
  saveChecklistItem: (categoryId: string, item: ChecklistItem) => void
  deleteChecklistItem: (categoryId: string, itemId: string) => void
  updateLocation: (id: string, p: Partial<HospitalLocation>) => void
  updateRouteStep: (routeId: string, stepId: string, instruction: string) => void
  updateAppointment: (id: string, p: Partial<Appointment>) => void
}

export const STORAGE_KEY = 'my-hospital-journey-demo-v1'

const safeStorage = {
  getItem: (k: string) => {
    try { return localStorage.getItem(k) } catch { return null }
  },
  setItem: (k: string, v: string) => {
    try { localStorage.setItem(k, v) } catch { /* storage full or blocked: the demo keeps working in memory */ }
  },
  removeItem: (k: string) => {
    try { localStorage.removeItem(k) } catch { /* ignore */ }
  },
}

const defaults = { onboarded: false, patientSignedIn: false, staff: null as Staff | null, settings: { textScale: 1, reduceMotion: false, biometric: false }, chat: [] as ChatMessage[] }

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const audit = (actor: string, role: string, action: string, entity: string, detail: string) =>
        set((s) => ({ audit: [{ id: uid(), at: new Date().toISOString(), actor, role, action, entity, detail }, ...s.audit] }))
      const patientAudit = (action: string, entity: string, detail: string) => audit(PATIENT.name, PATIENT.accountType, action, entity, detail)
      const staffAudit = (action: string, entity: string, detail: string) => {
        const s = get().staff
        audit(s?.name ?? 'Unknown', s?.role ?? 'Staff', action, entity, detail)
      }

      return {
        ...createSeed(),
        ...defaults,

        signInPatient: () => set({ patientSignedIn: true, onboarded: true }),
        signOutPatient: () => set({ patientSignedIn: false }),
        signInStaff: (staff) => {
          set({ staff })
          staffAudit('Signed in', 'Session', 'Staff admin')
        },
        signOutStaff: () => {
          staffAudit('Signed out', 'Session', 'Staff admin')
          set({ staff: null })
        },
        resetDemo: () => set({ ...createSeed(), ...defaults }),
        setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

        toggleChecklist: (id) =>
          set((s) => {
            const done = { ...s.checklistDone }
            if (done[id]) delete done[id]
            else done[id] = new Date().toISOString()
            return { checklistDone: done }
          }),

        saveReminder: (r) => set((s) => ({ reminders: s.reminders.some((x) => x.id === r.id) ? s.reminders.map((x) => (x.id === r.id ? r : x)) : [...s.reminders, r] })),
        deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
        fireReminder: (id) =>
          set((s) => {
            const r = s.reminders.find((x) => x.id === id)
            if (!r) return {}
            const now = new Date().toISOString()
            return {
              reminders: s.reminders.map((x) => (x.id === id ? { ...x, lastFired: now } : x)),
              notifications: [{ id: uid(), title: r.title, body: `${r.type} reminder`, at: now, read: false }, ...s.notifications],
            }
          }),
        markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (!id || n.id === id ? { ...n, read: true } : n)) })),

        addCheckin: (c) => {
          set((s) => ({ checkins: [...s.checkins, { ...c, id: uid(), at: new Date().toISOString() }] }))
          patientAudit('Submitted', 'Recovery check-in', 'Daily check-in')
        },

        saveObservation: (o) =>
          set((s) => ({
            observations: o.id ? s.observations.map((x) => (x.id === o.id ? { ...x, ...o, id: x.id } : x)) : [...s.observations, { ...o, id: uid() }],
          })),
        deleteObservation: (id) => set((s) => ({ observations: s.observations.filter((o) => o.id !== id) })),
        addSymptomLog: (symptoms, note) => set((s) => ({ symptomLogs: [...s.symptomLogs, { id: uid(), at: new Date().toISOString(), symptoms, note }] })),

        setConnection: (c) => set((s) => ({ connection: { ...s.connection, ...c } })),
        importHealth: () => {
          const { connection } = get()
          const source: Source = connection.platform === 'healthconnect' ? 'healthconnect' : 'apple'
          const now = Date.now()
          const sample: Record<Metric, [number, number?][]> = {
            hr: [[74], [70], [71]],
            bp: [[121, 77]],
            spo2: [[98], [99]],
            temp: [[36.6]],
          }
          const added: Observation[] = []
          for (const metric of connection.categories) {
            sample[metric].forEach(([value, value2], i) =>
              added.push({ id: uid(), metric, value, value2, at: new Date(now - (i + 1) * 47 * 60000).toISOString(), source, simulated: true }),
            )
          }
          set((s) => ({ observations: [...s.observations, ...added], connection: { ...s.connection, lastSync: new Date().toISOString() } }))
          return added.length
        },

        addPhoto: (dataUrl, note) => {
          set((s) => ({ photos: [{ id: uid(), at: new Date().toISOString(), note, status: 'Submitted', dataUrl }, ...s.photos] }))
          patientAudit('Submitted', 'Recovery photo', note || 'No note')
        },

        addChat: (m) => set((s) => ({ chat: [...s.chat, { ...m, id: uid(), at: new Date().toISOString() }] })),
        clearChat: () => set({ chat: [] }),

        setPhotoStatus: (id, status) => {
          const staff = get().staff
          set((s) => ({
            photos: s.photos.map((p) =>
              p.id === id ? { ...p, status, reviewedBy: status === 'Reviewed' ? staff?.name : undefined, reviewedAt: status === 'Reviewed' ? new Date().toISOString() : undefined } : p,
            ),
          }))
          staffAudit('Status changed', 'Recovery photo', `→ ${status}`)
        },
        saveGuidance: (a) => {
          const exists = get().guidance.some((x) => x.id === a.id)
          set((s) => ({ guidance: exists ? s.guidance.map((x) => (x.id === a.id ? a : x)) : [...s.guidance, a] }))
          staffAudit(exists ? 'Updated' : 'Created', 'Guidance', `${a.title}${a.published ? '' : ' (unpublished)'}`)
        },
        deleteGuidance: (id) => {
          const a = get().guidance.find((x) => x.id === id)
          set((s) => ({ guidance: s.guidance.filter((x) => x.id !== id) }))
          staffAudit('Deleted', 'Guidance', a?.title ?? id)
        },
        saveChecklistItem: (categoryId, item) => {
          set((s) => ({
            checklist: s.checklist.map((c) =>
              c.id !== categoryId ? c : { ...c, items: c.items.some((i) => i.id === item.id) ? c.items.map((i) => (i.id === item.id ? item : i)) : [...c.items, item] },
            ),
          }))
          staffAudit('Saved', 'Checklist', item.title)
        },
        deleteChecklistItem: (categoryId, itemId) => {
          set((s) => ({ checklist: s.checklist.map((c) => (c.id !== categoryId ? c : { ...c, items: c.items.filter((i) => i.id !== itemId) })) }))
          staffAudit('Deleted', 'Checklist', itemId)
        },
        updateLocation: (id, p) => {
          set((s) => ({ locations: s.locations.map((l) => (l.id === id ? { ...l, ...p } : l)) }))
          staffAudit('Updated', 'Location', p.name ?? id)
        },
        updateRouteStep: (routeId, stepId, instruction) => {
          set((s) => ({ routes: s.routes.map((r) => (r.id !== routeId ? r : { ...r, steps: r.steps.map((st) => (st.id === stepId ? { ...st, instruction } : st)) })) }))
          staffAudit('Updated', 'Route step', instruction)
        },
        updateAppointment: (id, p) => {
          set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...p } : a)) }))
          staffAudit('Updated', 'Appointment', get().appointments.find((a) => a.id === id)?.type ?? id)
        },
      }
    },
    { name: STORAGE_KEY, storage: createJSONStorage(() => safeStorage) },
  ),
)

// Keep the patient app and staff admin in sync when they are open in separate tabs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useStore.persist.rehydrate()
  })
}
