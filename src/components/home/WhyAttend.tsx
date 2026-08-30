import { CONFERENCE } from '../../content/conference'
import { Section } from './Section'

export default function WhyAttend() {
  const { whyAttend, district } = CONFERENCE
  return (
    <>
      <Section id="why" title="Why attend" kicker="Two days, one district">
        {/* Four items: 2 then 4, never 3 — a 3-column grid leaves one card
            orphaned on its own row. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyAttend.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-lg border border-border bg-white p-5">
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-3 text-lg">{title}</h3>
              <p className="mt-1 text-[16px] text-muted-fg">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Stat band. The district itself is the social proof — 4,500 members
          is a bigger endorsement than any quote on this page. */}
      <div className="bg-primary">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:py-10">
          {district.stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-white tnum sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-[15px] text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
