import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Sparkles, Ticket } from 'lucide-react'
import { money, sgDate } from '../../lib/format'
import type { EventInfo } from '../../lib/types'

/* The one thing on the hero that ticks. While the API says the early-bird
   window is the current one, count down to its end — days, hours, minutes,
   seconds — so the deadline is felt, not read. Every figure is the API's: the
   window end, the current fee and the next one. Nothing is hardcoded, so the
   committee moving the date on the admin Pricing page moves this clock.

   When the clock reaches zero the event query is refetched; the API then
   reports STANDARD as the window and this component renders nothing. */

const DAY = 86_400_000
const HOUR = 3_600_000
const MINUTE = 60_000

function split(ms: number) {
  const left = Math.max(ms, 0)
  return {
    days: Math.floor(left / DAY),
    hours: Math.floor((left % DAY) / HOUR),
    minutes: Math.floor((left % HOUR) / MINUTE),
    seconds: Math.floor((left % MINUTE) / 1000),
  }
}

export default function EarlyBirdCountdown({ event }: { event?: EventInfo }) {
  const queryClient = useQueryClient()
  const endsAt = event?.priceWindow === 'EARLY_BIRD' ? event.priceWindowEndsUtc : undefined
  const target = endsAt ? new Date(endsAt).getTime() : NaN
  const live = !!endsAt && !Number.isNaN(target)

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [live])

  const over = live && now >= target
  useEffect(() => {
    // Ask the API what applies now rather than guessing the next price here.
    if (over) void queryClient.invalidateQueries({ queryKey: ['event'] })
  }, [over, queryClient])

  if (!live || over || !event) return null

  const { days, hours, minutes, seconds } = split(target - now)
  const endsOn = sgDate(endsAt)
  const next = event.nextPriceWindow

  return (
    <div
      role="timer"
      aria-label={`Early bird pricing ends on ${endsOn ?? 'the published date'}`}
      className="ac-shimmer-border mt-7 rounded-xl p-[2px]"
    >
      <div className="rounded-[10px] bg-primary/95 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {/* A ticket that floats, inside a ring that pulses. Decorative:
                the text carries the meaning, and both stop under
                prefers-reduced-motion (index.css). */}
            <span className="ac-pulse-ring relative grid size-14 shrink-0 place-items-center rounded-full bg-accent text-primary">
              <Ticket className="ac-float size-7" aria-hidden="true" />
              <Sparkles
                className="ac-twinkle absolute -top-1 -right-1 size-5 text-white"
                aria-hidden="true"
              />
            </span>
            <div>
              <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
                <span className="ac-blink inline-block size-2 rounded-full bg-accent" aria-hidden="true" />
                Early bird ends in
              </p>
              <p className="mt-1 font-heading text-lg font-bold text-white sm:text-xl">
                {money(event.fee, event.currency)} per pax
                {next && (
                  <span className="font-normal text-white/80">
                    {' '}
                    · rises to {money(next.fee, event.currency)}
                    {endsOn ? ` after ${endsOn}` : ''}
                  </span>
                )}
              </p>
              {event.capacity ? (
                <p className="mt-0.5 text-[15px] text-white/75">
                  Limited to the first {event.capacity.toLocaleString('en-SG')} paid registrations.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3" aria-hidden="true">
            <Unit value={days} label={days === 1 ? 'Day' : 'Days'} />
            <Unit value={hours} label="Hours" />
            <Unit value={minutes} label="Mins" />
            <Unit value={seconds} label="Secs" hot />
          </div>
        </div>
      </div>
    </div>
  )
}

/** One tile. The digits are keyed by their value so a change remounts them
 *  and replays the drop-in animation — the seconds tile visibly ticks. */
function Unit({ value, label, hot = false }: { value: number; label: string; hot?: boolean }) {
  const text = String(value).padStart(2, '0')
  return (
    <div
      className={`flex min-w-[64px] flex-col items-center rounded-lg px-2 py-2 sm:min-w-[76px] sm:py-3 ${
        hot ? 'bg-accent text-primary' : 'bg-white/10 text-white'
      }`}
    >
      <span
        key={text}
        className="ac-tick font-display text-3xl font-bold leading-none tnum sm:text-4xl"
      >
        {text}
      </span>
      <span className={`mt-1 text-[12px] font-semibold uppercase tracking-wider ${hot ? 'text-primary/80' : 'text-white/70'}`}>
        {label}
      </span>
    </div>
  )
}
