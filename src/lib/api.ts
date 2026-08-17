import type {
  CreateRegistrationResult,
  EventInfo,
  Payment,
  PresignedUpload,
  Registration,
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

// ---------------------------------------------------------------- public ----

export const getEvent = () => request<EventInfo>('/v1/event')

export const createRegistration = (data: {
  name: string
  email: string
  phone: string
  club: string
  dietary: string
  tshirt: string
}) => request<CreateRegistrationResult>('/v1/registrations', json(data))

export const getRegistration = (code: string, k: string) =>
  request<{ registration: Registration; payments: Payment[] }>(
    `/v1/registrations/${encodeURIComponent(code)}?k=${encodeURIComponent(k)}`,
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

  const res = await fetch(presigned.url, { method: 'POST', body: form })
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
