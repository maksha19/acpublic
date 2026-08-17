import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import type { RegStatus } from '../lib/types'

/* Hand-built rather than shadcn/ui for Phase 0: the public site needs six
   components and pulling in Radix for them is Phase 1 work. Icons are Lucide —
   never emoji, which render inconsistently and are read aloud badly by screen
   readers. */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-[#00314d]',
  secondary: 'bg-white text-primary border-2 border-primary hover:bg-surface',
  ghost: 'bg-transparent text-primary hover:bg-surface',
  danger: 'bg-destructive text-white hover:bg-[#5e1c28]',
}

// min-h-11 is 44px — the accessibility minimum for a touch target, and these get
// tapped on phones by people standing in a queue.
export const buttonClass = (variant: Variant = 'primary', extra = '') =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 no-underline
   font-heading text-base font-semibold transition-colors duration-150
   disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${extra}`

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={buttonClass(variant, className)} {...props}>
      {children}
    </button>
  )
}

/** A navigation link that looks like a button.
 *  Separate from Button because an <a> inside a <button> is invalid HTML and
 *  breaks keyboard activation — the two need different elements, not a prop. */
export function LinkButton({
  to,
  children,
  variant = 'primary',
  className = '',
}: {
  to: string
  children: ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <Link to={to} className={buttonClass(variant, className)}>
      {children}
    </Link>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-white p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      {/* A visible label, always. Placeholder-only labels vanish the moment
          someone starts typing, which is when they are most needed. */}
      <label htmlFor={htmlFor} className="mb-1 block font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {hint && (
        <p id={`${htmlFor}-hint`} className="mb-1.5 text-[15px] text-muted-fg">
          {hint}
        </p>
      )}
      {children}
      {/* role=alert so a screen reader announces the error when it appears. */}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-[15px] font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

const controlClass = `w-full min-h-11 rounded-md border border-border bg-white px-3 py-2
  text-[17px] text-ink placeholder:text-muted-fg
  focus:border-primary aria-[invalid=true]:border-destructive aria-[invalid=true]:border-2`

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClass} ${props.className ?? ''}`} />
}

export function Alert({
  tone,
  title,
  children,
}: {
  tone: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children?: ReactNode
}) {
  const tones = {
    info: { cls: 'border-primary bg-[#F0F5F8] text-ink', Icon: Info },
    success: { cls: 'border-success bg-[#EEF6F2] text-ink', Icon: CheckCircle2 },
    warning: { cls: 'border-happy-yellow bg-[#FEFBEC] text-ink', Icon: AlertTriangle },
    error: { cls: 'border-destructive bg-[#FBF5F6] text-ink', Icon: AlertTriangle },
  }[tone]
  return (
    <div className={`flex gap-3 rounded-md border-l-4 p-4 ${tones.cls}`}>
      <tones.Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-heading font-semibold">{title}</p>}
        {children && <div className="text-[16px]">{children}</div>}
      </div>
    </div>
  )
}

/* One place decides how a status is worded and coloured, so the member sees the
   same language on the page as in the email. Colour is never the only signal —
   every badge carries text. */
const STATUS_META: Record<RegStatus, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: 'Awaiting payment', cls: 'bg-happy-yellow text-loyal-blue' },
  PAYMENT_SUBMITTED: { label: 'Under review', cls: 'bg-white text-primary border-2 border-primary' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-success text-white' },
  REJECTED: { label: 'Action needed', cls: 'bg-destructive text-white' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-white text-muted-fg border border-border' },
  REPLACED: { label: 'Transferred', cls: 'bg-white text-muted-fg border border-border' },
  CHECKED_IN: { label: 'Checked in', cls: 'bg-primary text-white' },
  NO_SHOW: { label: 'Did not attend', cls: 'bg-white text-muted-fg border border-border' },
}

export function StatusBadge({ status }: { status: RegStatus }) {
  const meta = STATUS_META[status] ?? { label: status, cls: 'bg-white text-muted-fg border border-border' }
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 font-heading text-sm font-semibold ${meta.cls}`}
    >
      {meta.label}
    </span>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-fg" role="status">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  )
}

export function PageHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {lede && <p className="mt-2 max-w-2xl text-lg text-muted-fg">{lede}</p>}
    </header>
  )
}

export function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 sm:flex-row sm:gap-4">
      <dt className="text-muted-fg sm:w-44 sm:shrink-0">{label}</dt>
      <dd className="font-semibold break-words">{value}</dd>
    </div>
  )
}
