import type {
  FieldValue,
  CreateRegistrationResult,
  EventInfo,
  MemberUpdateResult,
  PresignedUpload,
  Payment,
  RegistrationView,
} from './types'

const BASE = import.meta.env.VITE_API_BASE

if (!BASE) {
  // Fail loudly at load. The alternative is every fetch going to the dev server
  // and returning index.html, which surfaces as a baffling JSON parse error.
  console.error('VITE_API_BASE is not set. Copy .env.example to .env.local.')
}

/** Errors the API is allowed to describe to the user. `fields` maps a form
 *  field name to a message so it can be shown next to the input. */
export class ApiError extends Error {
  // Declared as fields rather than constructor parameter properties: the Vite
  // template enables `erasableSyntaxOnly`, which bans the shorthand because it
  // emits runtime code from type-position syntax.
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } catch {
    // A network-level failure, not an API response. Say so plainly rather than
    // reporting "unknown error" — the usual cause is being offline.
    throw new ApiError(0, 'NETWORK', 'Could not reach the server. Check your connection.')
  }

  const text = await res.text()
  const body = text ? safeJson(text) : null

  if (!res.ok) {
    const err = body?.error
    throw new ApiError(
      res.status,
      err?.code ?? 'UNKNOWN',
      err?.message ?? `Request failed (${res.status}).`,
      err?.fields,
    )
  }
  return body as T
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
})

const jsonPut = (body: unknown): RequestInit => ({
  method: 'PUT',
  body: JSON.stringify(body),
})

// ---------------------------------------------------------------- public ----

export const getEvent = () => request<EventInfo>('/v1/event')

/** Name and email, plus whatever fields the committee defined on the event —
 *  sent flat, as the API stores them. */
export type PersonInput = { name: string; email: string } & Record<string, FieldValue | number>

/** One booking of `seats` places. `seats` is 1 or the event's table size —
 *  never anything between, and the server checks it against the event rather
 *  than trusting this call. */
export type RegistrationInput = PersonInput & { seats: number }

export const createRegistration = (data: RegistrationInput) =>
  request<CreateRegistrationResult>('/v1/registrations', json(data))

export const getRegistration = (code: string, k: string) =>
  request<RegistrationView>(
    `/v1/registrations/${encodeURIComponent(code)}?k=${encodeURIComponent(k)}`,
  )

export interface AccessLinkResult {
  /** The registered address the link went to — the API's copy, not the form's. */
  to: string
  status: 'SENT' | 'FAILED' | string
  sentAt: string
  /** A link went out moments ago; nothing new was sent. Same outcome for the member. */
  throttled?: boolean
}

/** "Email me my link": code + registered email, never the key. A mismatch is
 *  a 404 whose message tells the member to check both. */
export const requestAccessLink = (code: string, email: string) =>
  request<AccessLinkResult>(
    `/v1/registrations/${encodeURIComponent(code)}/access-link`,
    json({ email }),
  )

/**
 * Name one member of a table. Saved one at a time on purpose: a forty-field
 * form for ten people is abandoned halfway on a phone, and "details at any
 * time" needs incremental saves regardless.
 *
 * `memberNo` is 1–9 — the owner is attendee 1, so member 01 is the second
 * person at the table.
 */
export const updateMember = (code: string, memberNo: number, k: string, data: PersonInput) =>
  request<MemberUpdateResult>(
    `/v1/registrations/${encodeURIComponent(code)}/members/${String(memberNo).padStart(2, '0')}` +
      `?k=${encodeURIComponent(k)}`,
    jsonPut(data),
  )

export const createProofUrl = (code: string, k: string, contentType: string) =>
  request<PresignedUpload>(
    `/v1/registrations/${encodeURIComponent(code)}/proof-url?k=${encodeURIComponent(k)}`,
    json({ contentType }),
  )

export const submitPayment = (
  code: string,
  k: string,
  data: {
    reference: string
    paidOn: string
    amount: string
    method: string
    proofKey: string
  },
) =>
  request<{ payment: Payment; status: string }>(
    `/v1/registrations/${encodeURIComponent(code)}/payments?k=${encodeURIComponent(k)}`,
    json(data),
  )

/**
 * Upload straight to S3 with the presigned POST. The file never passes through
 * the API, which keeps a 4 MB phone screenshot clear of API Gateway's 6 MB
 * request limit.
 *
 * Field order matters: S3 requires the policy fields BEFORE the file part.
 */
export async function uploadToS3(presigned: PresignedUpload, file: File): Promise<void> {
  const form = new FormData()
  for (const [name, value] of Object.entries(presigned.fields)) form.append(name, value)
  form.append('file', file)

  // A phone on mobile data drops connections mid-upload; Safari reports that as
  // a bare "Load failed" TypeError with no response. The presigned POST is
  // safe to repeat (same key, same policy), so try twice before giving up,
  // and say what happened in words the member can act on.
  let res: Response | undefined
  for (let attempt = 0; attempt < 2 && !res; attempt++) {
    try {
      res = await fetch(presigned.url, { method: 'POST', body: form })
    } catch {
      if (attempt === 1) {
        throw new ApiError(
          0,
          'NETWORK',
          'The screenshot upload did not complete. Check your connection and press Submit again.',
        )
      }
    }
  }
  if (!res) return
  if (!res.ok) {
    // S3 replies in XML. Pull out the message so a size or type rejection is
    // readable instead of "Upload failed (403)".
    const xml = await res.text().catch(() => '')
    const detail = /<Message>([^<]+)<\/Message>/.exec(xml)?.[1]
    throw new ApiError(
      res.status,
      'UPLOAD_FAILED',
      detail ?? 'The file could not be uploaded. Please try a smaller image.',
    )
  }
}
