import { Quote } from 'lucide-react'
import { CONFERENCE } from '../../content/conference'
import { InitialsAvatar, Section } from './Section'

/* Placed directly before Pricing on purpose: the last thing read before the
   ask should be "people like me loved this", not a schedule. */
export default function Testimonials() {
  return (
    <Section id="testimonials" title="What members say" kicker="Heard after past conferences" tint="white">
      <div className="grid gap-4 md:grid-cols-3">
        {CONFERENCE.testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-lg border border-border bg-white p-5"
          >
            <Quote className="size-6 text-secondary" aria-hidden="true" />
            {/* Brand: quotes set in Alice, italic. */}
            <blockquote className="mt-3 flex-1 font-quote italic">{t.quote}</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <InitialsAvatar name={t.name} className="size-10 text-sm" />
              <span>
                <span className="block font-semibold">{t.name}</span>
                <span className="block text-[15px] text-muted-fg">{t.club}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}
