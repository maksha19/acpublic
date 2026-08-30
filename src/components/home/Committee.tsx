import { CONFERENCE } from '../../content/conference'
import { InitialsAvatar, Section } from './Section'

/* Near the footer on purpose: a trust signature, not conversion content. */
export default function Committee() {
  const { committee, district } = CONFERENCE
  return (
    <Section id="committee" title="Organising committee" kicker="The people behind it">
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {committee.map((m) => (
          <li key={m.name} className="rounded-lg border border-border bg-white p-4 text-center">
            <InitialsAvatar name={m.name} className="mx-auto size-12 text-base" />
            <p className="mt-3 font-semibold leading-snug">{m.name}</p>
            <p className="text-[15px] text-muted-fg">{m.role}</p>
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
