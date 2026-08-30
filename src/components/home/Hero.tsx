import { CalendarDays, MapPin } from 'lucide-react'
import { CONFERENCE } from '../../content/conference'
import { daysUntil } from '../../lib/format'
import { LinkButton } from '../ui'
import type { EventInfo } from '../../lib/types'

/* Renders instantly and completely without the API: the fallbacks mirror the
   seeded event, so the hero never pops in late or sits behind a spinner. The
   query result, when it lands, silently corrects anything that changed. */
export default function Hero({ event }: { event?: EventInfo }) {
  const fb = CONFERENCE.fallbackEvent
  const dateLabel = event?.dateLabel ?? fb.dateLabel
  const city = event?.city ?? fb.city
  const venue = event?.venue ?? CONFERENCE.venue.name
  const days = daysUntil(event?.startsOn ?? fb.startsOn)

  return (
    <div className="bg-primary text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:py-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/75">
          Toastmasters {CONFERENCE.district.name} · {city}
        </p>

        {/* One h1 for the whole page. Event name and theme are one heading in
            two visual registers — the theme is what posters lead with. */}
        <h1 className="mt-3 text-white">
          <span className="block text-2xl font-semibold text-white/90 sm:text-3xl">
            Annual Conference 2027
          </span>
          <span className="mt-1 block text-4xl sm:text-6xl">{CONFERENCE.hero.theme}</span>
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-white/85">{CONFERENCE.hero.tagline}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[16px]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-5 shrink-0" aria-hidden="true" />
            {dateLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-5 shrink-0" aria-hidden="true" />
            {venue}, {city}
          </span>
          {days !== null && (
            // A count, not a clock — computed once per render, nothing ticks.
            <span
              className="inline-flex items-center rounded-full bg-happy-yellow px-3 py-1
                         font-heading text-[15px] font-semibold text-loyal-blue"
            >
              {days === 0 ? 'Happening today' : days === 1 ? '1 day to go' : `${days} days to go`}
            </span>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton to="/register" variant="inverse">
            Register now
          </LinkButton>
          <LinkButton to="/my" variant="inverseOutline">
            Check my registration
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
