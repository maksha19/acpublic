import { z } from 'zod'
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
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{6,19}$/

/** A dropdown option called "Other"/"Others" invites a free-text answer: the
 *  form shows a "please specify" box and the typed text is the value. Mirrors
 *  the server's rule in fields.py. */
export const isOtherOption = (o: string) => /^others?$/i.test(o.trim())
export const otherOption = (options: string[]) => options.find(isOtherOption)

function rule(field: PublicField): z.ZodTypeAny {
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
        'Enter a valid phone number, e.g. +65 8123 4567.',
      )
    case 'select':
      if (otherOption(field.options)) return required
      return required.refine(
        (v) => v === '' || field.options.includes(v),
        `Choose one of the ${label} options.`,
      )
    default:
      return required
  }
}

export const personSchema = (who: 'your' | 'their' = 'their', fields: PublicField[] = []) =>
  z.object({
    name: z.string().trim().min(2, `Please enter ${who} full name.`).max(80),
    email: z.string().trim().toLowerCase().regex(EMAIL_RE, 'Enter a valid email address.'),
    ...Object.fromEntries(fields.map((f) => [f.key, rule(f)])),
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
