'use client'

import React from 'react'
import { FormFieldType } from '@/types'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button as UIButton } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar, ChevronsUpDown, Star, MapPin, PenTool, CreditCard, FileText, Hash, Lock, Smartphone } from 'lucide-react'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@/components/ui/multi-select'
import { TagsInput } from '@/components/ui/tags-input'
import { SmartDatetimeInput } from '@/components/ui/smart-datetime-input'
import { DatetimePicker } from '@/components/ui/datetime-picker'
import LocationSelector from '@/components/ui/location-input'
import SignatureInput from '@/components/ui/signature-input'
import { CreditCard as CreditCardUI, type CreditCardValue } from '@/components/ui/credit-card'
import { FileUploader, FileUploaderContent, FileUploaderItem } from '@/components/ui/file-upload'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DateCalendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface FormFieldRendererProps {
  field: FormFieldType
}

const MultiSelectPreview: React.FC<{ field: FormFieldType }> = ({ field }) => {
  const [values, setValues] = React.useState<string[]>([])
  const options = field.options || [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Svelte', value: 'svelte' },
    { label: 'Angular', value: 'angular' },
  ]
  return (
    <div className="w-full">
      <Label className="text-sm font-medium mb-2 block">{field.label || 'Multi Select'}{field.required ? ' *' : ''}</Label>
      <MultiSelector values={values} onValuesChange={setValues}>
        <MultiSelectorTrigger>
          <MultiSelectorInput placeholder={field.placeholder || 'Select options'} />
        </MultiSelectorTrigger>
        <MultiSelectorContent>
          <MultiSelectorList>
            {options.map((opt) => (
              <MultiSelectorItem key={opt.value} value={opt.value}>
                {opt.label}
              </MultiSelectorItem>
            ))}
          </MultiSelectorList>
        </MultiSelectorContent>
      </MultiSelector>
    </div>
  )
}

const TagsInputPreview: React.FC<{ field: FormFieldType }> = ({ field }) => {
  const [tags, setTags] = React.useState<string[]>([])
  return (
    <div className="w-full">
      <Label className="text-sm font-medium mb-2 block">{field.label || 'Tags'}{field.required ? ' *' : ''}</Label>
      <TagsInput value={tags} onValueChange={setTags} placeholder={field.placeholder || 'Enter tags'} />
    </div>
  )
}

