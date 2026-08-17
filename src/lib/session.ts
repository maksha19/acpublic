/**
 * Remembers the member's registration code and access key in this browser, so
 * "Check my registration" works without digging out the email.
 *
 * This is convenience, not authentication. The key is a capability — whoever
 * holds it can read that one registration — so it is stored per-browser only and
 * never sent anywhere except as the `k` query parameter the API expects.
 *
 * Phase 1 deletes this file: a magic-link JWT replaces the key, and the token
 * lives in memory with a 24-hour expiry instead of in localStorage.
 */
const KEY = 'ac2027.registration'

export interface RememberedRegistration {
  code: string
  accessKey: string
}

export function remember(code: string, accessKey: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, accessKey }))
  } catch {
    // Private browsing or a full quota. Losing the convenience is fine; the
    // member still has the link in their email.
  }
}

export function recall(): RememberedRegistration | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed?.code === 'string' && typeof parsed?.accessKey === 'string'
      ? parsed
      : null
  } catch {
    return null
  }
}

export function forget(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing useful to do */
  }
}
