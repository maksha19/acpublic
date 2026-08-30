import type { ReactNode } from 'react'

/* The one shape every landing band shares: a full-bleed tinted <section> with
   a contained column inside — the same idiom the site header and footer
   already use. Each section owns its background, so Home alternates
   surface/white/blue without wrapper divs, and no band ever needs a
   w-screen/-mx-4 breakout (which is how horizontal scrollbars happen). */

const TINTS = {
  default: 'bg-surface',
  white: 'bg-white',
  primary: 'bg-primary',
} as const

export type SectionTint = keyof typeof TINTS

export function Section({
  id,
  title,
  kicker,
  tint = 'default',
  children,
}: {
  id: string
  title: string
  kicker?: string
  tint?: SectionTint
  children: ReactNode
}) {
  const onBlue = tint === 'primary'
  return (
    // scroll-mt gives anchor jumps breathing room; nothing is sticky, so a
    // small offset is all that's needed.
    <section id={id} aria-labelledby={`${id}-heading`} className={`scroll-mt-6 ${TINTS[tint]}`}>
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
        {kicker && (
          <p
            className={`text-[13px] font-semibold uppercase tracking-[0.14em] ${
              onBlue ? 'text-white/75' : 'text-secondary'
            }`}
          >
            {kicker}
          </p>
        )}
        {/* text-white must win over the base-layer h2 colour on blue bands —
            utilities beat @layer base, so it does. */}
        <h2 id={`${id}-heading`} className={`mt-1 text-2xl sm:text-3xl ${onBlue ? 'text-white' : ''}`}>
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  )
}

/** A lettered circle standing in for the photo we do not have. There are no
 *  image assets in this repo at all, and an empty <img> box reads as broken —
 *  initials read as deliberate. aria-hidden because the name is always
 *  rendered right next to it. */
export function InitialsAvatar({
  name,
  className = 'size-14 text-lg',
}: {
  name: string
  className?: string
}) {
  const initials = name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-primary font-heading
                  font-semibold text-white ${className}`}
    >
      {initials}
    </span>
  )
}
