// All data in this file is synthetic. Nothing here describes a real hospital, patient or member of staff.

export type Appointment = {
  id: string
  type: string
  date: string
  locationId: string
  clinic: string
  status: 'Completed' | 'Upcoming' | 'Scheduled'
  prepNotes: string
  bring: string[]
  contact: string
}

export type HospitalLocation = {
  id: string
  name: string
  floor: 0 | 1
  x: number
  y: number
  w: number
  h: number
  kind: 'clinic' | 'service' | 'entrance' | 'transit' | 'outside'
  description: string
  destination?: boolean
}

export type NavStep = {
  id: string
  instruction: string
  floor: 0 | 1
  pts: [number, number][]
  meters: number
}

export type NavRoute = {
  id: string
  destinationId: string
  accessible: boolean
  startId: string
  summary: string
  steps: NavStep[]
}

export type ChecklistItem = { id: string; title: string; detail: string }
export type ChecklistCategory = { id: string; title: string; items: ChecklistItem[] }

export type Reminder = {
  id: string
  title: string
  type: 'Appointment' | 'Checklist' | 'Recovery check-in' | 'Health reading' | 'Guidance'
  time: string
  repeat: 'Daily' | 'Once'
  enabled: boolean
  lastFired?: string
}

export type NotificationEntry = { id: string; title: string; body: string; at: string; read: boolean }

export type CheckIn = { id: string; at: string; feeling: string; pain: number; mobility: string; notes: string }

export type Metric = 'bp' | 'hr' | 'temp' | 'spo2'
export type Source = 'manual' | 'apple' | 'healthconnect'
export type Observation = { id: string; metric: Metric; value: number; value2?: number; at: string; source: Source; simulated?: boolean }
export type SymptomLog = { id: string; at: string; symptoms: string[]; note: string }

export type PhotoStatus = 'Submitted' | 'Awaiting Review' | 'Reviewed'
export type PhotoSubmission = { id: string; at: string; note: string; status: PhotoStatus; dataUrl: string; reviewedBy?: string; reviewedAt?: string }

export type GuidanceArticle = {
  id: string
  ref: string
  title: string
  category: string
  summary: string
  body: string
  keywords: string[]
  questions: string[]
  lastReviewed: string
  published: boolean
}

export type AuditEvent = { id: string; at: string; actor: string; role: string; action: string; entity: string; detail: string }

export type HealthConnection = { platform: 'apple' | 'healthconnect' | null; status: 'disconnected' | 'connected' | 'denied'; lastSync?: string; categories: Metric[] }

export const SOURCE_NAME = 'Demo Hospital Patient Information (fictional)'
export const CARE_TEAM_PHONE = '020 7946 0100'
export const PATIENT = { name: 'Alex Morgan', firstName: 'Alex', id: 'DEMO-PAT-001', accountType: 'Demo Patient', hospital: 'Demo Hospital Campus' }

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const at = (y: number, m: number, d: number, h: number, min: number) => new Date(y, m - 1, d, h, min).toISOString()

