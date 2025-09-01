'use client'

import React from 'react'
import { HeadlessFieldApi, FieldTypeKey } from '@/types'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DateCalendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from '@/components/ui/multi-select'
import { TagsInput } from '@/components/ui/tags-input'
import { Rating as UIRating } from '@/components/ui/rating'
import { SmartDatetimeInput } from '@/components/ui/smart-datetime-input'
import LocationSelector from '@/components/ui/location-input'
import SignatureInput from '@/components/ui/signature-input'
import { CreditCard, CreditCardValue } from '@/components/ui/credit-card'
import { FileUploader, FileUploaderContent, FileUploaderItem } from '@/components/ui/file-upload'

export type FieldRendererMode = 'designer' | 'renderer'

export type FieldRendererProps<T extends FieldTypeKey = FieldTypeKey> =
  | ({ mode: 'designer'; field: Omit<HeadlessFieldApi<T>, 'value' | 'onChange' | 'error'> })
  | ({ mode: 'renderer'; field: HeadlessFieldApi<T> })

export const FieldRenderer = (props: FieldRendererProps) => {
  const { field, mode } = props as any
  const { value, onChange, error } = (mode === 'renderer'
    ? (field as HeadlessFieldApi)
    : { value: undefined, onChange: undefined, error: undefined }) as {
    value: unknown
    onChange?: (v: unknown) => void
    error?: string
  }

  const common: any = {
    placeholder: field.placeholder,
    disabled: field.disabled,
    required: field.required ? true : undefined,
    'aria-required': field.required ? true : undefined,
    'aria-invalid': Boolean(error) || undefined,
  }

  const handleChange = (v: unknown) => {
    if (mode === 'renderer' && onChange) onChange(v)
  }

  const [dateOpen, setDateOpen] = React.useState(false)

  switch (field.type as FieldTypeKey) {
    case 'date': {
      const selected = typeof value === 'string' && value ? new Date(value as string) : undefined
      const labelText = selected ? selected.toLocaleDateString() : (field.placeholder || 'Select date')
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" id={field.name} disabled={field.disabled} className="w-48 justify-between font-normal">
                {labelText}
                <ChevronDownIcon className="h-4 w-4 opacity-70" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <DateCalendar
                mode="single"
                captionLayout="dropdown"
                selected={selected}
                onSelect={(d) => {
                  if (!d) {
                    handleChange('')
                  } else {
                    const yyyy = d.getFullYear()
                    const mm = String(d.getMonth() + 1).padStart(2, '0')
                    const dd = String(d.getDate()).padStart(2, '0')
                    handleChange(`${yyyy}-${mm}-${dd}`)
                  }
                  setDateOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    }
    case 'number':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <Input {...common} type="number" value={typeof value === 'number' ? String(value) : ''} onChange={(e) => handleChange(Number(e.target.value))} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'checkbox-group':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <div className="space-y-2">
            {(field.options ?? []).map((opt: {label: string; value: string}) => {
              const checked = Array.isArray(value) ? (value as string[]).includes(opt.value) : false
              return (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={checked} onCheckedChange={(v) => {
                    const current = Array.isArray(value) ? (value as string[]) : []
                    const next = Boolean(v)
                      ? Array.from(new Set([...current, opt.value]))
                      : current.filter((x) => x !== opt.value)
                    handleChange(next)
                  }} disabled={field.disabled} />
                  {opt.label}
                </label>
              )
            })}
          </div>
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'rating': {
      const current = typeof value === 'number' ? (value as number) : 0
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <UIRating value={current} onChange={(n: number) => handleChange(n)} readOnly={false} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    }
    case 'text':
    case 'password':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <PasswordInput {...common} value={(value as string) ?? ''} onChange={(e) => handleChange((e.target as HTMLInputElement).value)} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'phone':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <PhoneInput {...(common as any)} value={(value as string) ?? ''} onChange={(v) => handleChange((v as string) ?? '')} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'datetime': {
      const selected = typeof value === 'string' && value ? new Date(value as string) : null
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <SmartDatetimeInput value={selected} onValueChange={(d) => handleChange(d ? (d as Date).toISOString() : '')} hour12={false} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    }
    case 'smart-datetime':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <SmartDatetimeInput value={(value as any) ?? null} onValueChange={(d) => handleChange(d ? String(d?.toISOString?.() ?? d) : '')} hour12={false} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'file':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <FileUploader value={(value as File[] | null) ?? null} onValueChange={(files: File[] | null) => handleChange(files ?? [])} dropzoneOptions={{ maxFiles: 5, multiple: true }}>
            <FileUploaderContent>
              {(Array.isArray(value) ? (value as File[]) : []).map((_, i) => (
                <FileUploaderItem key={i} index={i} />
              ))}
            </FileUploaderContent>
          </FileUploader>
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'location':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <LocationSelector disabled={field.disabled} onCountryChange={(c) => handleChange({ ...(value as any), country: c?.name })} onStateChange={(s) => handleChange({ ...(value as any), state: s?.name })} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'signature':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <SignatureInput onSignatureChange={(sig) => handleChange(sig)} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'credit-card':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <CreditCard value={(value as CreditCardValue) ?? undefined} onChange={(v) => handleChange(v as any)} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'textarea':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <Textarea {...common} value={(value as string) ?? ''} onChange={(e) => handleChange(e.target.value)} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'checkbox':
      return (
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-3">
            <Checkbox checked={Boolean(value)} onCheckedChange={(v) => handleChange(Boolean(v))} disabled={field.disabled} />
            {field.label && <span className="text-sm">{field.label}{field.required ? ' *' : ''}</span>}
          </div>
          {field.description && <span className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</span>}
          {error && <span className="text-[0.8rem] font-medium text-destructive mt-1">{error}</span>}
        </div>
      )
    case 'switch':
      return (
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-3">
            <Switch field={field as HeadlessFieldApi<'switch'>} />
            {field.label && <span className="text-sm">{field.label}{field.required ? ' *' : ''}</span>}
          </div>
          {field.description && <span className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</span>}
          {error && <span className="text-[0.8rem] font-medium text-destructive mt-1">{error}</span>}
        </div>
      )
    case 'select':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <Select value={(value as string) ?? ''} onValueChange={(v) => handleChange(v)}>
            <SelectTrigger disabled={field.disabled}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((opt: {label: string; value: string}) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'radio':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <RadioGroup value={(value as string) ?? ''} onValueChange={(v) => handleChange(v)}>
            {(field.options ?? []).map((opt: {label: string; value: string}) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem id={`${field.name}-${opt.value}`} value={opt.value} disabled={field.disabled} />
                <label htmlFor={`${field.name}-${opt.value}`} className="text-sm">
                  {opt.label}
                </label>
              </div>
            ))}
          </RadioGroup>
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'slider':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <Slider field={field as HeadlessFieldApi<'slider'>} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'multiselect':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <MultiSelector values={(value as string[]) ?? []} onValuesChange={(v) => handleChange(v)}>
            <MultiSelectorTrigger>
              <MultiSelectorInput placeholder={field.placeholder || 'Select options'} />
            </MultiSelectorTrigger>
            <MultiSelectorContent>
              <MultiSelectorList>
                {(field.options ?? []).map((opt: { label: string; value: string }) => (
                  <MultiSelectorItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MultiSelectorItem>
                ))}
              </MultiSelectorList>
            </MultiSelectorContent>
          </MultiSelector>
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    case 'tags':
      return (
        <div>
          {field.label && (
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required ? ' *' : ''}
            </label>
          )}
          <TagsInput value={(value as string[]) ?? []} onValueChange={(v) => handleChange(v)} placeholder={field.placeholder || 'Enter tags'} />
          {field.description && <p className="text-[0.8rem] text-muted-foreground mt-1">{field.description}</p>}
          {error && <p className="text-[0.8rem] font-medium text-destructive mt-1">{error}</p>}
        </div>
      )
    default:
      return (
        <div>
          {field.label && <label className="block text-sm font-medium mb-1">{field.label}</label>}
          <p className="text-[0.8rem] text-muted-foreground">Unsupported field type: {field.type}</p>
        </div>
      )
  }
}


