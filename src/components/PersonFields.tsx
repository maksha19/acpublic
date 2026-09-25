import { useEffect, useRef, useState } from 'react'
import {
  useController,
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type PathValue,
} from 'react-hook-form'
import { otherOption } from '../lib/person'
import { isClubField, isMemberNumberField, lookupMember, useDirectory } from '../lib/directory'
import type { PublicField } from '../lib/types'
import { Field, Input, Select } from './ui'

/* The committee-defined part of a person form — every field after name and
   email — rendered from the event's definitions, one per row. Register and
   the table roster both use this, so a field the committee adds appears in
   both places at once. Single column on purpose: two-column rows misalign
   the moment one hint wraps.

   One pair of fields is wired together: when the form has both a member
   number and a club, the club is filled in from the District roster as the
   number is typed (lib/directory.ts). A match locks the club box; no match
   unlocks it for typing. Either field alone behaves like any other. */

const TEXTAREA =
  'w-full min-h-11 rounded-md border border-border bg-white px-3 py-2 text-[17px] text-ink ' +
  'placeholder:text-muted-fg focus:border-primary aria-[invalid=true]:border-destructive ' +
  'aria-[invalid=true]:border-2'

export default function PersonFields<T extends FieldValues>({
  control,
  fields,
  idPrefix = '',
}: {
  control: Control<T>
  fields: PublicField[]
  idPrefix?: string
}) {
  const memberField = fields.find(isMemberNumberField)
  const clubField = memberField ? fields.find(isClubField) : undefined
  return (
    <>
      {fields.map((f) =>
        clubField && memberField && f.key === clubField.key ? (
          <ClubFromRoster
            key={f.key}
            control={control}
            field={f}
            memberField={memberField}
            id={`${idPrefix}${f.key}`}
          />
        ) : (
          <DynamicField key={f.key} control={control} field={f} id={`${idPrefix}${f.key}`} />
        ),
      )}
    </>
  )
}

/* ------------------------------------------------------ club from roster ---- */

type LookupStatus = 'blank' | 'checking' | 'found' | 'missing'

/** Half a second after the last keystroke, not on every one: member IDs are
 *  seven or eight digits and a lookup per digit flickers the hint. */
const LOOKUP_DEBOUNCE_MS = 500

