import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { QRCodeSVG } from 'qrcode.react'
import { Building2, CheckCircle2, QrCode, Upload } from 'lucide-react'
import { ApiError, createProofUrl, getEvent, getRegistration, submitPayment, uploadToS3 } from '../lib/api'
import { money, priceLine } from '../lib/format'
import { recall } from '../lib/session'
import { getPaynowQRCode } from '../lib/sgQRCode'
import {
  Alert,
  Button,
  Card,
  DataRow,
  Field,
  Input,
  LinkButton,
  PageHeader,
  Select,
  Spinner,
  StatusBadge,
} from '../components/ui'

/* Must match config.ALLOWED_PROOF_TYPES and MAX_PROOF_BYTES in the Lambda. The
   S3 presigned policy enforces both server-side; checking here just means the
   member finds out before a 4 MB upload instead of after. */
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

const schema = z.object({
  reference: z
    .string()
    .trim()
    .min(3, 'Enter the transaction reference from your bank.')
    .max(40)
    .regex(/^[A-Za-z0-9\-_/ ]+$/, 'Use letters, numbers, spaces, - _ / only.'),
  paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose the date you paid.'),
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,6}(\.\d{1,2})?$/, 'Enter an amount, e.g. 120.00'),
  method: z.enum(['BANK_TRANSFER', 'PAYNOW']),
})

type FormValues = z.infer<typeof schema>

/** The two ways the committee accepts money. Chosen in Step 1; Step 2's "How
 *  you paid" follows the choice so the member is not asked twice. */
type PayOption = 'BANK_TRANSFER' | 'PAYNOW'

/** The admin types a UEN or a mobile number into one box. A Singapore mobile
 *  is eight digits starting 8 or 9, with or without +65; anything else is
 *  treated as a UEN. */
function paynowTarget(raw: string): { uen?: string; phone?: string } {
  const compact = raw.replace(/[\s-]/g, '')
  const m = /^(?:\+?65)?([89]\d{7})$/.exec(compact)
  return m ? { phone: `+65${m[1]}` } : { uen: compact.toUpperCase() }
}

type Stage = 'idle' | 'preparing' | 'uploading' | 'saving' | 'done'

const STAGE_LABEL: Record<Exclude<Stage, 'idle' | 'done'>, string> = {
  preparing: 'Preparing upload…',
  uploading: 'Uploading your screenshot…',
  saving: 'Saving your payment details…',
}

