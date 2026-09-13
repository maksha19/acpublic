import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, Search, Users } from 'lucide-react'
import { getEvent, getRegistration } from '../lib/api'
import { money, priceLine } from '../lib/format'
import { recall, remember } from '../lib/session'
import Roster from '../components/Roster'
import {
  Alert,
  Button,
  Card,
  DataRow,
  Field,
  Input,
  LinkButton,
  PageHeader,
  Spinner,
  StatusBadge,
} from '../components/ui'
import type { RegStatus } from '../lib/types'

/* What the member should do next, per status. Saying "Confirmed" without saying
   whether anything is expected of them is the question the WhatsApp group
   currently answers by hand. */
const NEXT_STEP: Partial<Record<RegStatus, string>> = {
  PENDING_PAYMENT: 'Pay the conference fee and upload your screenshot to confirm your place.',
  PAYMENT_SUBMITTED:
    'Your payment is with the registration team. Nothing is needed from you — we will email you when it has been checked.',
  CONFIRMED: 'You are confirmed. Show the e-ticket below at the door — or just your code.',
  REJECTED: 'We could not verify your payment. Please submit corrected details.',
  CANCELLED: 'This registration has been cancelled. Contact the registration team if that is wrong.',
  REPLACED: 'This place has been transferred to another member.',
  CHECKED_IN: 'You are checked in. Enjoy the conference.',
}

/* A guest on someone else's table has a different next step for every status,
   because none of them involve them paying anything. */
const GUEST_NEXT_STEP: Partial<Record<RegStatus, string>> = {
  PENDING_PAYMENT:
    'Your place is reserved. There is nothing for you to pay — the person who booked the table is settling it.',
  PAYMENT_SUBMITTED:
    'The payment for your table is with the registration team. Nothing is needed from you.',
  CONFIRMED: 'Your place is confirmed. Show the e-ticket below at the door — or just your code.',
  REJECTED:
    'There is a query on the payment for your table. The person who booked it has been contacted — nothing is needed from you.',
  REPLACED: 'This place has been transferred to another member by whoever booked the table.',
  CHECKED_IN: 'You are checked in. Enjoy the conference.',
}

