import { ChevronDown } from 'lucide-react'
import { CONFERENCE } from '../../content/conference'
import { Section } from './Section'

/* Native <details>/<summary>: focusable, Enter/Space toggles, zero JS. No
   `name` attribute — auto-closing siblings disorients; each stays open until
   the reader closes it. No heading inside <summary>: an interactive element
   wrapping an h3 is announced inconsistently by screen readers, and the
   section h2 already names the region. */
export default function Faq() {
  return (
    <Section id="faq" title="Frequently asked questions" kicker="Before you ask" tint="white">
      <div className="divide-y divide-border rounded-lg border border-border bg-white">
        {CONFERENCE.faq.map((item) => (
          <details key={item.q} className="group px-5">
            <summary
              className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4
                         py-3 font-heading font-semibold text-primary
                         [&::-webkit-details-marker]:hidden"
            >
              {item.q}
              <ChevronDown
                className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="pb-4 text-[16px]">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-4 text-[15px] text-muted-fg">
        Something else? Write to{' '}
        <a
          href={`mailto:${CONFERENCE.district.contactEmail}`}
          className="font-semibold text-primary underline"
        >
          {CONFERENCE.district.contactEmail}
        </a>
        .
      </p>
    </Section>
  )
}
