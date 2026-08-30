import { useQuery } from '@tanstack/react-query'
import { getEvent } from '../lib/api'
import Hero from '../components/home/Hero'
import AnchorNav from '../components/home/AnchorNav'
import WhyAttend from '../components/home/WhyAttend'
import Speakers from '../components/home/Speakers'
import Agenda from '../components/home/Agenda'
import Testimonials from '../components/home/Testimonials'
import Pricing from '../components/home/Pricing'
import HowItWorks from '../components/home/HowItWorks'
import VenueSection from '../components/home/VenueSection'
import Faq from '../components/home/Faq'
import Committee from '../components/home/Committee'
import FinalCta from '../components/home/FinalCta'

/* The landing page. Copy lives in src/content/conference.ts (one file to
   swap when the committee's real content arrives); section order is a
   conversion argument — value before speakers before agenda, testimonials
   directly before the price, objections (venue, FAQ) after it.

   Bands alternate surface/white with three blue anchors (hero, stat band,
   final CTA). Each section owns its background, full-bleed, with a contained
   column inside — Home deliberately renders OUTSIDE the app's Contained
   wrapper (see App.tsx). */
export default function Home() {
  /* Same query key as Register and Payment — one fetch feeds the site. The
     page does NOT gate on it: everything except prices reads fine from the
     content module while the API answers, or doesn't. Only Pricing shows
     loading and error states. */
  const { data: event, isLoading, error } = useQuery({ queryKey: ['event'], queryFn: getEvent })

  return (
    <div>
      <Hero event={event} />
      <AnchorNav />
      <WhyAttend />
      <Speakers />
      <Agenda />
      <Testimonials />
      <Pricing event={event} isLoading={isLoading} error={error} />
      <HowItWorks />
      <VenueSection event={event} />
      <Faq />
      <Committee />
      <FinalCta event={event} />
    </div>
  )
}
