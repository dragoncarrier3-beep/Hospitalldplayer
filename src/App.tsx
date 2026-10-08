import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useStore } from './store'
import PhoneShell from './components/PhoneShell'
import Welcome from './screens/Welcome'
import Home from './screens/Home'
import { VisitDetail, Visits } from './screens/Visits'
import Wayfinding from './screens/Wayfinding'
import Surgery from './screens/Surgery'
import Reminders from './screens/Reminders'
import { CheckIn, Recovery } from './screens/Recovery'
import { Health, MetricDetail } from './screens/Health'
import HealthConnect from './screens/HealthConnect'
import Photo from './screens/Photo'
import Ask from './screens/Ask'
import { GuidanceList, GuidanceView } from './screens/Guidance'
import Profile from './screens/Profile'
import Admin from './admin/Admin'

function RequirePatient() {
  const signedIn = useStore((s) => s.patientSignedIn)
  return signedIn ? <Outlet /> : <Navigate to="/welcome" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<PhoneShell />}>
        <Route path="/welcome" element={<Welcome />} />
        <Route element={<RequirePatient />}>
          <Route path="/" element={<Home />} />
          <Route path="/visits" element={<Visits />} />
          <Route path="/visits/:id" element={<VisitDetail />} />
          <Route path="/wayfinding" element={<Wayfinding />} />
          <Route path="/surgery" element={<Surgery />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/recovery/checkin" element={<CheckIn />} />
          <Route path="/recovery/health" element={<Health />} />
          <Route path="/recovery/health/:metric" element={<MetricDetail />} />
          <Route path="/recovery/connect" element={<HealthConnect />} />
          <Route path="/recovery/photo" element={<Photo />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/guidance" element={<GuidanceList />} />
          <Route path="/guidance/:id" element={<GuidanceView />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="/admin/*" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
