import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowRight, User, Users, DotIcon } from 'lucide-react'
import { ApiError, createRegistration, getEvent } from '../lib/api'
import { money, priceLine } from '../lib/format'
import { emptyPerson, personSchema, type PersonValues } from '../lib/person'
import PersonFields from '../components/PersonFields'
import { remember } from '../lib/session'
import { Alert, Button, Card, Field, Input, LinkButton, PageHeader, PriceWindowNote } from '../components/ui'
import type { EventInfo } from '../lib/types'

/* Validation lives in lib/person.ts — name and email plus whatever fields the
   committee defined on the event describe the person registering and every
   guest they name, and the server revalidates all of it either way. */
type FormValues = PersonValues

export default function Register() {
  const { data: event } = useQuery({ queryKey: ['event'], queryFn: getEvent })

  /* The fork: one place or a whole table. A choice made BEFORE the form, not a
     quantity field inside it — a table of ten is a different thing to buy, with
     a different price and a roster to fill in afterwards, and burying that in a
     number input reads as an afterthought. */
  const [seats, setSeats] = useState<number | null>(null)
  const [result, setResult] = useState<{ code: string; accessKey: string; seats: number } | null>(
    null,
  )

  const tableSeats = event?.tableSeats ?? 10
  const fields = useMemo(() => event?.fields ?? [], [event])
  // Rebuilt when the event (and so the field list) arrives; react-hook-form
  // picks up the new resolver on the next validation.
  const schema = useMemo(() => personSchema('your', fields), [fields])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyPerson(),
  })

  const mutation = useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      // The access key is shown once and emailed once. Keeping it in this
      // browser means "Check my registration" works later without the email.
      remember(data.code, data.accessKey)
      setResult({ code: data.code, accessKey: data.accessKey, seats: data.seats })
    },
    onError: (err) => {
      // Map server field errors back onto the inputs, so a rejected email lands
      // on the email box rather than in a banner at the top.
      if (err instanceof ApiError && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          setError(field as keyof FormValues, { message })
        }
      }
    },
  })

  if (result) return <Registered {...result} tableSeats={tableSeats} />

  if (seats === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Register for AC 2027"
          lede="Register yourself, or book a whole table for your club."
        />
        <PriceWindowNote event={event} />
        <BookingChoice event={event} onChoose={setSeats} />
      </div>
    )
  }

  const isTable = seats > 1

  return (
    <div className="space-y-6">
      <PageHeader
        title={isTable ? `Book a table of ${seats}` : 'Register for AC 2027'}
        lede={
          isTable
            ? `Your own details first. The other ${seats - 1} places are reserved straight away and you can name them whenever you like.`
            : 'Fill in your details. Payment comes after this step.'
        }
      />

      <Card className="!py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[17px]">
            <span className="font-semibold">
              {isTable ? `A table of ${seats}` : 'One place, just me'}
            </span>
            {event && (
              <span className="text-muted-fg">
                {' · '}
                {priceLine(
                  seats,
                  isTable ? (event.groupFee ?? event.fee) : event.fee,
                  isTable ? event.tableFee : event.fee,
                  event.currency,
                )}
              </span>
            )}
          </p>
          <Button variant="ghost" onClick={() => setSeats(null)} className="!px-3">
            Change
          </Button>
        </div>
      </Card>

      <Card>
        <form
          onSubmit={handleSubmit((values) =>
            mutation.mutate({ ...values, seats }),
          )}
          className="space-y-5"
          noValidate
        >
          {mutation.error && !(mutation.error instanceof ApiError && mutation.error.fields) && (
            <Alert tone="error" title="We couldn't complete your registration">
              {mutation.error.message}
            </Alert>
          )}

          {isTable && (
            <Alert tone="info" title="These are your own details">
              You are attendee 1 of {seats}. We will ask for the other {seats - 1} names later —
              there is nothing to fill in for them now.
            </Alert>
          )}

          <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
          </Field>

          <Field
            label="Email"
            htmlFor="email"
            required
            hint={
              isTable
                ? 'Your booking code, payment details and confirmation are sent here — and only here.'
                : 'Your registration code and confirmation are sent here.'
            }
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : 'email-hint'}
              {...register('email')}
            />
          </Field>

          <PersonFields control={control} fields={fields} />

          <div className="border-t border-border pt-5">
            <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full sm:w-auto">
              {mutation.isPending
                ? 'Registering…'
                : isTable
                  ? `Reserve ${seats} places`
                  : 'Register'}
            </Button>
            <p className="mt-3 text-[15px] text-muted-fg">
              {isTable
                ? `Reserving holds all ${seats} places. They are confirmed once your payment has been verified. Unused places are not refunded.`
                : 'Registering reserves a place. It is confirmed once your payment has been verified.'}
            </p>
          </div>
        </form>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ fork ---- */

