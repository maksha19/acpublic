/* ============================================================================
 * MOCK CONTENT — DO NOT PUBLISH AS-IS
 *
 * This file is the landing page's copy deck, and the ONLY file to edit when
 * the committee supplies the real content. Every field group below is flagged:
 *
 *   [REAL] — verified fact (District 80 public site, or mirrors the seeded
 *            event in ac-infra/scripts/seed.py)
 *   [MOCK] — invented to demonstrate the layout; replace before launch
 *
 * Flags live in comments only. Nothing here may render a "[MOCK]" string —
 * the page must look real to demo well, which is exactly why this banner
 * exists.
 *
 * Two values are duplicated OUTSIDE this file and must be changed together:
 *   - venue.name        ↔ ac-infra/scripts/seed.py EVENT["venue"] (the API is
 *                         authoritative; this copy is the offline fallback)
 *   - district.name     ↔ ac-public/index.html <title> and meta description
 * ========================================================================== */

import type { LucideIcon } from 'lucide-react'
import { Award, Mic, Trophy, Users } from 'lucide-react'

export interface Stat {
  value: string
  label: string
}

export interface SocialLink {
  label: string
  href: string
}

export interface WhyAttendItem {
  Icon: LucideIcon
  title: string
  body: string
}

export interface Speaker {
  name: string
  credentials: string
  session: string
  blurb: string
}

export interface AgendaItem {
  time: string
  title: string
  detail?: string
}

export interface AgendaDay {
  label: string
  items: AgendaItem[]
}

export interface VenueDetails {
  /** Must match seed.py EVENT["venue"] — see the header note. */
  name: string
  address: string
  mapsUrl: string
  mrt: string
  parking: string
  notes: string[]
}

export interface CommitteeMember {
  name: string
  role: string
}

/** One portfolio of the organising committee: a chair and their team. */
export interface Portfolio {
  name: string
  chair: string
  team: string[]
}

export interface Committee {
  /** District leadership advising the conference. */
  advisors: CommitteeMember[]
  chair: string
  portfolios: Portfolio[]
}

