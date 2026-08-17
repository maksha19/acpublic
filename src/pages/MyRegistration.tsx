import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { getRegistration } from '../lib/api'
import { recall, remember } from '../lib/session'
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
  CONFIRMED: 'You are confirmed. Bring your registration code on the day.',
  REJECTED: 'We could not verify your payment. Please submit corrected details.',
  CANCELLED: 'This registration has been cancelled. Contact the registration team if that is wrong.',
  REPLACED: 'This place has been transferred to another member.',
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
            <Field label="Registration code" htmlFor="code" required hint="For example AC27-0042.">
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

  const { registration: reg, payments } = query.data!
  const needsPayment = reg.status === 'PENDING_PAYMENT' || reg.status === 'REJECTED'

  return (
    <div className="space-y-6">
      <PageHeader title="My registration" />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[15px] uppercase tracking-[0.1em] text-muted-fg">Registration code</p>
            <p className="font-heading text-2xl font-bold tracking-wide text-loyal-blue tnum">
              {reg.code}
            </p>
          </div>
          <StatusBadge status={reg.status} />
        </div>

        {NEXT_STEP[reg.status] && (
          <div className="mt-4">
            <Alert tone={needsPayment ? 'warning' : reg.status === 'CONFIRMED' ? 'success' : 'info'}>
              {NEXT_STEP[reg.status]}
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

      <Card>
        <h2 className="text-xl">Your details</h2>
        <dl className="mt-3">
          <DataRow label="Name" value={reg.name} />
          <DataRow label="Email" value={reg.email} />
          <DataRow label="Mobile" value={<span className="tnum">{reg.phone}</span>} />
          <DataRow label="Club" value={reg.club} />
          <DataRow label="Dietary requirements" value={reg.dietary || '—'} />
          <DataRow label="T-shirt size" value={reg.tshirt || '—'} />
        </dl>
        <p className="mt-4 text-[15px] text-muted-fg">
          Need a change? Contact the registration team — self-service edits arrive in a later
          release.
        </p>
      </Card>

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
                  {Number(p.amount).toFixed(2)} · paid {p.paidOn} · {p.method.replace('_', ' ').toLowerCase()}
                </p>
                {p.rejectReason && (
                  <p className="mt-2 text-[16px] font-semibold text-destructive">{p.rejectReason}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