export const daysAgo = (n: number, h = 9, m = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export const placeholderPhoto = (label: string, hue: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='${hue}'/><g fill='none' stroke='#12365A' stroke-opacity='.25' stroke-width='2'><rect x='130' y='85' width='140' height='100' rx='12'/><circle cx='200' cy='135' r='28'/></g><text x='200' y='225' text-anchor='middle' font-family='sans-serif' font-size='18' font-weight='600' fill='#12365A'>${label}</text><text x='200' y='250' text-anchor='middle' font-family='sans-serif' font-size='13' fill='#5B6C7B'>Placeholder — not a clinical photo</text></svg>`,
  )

const locations: HospitalLocation[] = [
  { id: 'parking', name: 'Parking Area', floor: 0, x: 8, y: 218, w: 104, h: 36, kind: 'outside', description: 'Visitor and patient parking, including Blue Badge bays.' },
  { id: 'main-entrance', name: 'Main Entrance', floor: 0, x: 150, y: 198, w: 70, h: 40, kind: 'entrance', description: 'Main entrance with automatic doors.' },
  { id: 'accessible-entrance', name: 'Accessible Entrance', floor: 0, x: 234, y: 198, w: 92, h: 40, kind: 'entrance', description: 'Step-free entrance with a drop-off point.' },
  { id: 'reception', name: 'Reception', floor: 0, x: 150, y: 118, w: 70, h: 46, kind: 'service', description: 'Main reception and help desk.' },
  { id: 'pharmacy', name: 'Pharmacy', floor: 0, x: 16, y: 110, w: 96, h: 56, kind: 'service', description: 'Outpatient pharmacy.', destination: true },
  { id: 'radiology', name: 'Radiology', floor: 0, x: 16, y: 16, w: 110, h: 64, kind: 'clinic', description: 'X-ray and scans.', destination: true },
  { id: 'lift-a', name: 'Lift A', floor: 0, x: 262, y: 90, w: 46, h: 40, kind: 'transit', description: 'Lift to all floors.' },
  { id: 'stairs', name: 'Stairs', floor: 0, x: 262, y: 20, w: 46, h: 44, kind: 'transit', description: 'Stairs to the first floor.' },
  { id: 'clinic-a', name: 'Outpatients Clinic A', floor: 1, x: 16, y: 16, w: 144, h: 80, kind: 'clinic', description: 'Outpatient appointments and pre-operative assessment.', destination: true },
  { id: 'day-surgery', name: 'Day Surgery Unit', floor: 1, x: 16, y: 124, w: 144, h: 76, kind: 'clinic', description: 'Check-in for day procedures.', destination: true },
  { id: 'waiting', name: 'Waiting Area', floor: 1, x: 214, y: 150, w: 104, h: 50, kind: 'service', description: 'Seating and refreshments.' },
]

const step = (id: string, instruction: string, floor: 0 | 1, pts: [number, number][], meters: number): NavStep => ({ id, instruction, floor, pts, meters })

const toReception = (p: string, accessible: boolean): NavStep[] =>
  accessible
    ? [
        step(`${p}-1`, 'Start at the Accessible Entrance. It is step-free with automatic doors.', 0, [[280, 204]], 0),
        step(`${p}-2`, 'Go straight ahead, then turn left and follow the corridor to Reception.', 0, [[280, 204], [280, 182], [185, 182]], 45),
      ]
    : [
        step(`${p}-1`, 'Start at the Main Entrance.', 0, [[185, 204]], 0),
        step(`${p}-2`, 'Walk straight ahead to Reception.', 0, [[185, 204], [185, 182]], 15),
      ]

const liftUp = (p: string): NavStep[] => [
  step(`${p}-3`, 'With Reception on your left, follow the corridor to Lift A.', 0, [[185, 182], [240, 182], [240, 110], [262, 110]], 55),
  step(`${p}-4`, 'Take Lift A to the First Floor.', 1, [[262, 110]], 0),
]

const routes: NavRoute[] = [
  {
    id: 'route-clinic-a', destinationId: 'clinic-a', accessible: false, startId: 'main-entrance', summary: 'Main Entrance → Reception → Lift A → First Floor → Outpatients Clinic A',
    steps: [...toReception('ca', false), ...liftUp('ca'),
      step('ca-5', 'Leave the lift and follow the corridor straight ahead.', 1, [[262, 110], [185, 110]], 35),
      step('ca-6', 'Turn right. Outpatients Clinic A is on your left. You have arrived.', 1, [[185, 110], [185, 56], [160, 56]], 30)],
  },
  {
    id: 'route-clinic-a-acc', destinationId: 'clinic-a', accessible: true, startId: 'accessible-entrance', summary: 'Accessible Entrance → Reception → Lift A → First Floor → Outpatients Clinic A',
    steps: [...toReception('caa', true), ...liftUp('caa'),
      step('caa-5', 'Leave the lift and follow the wide corridor straight ahead.', 1, [[262, 110], [185, 110]], 35),
      step('caa-6', 'Turn right. Outpatients Clinic A is on your left, with a step-free doorway. You have arrived.', 1, [[185, 110], [185, 56], [160, 56]], 30)],
  },
  {
    id: 'route-day-surgery', destinationId: 'day-surgery', accessible: false, startId: 'main-entrance', summary: 'Main Entrance → Reception → Stairs → First Floor → Day Surgery Unit',
    steps: [...toReception('ds', false),
      step('ds-3', 'With Reception on your left, follow the corridor to the Stairs.', 0, [[185, 182], [240, 182], [240, 42], [262, 42]], 75),
      step('ds-4', 'Take the Stairs up one floor.', 1, [[262, 42]], 0),
      step('ds-5', 'At the top, follow the corridor past Lift A.', 1, [[262, 42], [240, 42], [240, 110], [185, 110]], 55),
      step('ds-6', 'Turn left. The Day Surgery Unit is on your right. You have arrived.', 1, [[185, 110], [185, 162], [160, 162]], 30)],
  },
  {
    id: 'route-day-surgery-acc', destinationId: 'day-surgery', accessible: true, startId: 'accessible-entrance', summary: 'Accessible Entrance → Reception → Lift A → First Floor → Day Surgery Unit',
    steps: [...toReception('dsa', true), ...liftUp('dsa'),
      step('dsa-5', 'Leave the lift and follow the wide corridor straight ahead.', 1, [[262, 110], [185, 110]], 35),
      step('dsa-6', 'Turn left. The Day Surgery Unit is on your right, with a step-free doorway. You have arrived.', 1, [[185, 110], [185, 162], [160, 162]], 30)],
  },
  {
    id: 'route-pharmacy', destinationId: 'pharmacy', accessible: true, startId: 'main-entrance', summary: 'Main Entrance → Reception → Pharmacy',
    steps: [...toReception('ph', false),
      step('ph-3', 'Turn left at Reception and follow the corridor.', 0, [[185, 182], [135, 182]], 25),
      step('ph-4', 'Turn right. The Pharmacy is on your left. You have arrived.', 0, [[135, 182], [135, 138], [112, 138]], 30)],
  },
  {
    id: 'route-radiology', destinationId: 'radiology', accessible: true, startId: 'main-entrance', summary: 'Main Entrance → Reception → Radiology',
    steps: [...toReception('ra', false),
      step('ra-3', 'Turn left at Reception and follow the corridor.', 0, [[185, 182], [135, 182]], 25),
      step('ra-4', 'Turn right and continue past the Pharmacy. Radiology is at the end on your left. You have arrived.', 0, [[135, 182], [135, 48], [126, 48]], 70)],
  },
]

const g = (n: number, title: string, category: string, summary: string, body: string, keywords: string[], questions: string[] = []): GuidanceArticle => ({
  id: `guide-${String(n).padStart(3, '0')}`,
  ref: `DEMO-GUIDE-${String(n).padStart(3, '0')}`,
  title, category, summary, body, keywords, questions,
  lastReviewed: '2026-09-14',
  published: true,
})

const guidance: GuidanceArticle[] = [
  g(1, 'Parking at Demo Hospital Campus', 'Parking',
    'You can park in the Parking Area next to the Main Entrance. Pay at the machines before you return to your car. Blue Badge bays are closest to the Accessible Entrance.',
    'The Parking Area is beside the Main Entrance and is open 24 hours a day.\n\nPay at the machines by the Main Entrance or by card at the exit barrier. Blue Badge holders can use the marked bays closest to the Accessible Entrance.\n\nSpaces can be limited between 9am and 12 noon. Please allow extra time, or consider public transport.',
    ['park', 'parking', 'car', 'blue badge', 'drive'], ['Where can I park?', 'Where do I park?']),
  g(2, 'Travelling to the hospital', 'Travel',
    'Demo Hospital Campus is served by local buses that stop outside the Main Entrance, and the nearest station is about a 10 minute walk. There is a drop-off point at the Accessible Entrance.',
    'Buses stop directly outside the Main Entrance. The nearest station is about a 10 minute walk away.\n\nTaxis and patient transport can use the drop-off point at the Accessible Entrance.\n\nIf you think you may be eligible for patient transport, contact the hospital before your appointment.',
    ['travel', 'bus', 'train', 'tube', 'station', 'taxi', 'transport', 'public transport'], ['How do I get to the hospital?']),
  g(3, 'Hospital entrances', 'Entrances',
    'There are two public entrances. The Main Entrance is next to the Parking Area. The Accessible Entrance is step-free, has automatic doors and a drop-off point.',
    'Main Entrance: next to the Parking Area, open 24 hours.\n\nAccessible Entrance: step-free with automatic doors and a drop-off point. Wheelchairs can be borrowed from Reception.\n\nBoth entrances lead to Reception on the ground floor.',
    ['entrance', 'door', 'wheelchair', 'step-free', 'accessible'], ['Which entrance should I use?']),
  g(4, 'Finding Outpatients Clinic A', 'Finding your way',
    'Outpatients Clinic A is on the First Floor. From the Main Entrance, go to Reception, take Lift A to the First Floor and follow the corridor. The clinic is on your left. You can follow step-by-step directions in Find My Clinic.',
    'Outpatients Clinic A is on the First Floor.\n\nFrom the Main Entrance, walk straight ahead to Reception. Follow the corridor to Lift A and go up to the First Floor. Leave the lift, follow the corridor and turn right. The clinic is on your left.\n\nA step-free route is available from the Accessible Entrance. Staff at Reception can help if you are unsure.',
    ['find', 'clinic', 'outpatient', 'direction', 'floor', 'lost', 'way'], ['How do I find Outpatients Clinic A?']),
  g(5, 'Preparing for your appointment', 'Appointments',
    'Please arrive 15 minutes before your appointment time so you can check in. If you are running late or cannot attend, contact the hospital as soon as you can.',
    'Please arrive 15 minutes before your appointment time. This allows time to check in and find the clinic.\n\nIf you cannot attend, tell us as early as possible so the appointment can be offered to someone else.\n\nIf you need an interpreter or any support during your visit, let the hospital know in advance.',
    ['prepare', 'appointment', 'arrive', 'early', 'late', 'interpreter'], ['How early should I arrive?']),
  g(6, 'What to bring to your appointment', 'Appointments',
    'Please bring your appointment letter, a list of your current medicines, and any questions you have for your care team.',
    'Please bring:\n\n• Your appointment letter\n• A list of your current medicines\n• Any questions you would like to ask your care team\n\nYou are welcome to bring a relative, friend or carer with you.',
    ['bring', 'letter', 'take with me'], ['What should I bring to my appointment?']),
  g(7, 'Visiting information', 'Visiting',
    'Visiting hours on most wards are 11am to 8pm. Two visitors at a time are welcome. Please check with the ward before visiting, as times can vary.',
    'Most wards welcome visitors between 11am and 8pm, with two visitors at a bedside at a time.\n\nSome areas have different arrangements. Please check with the ward before you travel.\n\nPlease do not visit if you feel unwell.',
    ['visit', 'visitor', 'visiting', 'family', 'friend'], ['What are the visiting hours?']),
  g(8, 'Contacting the hospital', 'Contact',
    `You can call the hospital switchboard on ${CARE_TEAM_PHONE} (fictional demo number). To change or cancel an appointment, ask for the appointments team.`,
    `Switchboard: ${CARE_TEAM_PHONE} (fictional demo number), open 24 hours.\n\nAppointments team: Monday to Friday, 8am to 6pm. Ask the switchboard to connect you.\n\nPlease have your appointment letter to hand when you call.`,
    ['contact', 'phone', 'call', 'number', 'reschedule', 'cancel', 'change', 'switchboard'], ['How do I contact the hospital?']),
  g(9, 'General information about preparing for surgery', 'Surgery',
    'Your care team will give you written instructions for your procedure. Read them carefully, arrange how you will get home, and pack the items listed. Your Surgery Checklist in this app helps you keep track.',
    'Before a procedure your care team gives you written instructions that are specific to you.\n\nIn general, it helps to read your instructions early, arrange travel home, and prepare what you need for your stay.\n\nIf anything in your instructions is unclear, contact the pre-operative team before the day of your procedure.',
    ['surgery', 'operation', 'procedure', 'prepare', 'pack', 'stay'], ['How do I prepare for surgery?']),
  g(10, 'Eating and drinking before your procedure', 'Surgery',
    'Eating and drinking instructions are different for each patient and procedure. Please follow the individual instructions your hospital has given you. If you are not sure, contact the pre-operative team before your procedure. This assistant cannot tell you what or when to eat or drink.',
    'Your care team gives you individual instructions about eating and drinking before a procedure. These depend on you and on the procedure, so this app does not give times.\n\nPlease follow the written instructions from your hospital.\n\nIf you have lost your instructions or are unsure about anything, contact the pre-operative team before the day of your procedure.',
    ['eat', 'drink', 'water', 'fasting', 'fast', 'food', 'breakfast'], ['Can I drink water before surgery?', 'Can I drink water before my operation?']),
  g(11, 'Medicines before your procedure', 'Surgery',
    'Do not change how you take your medicines unless your care team has told you to. Follow the individual medicine instructions you were given, and contact the pre-operative team if you are unsure.',
    'Your care team reviews your medicines with you before a procedure and gives you individual instructions.\n\nThis app does not tell you which medicines to take or stop.\n\nPlease bring your current medicine list to every appointment, and contact the pre-operative team if you have questions.',
    ['medicine', 'medication', 'tablet', 'pill'], []),
  g(12, 'Recovery support and who to contact', 'Recovery',
    `For questions about your recovery, contact your care team on ${CARE_TEAM_PHONE} (fictional demo number). For urgent medical help call NHS 111. In an emergency call 999.`,
    `Your care team can answer questions about your recovery. Call ${CARE_TEAM_PHONE} (fictional demo number), Monday to Friday, 8am to 6pm.\n\nOutside these hours, for urgent medical help call NHS 111.\n\nIn an emergency, call 999.`,
    ['recovery', 'contact', 'home', 'support', 'discharge', 'worried'], ['Who should I contact about my recovery?']),
]

const bp1 = [128, 126, 127, 125, 126, 124, 125, 123, 124, 122, 123, 121, 123, 122]
const bp2 = [84, 82, 83, 81, 82, 80, 81, 80, 79, 79, 78, 79, 77, 78]
const hr = [80, 79, 78, 78, 77, 76, 76, 75, 74, 74, 73, 73, 72, 72]
const temp = [36.9, 37.0, 36.8, 36.9, 36.8, 36.8, 36.7, 36.8, 36.6, 36.7, 36.7, 36.6, 36.8, 36.7]
const spo2 = [97, 97, 98, 97, 98, 98, 97, 98, 98, 99, 98, 98, 98, 98]

export function createSeed() {
  const observations: Observation[] = []
  for (let i = 0; i < 14; i++) {
    const d = 14 - i
    observations.push(
      { id: `obs-bp-${i}`, metric: 'bp', value: bp1[i], value2: bp2[i], at: daysAgo(d, 8, 30), source: 'manual' },
      { id: `obs-hr-${i}`, metric: 'hr', value: hr[i], at: daysAgo(d, 8, 30), source: 'manual' },
      { id: `obs-temp-${i}`, metric: 'temp', value: temp[i], at: daysAgo(d, 8, 35), source: 'manual' },
      { id: `obs-spo2-${i}`, metric: 'spo2', value: spo2[i], at: daysAgo(d, 8, 35), source: 'manual' },
    )
  }

  const feelings = ['Not so well', 'About the same', 'About the same', 'Well', 'Well', 'Well', 'Very well']
  const pains = [6, 5, 5, 4, 4, 3, 3]
  const mob = ['Limited movement', 'Limited movement', 'Walking with some difficulty', 'Walking with some difficulty', 'Walking with some difficulty', 'Walking normally', 'Walking normally']
  const checkins: CheckIn[] = feelings.map((f, i) => ({
    id: `checkin-${i}`, at: daysAgo(7 - i, 9, 15), feeling: f, pain: pains[i], mobility: mob[i],
    notes: i === 0 ? 'Tired after coming home.' : i === 4 ? 'Short walk outside today.' : '',
  }))

  return {
    appointments: [
      { id: 'appt-0', type: 'Initial Consultation', date: at(2026, 9, 24, 14, 0), locationId: 'clinic-a', clinic: 'Outpatients Clinic A', status: 'Completed', prepNotes: 'No preparation was needed for this appointment.', bring: ['Appointment letter'], contact: `Appointments team: ${CARE_TEAM_PHONE}` },
      { id: 'appt-1', type: 'Pre-operative Assessment', date: at(2026, 10, 22, 10, 30), locationId: 'clinic-a', clinic: 'Outpatients Clinic A', status: 'Upcoming', prepNotes: 'Please arrive 15 minutes before your appointment. The assessment usually takes about an hour. You can eat and drink as usual before this appointment.', bring: ['Appointment letter', 'Current medication list', 'Questions for your care team'], contact: `Pre-operative team: ${CARE_TEAM_PHONE}` },
      { id: 'appt-2', type: 'Day Procedure', date: at(2026, 11, 5, 7, 30), locationId: 'day-surgery', clinic: 'Day Surgery Unit', status: 'Scheduled', prepNotes: 'Follow the individual instructions given to you by your care team. Arrange for someone to take you home.', bring: ['Appointment information', 'Current medication list', 'Comfortable clothes'], contact: `Day Surgery Unit: ${CARE_TEAM_PHONE}` },
      { id: 'appt-3', type: 'Post-operative Follow-up', date: at(2026, 11, 19, 14, 0), locationId: 'clinic-a', clinic: 'Outpatients Clinic A', status: 'Scheduled', prepNotes: 'Bring a note of any questions about your recovery.', bring: ['Appointment letter', 'Questions for your care team'], contact: `Appointments team: ${CARE_TEAM_PHONE}` },
    ] as Appointment[],
    locations,
    routes,
    checklist: [
      { id: 'before', title: 'Before Your Procedure', items: [
        { id: 'cl-1', title: 'Read your hospital preparation instructions', detail: 'Your care team has given you written instructions. Read them in full and keep them somewhere easy to find.' },
        { id: 'cl-2', title: 'Confirm your travel arrangements', detail: 'Plan how you will get to the hospital and arrange for someone to take you home afterwards.' },
        { id: 'cl-3', title: 'Prepare items for your hospital stay', detail: 'Pack comfortable clothes, your glasses or hearing aids, and something to read.' },
        { id: 'cl-4', title: 'Review your medication instructions with your care team', detail: 'Your care team will tell you what to do with your medicines. Do not make changes unless they have told you to.' },
        { id: 'cl-5', title: 'Confirm fasting instructions provided by your hospital', detail: 'Check the eating and drinking instructions in your hospital letter. If you are unsure, contact the pre-operative team.' },
      ] },
      { id: 'day', title: 'On the Day', items: [
        { id: 'cl-6', title: 'Bring your appointment information', detail: 'Bring your letter or have your appointment details ready in this app.' },
        { id: 'cl-7', title: 'Bring your medication list', detail: 'Bring an up-to-date list of the medicines you take.' },
        { id: 'cl-8', title: "Follow your individual care team's instructions", detail: 'Your written instructions from the hospital are specific to you. Follow them on the day.' },
        { id: 'cl-9', title: 'Check in at the designated department', detail: 'Check in at the Day Surgery Unit on the First Floor. Use Find My Clinic for directions.' },
      ] },
    ] as ChecklistCategory[],
    checklistDone: { 'cl-1': daysAgo(3), 'cl-2': daysAgo(2) } as Record<string, string>,
    reminders: [
      { id: 'rem-1', title: 'Upcoming appointment: Pre-operative Assessment', type: 'Appointment', time: '09:00', repeat: 'Once', enabled: true },
      { id: 'rem-2', title: 'Review your pre-operative checklist', type: 'Checklist', time: '18:00', repeat: 'Daily', enabled: true },
      { id: 'rem-3', title: 'Record your daily recovery check-in', type: 'Recovery check-in', time: '09:30', repeat: 'Daily', enabled: true },
      { id: 'rem-4', title: 'Record your blood pressure', type: 'Health reading', time: '08:30', repeat: 'Daily', enabled: true },
      { id: 'rem-5', title: 'Read hospital preparation guidance', type: 'Guidance', time: '19:00', repeat: 'Once', enabled: false },
      { id: 'rem-6', title: 'Record your temperature', type: 'Health reading', time: '08:35', repeat: 'Daily', enabled: false },
    ] as Reminder[],
    notifications: [
      { id: 'note-1', title: 'Record your blood pressure', body: 'Time to take your reading.', at: daysAgo(1, 8, 30), read: true },
      { id: 'note-2', title: 'Review your pre-operative checklist', body: 'You have items left to complete.', at: daysAgo(1, 18, 0), read: false },
    ] as NotificationEntry[],
    checkins,
    observations,
    symptomLogs: [
      { id: 'sym-1', at: daysAgo(5, 20, 0), symptoms: ['Tiredness'], note: '' },
      { id: 'sym-2', at: daysAgo(2, 19, 30), symptoms: ['Trouble sleeping'], note: 'Woke a few times.' },
    ] as SymptomLog[],
    connection: { platform: null, status: 'disconnected', categories: ['hr', 'bp', 'spo2', 'temp'] } as HealthConnection,
    photos: [
      { id: 'photo-1', at: daysAgo(4, 10, 20), note: 'Sample submission one.', status: 'Reviewed', dataUrl: placeholderPhoto('Sample photo 1', '#EAF4FB'), reviewedBy: 'Jordan Lee', reviewedAt: daysAgo(4, 14, 5) },
      { id: 'photo-2', at: daysAgo(1, 11, 45), note: 'Sample submission two.', status: 'Awaiting Review', dataUrl: placeholderPhoto('Sample photo 2', '#E8F7F4') },
    ] as PhotoSubmission[],
    guidance,
    audit: [
      ['Jordan Lee', 'Demo Care Coordinator', 'Published', 'Guidance', 'Parking at Demo Hospital Campus', 12],
      ['Jordan Lee', 'Demo Care Coordinator', 'Published', 'Guidance', 'Finding Outpatients Clinic A', 12],
      ['Jordan Lee', 'Demo Care Coordinator', 'Updated', 'Checklist', 'Before Your Procedure', 10],
      ['Jordan Lee', 'Demo Care Coordinator', 'Updated', 'Location', 'Outpatients Clinic A', 9],
      ['Alex Morgan', 'Demo Patient', 'Submitted', 'Recovery check-in', 'Daily check-in', 7],
      ['Jordan Lee', 'Demo Care Coordinator', 'Updated', 'Guidance', 'Visiting information', 6],
      ['Alex Morgan', 'Demo Patient', 'Submitted', 'Recovery photo', 'Sample photo 1', 4],
      ['Jordan Lee', 'Demo Care Coordinator', 'Status changed', 'Recovery photo', 'Sample photo 1 → Reviewed', 4],
      ['Jordan Lee', 'Demo Care Coordinator', 'Signed in', 'Session', 'Staff admin', 2],
      ['Alex Morgan', 'Demo Patient', 'Submitted', 'Recovery photo', 'Sample photo 2', 1],
    ].map((r, i) => ({ id: `audit-${i}`, actor: r[0], role: r[1], action: r[2], entity: r[3], detail: r[4], at: daysAgo(r[5] as number, 10 + (i % 6), 5 * i) })) as AuditEvent[],
  }
}

export type SeedData = ReturnType<typeof createSeed>
