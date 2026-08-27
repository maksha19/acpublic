import { z } from 'zod'

/**
 * The six fields that describe one attendee, validated for the member's benefit.
 *
 * Mirrors `PersonDetails` in the Lambda's models.py — the server revalidates all
 * of it, because anyone can post to the API directly. Defined once here because
 * it is used twice: registering yourself, and naming a guest on your table. Two
 * copies of a validation rule drift, and the one that drifts is always the one
 * being used at the time.
 */
export const personSchema = (who: 'your' | 'their' = 'their') =>
  z.object({
    name: z.string().trim().min(2, `Please enter ${who} full name.`).max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/, 'Enter a valid email address.'),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, 'Enter a valid phone number, e.g. +65 8123 4567.'),
    club: z.string().trim().min(2, `Please enter ${who} club name.`).max(80),
    dietary: z.string().trim().max(120).default(''),
    tshirt: z.enum(['', 'S', 'M', 'L', 'XL', 'XXL']).default(''),
  })

export type PersonValues = z.input<ReturnType<typeof personSchema>>

export const EMPTY_PERSON: PersonValues = {
  name: '',
  email: '',
  phone: '',
  club: '',
  dietary: '',
  tshirt: '',
}

export const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const
