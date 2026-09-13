import { CONFERENCE } from '../../content/conference'
import { InitialsAvatar, Section } from './Section'

/* Near the footer on purpose: a trust signature, not conversion content.
   Three tiers, in the order the committee lists them — advisors, the chair,
   then each portfolio with its chair and team. Around forty names: a grid of
   portfolio cards keeps it scannable where one long list would not be. */
export default function Committee() {
  const { committee, district } = CONFERENCE
  return (
    <Section id="committee" title="Organising committee" kicker="The people behind it">
      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        {/* The conference chair: one card, largest avatar. */}
        <div className="flex items-center gap-4 rounded-lg border-2 border-primary bg-white p-5">
          <InitialsAvatar name={committee.chair} className="size-14 text-lg" />
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">
              Conference Chair
            </p>
            <p className="font-heading text-lg font-bold text-primary">{committee.chair}</p>
          </div>
        </div>

        {/* District leadership advising the conference. */}
        <div className="rounded-lg border border-border bg-white p-5">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">
            Advisors
          </h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {committee.advisors.map((a) => (
              <li key={a.name} className="flex items-center gap-3">
                <InitialsAvatar name={a.name} className="size-10 text-sm" />
                <span>
                  <span className="block font-semibold leading-snug">{a.name}</span>
                  <span className="block text-[15px] text-muted-fg">{a.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* One card per portfolio: chair named first, then the team. */}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {committee.portfolios.map((p) => (
          <li key={p.name} className="rounded-lg border border-border bg-white p-5">
            <h3 className="text-lg">{p.name}</h3>
            <p className="mt-2 flex items-center gap-3">
              <InitialsAvatar name={p.chair} className="size-9 text-[13px]" />
              <span>
                <span className="block font-semibold leading-snug">{p.chair}</span>
                <span className="block text-[14px] text-muted-fg">Chair</span>
              </span>
            </p>
            {p.team.length > 0 && (
              <ul className="mt-3 border-t border-border pt-3 text-[16px]">
                {p.team.map((m) => (
                  <li key={m} className="py-0.5">
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[15px] text-muted-fg">
        Reach the team at{' '}
        <a
          href={`mailto:${district.contactEmail}`}
          className="font-semibold text-primary underline"
        >
          {district.contactEmail}
        </a>
        .
      </p>
    </Section>
  )
}
