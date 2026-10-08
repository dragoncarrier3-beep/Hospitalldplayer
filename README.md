# My Hospital Journey — interactive demo

A clickable web preview of the patient app concept (visit and wayfinding, surgery companion, recovery at home, Ask Hospital) plus a basic staff admin. It runs entirely in the browser on synthetic data, so it can be hosted as a static site.

This is a demonstration concept. It is not an official NHS or hospital product, uses no real patient data, and is not connected to any hospital system.

## Run locally

```
npm install
npm run dev
```

- Patient app: http://localhost:5173/
- Staff admin: http://localhost:5173/admin

`npm test` runs the assistant and validation tests. `npm run typecheck` runs TypeScript.

## Deploy to Vercel

Either import the repository in the Vercel dashboard (framework preset: Vite, no settings to change), or from this folder:

```
npx vercel --prod
```

`vercel.json` rewrites every path to `index.html` so deep links such as `/admin/guidance` work.

## Demo script

1. Welcome → **Continue as Demo Patient** (Alex Morgan, DEMO-PAT-001).
2. Home → **View Appointment** → **What to Bring**, **Add to Calendar** (downloads a real `.ics`), **Set Reminder**.
3. **Get Directions** → step through the route; switch on **Step-free route**; change destination to Day Surgery Unit to see stairs vs lift.
4. **Surgery Checklist** → tick items, expand details, undo.
5. **Reminders** (bell on Home) → add a reminder, **Send test now**, check History.
6. **Recovery** → daily check-in; **Record My Health** → add a blood pressure reading, open History for the 7 / 30 day chart; try an invalid value.
7. **Connect Health Data** → connect, **Try Demo Import** (readings are labelled as simulated); **Share a recovery photo**.
8. **Ask Hospital** → “Where can I park?” (answer with source), “Can I drink water before surgery?” (approved guidance, no times), “Is my wound infected?” (safe referral).
9. **Open Staff Admin** in a second tab → sign in as Jordan Lee → **Wound Photos**: change a status → **Hospital Guidance**: edit the parking short answer and save.
10. Back in the patient tab, ask “Where can I park?” again. The new answer appears, and the photo status has changed. **Audit Log** shows both actions.

Sign in to the admin as Sam Rivers to show the read-only role. **Reset demo** (desktop side panel, or Profile) restores the original data.

## How it is built

- React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router.
- `src/data/seed.ts` — all synthetic data and the data model (appointments, locations, routes, checklist, reminders, check-ins, observations, photos, guidance, audit events).
- `src/store.ts` — single store, persisted to `localStorage` and synced between tabs. This stands in for the backend API.
- `src/lib/assistant.ts` — Ask Hospital. Retrieval only: it returns the approved short answer of the best-matching published article, a fixed safety message for clinical or urgent questions, or “no approved answer”. Nothing is generated and nothing leaves the browser.
- `src/screens/` — patient app screens. `src/admin/Admin.tsx` — staff admin.

## What this demo is not

It is a web prototype for stakeholder review, not the production build. The following are simulated or absent and would be delivered in the real project:

- Native Flutter iOS and Android apps. This preview is a web app shown in a phone frame.
- HealthKit and Health Connect. A browser cannot reach them; the import uses clearly labelled simulated readings.
- Backend, database and authentication. Data lives in the browser; sign-in is a demo button.
- Local push notifications, biometric unlock and secure device storage. These are previewed, not implemented.
- FHIR (UK Core) mapping, UK hosting, and clinical safety and data protection assessment.
