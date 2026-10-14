import { UserRound } from 'lucide-react'
import { CONFERENCE } from '../../content/conference'
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
              <img
                src={`${import.meta.env.BASE_URL}${s.photo}`}
                alt=""
                width={96}
                height={96}
                loading="lazy"
                className="size-24 rounded-full object-cover object-[50%_30%]"
              />
            ) : (
              // Speaker not yet announced — a silhouette, not fake initials.
              <span className="grid size-24 place-items-center rounded-full bg-surface text-muted-fg">
                <UserRound className="size-10" aria-hidden="true" />
              </span>
            )}
            <h3 className="mt-4 text-lg">{s.name}</h3>
            <p className="text-[15px] text-secondary">{s.credentials}</p>
            {s.session && <p className="mt-3 font-semibold text-secondary">{s.session}</p>}
            <p className={`${s.session ? 'mt-1' : 'mt-3'} text-[16px] `}>{s.blurb}</p>
          </div>
        ))}
      </div>
      {/* Honest for a page whose speakers are placeholders — and stays true
          once real ones land, since line-ups always grow. */}
      <p className="mt-4 text-[15px] text-muted-fg">More speakers to be announced.</p>
    </Section>
  )
}
