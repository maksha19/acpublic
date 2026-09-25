import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Quote } from 'lucide-react'
import { CONFERENCE, type MemberMessage } from '../../content/conference'
import { InitialsAvatar, Section } from './Section'

/* Placed directly before Pricing on purpose: the last thing read before the
   ask should be a voice the member trusts, not a schedule. Each message is
   set as a letter — greeting, paragraphs, sign-off — rather than a pull
   quote, because that is what the writers sent.

   Letters are long, so a card opens at a fixed height with a fade and a
   "Read the full story" button; it folds back up on its own once the reader
   has scrolled past it, so the page never stays stretched behind them. */
export default function Testimonials() {
  return (
    <Section id="testimonials" title="What members say" kicker="Your voices. Your inspiration." tint="white">
      <div className="grid gap-5 md:grid-cols-2">
        {CONFERENCE.memberMessages.map((m) => (
          <MessageCard key={m.name} message={m} />
        ))}
      </div>
    </Section>
  )
}

/** Collapsed height: roughly the greeting and first paragraph. */
const COLLAPSED = 'max-h-44'

function MessageCard({ message: m }: { message: MemberMessage }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const bodyId = useId()

  // Auto-collapse when the whole card has left the viewport. Only watched
  // while open, so a closed card costs nothing.
  useEffect(() => {
    if (!open) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setOpen(false)
      },
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [open])

  return (
    <figure ref={ref} className="flex flex-col rounded-lg border border-border bg-white p-6 sm:p-7">
      <Quote className="size-7 text-secondary" aria-hidden="true" />

      <div className="relative">
        {/* Brand: quotes set in Alice, italic. */}
        <blockquote
          id={bodyId}
          className={`mt-4 space-y-3 overflow-hidden font-quote text-[18px] italic leading-relaxed
                      transition-[max-height] duration-300 ease-out ${open ? 'max-h-[200rem]' : COLLAPSED}`}
        >
          {m.salutation && <p>{m.salutation}</p>}
          {m.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {m.signoff && <p>{m.signoff}</p>}
        </blockquote>
        {!open && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="mt-3 inline-flex min-h-11 items-center gap-1 self-start font-heading font-semibold
                   text-primary underline-offset-4 hover:underline"
      >
        {open ? 'Show less' : 'Read the full story'}
        <ChevronDown
          className={`size-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <figcaption className="mt-5 flex items-center gap-4 border-t border-border pt-5">
        {m.photo ? (
          // Served from public/, so the path must carry Vite's base or it
          // 404s on GitHub Pages. Decorative: the name is right beside it.
          <span className="size-12 shrink-0 overflow-hidden rounded-full">
            <img
              src={`${import.meta.env.BASE_URL}${m.photo}`}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              className="size-full origin-[48%_30%] object-cover"
            />
          </span>
        ) : (
          <InitialsAvatar name={m.name} className="size-12 text-base" />
        )}
        <span>
          <span className="block font-heading text-lg font-semibold">{m.name}</span>
          <span className="block text-[15px] text-muted-fg">{m.title}</span>
        </span>
      </figcaption>
    </figure>
  )
}