export function FormFieldRenderer({ field }: FormFieldRendererProps) {
  // Render your custom components based on field type
  switch (field.type) {
    case 'input':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Text Input'}{field.required ? ' *' : ''}</Label>
          <Input 
            placeholder={field.placeholder || 'Enter text...'} 
            disabled={field.disabled}
            className="w-full"
          />
        </div>
      )
    
    case 'textarea':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Text Area'}{field.required ? ' *' : ''}</Label>
          <Textarea 
            placeholder={field.placeholder || 'Enter text...'} 
            disabled={field.disabled}
            className="w-full min-h-[80px]"
          />
        </div>
      )
    
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox disabled={field.disabled} />
          <Label className="text-sm">{field.label || 'Checkbox'}{field.required ? ' *' : ''}</Label>
        </div>
      )
    
    case 'switch':
      return (
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">
              {field.label || 'Switch'}{field.required ? ' *' : ''}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
          <Switch disabled={field.disabled} aria-readonly />
        </div>
      )
    
    case 'select':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Select'}{field.required ? ' *' : ''}</Label>
          <Select disabled={field.disabled}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder || 'Select option...'} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
                { label: 'Option 3', value: 'option3' },
              ]).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    
    case 'slider':
      return (
        <div className="w-full space-y-2">
          <Label className="text-sm font-medium block">{field.label || 'Slider'}{field.required ? ' *' : ''}</Label>
          <Slider defaultValue={[50]} max={100} step={1} disabled={field.disabled} />
          <div className="text-xs text-muted-foreground text-center">50</div>
        </div>
      )
    
    case 'number':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Number'}{field.required ? ' *' : ''}</Label>
          <Input 
            type="number" 
            placeholder={field.placeholder || 'Enter number...'} 
            disabled={field.disabled}
            className="w-full"
          />
        </div>
      )
    
    case 'password':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Password'}{field.required ? ' *' : ''}</Label>
          <PasswordInput placeholder={field.placeholder || 'Enter password...'} disabled={field.disabled} className="w-full" />
        </div>
      )
    
    case 'phone':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Phone'}{field.required ? ' *' : ''}</Label>
          <PhoneInput placeholder={field.placeholder || 'Enter phone number...'} defaultCountry="US" disabled={field.disabled} className="w-full" />
        </div>
      )
    
    case 'date-picker': {
      const [open, setOpen] = React.useState(false)
      const [date, setDate] = React.useState<Date | undefined>(undefined)
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Date'}{field.required ? ' *' : ''}</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <UIButton variant="outline" className="w-48 justify-between font-normal" disabled={field.disabled}>
                {date ? date.toLocaleDateString() : (field.placeholder || 'Select date')}
                <ChevronDownIcon className="h-4 w-4 opacity-70" />
              </UIButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <DateCalendar
                mode="single"
                captionLayout="dropdown"
                selected={date}
                onSelect={(d) => {
                  setDate(d)
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )
    }

    case 'datetime-picker': {
      const [dt, setDt] = React.useState<Date | undefined>(undefined)
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Date & Time'}{field.required ? ' *' : ''}</Label>
          <DatetimePicker value={dt} onChange={setDt} format={[['months','days','years'],['hours','minutes']]} dtOptions={{ hour12: false }} />
        </div>
      )
    }

    case 'smart-datetime': {
      const [dt, setDt] = React.useState<Date | null>(null)
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Smart DateTime'}{field.required ? ' *' : ''}</Label>
          <SmartDatetimeInput value={dt} onValueChange={setDt} />
        </div>
      )
    }
    
    case 'file-input': {
      const [files, setFiles] = React.useState<File[] | null>(null)
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'File Upload'}{field.required ? ' *' : ''}</Label>
          <FileUploader value={files} onValueChange={setFiles} dropzoneOptions={{ maxFiles: 5, multiple: true }}>
            <div className="border rounded-md p-4 text-sm text-muted-foreground">Drop files here or click to upload</div>
            <FileUploaderContent>
              {(files ?? []).map((_, i) => (
                <FileUploaderItem key={i} index={i} />
              ))}
            </FileUploaderContent>
          </FileUploader>
        </div>
      )
    }
    
    case 'location-input': {
      return (
        <div className="w-full space-y-2">
          <Label className="text-sm font-medium block">{field.label || 'Location'}{field.required ? ' *' : ''}</Label>
          <LocationSelector disabled={field.disabled} />
        </div>
      )
    }
    
    case 'signature-input': {
      const [sig, setSig] = React.useState<string | null>(null)
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Signature'}{field.required ? ' *' : ''}</Label>
          <SignatureInput onSignatureChange={setSig} />
        </div>
      )
    }
    
    case 'credit-card': {
      const [cc, setCc] = React.useState<CreditCardValue | undefined>(undefined)
      return (
        <div className="w-full space-y-2">
          <Label className="text-sm font-medium block">{field.label || 'Credit Card'}{field.required ? ' *' : ''}</Label>
          <CreditCardUI value={cc} onChange={setCc} />
        </div>
      )
    }
    
    case 'rating':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">{field.label || 'Rating'}{field.required ? ' *' : ''}</Label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" aria-label={`Rate ${n}`} className="w-6 h-6 text-yellow-500">
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
        </div>
      )
    
    case 'radio-group':
      return (
        <div className="w-full space-y-2">
          <Label className="text-sm font-medium block">{field.label || 'Radio Group'}{field.required ? ' *' : ''}</Label>
          {(field.options || [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' },
          ]).map((opt, index) => (
            <div key={opt.value || index} className="flex items-center space-x-2">
              <div className="w-4 h-4 border rounded-full bg-primary"></div>
              <Label className="text-sm">{opt.label}</Label>
            </div>
          ))}
        </div>
      )
    case 'checkbox-group': {
      const opts = field.options || [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ]
      const [selected, setSelected] = React.useState<string[]>([])
      return (
        <div className="w-full space-y-2">
          <Label className="text-sm font-medium block">{field.label || 'Checkbox Group'}{field.required ? ' *' : ''}</Label>
          {opts.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.includes(opt.value)}
                onCheckedChange={(v) =>
                  setSelected((prev) => (v ? Array.from(new Set([...prev, opt.value])) : prev.filter((x) => x !== opt.value)))
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      )
    }

    case 'text-block': {
      const variant = (field as any).variant || 'paragraph'
      const content = (field.description || field.label || '').trim() || (variant === 'heading' ? 'Heading' : variant === 'sub-heading' ? 'Sub-heading' : variant === 'caption' ? 'Caption' : 'Paragraph')
      const style: React.CSSProperties = {
        fontSize: field.fontSizePt ? `${field.fontSizePt}pt` : undefined,
        fontWeight: (field as any).bold ? 600 : undefined,
        fontStyle: (field as any).italic ? 'italic' : undefined,
      }
      return (
        <div className="w-full">
          {variant === 'heading' && (
            <h2 className="text-2xl font-semibold" style={style}>{content}</h2>
          )}
          {variant === 'sub-heading' && (
            <h3 className="text-xl font-medium" style={style}>{content}</h3>
          )}
          {variant === 'caption' && (
            <p className="text-xs text-muted-foreground" style={style}>{content}</p>
          )}
          {variant === 'paragraph' && (
            <p className="text-sm" style={style}>{content}</p>
          )}
        </div>
      )
    }

    case 'divider':
      return (
        <div className="w-full py-2">
          <Separator />
        </div>
      )

    case 'spacer':
      return <div className="w-full h-6" />
    case 'multi-select':
      return <MultiSelectPreview field={field} />
    
    case 'tags-input':
      return <TagsInputPreview field={field} />
    
    default:
      return (
        <div className="w-full p-3 border rounded bg-muted/50 text-center text-sm text-muted-foreground">
          {field.type} field
        </div>
      )
  }
}
