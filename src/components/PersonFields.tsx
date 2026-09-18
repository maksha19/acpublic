import { useState } from 'react'
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form'
import { otherOption } from '../lib/person'
import type { PublicField } from '../lib/types'
import { Field, Input, Select } from './ui'

/* The committee-defined part of a person form — every field after name and
   email — rendered from the event's definitions, one per row. Register and
   the table roster both use this, so a field the committee adds appears in
   both places at once. Single column on purpose: two-column rows misalign
   the moment one hint wraps. */

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
  return (
    <>
      {fields.map((f) => (
        <DynamicField key={f.key} control={control} field={f} id={`${idPrefix}${f.key}`} />
      ))}
    </>
  )
}

function DynamicField<T extends FieldValues>({
  control,
  field,
  id,
}: {
  control: Control<T>
  field: PublicField
  id: string
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
      hint={field.required ? undefined : 'Optional.'}
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