export default function Payment() {
  const { code = '' } = useParams()
  const [params] = useSearchParams()

  // The key normally arrives in the emailed link. Fall back to what this browser
  // remembers, so a member who navigates from the registration page still works.
  const remembered = recall()
  const accessKey =
    params.get('k') ?? (remembered?.code === code ? remembered.accessKey : '') ?? ''

  const { data: event } = useQuery({ queryKey: ['event'], queryFn: getEvent })
  const regQuery = useQuery({
    queryKey: ['registration', code, accessKey],
    queryFn: () => getRegistration(code, accessKey),
    enabled: !!code && !!accessKey,
  })

  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  // null until the event arrives: PayNow is the default when the committee
  // has set one up, otherwise bank transfer is the only option.
  const [option, setOption] = useState<PayOption | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reference: '', paidOn: '', amount: '', method: 'BANK_TRANSFER' },
  })

  const pay = event?.payment
  const hasPayNow = !!pay?.payNow
  const hasBank = !!(pay?.accountNumber || pay?.bankName)
  const chosen: PayOption = option ?? (hasPayNow ? 'PAYNOW' : 'BANK_TRANSFER')

  // Step 1's choice is Step 2's answer to "How you paid".
  useEffect(() => {
    setValue('method', chosen)
  }, [chosen, setValue])

  /* What this booking owes: the amount frozen when it was made, NOT the event's
     current fee. A table booked during early bird still owes the early-bird
     total after the window closes, and the confirmation email already said so. */
  const expectedAmount =
    regQuery.data?.registration.expectedAmount ?? (event ? Number(event.fee) : undefined)

  // Prefill the amount once it is known — the member paid that figure, so
  // retyping it is friction with no purpose.
  useEffect(() => {
    if (expectedAmount !== undefined) {
      reset((v) => ({ ...v, amount: Number(expectedAmount).toFixed(2) }), { keepDirtyValues: true })
    }
  }, [expectedAmount, reset])

  // The registration code IS the payment reference — it is what the PayNow QR
  // carries and what the bank-transfer instructions ask for — so it is the
  // transaction reference too, unless the member types over it.
  const regCode = regQuery.data?.registration.code
  useEffect(() => {
    if (regCode) reset((v) => ({ ...v, reference: regCode }), { keepDirtyValues: true })
  }, [regCode, reset])

  // The PayNow payload: this booking's frozen amount, not editable in the
  // banking app, referenced by the registration code. Built only when the
  // committee has a PayNow target; a malformed one falls back to the text.
  const paynowPayload = useMemo(() => {
    if (!pay?.payNow || !regCode || expectedAmount === undefined) return null
    try {
      return getPaynowQRCode({
        ...paynowTarget(pay.payNow),
        amount: Number(expectedAmount),
        amountEditable: '0',
        referenceNumber: regCode,
        merchantName: (pay.accountName || 'District 80').slice(0, 25),
      })
    } catch {
      return null
    }
  }, [pay?.payNow, pay?.accountName, regCode, expectedAmount])

  const previewUrl = useMemo(
    () => (file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null),
    [file],
  )
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  function pickFile(picked: File | null) {
    setSubmitError(null)
    if (!picked) {
      setFile(null)
      setFileError(null)
      return
    }
    if (!ACCEPTED.includes(picked.type)) {
      setFile(null)
      setFileError('Please choose a JPG, PNG, WebP or PDF file.')
      return
    }
    if (picked.size > MAX_BYTES) {
      setFile(null)
      setFileError(
        `That file is ${(picked.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB — a screenshot rather than a photo of the screen usually does it.`,
      )
      return
    }
    setFileError(null)
    setFile(picked)
  }

  async function onSubmit(values: FormValues) {
    if (!file) {
      setFileError('Please attach your payment screenshot.')
      return
    }
    setSubmitError(null)
    try {
      setStage('preparing')
      const presigned = await createProofUrl(code, accessKey, file.type)

      setStage('uploading')
      await uploadToS3(presigned, file)

      setStage('saving')
      await submitPayment(code, accessKey, { ...values, proofKey: presigned.key })

      setStage('done')
      await regQuery.refetch()
    } catch (err) {
      setStage('idle')
      if (err instanceof ApiError && err.fields) {
        for (const [f, message] of Object.entries(err.fields)) {
          if (f in schema.shape) setError(f as keyof FormValues, { message })
        }
        setSubmitError(err.message)
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    }
  }

  // ---- guards ------------------------------------------------------------

  if (!accessKey) {
    return (
      <Card>
        <PageHeader title="This link is incomplete" />
        <Alert tone="warning" title="We could not open your registration from this link">
          Please open the payment link from your registration email again. If you no longer have
          the email, we can send your personal link to the address you registered with.
        </Alert>
        <div className="mt-6">
          <LinkButton to="/my" variant="secondary">
            Email me my link
          </LinkButton>
        </div>
      </Card>
    )
  }

  if (regQuery.isLoading) return <Spinner label="Loading your registration" />

  if (regQuery.error) {
    return (
      <Card>
        <PageHeader title="We couldn't find that registration" />
        <Alert tone="error">{(regQuery.error as Error).message}</Alert>
      </Card>
    )
  }

  const reg = regQuery.data!.registration
  const payments = regQuery.data!.payments
  const canSubmit = reg.status === 'PENDING_PAYMENT' || reg.status === 'REJECTED'
  const lastRejection = payments.find((p) => p.status === 'REJECTED')

  if (stage === 'done' || (!canSubmit && reg.status === 'PAYMENT_SUBMITTED')) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment details received" />
        <Card>
          <div className="flex gap-3">
            <CheckCircle2 className="mt-1 size-6 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="text-lg font-semibold">Thank you — nothing further is needed for now.</p>
              <p className="mt-1 text-muted-fg">
                Your details are with the registration team. You'll get an email once they've been
                checked, and your status here will change to Confirmed.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <LinkButton to={`/my?code=${code}&k=${encodeURIComponent(accessKey)}`} variant="secondary">
              View my registration
            </LinkButton>
          </div>
        </Card>
      </div>
    )
  }

  if (!canSubmit) {
    return (
      <div className="space-y-6">
        <PageHeader title="No payment needed" />
        <Card>
          <div className="mb-4">
            <StatusBadge status={reg.status} />
          </div>
          <p className="text-lg">
            {reg.status === 'CONFIRMED'
              ? "You're already confirmed for AC 2027. No further payment is needed."
              : 'This registration cannot accept a payment. Please contact the registration team.'}
          </p>
          <div className="mt-6">
            <LinkButton to={`/my?code=${code}&k=${encodeURIComponent(accessKey)}`} variant="secondary">
              View my registration
            </LinkButton>
          </div>
        </Card>
      </div>
    )
  }

  const busy = stage !== 'idle'
  const seats = reg.seats ?? 1
  const isTable = seats > 1

  const amountRow = (
    <DataRow
      label="Amount to pay"
      value={
        <span className="tnum">
          {money(expectedAmount, event?.currency)}
          {isTable && (
            <span className="ml-2 block font-normal text-muted-fg sm:inline">
              {priceLine(seats, reg.unitFee, expectedAmount, event?.currency)}
            </span>
          )}
        </span>
      }
    />
  )

  const optionTab = (value: PayOption, Icon: typeof QrCode, label: string) => {
    const active = chosen === value
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={`pay-${value}`}
        id={`tab-${value}`}
        onClick={() => setOption(value)}
        className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-4
                    font-heading font-semibold transition-colors duration-150 ${
                      active
                        ? 'bg-primary text-white'
                        : 'bg-white text-primary hover:bg-surface'
                    }`}
      >
        <Icon className="size-5" aria-hidden="true" />
        {label}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isTable ? 'Upload the payment for your table' : 'Upload your payment'}
        lede={
          isTable
            ? `Booking ${reg.code} — ${seats} places, booked by ${reg.name ?? ''}`
            : `Registration ${reg.code} — ${reg.name ?? ''}`
        }
      />

      {isTable && (
        <Alert tone="info" title="One payment covers the whole table">
          {seats} places, one transfer, one screenshot. You do not need the other names before
          paying.
        </Alert>
      )}

      {lastRejection && (
        <Alert tone="error" title="Your previous submission needs correcting">
          <p className="mt-1">{lastRejection.rejectReason}</p>
          <p className="mt-2">Please submit the corrected details below.</p>
        </Alert>
      )}

      {pay && (
        <Card>
          <h2 className="text-xl">Step 1 — Pay the fee</h2>

          {/* Two ways to pay, one visible at a time. Both tabs show only when
              the committee has set both up; otherwise the one that exists. */}
          {hasPayNow && hasBank && (
            <div
              role="tablist"
              aria-label="How would you like to pay?"
              className="mt-4 flex gap-1 rounded-lg border border-border bg-surface p-1"
            >
              {optionTab('PAYNOW', QrCode, 'PayNow')}
              {optionTab('BANK_TRANSFER', Building2, 'Bank transfer')}
            </div>
          )}

          {chosen === 'PAYNOW' && hasPayNow ? (
            <div
              id="pay-PAYNOW"
              role="tabpanel"
              aria-labelledby="tab-PAYNOW"
              className="mt-4 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start"
            >
              {paynowPayload ? (
                <figure className="flex flex-col items-center mx-auto w-fit rounded-lg border border-border bg-white p-4">
                  <QRCodeSVG value={paynowPayload} size={208} marginSize={0} level="M" />
                  <figcaption className="mt-3 text-center text-[15px] text-muted-fg">
                    Scan with any Singapore banking app
                  </figcaption>
                </figure>
              ) : (
                <Alert tone="warning" title="QR code unavailable">
                  Pay with PayNow to the details on the right.
                </Alert>
              )}
              <div>
                <dl>
                  <DataRow label="PayNow" value={<span className="tnum">{pay.payNow}</span>} />
                  {pay.accountName && <DataRow label="Pays to" value={pay.accountName} />}
                  {amountRow}
                  <DataRow label="Reference" value={<span className="tnum">{reg.code}</span>} />
                </dl>
                <p className="mt-3 text-[16px] text-muted-fg">
                  The amount and reference are already in the code — the app will not let you
                  change them. Take a screenshot of the confirmation for Step 2.
                </p>
              </div>
            </div>
          ) : (
            <div id="pay-BANK_TRANSFER" role="tabpanel" aria-labelledby="tab-BANK_TRANSFER" className="mt-2">
              <dl>
                {pay.bankName && <DataRow label="Bank" value={pay.bankName} />}
                {pay.accountName && <DataRow label="Account name" value={pay.accountName} />}
                {pay.accountNumber && (
                  <DataRow label="Account number" value={<span className="tnum">{pay.accountNumber}</span>} />
                )}
                {!hasBank && pay.payNow && (
                  <DataRow label="PayNow" value={<span className="tnum">{pay.payNow}</span>} />
                )}
                {amountRow}
                <DataRow label="Payment reference" value={<span className="tnum">{reg.code}</span>} />
              </dl>
              {pay.instructions && <p className="mt-3 text-[16px] text-muted-fg">{pay.instructions}</p>}
            </div>
          )}
        </Card>
      )}

      <Card>
        <h2 className="text-xl">Step 2 — Tell us about the payment</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5" noValidate>
          {submitError && (
            <Alert tone="error" title="We couldn't save your payment">
              {submitError}
            </Alert>
          )}

          <Field
            label="Transaction reference"
            htmlFor="reference"
            required
            hint={
              chosen === 'PAYNOW'
                ? 'Your registration code, as carried in the QR code. Replace it with the transaction number from your banking app if you prefer.'
                : 'Your registration code is filled in. Replace it with the transaction number from your bank if you have one.'
            }
            error={errors.reference?.message}
          >
            <Input
              id="reference"
              className="tnum"
              aria-invalid={!!errors.reference}
              aria-describedby={errors.reference ? 'reference-error' : 'reference-hint'}
              {...register('reference')}
            />
          </Field>

          <div className="grid gap-5">
            <Field label="Date paid" htmlFor="paidOn" required error={errors.paidOn?.message}>
              <Input
                id="paidOn"
                type="date"
                aria-invalid={!!errors.paidOn}
                aria-describedby={errors.paidOn ? 'paidOn-error' : undefined}
                {...register('paidOn')}
              />
            </Field>

            <Field
              label={`Amount paid${event ? ` (${event.currency})` : ''}`}
              htmlFor="amount"
              required
              error={errors.amount?.message}
            >
              <Input
                id="amount"
                inputMode="decimal"
                className="tnum"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                {...register('amount')}
              />
            </Field>
          </div>

          <Field label="How you paid" htmlFor="method" required error={errors.method?.message}>
            <Select id="method" {...register('method')}>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="PAYNOW">PayNow</option>
            </Select>
          </Field>

          <Field
            label="Payment screenshot"
            htmlFor="proof"
            required
            hint="JPG, PNG, WebP or PDF, up to 5 MB. Make sure the amount, date and reference are readable."
            error={fileError ?? undefined}
          >
            <input
              id="proof"
              type="file"
              accept={ACCEPTED.join(',')}
              aria-invalid={!!fileError}
              aria-describedby={fileError ? 'proof-error' : 'proof-hint'}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-md border border-border bg-white p-2.5
                         text-[16px] file:mr-3 file:min-h-9 file:cursor-pointer file:rounded
                         file:border-0 file:bg-primary file:px-4 file:font-heading
                         file:font-semibold file:text-primary-fg"
            />
          </Field>

          {file && (
            <div className="rounded-md border border-border bg-surface p-3">
              <p className="text-[15px] font-semibold">
                {file.name}{' '}
                <span className="font-normal text-muted-fg tnum">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </p>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview of the payment screenshot you selected"
                  className="mt-2 max-h-64 rounded border border-border object-contain"
                />
              )}
            </div>
          )}

          <div className="border-t border-border pt-5">
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">
              <Upload className="size-4" aria-hidden="true" />
              {busy ? 'Submitting…' : 'Submit payment details'}
            </Button>
            {/* Named stages, not a generic spinner: the upload is the slow part
                and "Uploading your screenshot…" stops people pressing again. */}
            {busy && (
              <p role="status" className="mt-3 text-[15px] font-semibold text-primary">
                {STAGE_LABEL[stage]}
              </p>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
