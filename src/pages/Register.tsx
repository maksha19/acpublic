import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
import { ApiError, createRegistration, getEvent } from '../lib/api'
import { remember } from '../lib/session'
import { Alert, Button, Card, Field, Input, LinkButton, PageHeader, Select } from '../components/ui'

/* Client-side validation mirrors the Pydantic models in the Lambda. It exists to
   give fast, friendly feedback — the server revalidates everything, because
   anyone can post to the API directly. */
const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/, 'Enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, 'Enter a valid phone number, e.g. +65 8123 4567.'),
  club: z.string().trim().min(2, 'Please enter your club name.').max(80),
  dietary: z.string().trim().max(120).default(''),
  tshirt: z.enum(['', 'S', 'M', 'L', 'XL', 'XXL']).default(''),
})

type FormValues = z.input<typeof schema>

export default function Register() {
  const { data: event } = useQuery({ queryKey: ['event'], queryFn: getEvent })
  const [result, setResult] = useState<{ code: string; accessKey: string } | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', club: '', dietary: '', tshirt: '' },
  })

  const mutation = useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      // The access key is shown once and emailed once. Keeping it in this
      // browser means "Check my registration" works later without the email.
      remember(data.code, data.accessKey)
      setResult({ code: data.code, accessKey: data.accessKey })
    },
    onError: (err) => {
      // Map server field errors back onto the inputs, so a rejected email lands
      // on the email box rather than in a banner at the top.
      if (err instanceof ApiError && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          setError(field as keyof FormValues, { message })
        }
      }
    },
  })

  if (result) {
    const payHref = `/register/${result.code}/payment?k=${encodeURIComponent(result.accessKey)}`
    return (
      <div className="space-y-6">
        <PageHeader title="You're registered — one step to go" />
        <Card>
          <p className="text-lg">Your place is reserved but not yet confirmed. Payment comes next.</p>

          <div className="my-6 rounded-md bg-happy-yellow px-5 py-4 text-center">
            <p className="text-[15px] uppercase tracking-[0.1em] text-loyal-blue">
              Your registration code
            </p>
            <p className="font-heading text-3xl font-bold tracking-wide text-loyal-blue tnum">
              {result.code}
            </p>
          </div>

          <Alert tone="info" title="We've emailed this to you">
            The email has your code, the payment details and a personal link to check your status.
            Keep it — the link cannot be recovered from the code alone.
          </Alert>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton to={payHref}>
              Continue to payment <ArrowRight className="size-4" aria-hidden="true" />
            </LinkButton>
            <LinkButton to={`/my?code=${result.code}&k=${encodeURIComponent(result.accessKey)}`} variant="secondary">
              View my registration
            </LinkButton>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register for AC 2027"
        lede={
          event
            ? `Conference fee: ${event.currency} ${Number(event.fee).toFixed(2)}. You'll pay after this step.`
            : 'Fill in your details. Payment comes after this step.'
        }
      />

      <Card>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values as Required<FormValues>))}
          className="space-y-5"
          noValidate
        >
          {mutation.error && !(mutation.error instanceof ApiError && mutation.error.fields) && (
            <Alert tone="error" title="We couldn't complete your registration">
              {mutation.error.message}
            </Alert>
          )}

          <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
          </Field>

          <Field
            label="Email"
            htmlFor="email"
            required
            hint="Your registration code and confirmation are sent here."
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : 'email-hint'}
              {...register('email')}
            />
          </Field>

          <Field
            label="Mobile number"
            htmlFor="phone"
            required
            hint="Used only if we need to reach you about your registration."
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
              {...register('phone')}
            />
          </Field>

          <Field label="Club" htmlFor="club" required error={errors.club?.message}>
            <Input
              id="club"
              autoComplete="organization"
              aria-invalid={!!errors.club}
              aria-describedby={errors.club ? 'club-error' : undefined}
              {...register('club')}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Dietary requirements"
              htmlFor="dietary"
              hint="Optional — leave blank if none."
              error={errors.dietary?.message}
            >
              <Input id="dietary" aria-describedby="dietary-hint" {...register('dietary')} />
            </Field>

            <Field label="T-shirt size" htmlFor="tshirt" hint="Optional." error={errors.tshirt?.message}>
              <Select id="tshirt" aria-describedby="tshirt-hint" {...register('tshirt')}>
                <option value="">Not sure yet</option>
                {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="border-t border-border pt-5">
            <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full sm:w-auto">
              {mutation.isPending ? 'Registering…' : 'Register'}
            </Button>
            <p className="mt-3 text-[15px] text-muted-fg">
              Registering reserves a place. It is confirmed once your payment has been verified.
            </p>
          </div>
        </form>
      </Card>
    </div>
  )
}
