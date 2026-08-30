import { Car, ExternalLink, Hotel, MapPin, Train } from 'lucide-react'
import { CONFERENCE } from '../../content/conference'
import { Section } from './Section'
import type { EventInfo } from '../../lib/types'

export default function VenueSection({ event }: { event?: EventInfo }) {
  const v = CONFERENCE.venue
  // The API is authoritative for the venue NAME (the committee edits the
  // seed); the directions below are content-file copy for the same place.
  const name = event?.venue ?? v.name

  return (
    <Section id="venue" title="Venue & getting there" kicker="Plan your day">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
          <h3 className="text-lg">{name}</h3>
          <p className="mt-2 flex items-start gap-2 text-[16px]">
            <MapPin className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
            {v.address}
          </p>
          <a
            href={v.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-primary
                       underline"
          >
            Open in Google Maps
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
          <h3 className="text-lg">Getting there</h3>
          <ul className="mt-3 space-y-3">
            <li className="flex gap-3">
              <Train className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="block font-semibold">By MRT</span>
                <span className="text-[16px] text-muted-fg">{v.mrt}</span>
              </span>
            </li>
            <li className="flex gap-3">
              <Car className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="block font-semibold">Driving</span>
                <span className="text-[16px] text-muted-fg">{v.parking}</span>
              </span>
            </li>
            {v.notes.map((note) => (
              <li key={note} className="flex gap-3">
                <Hotel className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">Staying over</span>
                  <span className="text-[16px] text-muted-fg">{note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
