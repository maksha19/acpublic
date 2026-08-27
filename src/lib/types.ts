/** Wire types. Kept in step with the Lambda by hand in Phase 0 — a generated
 *  client is Phase 1 work, not worth the toolchain for ten endpoints. */

export type RegStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REPLACED'
  | 'CHECKED_IN'
  | 'NO_SHOW'

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface PriceWindow {
  label: string
  fee: number
  fromUtc?: string
}

export interface EventInfo {
  name: string
  dateLabel?: string
  venue?: string
  city?: string
  /** The per-seat fee that applies NOW, resolved server-side from the price
   *  windows. Never recomputed here — two implementations of a pricing rule
   *  disagree on the one day it matters most. */
  fee: number
  currency: string
  registrationOpen?: boolean
  priceWindow?: string
  priceWindowEndsUtc?: string
  nextPriceWindow?: PriceWindow | null

  tableSeats?: number
  /** fee × tableSeats, also resolved server-side. */
  tableFee?: number
  rosterCutoff?: string
  rosterCutoffLabel?: string
  dietaryCutoff?: string

  /* "Full" has two meanings once tables exist. A club president who reads
     "registration is full" stops looking while forty seats are still free. */
  seatsRemaining?: number | null
  tablesRemaining?: number
  tableBookingsAvailable?: boolean
  individualBookingsAvailable?: boolean

  payment?: {
    bankName?: string
    accountName?: string
    accountNumber?: string
    payNow?: string
    instructions?: string
  }
}

/**
 * One person who is coming. The six person fields are optional because a
 * reserved-but-unnamed seat on a table genuinely has none of them — they are
 * absent, not blank, and that is the state the whole feature is built around.
 */
export interface Attendee {
  code: string
  /** The booking this attendee belongs to. Equal to `code` for an individual. */
  groupCode?: string
  /** 1–9 for a table member. NOT a seat position: the owner is attendee 1, so
   *  member 01 is the second person. */
  memberNo?: number
  name?: string
  email?: string
  phone?: string
  club?: string
  dietary?: string
  tshirt?: string
  status: RegStatus
  detailsPending?: boolean
  detailsProvidedAt?: string
  createdAt: string
  updatedAt?: string
}

/** An attendee who is also a booking: the payer, and attendee 1. */
export interface Registration extends Attendee {
  bookingType?: 'INDIVIDUAL' | 'TABLE'
  seats?: number
  namedSeats?: number
  /** Frozen at booking. The confirmation email stated this amount. */
  unitFee?: number
  expectedAmount?: number
  priceWindow?: string
}

export interface BookingSummary {
  code: string
  ownerName?: string
  status: RegStatus
  seats: number
  namedSeats: number
  bookingType: 'INDIVIDUAL' | 'TABLE'
}

export interface Payment {
  paymentId: string
  regCode: string
  reference: string
  paidOn: string
  amount: number
  method: string
  proofKey?: string
  status: PaymentStatus
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectReason?: string
  regName?: string
  regEmail?: string
  regClub?: string
  seats?: number
  bookingType?: 'INDIVIDUAL' | 'TABLE'
  /** What this booking owes, frozen when it was made. */
  expectedAmount?: number
}

export interface CreateRegistrationResult {
  code: string
  accessKey: string
  status: RegStatus
  seats: number
  registration: Registration
  /** Placeholder rows for the other seats. No access keys — each one leaves
   *  only in that member's own invitation email. */
  members: Attendee[]
}

export interface RegistrationView {
  registration: Registration
  members: Attendee[]
  payments: Payment[]
  booking: BookingSummary | null
}

export interface MemberUpdateResult {
  member: Attendee
  namedSeats: number
  seats: number
}

export interface PresignedUpload {
  url: string
  fields: Record<string, string>
  key: string
}