function ClubFromRoster<T extends FieldValues>({
  control,
  field,
  memberField,
  id,
}: {
  control: Control<T>
  field: PublicField
  memberField: PublicField
  id: string
}) {
  const { data: directory, isPending: loadingDirectory } = useDirectory()
  const rawMember = useWatch({ control, name: memberField.key as Path<T> })
  const memberNumber = typeof rawMember === 'string' ? rawMember.trim() : ''
  const { field: club } = useController({ control, name: field.key as Path<T> })

  const [status, setStatus] = useState<LookupStatus>(memberNumber ? 'checking' : 'blank')
  // Whether the CURRENT club value came from the roster. Only a value we put
  // there is ever cleared by us; something the member typed is theirs.
  const autoFilled = useRef(false)

  useEffect(() => {
    if (!memberNumber) {
      setStatus('blank')
      if (autoFilled.current) {
        club.onChange('' as PathValue<T, Path<T>>)
        autoFilled.current = false
      }
      return
    }
    if (loadingDirectory) {
      setStatus('checking')
      return
    }
    const timer = setTimeout(() => {
      const entry = lookupMember(directory, memberNumber)
      if (entry) {
        club.onChange(entry.club as PathValue<T, Path<T>>)
        autoFilled.current = true
        setStatus('found')
      } else {
        if (autoFilled.current) {
          club.onChange('' as PathValue<T, Path<T>>)
          autoFilled.current = false
        }
        setStatus('missing')
      }
    }, LOOKUP_DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // club.onChange is stable for the life of the controller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberNumber, directory, loadingDirectory])

  // Locked while a number is being looked up or has matched. With no number
  // typed the box stays locked only when the number is compulsory — an
  // optional number left blank must not strand a required club.
  const locked =
    status === 'found' || status === 'checking' || (status === 'blank' && memberField.required)

  const hint =
    status === 'found'
      ? 'Filled in from the District member roster.'
      : status === 'checking'
        ? 'Looking up your club…'
        : status === 'missing'
          ? 'That member number is not in the roster — type your club here.'
          : memberField.required
            ? `Enter your ${memberField.label.toLowerCase()} above and we will fill this in.`
            : `Filled in from your ${memberField.label.toLowerCase()}, or type it here.`

  return <DynamicField control={control} field={field} id={id} disabled={locked} hint={hint} />
}

/* ------------------------------------------------------------ one field ---- */

function DynamicField<T extends FieldValues>({
  control,
  field,
  id,
  disabled = false,
  hint,
}: {
  control: Control<T>
  field: PublicField
  id: string
  disabled?: boolean
  hint?: string
}) {
  const {
    field: ctl,
    fieldState: { error },
  } = useController({ control, name: field.key as Path<T> })
  const message = error?.message
  const describedBy = message ? `${id}-error` : undefined

  if (field.type === 'boolean') {
    return (
      <div>
        <label className="flex min-h-11 items-center gap-3 font-semibold text-ink">
          <input
            id={id}
            type="checkbox"
            className="size-5 accent-primary"
            checked={ctl.value === true}
            onChange={(e) => ctl.onChange(e.target.checked)}
            onBlur={ctl.onBlur}
            ref={ctl.ref}
            aria-invalid={!!message}
            aria-describedby={describedBy}
          />
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </label>
        {message && (
          <p id={`${id}-error`} role="alert" className="mt-1 text-[15px] font-semibold text-destructive">
            {message}
          </p>
        )}
      </div>
    )
  }

  const text = typeof ctl.value === 'string' ? ctl.value : ''
  return (
    <Field
      label={field.label}
      htmlFor={id}
      required={field.required}
      hint={hint ?? (field.required ? undefined : 'Optional.')}
      error={message}
    >
      {field.type === 'select' ? (
        <SelectWithOther
          id={id}
          options={field.options}
          value={text}
          required={field.required}
          invalid={!!message}
          onChange={ctl.onChange}
          onBlur={ctl.onBlur}
        />
      ) : field.type === 'textarea' ? (
        <textarea
          id={id}
          className={TEXTAREA}
          rows={4}
          maxLength={2000}
          value={text}
          onChange={(e) => ctl.onChange(e.target.value)}
          onBlur={ctl.onBlur}
          ref={ctl.ref}
          aria-invalid={!!message}
          aria-describedby={describedBy}
        />
      ) : (
        <Input
          id={id}
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
          inputMode={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : undefined}
          autoComplete={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : 'off'}
          maxLength={200}
          value={text}
          disabled={disabled}
          onChange={(e) => ctl.onChange(e.target.value)}
          onBlur={ctl.onBlur}
          aria-invalid={!!message}
          aria-describedby={describedBy}
        />
      )}
    </Field>
  )
}

/** A dropdown whose "Other" option opens a "please specify" box; the typed
 *  text is what gets stored, as the server expects. */
function SelectWithOther({
  id,
  options,
  value,
  required,
  invalid,
  onChange,
  onBlur,
}: {
  id: string
  options: string[]
  value: string
  required: boolean
  invalid: boolean
  onChange: (v: string) => void
  onBlur: () => void
}) {
  const other = otherOption(options)
  const isCustom = !!other && value !== '' && !options.includes(value)
  const [otherChosen, setOtherChosen] = useState(false)
  const specifying = !!other && (otherChosen || isCustom)
  return (
    <div className="space-y-2">
      <Select
        id={id}
        value={specifying ? other : value}
        onChange={(e) => {
          const v = e.target.value
          if (other && v === other) {
            setOtherChosen(true)
            onChange('')
          } else {
            setOtherChosen(false)
            onChange(v)
          }
        }}
        onBlur={onBlur}
        aria-invalid={invalid}
      >
        <option value="">{required ? 'Choose…' : 'Not sure yet'}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
      {specifying && (
        <Input
          id={`${id}-other`}
          value={isCustom ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="Please specify"
          aria-label="Please specify"
          maxLength={200}
          aria-invalid={invalid}
        />
      )}
    </div>
  )
}
