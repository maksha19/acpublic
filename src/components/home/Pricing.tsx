import type { LucideIcon } from 'lucide-react'
import { User, Users, DotIcon } from 'lucide-react'
import { CONFERENCE } from '../../content/conference'
import { money, places, sgDate } from '../../lib/format'
import { Alert, LinkButton, PriceWindowNote, Spinner } from '../ui'
import { Section } from './Section'
import type { EventInfo } from '../../lib/types'

/* The ONLY section allowed to show query state. Prices must come from the
   API or not appear — a hardcoded fallback fee is a wrong number waiting for
   a window boundary — so this section owns the spinner and the error. */

/* Scarcity is a fact worth stating only when it is real. 30 is 10% of the
   seeded capacity of 300; whisper-numbers above that read as marketing. */
const SEATS_URGENT = 30
const TABLES_URGENT = 3

export default function Pricing({
  event,
  isLoading,
  error,
}: {
  event?: EventInfo
  isLoading: boolean
  error: unknown
}) {
  const tableSeats = event?.tableSeats ?? 10
  // Two per-place rates from the API: `fee` for one person, `groupFee` for
  // each place on a table. The saving is shown only when it is a real number
  // — a difference between two figures the server resolved, not a rule.
  const groupFee = event?.groupFee ?? event?.fee
  const saving =
    event && groupFee !== undefined && Number(event.fee) > Number(groupFee)
      ? Number(event.fee) - Number(groupFee)
      : 0
  // Two counters, two answers — whole tables can sell out while individual
  // places remain. Same idiom as the register fork: undefined stays open.
  const soloOpen = event?.individualBookingsAvailable !== false
  const tableOpen = event?.tableBookingsAvailable !== false
  const open = event?.registrationOpen !== false

  return (
    <Section id="pricing" title="Tickets" kicker="Secure your place">
      {isLoading && <Spinner label="Loading prices" />}

      {error != null && !event && (
        <Alert tone="error" title="Prices are unavailable">
          The registration service could not be reached. Please try again shortly.
        </Alert>
      )}

      {event && (
        <div className="space-y-4">
          {!open && (
            <Alert tone="info" title="Registration is not open">
              Registration for this conference is currently closed. Write to{' '}
              {CONFERENCE.district.contactEmail} with any questions.
            </Alert>
          )}

          {/* The committee wants the early-bird offer stressed — number and
              time limit — so while it runs it gets a card, not a note. */}
          {event.priceWindow === 'EARLY_BIRD' ? (
            <EarlyBirdCallout event={event} />
          ) : (
            <PriceWindowNote event={event} />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <PriceCard
              Icon={User}
              title="Individual"
              price={money(event.fee, event.currency)}
              priceNote="per pax"
              badge={event.priceWindow === 'EARLY_BIRD' ? 'Early bird' : undefined}
              bullets={CONFERENCE.ticketPerks.individual}
              soldOut={open && !soloOpen}
              soldOutNote="Every place has been taken."
              urgency={open && soloOpen ? seatsUrgency(event) : undefined}
              cta={open && soloOpen ? 'Register now' : undefined}
            />
            <PriceCard
              Icon={Users}
              title={`Table of ${tableSeats}`}
              price={money(event.tableFee, event.currency)}
              priceNote={`${tableSeats} pax · ${money(groupFee, event.currency)} per pax · one payment`}
              badge={
                saving > 0
                  ? `Group rate — save ${money(saving, event.currency)} per pax`
                  : event.priceWindow === 'EARLY_BIRD'
                    ? 'Early bird'
                    : undefined
              }
              bullets={CONFERENCE.ticketPerks.table}
              soldOut={open && !tableOpen}
              soldOutNote={
                soloOpen
                  ? 'Whole tables are sold out — individual places are still available.'
                  : 'Every place has been taken.'
              }
              urgency={open && tableOpen ? tablesUrgency(event) : undefined}
              cta={open && tableOpen ? `Book a table of ${tableSeats}` : undefined}
              highlight
            />
          </div>
        </div>
      )}
    </Section>
  )
}

/* Every figure here is the API's: the fee, the window boundaries, the room
   capacity and the next window's fee. Nothing is hardcoded, so the committee
   editing the pricing in the admin portal rewrites this paragraph too. */
function EarlyBirdCallout({ event }: { event: EventInfo }) {
  const from = sgDate(event.priceWindowStartsUtc)
  const to = sgDate(event.priceWindowEndsUtc)
  const next = event.nextPriceWindow
  const period = from && to ? ` from ${from} to ${to}` : to ? ` until ${to}` : ''
  return (
    <div
      className="rounded-lg border-2 border-accent bg-[#FFF5E6] p-5 sm:p-6"
      role="region"
      aria-labelledby="early-bird-heading"
    >
      <h3 id="early-bird-heading" className="text-xl text-primary">
        Grab your Early Bird Ticket now
      </h3>
      {event.capacity ? (
        <p className="mt-2 font-heading text-lg font-bold text-destructive tnum">
          Limited to the first {event.capacity.toLocaleString('en-SG')} paid registrations.
        </p>
      ) : null}
      <p className="mt-2 text-[16px] tnum">
        Early Bird Ticket of <strong>{money(event.fee, event.currency)} per pax</strong>
        {period}.
        {next && (
          <>
            {' '}
            Full Ticket price of <strong>{money(next.fee, event.currency)} per pax</strong> will apply
            after that.
          </>
        )}
      </p>
    </div>
  )
}

function seatsUrgency(event: EventInfo): string | undefined {
  const n = event.seatsRemaining
  if (n != null && n > 0 && n <= SEATS_URGENT) return `Only ${places(n)} left`
  return undefined
}

function tablesUrgency(event: EventInfo): string | undefined {
  const n = event.tablesRemaining
  if (n != null && n > 0 && n <= TABLES_URGENT)
    return n === 1 ? 'Only 1 table left' : `Only ${n} tables left`
  return undefined
}

/* Display-only sibling of Register's Option card — same visual recipe, but no
   fork semantics: the choice itself is made on /register, where it is guarded
   by the live counters at submit time. */
function PriceCard({
  Icon,
  title,
  price,
  priceNote,
  badge,
  bullets,
  soldOut,
  soldOutNote,
  urgency,
  cta,
  highlight = false,
}: {
  Icon: LucideIcon
  title: string
  price: string
  priceNote: string
  badge?: string
  bullets: string[]
  soldOut: boolean
  soldOutNote: string
  urgency?: string
  cta?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border bg-white p-6 ${
        highlight ? 'border-2 border-primary' : 'border-border'
      } ${soldOut ? 'opacity-70' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <h3 className="text-xl">{title}</h3>
        </div>
        {badge && (
          <span
            className="rounded-full bg-accent px-3 py-1 font-heading text-sm font-semibold
                       text-primary"
          >
            {badge}
          </span>
        )}
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

      {urgency && <p className="mt-3 font-semibold text-destructive">{urgency}</p>}

      {soldOut ? (
        <div className="mt-5">
          <Alert tone="warning" title="Not available">
            {soldOutNote}
          </Alert>
        </div>
      ) : (
        cta && (
          <div className="mt-5">
            <LinkButton to="/register" variant={highlight ? 'primary' : 'secondary'} className="w-full">
              {cta}
            </LinkButton>
          </div>
        )
      )}
    </div>
  )
}
