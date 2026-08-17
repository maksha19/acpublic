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

export interface EventInfo {
  name: string
  dateLabel?: string
  venue?: string
  city?: string
  fee: number
  currency: string
  registrationOpen?: boolean
  payment?: {
    bankName?: string
    accountName?: string
    accountNumber?: string
    payNow?: string
    instructions?: string
  }
}

export interface Registration {
  code: string
  name: string
  email: string
  phone: string
  club: string
  dietary?: string
  tshirt?: string
  status: RegStatus
  createdAt: string
  updatedAt?: string
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
}

export interface CreateRegistrationResult {
  code: string
  accessKey: string
  status: RegStatus
  registration: Registration
}

export interface PresignedUpload {
  url: string
  fields: Record<string, string>
  key: string
}
