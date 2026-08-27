/** Money and place-count wording, in one place.
 *
 *  The wording matters more than it looks. A table booking is ONE payment and
 *  TEN attendees, and a screen that shows a count without saying which of the
 *  two it means is a number somebody will quote wrongly.
 */

export function money(amount: number | undefined | null, currency = 'SGD'): string {
  if (amount === undefined || amount === null) return '—'
  return `${currency} ${Number(amount).toFixed(2)}`
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
