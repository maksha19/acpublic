import { CreditCard, MailCheck, UserPlus } from 'lucide-react'
import { Section } from './Section'

/* Placed right after Pricing: the moment a price is accepted, the next
   question is "how painful is this?" — these three steps answer it. The copy
   is the committee's (18 Sep 2026) and describes real system behaviour. */
const STEPS = [
  {
    Icon: UserPlus,
    title: 'Register',
    body: 'Upon successful registration, you will receive an email acknowledgement with a unique code and payment instructions.',
  },
  {
    Icon: CreditCard,
    title: 'Pay and upload proof of payment',
    body: 'Make payment via bank transfer and upload your proof of payment.',
  },
  {
    Icon: MailCheck,
    title: 'Confirmation',
    body: 'You are all set! An email confirmation with your digital ticket will be sent to you.',
  },
]

export default function HowItWorks() {
  return (
    <Section id="how" title="How it works" kicker="Registration to confirmation" tint="white">
      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ Icon, title, body }, i) => (
          <li key={title} className="rounded-lg border border-border bg-white p-5">
            <div className="flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full
                           bg-accent font-heading font-bold text-primary"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <Icon className="size-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-lg">{title}</h3>
            <p className="mt-1 text-[16px] text-muted-fg">{body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
