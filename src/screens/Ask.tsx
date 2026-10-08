import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, FileText, MessageCircleQuestion, SendHorizontal, ShieldAlert, Trash2 } from 'lucide-react'
import { useStore, type ChatMessage } from '../store'
import { answer } from '../lib/assistant'
import { SOURCE_NAME } from '../data/seed'
import { fullDate } from '../lib/format'
import { cx } from '../components/ui'

const SUGGESTED = ['Where can I park?', 'How do I find Outpatients Clinic A?', 'What should I bring to my appointment?', 'Can I drink water before surgery?', 'Who should I contact about my recovery?']

function Bubble({ m }: { m: ChatMessage }) {
  if (m.from === 'user') {
    return <div className="ml-10 self-end rounded-2xl rounded-br-md bg-navy px-4 py-3 text-white">{m.text}</div>
  }
  const r = m.reply
  const referral = r?.kind === 'referral'
  return (
    <div className={cx('fade-in mr-6 self-start rounded-2xl rounded-bl-md p-4 shadow-card', referral ? 'bg-softamber' : 'bg-white')}>
      {referral && (
        <p className="mb-1.5 flex items-center gap-2 font-bold text-[#7A470B]"><ShieldAlert size={20} aria-hidden /> {r.urgent ? 'Get help now' : 'Please speak to your care team'}</p>
      )}
      <p className="text-ink">{m.text}</p>
      {r?.kind === 'answer' && (
        <div className="mt-3 rounded-xl border border-line bg-bg p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Source</p>
          <p className="mt-0.5 flex items-start gap-2 font-semibold text-navy"><FileText size={18} className="mt-0.5 shrink-0" aria-hidden /> {r.title}</p>
          <p className="mt-1 text-sm text-muted">{SOURCE_NAME} · {r.ref}</p>
          <p className="text-sm text-muted">Last reviewed {fullDate(r.lastReviewed)}</p>
          <Link to={`/guidance/${r.articleId}`} className="mt-2.5 inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl bg-softblue px-4 text-sm font-semibold text-navy hover:bg-[#DCECF7]"><BookOpen size={16} aria-hidden /> View Guidance</Link>
        </div>
      )}
    </div>
  )
}

export default function Ask() {
  const { chat, addChat, clearChat } = useStore()
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [chat.length, thinking])

  const send = (q: string) => {
    const question = q.trim()
    if (!question || thinking) return
    addChat({ from: 'user', text: question })
    setText('')
    setThinking(true)
    setTimeout(() => {
      try {
        // Read guidance at answer time so edits published in the staff admin apply immediately.
        const reply = answer(question, useStore.getState().guidance)
        addChat({ from: 'assistant', text: reply.text, reply })
      } catch {
        addChat({ from: 'assistant', text: 'Ask Hospital is unavailable right now. Please try again, or contact the hospital directly.' })
      }
      setThinking(false)
    }, 550)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start gap-3 border-b border-line bg-white px-4 pb-3 pt-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-softblue text-blue"><MessageCircleQuestion size={24} aria-hidden /></span>
        <div className="flex-1">
          <h1 className="text-xl font-bold leading-tight text-navy">Ask Hospital</h1>
          <p className="text-sm text-muted">Practical answers from hospital guidance.</p>
        </div>
        <Link to="/guidance" aria-label="Browse all guidance" className="grid h-11 w-11 place-items-center rounded-full text-blue hover:bg-softblue"><BookOpen size={22} /></Link>
        {chat.length > 0 && <button aria-label="Clear conversation" onClick={clearChat} className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-softblue"><Trash2 size={20} /></button>}
      </header>

      <div className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <div className="mr-6 self-start rounded-2xl rounded-bl-md bg-white p-4 shadow-card">
          <p className="text-ink">Hello. I can help with practical questions such as parking, directions, what to bring and who to contact.</p>
          <p className="mt-2 text-sm text-muted">I only use approved hospital guidance and I can't give medical advice. In this demo the guidance is fictional.</p>
        </div>
        {chat.map((m) => <Bubble key={m.id} m={m} />)}
        {thinking && <div className="self-start rounded-2xl bg-white px-4 py-3 text-muted shadow-card" role="status">Looking in hospital guidance…</div>}
        <div ref={end} />
      </div>

      <div className="border-t border-line bg-white px-3 pb-3 pt-2">
        <div className="no-scrollbar -mx-3 mb-2 flex gap-2 overflow-x-auto px-3" aria-label="Suggested questions">
          {SUGGESTED.map((q) => (
            <button key={q} onClick={() => send(q)} className="min-h-[2.5rem] shrink-0 rounded-full border border-line bg-bg px-3.5 text-sm font-medium text-navy hover:bg-softblue">{q}</button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(text) }}>
          <label className="sr-only" htmlFor="ask-input">Type your question</label>
          <input id="ask-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your question" maxLength={200} autoComplete="off" />
          <button type="submit" aria-label="Send question" disabled={!text.trim() || thinking} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy text-white disabled:bg-[#9AA9B6]"><SendHorizontal size={22} /></button>
        </form>
      </div>
    </div>
  )
}
