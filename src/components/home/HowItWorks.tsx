import { CreditCard, MailCheck, UserPlus } from 'lucide-react'
import { Section } from './Section'

/* Moved verbatim from the old Home page. Placed right after Pricing: the
   moment a price is accepted, the next question is "how painful is this?" —
   these three steps answer it. The copy is real system behaviour, not mock. */
const STEPS = [
  { Icon: UserPlus, title: 'Register', body: 'Register yourself, or book a table of ten for your club. You get a code straight away.' },
  { Icon: CreditCard, title: 'Pay and upload', body: 'Transfer the fee, then upload your payment screenshot on the site. One payment covers a whole table.' },
  { Icon: MailCheck, title: 'Get confirmed', body: 'The team verifies your payment and emails your confirmation.' },
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