function BookingChoice({
  event,
  onChoose,
}: {
  event?: EventInfo
  onChoose: (seats: number) => void
}) {
  const tableSeats = event?.tableSeats ?? 10
  // Availability comes from the API as two separate answers, because they are
  // two separate counters. Whole tables can sell out while individual places
  // remain, and the opposite is also possible.
  const soloOpen = event?.individualBookingsAvailable !== false
  const tableOpen = event?.tableBookingsAvailable !== false

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Option
        Icon={User}
        title="Just me"
        price={money(event?.fee, event?.currency)}
        priceNote="per pax"
        available={soloOpen}
        unavailableNote="Every place has been taken."
        bullets={['Your own seat', 'You pay for yourself', 'Confirmed once we verify your payment']}
        cta="Register"
        onChoose={() => onChoose(1)}
      />
      <Option
        Icon={Users}
        title={`A table of ${tableSeats}`}
        price={money(event?.tableFee, event?.currency)}
        priceNote={
          event
            ? `${tableSeats} places · ${money(event.groupFee ?? event.fee, event.currency)} per pax · one payment`
            : `${tableSeats} places · one payment`
        }
        available={tableOpen}
        unavailableNote={
          soloOpen
            ? 'Whole tables are sold out — individual places are still available.'
            : 'Every place has been taken.'
        }
        bullets={[
          `You sit together, all ${tableSeats} of you`,
          'One payment and one screenshot for the whole table',
          'Add the other names whenever you have them',
        ]}
        cta={`Book a table of ${tableSeats}`}
        onChoose={() => onChoose(tableSeats)}
        highlight
      />
    </div>
  )
}

function Option({
  Icon,
  title,
  price,
  priceNote,
  bullets,
  cta,
  onChoose,
  available,
  unavailableNote,
  highlight = false,
}: {
  Icon: typeof User
  title: string
  price: string
  priceNote: string
  bullets: string[]
  cta: string
  onChoose: () => void
  available: boolean
  unavailableNote: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border bg-white p-6 ${
        highlight ? 'border-primary border-2' : 'border-border'
      } ${available ? '' : 'opacity-70'}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="size-6 shrink-0 text-primary" aria-hidden="true" />
        <h2 className="text-xl">{title}</h2>
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-primary tnum">{price}</p>
      <p className="text-[15px] text-muted-fg">{priceNote}</p>

      <ul className="mt-4 flex-1 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2 text-[16px]">
            <DotIcon className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        {available ? (
          <Button onClick={onChoose} variant={highlight ? 'primary' : 'secondary'} className="w-full">
            {cta} <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Alert tone="warning" title="Not available">
            {unavailableNote}
          </Alert>
        )}
      </div>
    </div>
  )
}

/* PriceWindowNote moved to components/ui.tsx — the landing page shows the same
   note, and two copies of a price sentence is how they end up disagreeing. */

/* --------------------------------------------------------------- success ---- */

function Registered({
  code,
  accessKey,
  seats,
  tableSeats,
}: {
  code: string
  accessKey: string
  seats: number
  tableSeats: number
}) {
  const isTable = seats > 1
  const payHref = `/register/${code}/payment?k=${encodeURIComponent(accessKey)}`
  const myHref = `/my?code=${code}&k=${encodeURIComponent(accessKey)}`

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isTable ? `Your table of ${seats} is reserved — one more step to go` : "You're registered — one more step to go"
        }
      />
      <Card>
        <p className="text-lg">
          {isTable
            ? `All ${seats} places are reserved but not yet confirmed. Payment comes next.`
            : 'Your place is reserved but not yet confirmed. Payment comes next.'}
        </p>

        <div className="my-6 rounded-md bg-accent px-5 py-4 text-center">
          <p className="text-[15px] uppercase tracking-[0.1em] text-primary">
            {isTable ? 'Your booking code' : 'Your registration code'}
          </p>
          <p className="font-heading text-3xl font-bold tracking-wide text-primary tnum">
            {code}
          </p>
          {isTable && (
            <p className="mt-1 text-[15px] text-primary">
              Your guests will get their own codes, {code}-01 to {code}-
              {String(tableSeats - 1).padStart(2, '0')}
            </p>
          )}
        </div>

        <Alert tone="info" title="We've emailed this to you">
          The email has your code, the payment details and a personal link to check your status.
          Keep it — the link cannot be recovered from the code alone.
        </Alert>

        {isTable && (
          <div className="mt-4">
            <Alert tone="warning" title={`${seats - 1} places still need names`}>
              There is no hurry — add them one at a time from your booking page. Each guest is
              emailed their own code as you go.
            </Alert>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LinkButton to={payHref}>
            Continue to payment <ArrowRight className="size-4" aria-hidden="true" />
          </LinkButton>
          <LinkButton to={myHref} variant="secondary">
            {isTable ? 'View my booking' : 'View my registration'}
          </LinkButton>
        </div>
      </Card>
    </div>
  )
}
