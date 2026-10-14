import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, UserRound } from 'lucide-react'
import { CONFERENCE, type Speaker } from '../../content/conference'
import { Section } from './Section'

export default function Speakers() {
  return (
    <Section id="speakers" title="Keynote and Workshop Speakers" kicker="On stage" tint="white">
      <div className="grid gap-4 sm:grid-cols-3">
        {CONFERENCE.speakers.map((s) => (
          <div key={s.name} className="rounded-lg border border-border bg-white p-5">
            {s.photo ? (
              // Served from public/, so the path must carry Vite's base.
              // Decorative: the name is right below it.
              <span className="block size-28 overflow-hidden rounded-full bg-surface">
                <img
                  src={`${import.meta.env.BASE_URL}${s.photo}`}
                  alt=""
                  width={98}
                  height={98}
                  loading="lazy"
                  className={`size-full object-cover ${s.photoFraming ?? 'object-[50%_20%]'}`}
                />
              </span>
            ) : (
              // Speaker not yet announced — a silhouette, not fake initials.
              <span className="grid size-28 place-items-center rounded-full bg-surface text-muted-fg">
                <UserRound className="size-10" aria-hidden="true" />
              </span>
            )}
            <h3 className="mt-4 text-lg">{s.name}</h3>
            <p className="text-[15px] text-secondary">{s.credentials}</p>
            {s.tagline && <p className="mt-1 text-[14px] text-muted-fg">{s.tagline}</p>}
            {s.session && <p className="mt-3 font-semibold text-secondary">{s.session}</p>}
            {s.blurb && <p className={`${s.session ? 'mt-1' : 'mt-3'} text-[16px] `}>{s.blurb}</p>}
            {s.message && <SpeakerMessage message={s.message} />}
            {s.bio && <SpeakerBio bio={s.bio} />}
          </div>
        ))}
      </div>
      {/* Honest for a page whose speakers are placeholders — and stays true
          once real ones land, since line-ups always grow. */}
      <p className="mt-4 text-[15px] text-muted-fg">More speakers to be announced.</p>
    </Section>
  )
}

/* Long speaker text opens on its first few lines behind a fade, with a
   "See more" toggle, and folds back up once scrolled past — the same
   behaviour as the letters in Testimonials. */
function Expandable({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const bodyId = useId()

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
    <div ref={ref}>
      <div className="relative">
        <div
          id={bodyId}
          className={`overflow-hidden transition-[max-height] duration-300 ease-out
                      ${open ? 'max-h-[200rem]' : 'max-h-58'} ${className}`}
        >
          {children}
        </div>
        {!open && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="mt-1 inline-flex min-h-11 items-center gap-1 font-heading font-semibold
                   text-primary underline-offset-4 hover:underline"
      >
        {open ? 'Show less' : 'See more'}
        <ChevronDown
          className={`size-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

/* The speaker's own words, set like the Testimonials letters (Alice). */
function SpeakerMessage({ message: m }: { message: NonNullable<Speaker['message']> }) {
  return (
    <div className="mt-4 border-t border-border pt-4">
      {m.heading && <p className="font-heading font-semibold text-primary">{m.heading}</p>}
      {/* Brand: quotes set in Alice. */}
      <Expandable className="mt-2 space-y-3 font-quote text-[17px] leading-relaxed">
        {m.salutation && <p>{m.salutation}</p>}
        {m.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {m.signoff && <p>{m.signoff}</p>}
        {m.signature && (
          <p className="not-italic font-body text-[15px] text-muted-fg">
            {m.signature.map((line, i) => (
              <span key={line} className={`block ${i === 0 ? 'font-semibold text-ink' : ''}`}>
                {line}
              </span>
            ))}
          </p>
        )}
      </Expandable>
    </div>
  )
}

/* A third-person bio — written about the speaker, not by them, so it stays in
   the body face rather than the quote face. */
function SpeakerBio({ bio }: { bio: NonNullable<Speaker['bio']> }) {
  return (
    <Expandable className="mt-3 space-y-3 text-[16px]">
      {bio.map((block) =>
        typeof block === 'string' ? (
          <p key={block}>{block}</p>
        ) : (
          <div key={block.heading}>
            <p className="font-heading font-semibold text-primary">{block.heading}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ),
      )}
    </Expandable>
  )
}