export interface Testimonial {
  quote: string
  name: string
  club: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface ConferenceContent {
  district: {
    name: string
    stats: Stat[]
    socials: SocialLink[]
    contactEmail: string
  }
  /** Mirrors seed.py EVENT so the hero renders before (or without) the API.
   *  If the seed's dates change, change these too. */
  fallbackEvent: { dateLabel: string; startsOn: string; city: string }
  /** The theme is the committee's headline; `highlights` is the programme in
   *  four words each, as printed on the poster. */
  hero: { theme: string; tagline: string; highlights: string[] }
  whyAttend: WhyAttendItem[]
  speakers: Speaker[]
  agendaDays: AgendaDay[]
  ticketPerks: { individual: string[]; table: string[] }
  venue: VenueDetails
  committee: Committee
  testimonials: Testimonial[]
  faq: FaqItem[]
  finalCta: { heading: string; body: string }
}

export const CONFERENCE: ConferenceContent = {
  /* [REAL] — district facts and social profiles from d80toastmasters.org.
     The contact email is [MOCK]: the domain is real, the mailbox is invented. */
  district: {
    name: 'District 80',
    stats: [
      { value: '200+', label: 'clubs' },
      { value: '4,500+', label: 'members' },
      { value: '9', label: 'divisions' },
      { value: '45', label: 'areas' },
    ],
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/District80' },
      { label: 'Instagram', href: 'https://www.instagram.com/district80_toastmasters' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/toastmasters-district-80/' },
      { label: 'YouTube', href: 'https://www.youtube.com/@singaporetoastmastersdistr9843' },
    ],
    contactEmail: 'ac2027@d80toastmasters.org',
  },

  /* [REAL] — committee's dates (13 Sep 2026); mirrors ac-infra/scripts/seed.py EVENT. */
  fallbackEvent: { dateLabel: '29–30 May 2027', startsOn: '2027-05-29', city: 'Singapore' },

  /* [REAL] — the committee's theme and event highlights (13 Sep 2026). The
     tagline is ours, written around them. */
  hero: {
    theme: 'Your Story, Your Stage',
    tagline:
      'Two days of keynotes, champion insights, the speech contest finals and a gala dinner — with Toastmasters from every corner of Singapore.',
    highlights: ['Keynote Speeches', 'Champion Insights', 'Speech Contest Finals', 'Gala Dinner'],
  },

  /* The four titles are the committee's [REAL] event highlights; the body
     copy is [MOCK] and the member/club numbers in "Champion insights" are [REAL]. */
  whyAttend: [
    {
      Icon: Mic,
      title: 'Keynote speeches',
      body: 'Speakers at the top of their craft on what it takes to find your story — and tell it so it lands.',
    },
    {
      Icon: Users,
      title: 'Champion insights',
      body: 'Past champions and district leaders on how they got there, in conversation with members from 200+ clubs.',
    },
    {
      Icon: Trophy,
      title: 'Speech contest finals',
      body: 'The International Speech and Table Topics finals — the best of District 80 on one stage.',
    },
    {
      Icon: Award,
      title: 'Gala dinner',
      body: 'Saturday night: dinner, awards and a year of club achievements, honoured properly.',
    },
  ],

  /* [MOCK] — invented speakers, kept distinct from the seeded demo attendees
     so a demo never shows the same fake person on stage and in the queue. */
  speakers: [
    {
      name: 'Hani Nur Zaihanirah Zaini, DTM. ',
      credentials: 'International Director,',
      session: 'Leading Beyond the Lectern',
      blurb: '    She made history as the first Sarawakian woman elected to the Toastmasters International Board of Directors. She will share her journey and the lessons she learned along the way.',
    },
    // {
    //   name: 'Rizal Hamid',
    //   credentials: 'Accredited Speaker',
    //   session: 'The Story Only You Can Tell',
    //   blurb: 'Why the speech that scares you most is the one your audience came for — and why this is your stage.',
    // },
    // {
    //   name: 'Sanjay Krishnamoorthy, DTM',
    //   credentials: 'Region Advisor, Region 14',
    //   session: 'From Member to Movement',
    //   blurb: 'How ordinary clubs become the ones everyone wants to join.',
    // },
  ],

  /* Day labels are [REAL] (29 May 2027 is a Saturday). The four highlight
     slots are [REAL] programme items; times and everything else are [MOCK] —
     the printed programme is the committee's call. */
  agendaDays: [
    {
      label: 'Day 1 — Saturday 29 May',
      items: [
        { time: '08:30', title: 'Registration and coffee' },
        { time: '09:30', title: 'Opening ceremony' },
        { time: '10:15', title: 'Keynote speech', detail: 'Leading Beyond the Lectern' },
        { time: '11:30', title: 'Champion insights', detail: 'Past champions in conversation' },
        { time: '13:00', title: 'Lunch' },
        { time: '14:30', title: 'International Speech Contest final' },
        { time: '17:00', title: 'Break — check in, dress up' },
        { time: '19:00', title: 'Gala dinner and awards night' },
      ],
    },
    {
      label: 'Day 2 — Sunday 30 May',
      items: [
        { time: '09:00', title: 'Table Topics Contest final' },
        { time: '11:00', title: 'Keynote speech', detail: 'The Story Only You Can Tell' },
        { time: '12:30', title: 'Lunch' },
        { time: '14:00', title: 'Education sessions' },
        { time: '15:30', title: 'Hall of Fame and closing ceremony' },
        { time: '16:30', title: 'Carriages' },
      ],
    },
  ],

  /* Inclusions are [MOCK]; the table bullets about sitting together and one
     payment are [REAL] system behaviour. */
  ticketPerks: {
    individual: [
      'Every keynote, workshop and contest final across both days',
      'Lunch on both days',
      'Saturday gala dinner',
    ],
    table: [
      'Everything in the individual ticket — for all ten places',
      'The group rate: a lower price per place than booking one at a time',
      'Your club sits together',
      'One payment and one screenshot for the whole table',
    ],
  },

  /* [REAL] name and address — the committee's venue (13 Sep 2026). name must
     match seed.py (see header). The MRT and parking lines are [TBC]: the
     nearest station is right, the walking time and carpark details need
     confirming with the venue before launch. */
  venue: {
    name: 'The Istana Ballroom',
    address: '11 Tanjong Katong Road, Singapore 437157',
    mapsUrl: 'https://maps.google.com/?q=11+Tanjong+Katong+Road+Singapore+437157',
    mrt: 'Paya Lebar (EW8 / CC9) is the nearest station — about a ten-minute walk along Tanjong Katong Road.',
    parking: 'Parking is available at the venue and nearby — rates to be confirmed.',
    notes: [],
  },

  /* [REAL] — the D80 AC2027 organising committee as supplied by the
     committee (13 Sep 2026). Names and post-nominals exactly as given. */
  committee: {
    advisors: [
      { name: 'Aaron Ting, DTM', role: 'District Director' },
      { name: 'George Chew, DTM', role: 'Program Quality Director' },
      { name: 'Zuhriyyah Ariffin', role: 'Club Growth Director' },
    ],
    chair: 'Ho Chu Lin, DTM',
    portfolios: [
      { name: 'Program', chair: 'Jenny Goh', team: ['Eugene Low', 'Anne Lee'] },
      {
        name: 'Gala Night',
        chair: 'Julie Ong, DTM',
        team: ['Kathyrn Galatis', 'Robekka Purba', 'Edmund Chew, DTM'],
      },
      { name: 'Publicity', chair: 'Goh Shu Ching', team: ['Suzanne Loh, DTM', 'Gordon Yit'] },
      {
        name: 'Marketing',
        chair: 'Lim Jun Jie, DTM',
        team: ['Veron Lee, DTM', 'Alice Cheong, DTM', 'Yip Li Xian'],
      },
      { name: 'Sponsorship', chair: 'Wiwiek Najihah', team: ['Li Shan Shan, DTM', 'Terry Lee, DTM'] },
      {
        name: 'Admin & Registration',
        chair: 'Lim Cheng Boon, DTM',
        team: ['Jocelyn Lee', 'Michael Yonathan', 'Jhunilyn Ofiana', 'Niza Khalil, DTM', 'Sandy Goh'],
      },
      { name: 'Finance', chair: 'Charlene Wong', team: ['Koh Mee Zhen'] },
      {
        name: 'Logistics',
        chair: 'Jamal Shahul Hameed',
        team: ['Ma. Theresa Ang', 'Govindan Rathakrishnan', 'Tan Yan Kit'],
      },
      { name: 'Hospitality', chair: 'Sam Lim, DTM', team: ['Patricia Lum, DTM', 'Mark Alan Franco Opao'] },
      {
        name: 'Technical',
        chair: 'Manikandan Shanmugam',
        team: ['Bimla Bai Jeyasingh', 'Sankar Palani, DTM'],
      },
    ],
  },

  /* [MOCK] — invented quotes about a past conference. Replace with real,
     attributed quotes (with permission) or delete the section's data. */
  testimonials: [
    {
      quote:
        'I came for the contest final and left with three new mentors. Nothing else in the Toastmasters year puts this many good people in one room.',
      name: 'Jackie Tan',
      club: 'Katong Toastmasters',
    },
    {
      quote:
        'Our club booked a table and it changed our year — we planned the whole club calendar over the gala dinner.',
      name: 'Firdaus Zainal',
      club: 'Alexandra Communicators',
    },
    {
      quote:
        'The workshops alone were worth the fee. I used what I learned in a client pitch the following Tuesday.',
      name: 'Dinesh Sundaram',
      club: 'Seletar Speakers',
    },
  ],

  /* Answers 1–6 are [REAL] — they describe how this system actually works.
     Answers 7–10 are [MOCK/TBC] pending committee decisions. */
  faq: [
    {
      q: 'How do I pay?',
      a: 'Register first — your confirmation email carries the bank transfer and PayNow details together with your code. Pay, take a screenshot, and upload it on the payment page. The registration team checks every payment by hand.',
    },
    {
      q: 'When is my place confirmed?',
      a: 'As soon as the team verifies your payment, you get a confirmation email. Until then your place is reserved, not confirmed.',
    },
    {
      q: 'Can my club book a table?',
      a: 'Yes — a table seats ten, is booked in one go with one payment, and gets the group rate: a lower price per place. You do not need all ten names up front: add your guests any time until 24 May 2027, and each guest is emailed their own code as you name them.',
    },
    {
      q: 'Can I change my details later?',
      a: 'Yes. Your confirmation email has a personal My Registration link — use it to update your dietary needs, t-shirt size and contact details.',
    },
    {
      q: 'What is the code in my email?',
      a: 'Your registration code, for example AC27-0042. Guests on a table get their own codes ending -01 to -09. Quote it whenever you write to the organisers.',
    },
    {
      q: 'What if my table has empty places?',
      a: 'Unused places are not refunded, but they are not lost either — you can name a guest to an empty place any time before the roster closes on 24 May 2027.',
    },
    {
      q: 'What does the fee include?',
      a: 'All keynote speeches, champion insight sessions and contest finals across both days, lunch on both days, and the Saturday gala dinner. Early-bird and group prices are shown in the Tickets section and change on the dates given there.',
    },
    {
      q: 'What is the dress code?',
      a: 'Business or smart casual for the day programme. The Saturday gala dinner is formal — national dress very welcome.',
    },
    {
      q: 'Can I bring a guest who is not a Toastmaster?',
      a: 'Yes — friends and family are welcome. Every attendee needs a registered place, member or not.',
    },
    {
      q: 'How do I get there, and can I park?',
      a: 'The Istana Ballroom is at 11 Tanjong Katong Road, a short walk from Paya Lebar MRT (EW8 / CC9). Driving, parking is available at and around the venue — see the venue section for details.',
    },
  ],

  /* [MOCK] heading and body; the live fee shown next to it comes from the API. */
  finalCta: {
    heading: 'Your story. Your stage. Your seat is waiting.',
    body: 'Join three hundred Toastmasters for two days of keynote speeches, champion insights, the contest finals and the gala dinner — and be in the room when District 80 takes the stage.',
  },
}
