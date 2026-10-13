import { z } from 'zod'
import { isMemberNumberField, lookupMember, type Directory } from './directory'
import type { FieldValue, PublicField } from './types'

/**
 * One attendee's details: name and email are fixed, everything else is a
 * field the committee defined on the event (admin → Event → Registration form
 * fields) and the API serves on `GET /v1/event` as `fields`.
 *
 * The zod schema is built from those definitions so the form validates the
 * same rules the server enforces (fields.py). Defined once because it is
 * used twice: registering yourself, and naming a guest on your table.
 */

export type PersonValues = { name: string; email: string } & Record<string, FieldValue>

const EMAIL_RE = /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/
/** Digits only — no +, spaces or dashes. Mirrors PHONE_RE in fields.py. */
const PHONE_RE = /^[0-9]{7,15}$/

/** A Toastmasters member ID as it appears on toastmasters.org: PN- and the
 *  member's digits — eight for recent members, six or seven for older ones.
 *  Case-insensitive here; the server stores it upper-case. Mirrors
 *  MEMBER_ID_RE in fields.py. */
export const MEMBER_ID_RE = /^PN-\d{6,8}$/i
export const MEMBER_ID_ERROR = 'Enter your member ID as PN- followed by 6 to 8 digits, e.g. PN-61234567.'
export const MEMBER_NOT_IN_ROSTER =
  'That member number is not in the District member roster. Check it against toastmasters.org, or contact the organisers.'

/** Who the form describes decides one rule: whoever makes the booking must
 *  give their member ID (it is how the API stops one person booking twice
 *  under two emails), while a table guest may leave it blank — not every gala
 *  guest is a member. Applied to the committee's field list before it reaches
 *  the schema and the inputs, so the required marker and the rule agree. */
export const withMemberRule = (fields: PublicField[], role: 'booker' | 'guest'): PublicField[] =>
  fields.map((f) => (isMemberNumberField(f) ? { ...f, required: role === 'booker' } : f))

/** A dropdown option called "Other"/"Others" invites a free-text answer: the
 *  form shows a "please specify" box and the typed text is the value. Mirrors
 *  the server's rule in fields.py. */
export const isOtherOption = (o: string) => /^others?$/i.test(o.trim())
export const otherOption = (options: string[]) => options.find(isOtherOption)

function rule(field: PublicField, directory?: Directory): z.ZodTypeAny {
  const label = field.label
  if (field.type === 'boolean') {
    return z.boolean().default(false)
  }
  const base = z.string().trim().max(field.type === 'textarea' ? 2000 : 200, 'That is too long.')
  const required = field.required
    ? base.refine((v) => v !== '', `Please enter ${label.toLowerCase()}.`)
    : base.default('')
  // Format rules apply only to a non-empty answer; emptiness is the
  // required-ness rule above, and the server checks in the same order.
  switch (field.type) {
    case 'email':
      return required.refine((v) => v === '' || EMAIL_RE.test(v), 'Enter a valid email address.')
    case 'phone':
      return required.refine(
        (v) => v === '' || PHONE_RE.test(v),
        'Enter digits only, no spaces or +, e.g. 81234567.',
      )
    case 'select':
      if (otherOption(field.options)) return required
      return required.refine(
        (v) => v === '' || field.options.includes(v),
        `Choose one of the ${label} options.`,
      )
    default:
      if (isMemberNumberField(field)) {
        // Checked against the District roster when it has loaded. A roster
        // that failed to load (or is empty) checks nothing — the server's
        // one-place-per-member rule still holds, and an unreachable Google
        // Sheet must not stop anyone registering.
        const checkRoster = !!directory && directory.size > 0
        return required
          .refine((v) => v === '' || MEMBER_ID_RE.test(v), MEMBER_ID_ERROR)
          .refine(
            (v) => v === '' || !checkRoster || !MEMBER_ID_RE.test(v) || !!lookupMember(directory, v),
            MEMBER_NOT_IN_ROSTER,
          )
      }
      return required
  }
}

export const personSchema = (
  who: 'your' | 'their' = 'their',
  fields: PublicField[] = [],
  directory?: Directory,
) =>
  z.object({
    name: z.string().trim().min(2, `Please enter ${who} full name.`).max(80),
    email: z.string().trim().toLowerCase().regex(EMAIL_RE, 'Enter a valid email address.'),
    ...Object.fromEntries(fields.map((f) => [f.key, rule(f, directory)])),
  })

export function emptyPerson(fields: PublicField[] = []): PersonValues {
  return {
    name: '',
    email: '',
    ...Object.fromEntries(fields.map((f) => [f.key, f.type === 'boolean' ? false : ''])),
  }
}

/** Existing values for a person, shaped for the form (missing → empty). */
export function personValues(fields: PublicField[], row: Record<string, unknown>): PersonValues {
  const out = emptyPerson(fields)
  out.name = typeof row.name === 'string' ? row.name : ''
  out.email = typeof row.email === 'string' ? row.email : ''
  for (const f of fields) {
    const v = row[f.key]
    if (f.type === 'boolean') out[f.key] = v === true
    else if (typeof v === 'string') out[f.key] = v
  }
  return out
}

/** A stored value as text, for read-only rows. */
export function showValue(field: PublicField, value: unknown): string {
  if (field.type === 'boolean') return value === true ? 'Yes' : value === false ? 'No' : '—'
  return typeof value === 'string' && value ? value : '—'
}
