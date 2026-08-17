import { useQuery } from '@tanstack/react-query'
import { CalendarDays, CreditCard, MailCheck, MapPin, UserPlus } from 'lucide-react'
import { getEvent } from '../lib/api'
import { Alert, Card, LinkButton, PageHeader, Spinner } from '../components/ui'

const STEPS = [
  { Icon: UserPlus, title: 'Register', body: 'Fill in the form. You get a registration code straight away.' },
  { Icon: CreditCard, title: 'Pay and upload', body: 'Transfer the fee, then upload your payment screenshot on the site.' },
  { Icon: MailCheck, title: 'Get confirmed', body: 'The team verifies your payment and emails your confirmation.' },
]

export default function Home() {
  const { data: event, isLoading, error } = useQuery({ queryKey: ['event'], queryFn: getEvent })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Annual Conference 2027"
        lede="Register, pay and track your confirmation in one place — no forms to chase and no
              screenshots to forward."
      />

      {isLoading && <Spinner label="Loading conference details" />}

      {error && (
        <Alert tone="error" title="Conference details are unavailable">
          The registration service could not be reached. Please try again shortly.
        </Alert>
      )}

      {event && (
        <>
          <Card>
            <h2 className="text-2xl">{event.name}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-[15px] text-muted-fg">When</dt>
                  <dd className="font-semibold">{event.dateLabel ?? 'To be announced'}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-[15px] text-muted-fg">Where</dt>
                  <dd className="font-semibold">{event.venue ?? 'To be announced'}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-[15px] text-muted-fg">Fee</dt>
                  <dd className="font-semibold tnum">
                    {event.currency} {Number(event.fee).toFixed(2)}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/register">Register now</LinkButton>
              <LinkButton to="/my" variant="secondary">
                Check my registration
              </LinkButton>
            </div>
          </Card>

          <section aria-labelledby="how">
            <h2 id="how" className="text-xl">
              How it works
            </h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3">
              {STEPS.map(({ Icon, title, body }, i) => (
                <li key={title} className="rounded-lg border border-border bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full
                                 bg-happy-yellow font-heading font-bold text-loyal-blue"
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
          </section>
        </>
      )}
    </div>
  )
}
