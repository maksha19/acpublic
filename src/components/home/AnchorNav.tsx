/* Static jump strip under the hero — deliberately NOT sticky. The site header
   does not stick either; a pinned second bar costs phone height on a page
   people read once, top to bottom, and scrollspy highlighting would be scroll
   choreography, which this design system forbids. Plain fragment links (not
   router Links) so the browser moves the sequential-focus point into the
   target section for free. */

// Must match the ids Home's sections declare. FAQ last mirrors page order.
const ANCHORS = [
  { href: '#why', label: 'Why attend' },
  { href: '#speakers', label: 'Speakers' },
  { href: '#agenda', label: 'Agenda' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#venue', label: 'Venue' },
  { href: '#faq', label: 'FAQ' },
]

export default function AnchorNav() {
  return (
    <nav aria-label="On this page" className="bg-white print:hidden">
      <div className="mx-auto w-full max-w-5xl px-4 py-4">
        {/* flex-wrap, not overflow-x-auto: a scrolling strip hides later pills
            with no affordance on iOS. Six short pills wrap to two rows. */}
        <ul className="flex flex-wrap gap-2">
          {ANCHORS.map((a) => (
            <li key={a.href}>
              <a
                href={a.href}
                className="inline-flex min-h-11 items-center rounded-full border border-border
                           bg-white px-4 font-heading text-[15px] font-semibold text-primary
                           no-underline transition-colors duration-150 hover:border-primary
                           hover:bg-surface"
              >
                {a.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
