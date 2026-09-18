import { CONFERENCE } from '../../content/conference'
import { Section } from './Section'

export default function Agenda() {
  return (
    <Section id="agenda" title="Two days at a glance" kicker="Programme">
      <div className="grid gap-4 md:grid-cols-2">
        {CONFERENCE.agendaDays.map((day) => (
          <div key={day.label} className="rounded-lg border border-border bg-white p-5 sm:p-6">
            <h3 className="text-lg">{day.label}</h3>
            <ul className="mt-3">
              {day.items.map((item) => (
                <li
                  key={`${item.time} ${item.title}`}
                  className="flex gap-4 border-b border-border py-2.5 last:border-0"
                >
                  <span className="w-20 shrink-0 font-semibold text-primary tnum">{item.time}</span>
                  <span>
                    <span className="font-semibold">{item.title}</span>
                    {item.detail && (
                      <span className="block text-[15px] text-muted-fg" dangerouslySetInnerHTML={{ __html: item.detail }} />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[15px] text-muted-fg">
        Programme subject to changes
      </p>
    </Section>
  )
}
