import { CONFERENCE } from '../../content/conference'
import { InitialsAvatar, Section } from './Section'

export default function Speakers() {
  return (
    <Section id="speakers" title="Keynote speakers" kicker="On stage" tint="white">
      <div className="grid gap-4 sm:grid-cols-3">
        {CONFERENCE.speakers.map((s) => (
          <div key={s.name} className="rounded-lg border border-border bg-white p-5">
            <InitialsAvatar name={s.name} className="size-16 text-xl" />
            <h3 className="mt-4 text-lg">{s.name}</h3>
            <p className="text-[15px] text-muted-fg">{s.credentials}</p>
            <p className="mt-3 font-semibold text-secondary">{s.session}</p>
            <p className="mt-1 text-[16px] text-muted-fg">{s.blurb}</p>
          </div>
        ))}
      </div>
      {/* Honest for a page whose speakers are placeholders — and stays true
          once real ones land, since line-ups always grow. */}
      <p className="mt-4 text-[15px] text-muted-fg">More speakers to be announced.</p>
    </Section>
  )
}
