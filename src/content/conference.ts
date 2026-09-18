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
  /** One paragraph, or several rendered in order (steps, caveats). */
  a: string | string[]
  /** An in-site pointer rendered after the answer: "#agenda" jumps on this
   *  page, "/register" is a route. External URLs are deliberately not
   *  supported here — every FAQ answer should land somewhere on this site. */
  link?: { label: string; href: string }
}

/** FAQ is two levels: a category, then its questions. */
export interface FaqCategory {
  name: string
  items: FaqItem[]
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
  faq: FaqCategory[]
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

  /* [REAL] — the committee's theme, tagline and event highlights (13 and
     18 Sep 2026). */
  hero: {
    theme: 'Your Story, Your Stage.',
    tagline: 'Two Days of Stories. One Stage. A Lifetime of Inspiration.',
    highlights: ['Keynote Speeches', 'Champion Insights', 'Speech Contest Finals', 'Gala Dinner'],
  },

  /* The four titles are the committee's [REAL] event highlights. The speech
     contest and Gala Night copy is the committee's (18 Sep 2026); the keynote
     and champion-insights body copy is [MOCK] (the club count is [REAL]). */
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
      title: 'Speech contest',
      body: 'Exciting District finals for International Speech, Table Topics and Evaluation — the best of District 80 on one stage.',
    },
    {
      Icon: Award,
      title: 'Gala Night',
      body: 'An elegant evening of culinary artistry and celebration, dedicated to honouring our achievements and inspiring a brighter future.',
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

  /* Day labels are [REAL] (29 May 2027 is a Saturday). Which contests run on
     which day is [REAL] — it is what the committee's FAQ says (18 Sep 2026) —
     and the FAQ links here, so keep the two in step. Times and everything
     else are [MOCK]; the printed programme is the committee's call. */
  agendaDays: [
    {
      label: 'Day 1 — Saturday 29 May',
      items: [
        { time: '08:30', title: 'Registration and coffee' },
        { time: '09:30', title: 'Opening ceremony' },
        { time: '10:15', title: 'Keynote speech', detail: 'Leading Beyond the Lectern' },
        { time: '11:30', title: 'Champion insights', detail: 'Past champions in conversation' },
        { time: '13:00', title: 'Lunch' },
        {
          time: '14:30',
          title: 'District Table Topics and Evaluation Contests',
          detail: 'Division L and V International Speech and Evaluation contests run concurrently',
        },
        { time: '17:00', title: 'Break — check in, dress up' },
        { time: '19:00', title: 'Gala Night' },
      ],
    },
    {
      label: 'Day 2 — Sunday 30 May',
      items: [
        { time: '09:00', title: 'District International Speech Contest' },
        { time: '11:00', title: 'Keynote speech', detail: 'The Story Only You Can Tell' },
        { time: '12:30', title: 'Lunch' },
        { time: '14:00', title: 'Education sessions' },
        { time: '15:30', title: 'Hall of Fame and closing ceremony' },
        { time: '16:30', title: 'Carriages' },
      ],
    },
  ],

  /* Inclusions are [REAL] — the committee's "What does my ticket cover?" FAQ
     answer (18 Sep 2026). The table bullets about sitting together and one
     payment are [REAL] system behaviour. */
  ticketPerks: {
    individual: [
      'Opening and closing ceremonies, keynote speech and educational workshops',
      'District Speech Contests',
      'Breakfast and lunch on both days, and the Gala Dinner',
    ],
    table: [
      'Everything in the individual ticket — for all ten pax',
      'Your club sits together',
      'One payment and one proof of payment for the whole table',
    ],
  },

  /* [REAL] name and address — the committee's venue (13 Sep 2026). name must
     match seed.py (see header). MRT and parking are [REAL] from the
     committee's FAQ (18 Sep 2026); the walking time is ours. */
  venue: {
    name: 'The Istana Ballroom',
    address: 'Kinex Mall, Level 3, 11 Tanjong Katong Road, Singapore 437157',
    mapsUrl: 'https://maps.google.com/?q=11+Tanjong+Katong+Road+Singapore+437157',
    mrt: 'Paya Lebar (EW8 / CC9) is the nearest station — about a ten-minute walk along Tanjong Katong Road.',
    parking:
      'Parking is available at Kinex Mall, Levels 4 and 5. There is no complimentary parking coupon — standard mall parking rates apply.',
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

  /* [REAL] — the committee's FAQ (18 Sep 2026), grouped as they grouped it.
     Three answers carry committee-side caveats and may change:
       - "How do I pay?"      — bank details were "xxxxx" in the brief; we point
                                 at the acknowledgement email, which carries the
                                 live details from the API.
       - Refunds              — the 31 March 2027 date is "to verify with DFM".
       - Dress code           — Gala Night dress code is with the Gala chair.
     The two table questions are ours and describe [REAL] system behaviour. */
  faq: [
    {
      name: 'Tickets & Registration',
      items: [
        {
          q: 'How can I register for the conference?',
          a: [
            'We have set up an easy 3-step registration process on this website.',
            'Step 1 — Register. Step 2 — Pay and upload proof of payment. Step 3 — Confirmation.',
            'You will receive an email notification for each step.',
          ],
          link: { label: 'Register now', href: '/register' },
        },
        {
          q: 'How do I pay?',
          a: 'Please make payment via bank transfer. The bank account details and your unique registration code are in the acknowledgement email you receive on registering — quote the code as your payment reference, then upload your proof of payment on the payment page.',
        },
        {
          q: 'How do I know if my registration is confirmed?',
          a: 'You will receive an email confirmation upon successful registration with payment.',
        },
        {
          q: 'What does my ticket cover?',
          a: 'The Full Conference ticket covers the 2-day conference package: the Opening and Closing Ceremonies, Keynote Speech, Educational Workshops, District Speech Contests and Gala Dinner.',
        },
        {
          q: 'Can I get a refund if I am no longer able to attend?',
          a: 'Full refunds are possible before 31 March 2027. Cancellations made after this date are non-refundable due to venue commitments. However, you can easily transfer your ticket to another Toastmasters member by updating your registration on the portal.',
          link: { label: 'Manage my registration', href: '/my' },
        },
        {
          q: 'Will I get a physical ticket for entry?',
          a: 'You will receive a digital confirmation email with a QR code after your payment is confirmed. Please save this email, as our registration desk will scan your QR code on-site.',
        },
        {
          q: 'Can my club book a table?',
          a: 'Yes — a table seats ten, and is booked in one go with one payment. You do not need all ten names up front: add your guests any time until 24 May 2027, and each guest is emailed their own code as you name them.',
        },
        {
          q: 'Can I change my details later?',
          a: 'Yes. Your confirmation email has a personal My Registration link — use it to update your dietary needs, t-shirt size and contact details.',
        },
      ],
    },
    {
      name: 'Venue & Logistics',
      items: [
        {
          q: 'Where is the Annual Conference 2027 being held?',
          a: 'The 2-day conference will be held at The Istana Ballroom, Kinex Mall.',
          link: { label: 'Venue and directions', href: '#venue' },
        },
        {
          q: 'What is the nearest MRT station?',
          a: 'The nearest MRT station is Paya Lebar MRT (EW8 / CC9).',
        },
        {
          q: 'Is parking available at Kinex Mall?',
          a: [
            'Yes, parking is available at Kinex Mall Levels 4 and 5.',
            'There is no complimentary parking coupon — standard mall parking rates apply.',
          ],
        },
        {
          q: 'Is the venue wheelchair accessible?',
          a: 'Yes, Kinex Mall and The Istana Ballroom are fully wheelchair accessible. The mall features step-free entrances, accessible restrooms, and elevators that provide direct access to the ballroom on Level 3.',
        },
        {
          q: 'What dining options can I look forward to?',
          a: 'The full conference package includes breakfast, lunch and the Gala Dinner. All meals served are fully Halal-certified by The Istana Ballroom. An Indian Vegetarian menu will be available.',
        },
      ],
    },
    {
      name: 'Programme & Events',
      items: [
        {
          q: 'Where can I view the full conference programme?',
          a: 'The programme is in the Agenda section of this page. Please note that the detailed programme and specific session timings are subject to minor adjustments as the event approaches, to ensure the best possible experience.',
          link: { label: 'See the agenda', href: '#agenda' },
        },
        {
          q: 'What are the main events happening during the conference?',
          a: 'Get ready for an inspiring lineup! The conference delivers a powerful keynote presentation, insightful educational workshops, and the highly anticipated District Speech Contests. The crown jewel of the weekend is our glamorous Gala Night on Saturday evening — an unforgettable night of celebration and networking.',
        },
        {
          q: 'What speech contests will be held at the conference?',
          a: [
            'The District Table Topics and Evaluation Contests will be held on the Day 1 afternoon, while the District International Speech Contest will be on the Day 2 morning.',
            'The Division L and V International Speech and Evaluation Contests will be held concurrently on the Day 1 afternoon.',
          ],
        },
        {
          q: 'Will the educational workshops and keynotes be recorded for later viewing?',
          a: 'No, the workshops and keynote sessions will not be recorded. The conference is designed as a fully live, interactive and immersive experience for all. We encourage all delegates to join us in person to experience the full impact of each session.',
        },
      ],
    },
    {
      name: 'General & Other Info',
      items: [
        {
          q: 'Where can I find the most up-to-date details about the event?',
          a: 'All information related to the Annual Conference 2027 will be available online through this homepage. We recommend bookmarking the page and checking back for the latest updates.',
        },
        {
          q: 'What is the dress code for the conference?',
          a: 'We appreciate smart casual attire for the annual conference.',
        },
      ],
    },
  ],

  /* [MOCK] heading and body; the live fee shown next to it comes from the API. */
  finalCta: {
    heading: 'Your story. Your stage. Your seat is waiting.',
    body: 'Join three hundred Toastmasters for two days of keynote speeches, champion insights, the contest finals and the gala dinner — and be in the room when District 80 takes the stage.',
  },
}
