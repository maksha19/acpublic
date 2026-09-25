import { useQuery, type QueryClient } from '@tanstack/react-query'
import type { PublicField } from './types'

/**
 * The District's member roster, published from Google Sheets as CSV.
 *
 * Fetched once when the site loads (App prefetches it) and kept for the
 * session, so by the time someone reaches the "member number" box the answer
 * is already in memory. Columns, as published: Division, Area, Club ID,
 * Club Name, Member ID, First Name, Middle Name, Last Name, EDU. Only the
 * Member ID → Club Name pair is kept — the form fills in the club, nothing
 * else — so a 5,000-row sheet costs a few hundred kilobytes once and a Map.
 *
 * Failure is soft on purpose. If the sheet is unreachable the lookup reports
 * "not found" for everyone and the club box is simply typed by hand, exactly
 * as it was before the roster existed.
 */

export const DIRECTORY_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQX1RSuwttX1iAldGx-rn6WTOM7_nWIukC7PCFyNbH5IZVuseQ74NG7lFNX_TKzHp5bnSr9DRO9kX1y/pub?gid=2603816&single=true&output=csv'

export interface DirectoryEntry {
  memberId: string
  club: string
  name: string
}

export type Directory = Map<string, DirectoryEntry>

export const DIRECTORY_QUERY_KEY = ['member-directory'] as const

/** Digits only, so "0123 456" and "123456" and a pasted "ID: 123456" agree. */
export const normalizeMemberId = (raw: string) => raw.replace(/\D/g, '')

/* Which committee-defined fields play the two roles. Matched by key first
   (what the seed and admin editor write) and by label as a fallback, so a
   committee that renames or re-creates the field keeps the behaviour. */
export const isMemberNumberField = (f: PublicField) =>
  f.type === 'text' &&
  (/^member_?(number|no|id)$/i.test(f.key) || /\bmember(ship)?\s*(number|no\.?|id)\b/i.test(f.label))

export const isClubField = (f: PublicField) =>
  f.type === 'text' && (f.key === 'club' || /^club\b/i.test(f.label.trim()))

/** A CSV parser that understands quoted cells (club names can carry commas). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += ch
      continue
    }
    if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

export function buildDirectory(csv: string): Directory {
  const rows = parseCsv(csv)
  const header = (rows.shift() ?? []).map((h) => h.trim().toLowerCase())
  const col = (name: string) => header.indexOf(name)
  const idCol = col('member id')
  const clubCol = col('club name')
  const first = col('first name')
  const middle = col('middle name')
  const last = col('last name')
  const dir: Directory = new Map()
  if (idCol < 0 || clubCol < 0) return dir
  for (const r of rows) {
    const memberId = normalizeMemberId(r[idCol] ?? '')
    const club = (r[clubCol] ?? '').trim()
    if (!memberId || !club) continue
    const name = [r[first], r[middle], r[last]]
      .map((s) => (s ?? '').trim())
      .filter(Boolean)
      .join(' ')
    // First occurrence wins; a member listed under two clubs keeps the first.
    if (!dir.has(memberId)) dir.set(memberId, { memberId, club, name })
  }
  return dir
}

export async function fetchDirectory(): Promise<Directory> {
  const res = await fetch(DIRECTORY_CSV_URL, { cache: 'default' })
  if (!res.ok) throw new Error(`Directory unavailable (${res.status})`)
  return buildDirectory(await res.text())
}

const DIRECTORY_QUERY = {
  queryKey: DIRECTORY_QUERY_KEY,
  queryFn: fetchDirectory,
  staleTime: Infinity,
  gcTime: Infinity,
  retry: 2,
}

/** Warm the cache on page load so the register form never waits for it. */
export const prefetchDirectory = (client: QueryClient) => client.prefetchQuery(DIRECTORY_QUERY)

export const useDirectory = () => useQuery(DIRECTORY_QUERY)

export const lookupMember = (dir: Directory | undefined, raw: string): DirectoryEntry | undefined =>
  dir?.get(normalizeMemberId(raw))
