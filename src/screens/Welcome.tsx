import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { HeartHandshake, ListChecks, MapPinned, MessageCircleQuestion, ShieldCheck } from 'lucide-react'
import { useStore } from '../store'
import { Button, cx } from '../components/ui'

const SLIDES = [
  { icon: HeartHandshake, title: 'Your hospital journey, made simpler.', body: 'Everything you need for your visit, preparation and recovery, all in one place.' },
  { icon: MapPinned, title: 'Know where to go.', body: 'Find your clinic, check your appointment details and follow easy directions.' },
  { icon: ListChecks, title: 'Feel prepared.', body: "Follow your care team's instructions and keep track of your recovery." },
  { icon: MessageCircleQuestion, title: 'Get answers when you need them.', body: 'Find practical information from trusted hospital guidance.' },
]

export default function Welcome() {
  const [i, setI] = useState(0)
  const nav = useNavigate()
  const { patientSignedIn, signInPatient } = useStore()
  if (patientSignedIn) return <Navigate to="/" replace />

  const start = () => {
    signInPatient()
    nav('/')
  }
  const signIn = i === SLIDES.length
  const slide = SLIDES[Math.min(i, SLIDES.length - 1)]
  const Icon = signIn ? ShieldCheck : slide.icon

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-softblue to-bg px-6 pb-6 pt-8">
      <p className="text-center text-sm font-bold uppercase tracking-wide text-tealdark">My Hospital Journey</p>
      <div key={i} className="fade-in flex flex-1 flex-col items-center justify-center text-center">
        <div className="grid h-36 w-36 place-items-center rounded-full bg-white shadow-card">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-softteal text-tealdark">
            <Icon size={48} strokeWidth={1.75} aria-hidden />
          </div>
        </div>
        {signIn ? (
          <>
            <h1 className="mt-8 text-[1.75rem] font-bold leading-tight text-navy">Explore the demo</h1>
            <p className="mt-3 text-lg text-muted">No email, NHS number or personal details are needed. You will explore as a fictional patient, Alex Morgan.</p>
          </>
        ) : (
          <>
            <h1 className="mt-8 text-[1.75rem] font-bold leading-tight text-navy">{slide.title}</h1>
            <p className="mt-3 text-lg text-muted">{slide.body}</p>
          </>
        )}
      </div>

      <div className="mb-5 flex justify-center gap-2" aria-hidden>
        {[...SLIDES, null].map((_, n) => (
          <span key={n} className={cx('h-2 rounded-full transition-all', n === i ? 'w-6 bg-navy' : 'w-2 bg-[#B8C4CE]')} />
        ))}
      </div>

      <div className="space-y-3">
        {signIn ? (
          <>
            <Button full onClick={start}>Continue as Demo Patient</Button>
            <Button full variant="outline" disabled className="!text-muted">NHS login — planned for a later phase</Button>
            <Link to="/admin" className="block py-2 text-center font-semibold text-blue underline">Staff demo sign-in</Link>
          </>
        ) : (
          <>
            <Button full onClick={() => setI(i + 1)}>{i === 0 ? 'Get Started' : 'Next'}</Button>
            <Button full variant="secondary" onClick={start}>Continue as Demo Patient</Button>
          </>
        )}
      </div>
    </div>
  )
}