export default function MyRegistration() {
  const [params, setParams] = useSearchParams()
  const urlCode = params.get('code') ?? ''
  const urlKey = params.get('k') ?? ''

  // Fall back to this browser's memory so a member who registered on this device
  // does not need to dig out the email.
  const remembered = recall()
  const code = urlCode || remembered?.code || ''
  const accessKey = urlKey || (remembered?.code === code ? (remembered?.accessKey ?? '') : '')

  const [formCode, setFormCode] = useState(code)
  const [formKey, setFormKey] = useState(accessKey)

  const { data: event } = useQuery({ queryKey: ['event'], queryFn: getEvent })
  const query = useQuery({
    queryKey: ['registration', code, accessKey],
    queryFn: () => getRegistration(code, accessKey),
    enabled: !!code && !!accessKey,
  })

  function lookup(e: React.FormEvent) {
    e.preventDefault()
    const c = formCode.trim().toUpperCase()
    const k = formKey.trim()
    if (!c || !k) return
    remember(c, k)
    setParams({ code: c, k })
  }

  if (!code || !accessKey) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Check my registration"
          lede="Open the link from your registration email, or enter your code and personal key below."
        />
        <Card>
          <form onSubmit={lookup} className="space-y-5" noValidate>
            <Field
              label="Registration code"
              htmlFor="code"
              required
              hint="For example AC27-0042, or AC27-0042-03 if you are a guest on someone's table."
            >
              <Input
                id="code"
                className="tnum"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                aria-describedby="code-hint"
              />
            </Field>
            <Field
              label="Personal key"
              htmlFor="k"
              required
              hint="The part of your email link after &k= — it proves the registration is yours."
            >
              <Input
                id="k"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                aria-describedby="k-hint"
              />
            </Field>
            <Button type="submit" className="w-full sm:w-auto">
              <Search className="size-4" aria-hidden="true" />
              Find my registration
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  if (query.isLoading) return <Spinner label="Loading your registration" />

  if (query.error) {
    return (
      <div className="space-y-6">
        <PageHeader title="We couldn't find that registration" />
        <Card>
          <Alert tone="error" title="No match for that code and key">
            Check that you copied the whole link from your email, including everything after the
            <code> &amp;k=</code>. If it still does not work, contact the registration team.
          </Alert>
          <div className="mt-6">
            <Button variant="secondary" onClick={() => setParams({})} className="w-full sm:w-auto">
              Try a different code
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const { registration: reg, members, payments, booking } = query.data!
  const seats = reg.seats ?? 1
  const isTable = seats > 1
  // A guest is an attendee whose booking is not their own — they have a member
  // number, and the money belongs to someone else entirely.
  const isGuest = reg.memberNo !== undefined
  const needsPayment =
    !isGuest && (reg.status === 'PENDING_PAYMENT' || reg.status === 'REJECTED')
  const nextStep = (isGuest ? GUEST_NEXT_STEP : NEXT_STEP)[reg.status]

  return (
    <div className="space-y-6">
      <PageHeader title={isTable ? 'My table booking' : 'My registration'} />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[15px] uppercase tracking-[0.1em] text-muted-fg">
              {isTable ? 'Booking code' : isGuest ? 'Your code' : 'Registration code'}
            </p>
            <p className="font-heading text-2xl font-bold tracking-wide text-primary tnum">
              {reg.code}
            </p>
          </div>
          <StatusBadge status={reg.status} />
        </div>

        {isTable && (
          <p className="mt-2 flex items-center gap-2 text-[16px] text-muted-fg">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            {seats} places · {priceLine(seats, reg.unitFee, reg.expectedAmount, event?.currency)}
          </p>
        )}

        {isGuest && booking && (
          <p className="mt-2 flex items-center gap-2 text-[16px] text-muted-fg">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            Part of a table of {booking.seats} booked by {booking.ownerName ?? 'another member'}
          </p>
        )}

        {nextStep && (
          <div className="mt-4">
            <Alert tone={needsPayment ? 'warning' : reg.status === 'CONFIRMED' ? 'success' : 'info'}>
              {nextStep}
            </Alert>
          </div>
        )}

        {needsPayment && (
          <div className="mt-5">
            <LinkButton to={`/register/${reg.code}/payment?k=${encodeURIComponent(accessKey)}`}>
              {reg.status === 'REJECTED' ? 'Submit corrected payment' : 'Upload payment'}
            </LinkButton>
          </div>
        )}
      </Card>

      {/* The e-ticket, only while CONFIRMED. A replaced or cancelled code
          renders no QR — the desk would refuse it, so showing one is a queue
          argument waiting to happen. */}
      {reg.status === 'CONFIRMED' && reg.ticket && (
        <div id="ticket">
          <Card>
          <h2 className="text-xl">Your e-ticket</h2>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="rounded-lg border border-border bg-white p-4">
              <QRCodeSVG value={reg.ticket} size={200} marginSize={0} aria-hidden="true" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-heading text-2xl font-bold tracking-wide text-primary tnum">
                {reg.code}
              </p>
              <p className="mt-1 text-lg font-semibold">{reg.name}</p>
              {event?.dateLabel && (
                <p className="mt-2 text-muted-fg">
                  {event.dateLabel}
                  {event.venue && <> · {event.venue}</>}
                </p>
              )}
              <p className="mt-3 text-[15px] text-muted-fg">
                Show this at the registration desk. A screenshot works; so does the code alone.
              </p>
              <div className="mt-4 print-hide">
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer className="size-4" aria-hidden="true" />
                  Print the ticket
                </Button>
              </div>
            </div>
          </div>
          </Card>
        </div>
      )}

      {/* The roster. Only the owner of a table sees it — a guest gets their own
          row and nothing about the other nine. Replaced seats are history rows,
          not places: they would make a table of ten read as eleven. */}
      {isTable && members.length > 0 && (
        <Roster
          code={reg.code}
          accessKey={accessKey}
          seats={seats}
          namedSeats={reg.namedSeats ?? 1}
          members={members.filter((m) => m.status !== 'REPLACED')}
          closed={isRosterClosed(event?.rosterCutoff)}
          cutoffLabel={event?.rosterCutoffLabel}
          onSaved={() => query.refetch()}
        />
      )}

      <Card>
        <h2 className="text-xl">{isTable ? 'Your own details' : 'Your details'}</h2>
        <dl className="mt-3">
          <DataRow label="Name" value={reg.name ?? '—'} />
          <DataRow label="Email" value={reg.email ?? '—'} />
          <DataRow label="Mobile" value={<span className="tnum">{reg.phone ?? '—'}</span>} />
          <DataRow label="Club" value={reg.club ?? '—'} />
          <DataRow label="Dietary requirements" value={reg.dietary || '—'} />
          <DataRow label="T-shirt size" value={reg.tshirt || '—'} />
        </dl>
        <p className="mt-4 text-[15px] text-muted-fg">
          {isGuest
            ? 'Need a change? Ask whoever booked the table, or contact the registration team.'
            : 'Need a change? Contact the registration team — self-service edits arrive in a later release.'}
        </p>
      </Card>

      {/* A guest never sees the payment history: it is not their money. */}
      {!isGuest && (
        <Card>
          <h2 className="text-xl">Payment history</h2>
          {payments.length === 0 ? (
            <p className="mt-3 text-muted-fg">No payment submitted yet.</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {payments.map((p) => (
                <li key={p.paymentId} className="rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold tnum">{p.reference}</p>
                    <span
                      className={`rounded-full px-3 py-0.5 font-heading text-sm font-semibold ${
                        p.status === 'APPROVED'
                          ? 'bg-success text-white'
                          : p.status === 'REJECTED'
                            ? 'bg-destructive text-white'
                            : 'border-2 border-primary bg-white text-primary'
                      }`}
                    >
                      {p.status === 'APPROVED'
                        ? 'Verified'
                        : p.status === 'REJECTED'
                          ? 'Not verified'
                          : 'Under review'}
                    </span>
                  </div>
                  <p className="mt-1 text-[16px] text-muted-fg tnum">
                    {money(p.amount, event?.currency)} · paid {p.paidOn} ·{' '}
                    {p.method.replace('_', ' ').toLowerCase()}
                    {(p.seats ?? 1) > 1 && ` · ${p.seats} places`}
                  </p>
                  {p.rejectReason && (
                    <p className="mt-2 text-[16px] font-semibold text-destructive">{p.rejectReason}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}

/** Read-time only, because nothing writes when the date passes — there is no
 *  scheduler. The API enforces the same comparison; this just stops the owner
 *  filling in a form that is going to be refused. */
function isRosterClosed(cutoff?: string): boolean {
  if (!cutoff) return false
  const at = Date.parse(cutoff)
  return Number.isFinite(at) && Date.now() > at
}
