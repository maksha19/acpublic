import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CircleDashed, Pencil, UserCheck, UserPlus } from 'lucide-react'
import { ApiError, updateMember } from '../lib/api'
import { personSchema, personValues, showValue, type PersonValues } from '../lib/person'
import PersonFields from './PersonFields'
import { Alert, Button, Card, Field, Input } from './ui'
import type { Attendee, PublicField } from '../lib/types'

/**
 * The table owner's roster.
 *
 * Saved ONE MEMBER AT A TIME, deliberately. A forty-field form for ten people
 * is abandoned halfway on a phone, and "give the details at any time" needs
 * incremental saves regardless — the owner will come back to this page weeks
 * after paying, several times, with two names each visit.
 */
export default function Roster({
  code,
  accessKey,
  seats,
  namedSeats,
  members,
  fields,
  closed,
  cutoffLabel,
  onSaved,
}: {
  code: string
  accessKey: string
  seats: number
  namedSeats: number
  members: Attendee[]
  /** The event's registration form fields — what each member is asked. */
  fields: PublicField[]
  closed: boolean
  cutoffLabel?: string
  onSaved: () => void
}) {
  const [editing, setEditing] = useState<number | null>(null)
  const remaining = Math.max(seats - namedSeats, 0)

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">Who is coming</h2>
        <p className="font-heading font-semibold text-primary tnum">
          {namedSeats} of {seats} details provided
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-valuenow={namedSeats}
        aria-valuemin={0}
        aria-valuemax={seats}
        aria-label={`${namedSeats} of ${seats} places have details`}
      >
        <div
          className="h-full bg-success transition-[width] duration-300"
          style={{ width: `${(namedSeats / seats) * 100}%` }}
        />
      </div>

      {closed ? (
        <div className="mt-4">
          <Alert tone="warning" title="Details are now closed">
            {cutoffLabel
              ? `Names could be added until ${cutoffLabel}.`
              : 'Names closed five days before the conference.'}{' '}
            {remaining > 0 && (
              <>
                Your {remaining === 1 ? 'remaining place' : `${remaining} remaining places`}{' '}
                {remaining === 1 ? 'is' : 'are'} still paid for and valid — the registration desk
                can take a name on the day.
              </>
            )}
          </Alert>
        </div>
      ) : (
        remaining > 0 && (
          <p className="mt-4 text-[16px] text-muted-fg">
            There is no hurry. Add each person when you know who they are — they will be emailed
            their own code as you go, and nothing about the payment.
          </p>
        )
      )}

      <ul className="mt-4 divide-y divide-border">
        {members.map((member) => {
          const n = member.memberNo ?? 0
          const named = !member.detailsPending
          const isOpen = editing === n

          return (
            <li key={member.code} className="py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {named ? (
                      <UserCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <CircleDashed className="size-4 shrink-0 text-muted-fg" aria-hidden="true" />
                    )}
                    <p className="font-semibold">
                      {/* An unnamed seat is described by what it is, not left
                          blank. It is a reserved place, not missing data. */}
                      {member.name ?? `Place ${n + 1} — no details yet`}
                    </p>
                  </div>
                  <p className="ml-6 text-[15px] text-muted-fg tnum">{member.code}</p>
                  {named && (
                    <p className="ml-6 text-[15px] text-muted-fg">
                      {[
                        member.email,
                        ...fields.map((f) => showValue(f, member[f.key])).filter((v) => v !== '—'),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </div>

                {!closed && (
                  <Button
                    variant={named ? 'ghost' : 'secondary'}
                    onClick={() => setEditing(isOpen ? null : n)}
                    aria-expanded={isOpen}
                    className="!px-3"
                  >
                    {named ? (
                      <>
                        <Pencil className="size-4" aria-hidden="true" /> Edit
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4" aria-hidden="true" /> Add details
                      </>
                    )}
                  </Button>
                )}
              </div>

              {isOpen && !closed && (
                <MemberForm
                  code={code}
                  accessKey={accessKey}
                  member={member}
                  memberNo={n}
                  fields={fields}
                  onDone={() => {
                    setEditing(null)
                    onSaved()
                  }}
                  onCancel={() => setEditing(null)}
                />
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function MemberForm({
  code,
  accessKey,
  member,
  memberNo,
  fields,
  onDone,
  onCancel,
}: {
  code: string
  accessKey: string
  member: Attendee
  memberNo: number
  fields: PublicField[]
  onDone: () => void
  onCancel: () => void
}) {
  const [banner, setBanner] = useState<string | null>(null)
  const schema = useMemo(() => personSchema('their', fields), [fields])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PersonValues>({
    resolver: zodResolver(schema),
    defaultValues: personValues(fields, member),
  })

  const save = useMutation({
    mutationFn: (values: PersonValues) => updateMember(code, memberNo, accessKey, values),
    onSuccess: onDone,
    onError: (err) => {
      if (err instanceof ApiError && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          setError(field as keyof PersonValues, { message })
        }
        setBanner(err.message)
      } else {
        setBanner(err instanceof Error ? err.message : 'That could not be saved.')
      }
    },
  })

  const id = (field: string) => `m${memberNo}-${field}`
  const wasNamed = !member.detailsPending

  return (
    <form
      onSubmit={handleSubmit((values) => save.mutate(values))}
      className="mt-4 space-y-4 rounded-md border border-border bg-surface p-4"
      noValidate
    >
      {banner && (
        <Alert tone="error" title="We couldn't save these details">
          {banner}
        </Alert>
      )}

      <Field label="Full name" htmlFor={id('name')} required error={errors.name?.message}>
        <Input id={id('name')} autoComplete="off" {...register('name')} />
      </Field>

      <Field
        label="Email"
        htmlFor={id('email')}
        required
        hint={
          wasNamed
            ? 'Changing this re-sends their code to the new address.'
            : 'They will be emailed their own code and link. Nothing about the payment.'
        }
        error={errors.email?.message}
      >
        <Input
          id={id('email')}
          type="email"
          inputMode="email"
          autoComplete="off"
          aria-describedby={`${id('email')}-hint`}
          {...register('email')}
        />
      </Field>

      <PersonFields control={control} fields={fields} idPrefix={id('')} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : wasNamed ? 'Save changes' : 'Save and email their code'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={save.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
