import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, ChevronLeft, FlaskConical, Info, X } from 'lucide-react'
import { create } from 'zustand'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-[#0E2B48] disabled:bg-[#9AA9B6]',
  secondary: 'bg-softblue text-navy hover:bg-[#DCECF7]',
  outline: 'border border-line bg-white text-navy hover:bg-softblue',
  danger: 'bg-danger text-white hover:bg-[#9E3030]',
  ghost: 'text-blue hover:bg-softblue',
}

export function Button({ variant = 'primary', full, small, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean; small?: boolean }) {
  return (
    <button
      type="button"
      {...p}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed',
        small ? 'min-h-[2.75rem] px-3.5 text-sm' : 'min-h-[3.25rem] px-5 text-base',
        full && 'w-full',
        VARIANTS[variant],
        className,
      )}
    />
  )
}

export function Card({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'li' }) {
  return <Tag className={cx('rounded-2xl bg-white p-4 shadow-card', className)}>{children}</Tag>
}

type Tone = 'blue' | 'teal' | 'amber' | 'grey' | 'red'
const TONES: Record<Tone, string> = {
  blue: 'bg-softblue text-navy',
  teal: 'bg-softteal text-tealdark',
  amber: 'bg-softamber text-amber',
  grey: 'bg-[#EEF2F5] text-muted',
  red: 'bg-softred text-danger',
}
export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: Tone }) {
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', TONES[tone])}>{children}</span>
}

export function ScreenHeader({ title, subtitle, back = true, action }: { title: string; subtitle?: string; back?: boolean; action?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="flex items-start gap-2 px-4 pb-3 pt-4">
      {back && (
        <button aria-label="Go back" onClick={() => nav(-1)} className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy hover:bg-softblue">
          <ChevronLeft size={26} />
        </button>
      )}
      <div className="min-w-0 flex-1 pt-1">
        <h1 className="text-[1.375rem] font-bold leading-tight text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.9375rem] text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between px-1">
      <h2 className="text-lg font-bold text-navy">{children}</h2>
      {action}
    </div>
  )
}

export function Note({ children, tone = 'blue', icon }: { children: ReactNode; tone?: 'blue' | 'amber' | 'teal'; icon?: ReactNode }) {
  return (
    <div className={cx('flex gap-2.5 rounded-xl p-3 text-sm', tone === 'amber' ? 'bg-softamber text-[#7A470B]' : tone === 'teal' ? 'bg-softteal text-[#0A5D57]' : 'bg-softblue text-navy')}>
      <span className="mt-0.5 shrink-0">{icon ?? <Info size={18} aria-hidden />}</span>
      <div>{children}</div>
    </div>
  )
}

export function Synthetic({ children = 'Synthetic example content for demonstration. Not real hospital instructions.' }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-muted">
      <FlaskConical size={14} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-6 text-center">
      <p className="font-semibold text-navy">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-8 w-14 shrink-0 rounded-full transition-colors', checked ? 'bg-tealdark' : 'bg-[#B8C4CE]')}
    >
      <span className={cx('absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all', checked ? 'left-7' : 'left-1')} />
    </button>
  )
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.9375rem] font-semibold text-ink">{label}</span>
      {hint && <span className="mb-1.5 block text-sm text-muted">{hint}</span>}
      {children}
      {error && (
        <span role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger">
          <AlertCircle size={16} aria-hidden /> {error}
        </span>
      )}
    </label>
  )
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const host = document.getElementById('phone-overlay')
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className={cx('pointer-events-auto inset-0 z-40 flex justify-center', host ? 'absolute items-end' : 'fixed items-center p-4')}>
      <button aria-label="Close" className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className={cx('fade-in relative w-full overflow-y-auto bg-white p-5 shadow-xl', host ? 'max-h-[88%] rounded-t-3xl' : 'max-h-[90vh] max-w-xl rounded-2xl')}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-navy">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-softblue">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    host ?? document.body,
  )
}

type ToastItem = { id: number; text: string; tone: 'success' | 'error' | 'info'; action?: { label: string; run: () => void } }
const useToasts = create<{ items: ToastItem[]; push: (t: Omit<ToastItem, 'id'>) => void; dismiss: (id: number) => void }>((set) => ({
  items: [],
  push: (t) => {
    const id = Date.now() + Math.random()
    set((s) => ({ items: [...s.items.slice(-1), { ...t, id }] }))
    setTimeout(() => set((s) => ({ items: s.items.filter((x) => x.id !== id) })), 4500)
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}))

export const toast = (text: string, tone: ToastItem['tone'] = 'success', action?: ToastItem['action']) => useToasts.getState().push({ text, tone, action })

export function Toaster({ fixed }: { fixed?: boolean }) {
  const { items, dismiss } = useToasts()
  return (
    <div aria-live="polite" className={cx('pointer-events-none inset-x-0 z-50 flex flex-col items-center gap-2 px-4', fixed ? 'fixed bottom-6' : 'absolute bottom-24')}>
      {items.map((t) => (
        <div key={t.id} className={cx('fade-in pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-[0.9375rem] font-medium text-white shadow-lg', t.tone === 'error' ? 'bg-danger' : 'bg-navy')}>
          {t.tone === 'error' ? <AlertCircle size={20} aria-hidden /> : t.tone === 'info' ? <Info size={20} aria-hidden /> : <CheckCircle2 size={20} aria-hidden />}
          <span className="flex-1">{t.text}</span>
          {t.action && (
            <button
              className="rounded-lg px-2 py-1 font-bold underline"
              onClick={() => {
                t.action!.run()
                dismiss(t.id)
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
