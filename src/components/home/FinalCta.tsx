import { CONFERENCE } from '../../content/conference'
import { money } from '../../lib/format'
import { LinkButton } from '../ui'
import type { EventInfo } from '../../lib/types'

/* For readers who consumed the whole page — the CTA that meets them at the
   bottom so they never have to scroll back up. Hidden in print: a call to
   action on paper is a dead button. */
export default function FinalCta({ event }: { event?: EventInfo }) {
  return (
    <section id="register-cta" aria-labelledby="register-cta-heading" className="bg-primary print:hidden">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center sm:py-16">
        <h2 id="register-cta-heading" className="text-2xl text-white sm:text-3xl">
          {CONFERENCE.finalCta.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-white/85">{CONFERENCE.finalCta.body}</p>
        {/* Price only when the API said so — never a hardcoded number. */}
        {event && (
          <p className="mt-4 font-heading text-xl font-bold text-white tnum">
            {money(event.fee, event.currency)} per place
            {event.priceWindow === 'EARLY_BIRD' && (
              <span className="ml-2 font-body text-[15px] font-semibold">— early-bird price</span>
            )}
          </p>
        )}
        <div className="mt-6 flex justify-center">
          <LinkButton to="/register" variant="inverse">
            Register now
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
