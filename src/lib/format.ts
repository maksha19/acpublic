/** Money and place-count wording, in one place.
 *
 *  The wording matters more than it looks. A table booking is ONE payment and
 *  TEN attendees, and a screen that shows a count without saying which of the
 *  two it means is a number somebody will quote wrongly.
 */

export function money(amount: number | undefined | null, currency = 'SGD'): string {
  if (amount === undefined || amount === null) return '—'
  // Thousands separator matters from the first table booking: "SGD 1080.00"
  // reads like a typo next to "SGD 1,080.00" on the same screen.
  return `${currency} ${Number(amount).toLocaleString('en-SG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** `10 × SGD 108.00 = SGD 1,080.00`, or just the fee for a single place. */
export function priceLine(
  seats: number,
  unitFee: number | undefined,
  total: number | undefined,
  currency = 'SGD',
): string {
  if (seats <= 1) return money(total ?? unitFee, currency)
  return `${seats} × ${money(unitFee, currency)} = ${money(total, currency)}`
}

export const places = (n: number) => (n === 1 ? '1 place' : `${n} places`)

/** Whole days until an event-local date, or null when there is nothing to
 *  count (missing, malformed, or already past). The +08:00 suffix pins the
 *  boundary to Singapore midnight regardless of the visitor's timezone. */
export function daysUntil(isoDate?: string): number | null {
  if (!isoDate) return null
  const target = new Date(`${isoDate}T00:00:00+08:00`).getTime()
  if (Number.isNaN(target)) return null
  const days = Math.ceil((target - Date.now()) / 86_400_000)
  return days >= 0 ? days : null
}
