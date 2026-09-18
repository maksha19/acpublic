import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CONFERENCE } from '../../content/conference'
import type { FaqItem } from '../../content/conference'
import { Section } from './Section'

/* Two levels of native <details>/<summary>: a category opens to its
   questions, each question opens to its answer. Focusable, Enter/Space
   toggles, zero JS. No `name` attribute at either level — auto-closing
   siblings disorients; everything stays open until the reader closes it.
   The first category starts open so the section never reads as an empty
   list of four headings. No heading element inside <summary>: an interactive
   element wrapping an h3 is announced inconsistently by screen readers, and
   the section h2 already names the region. */
export default function Faq() {
  return (
    <Section id="faq" title="Frequently Asked Questions (FAQs)" kicker="Before you ask" tint="white">
      <div className="space-y-3">
        {CONFERENCE.faq.map((category, i) => (
          <details
            key={category.name}
            open={i === 0}
            className="group/cat rounded-lg border border-border bg-white"
          >
            <summary
              className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4
                         px-5 py-3 font-heading text-lg font-semibold text-primary
                         [&::-webkit-details-marker]:hidden"
            >
              {category.name}
              <ChevronDown
                className="size-5 shrink-0 transition-transform duration-200 group-open/cat:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="divide-y divide-border border-t border-border">
              {category.items.map((item) => (
                <Question key={item.q} item={item} />
              ))}
            </div>
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

function Question({ item }: { item: FaqItem }) {
  const paragraphs = Array.isArray(item.a) ? item.a : [item.a]
  return (
    <details className="group/q px-5 pl-8">
      <summary
        className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4
                   py-3 font-semibold text-primary [&::-webkit-details-marker]:hidden"
      >
        {item.q}
        <ChevronDown
          className="size-4 shrink-0 transition-transform duration-200 group-open/q:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="space-y-2 pb-4 text-[16px]">
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {item.link && <AnswerLink {...item.link} />}
      </div>
    </details>
  )
}

/* "#agenda" is a same-page jump — a plain anchor, so the browser moves focus
   into the section. "/register" is a route — a router Link, so it does not
   reload the app. */
function AnswerLink({ label, href }: { label: string; href: string }) {
  const cls = 'inline-flex min-h-11 items-center font-semibold text-primary underline'
  return href.startsWith('#') ? (
    <a href={href} className={cls}>
      {label}
    </a>
  ) : (
    <Link to={href} className={cls}>
      {label}
    </Link>
  )
}
