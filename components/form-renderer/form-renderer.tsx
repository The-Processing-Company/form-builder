'use client'

import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { FieldRenderer } from './field-renderer'
import { FormSchema, SchemaField, HeadlessFieldApi } from '@/types'
import { Button } from '@/components/ui/button'

export interface FormRendererProps {
  schema: FormSchema
  initialValues?: Record<string, any>
  disabled?: boolean
  onChange?: (data: Record<string, any>) => void
  onSubmit: (data: Record<string, any>) => void
  onReset?: () => void
  context?: any
}

export const FormRenderer: React.FC<FormRendererProps> = ({ schema, initialValues, disabled, onChange, onSubmit, onReset, context }) => {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const defaultValues = useMemo(() => {
    const acc: Record<string, any> = {}
    schema.fields.forEach((item) => {
      item.fields.forEach((field) => {
        if (['display', 'divider', 'spacer'].includes((field as any).type)) return
        const isBooleanControl = field.type === 'checkbox' || field.type === 'switch'
        let fallback: any = ''
        if (isBooleanControl) fallback = false
        else if (field.type === 'slider') fallback = [0]
        else if (field.type === 'multiselect' || field.type === 'tags' || field.type === 'file' || field.type === 'checkbox-group') fallback = []
        else if (field.type === 'rating') fallback = 0
        else if (field.type === 'location') fallback = { country: undefined, state: undefined }
        else if (field.type === 'signature') fallback = null
        else if (field.type === 'credit-card') fallback = { cardholderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' }
        acc[field.name] = initialValues?.[field.name] ?? field.defaultValue ?? fallback
      })
    })
    return acc
  }, [schema, initialValues])

  const form = useForm({ defaultValues, disabled })

  const handleSubmit = form.handleSubmit((values) => {
    // simple required validation
    const newErrors: Record<string, string | undefined> = {}
    schema.fields.forEach((item) => {
      item.fields.forEach((field) => {
        if (['display', 'divider', 'spacer'].includes((field as any).type)) return
        if (field.required) {
          const v = (values as any)[field.name]
          let isEmpty =
            v === undefined ||
            v === null ||
            v === '' ||
            (Array.isArray(v) && v.length === 0) ||
            (typeof v === 'boolean' && v === false)

          // Type-specific emptiness
          if (!isEmpty) {
            switch (field.type) {
              case 'location': {
                const lv = v as { country?: string; state?: string }
                if (!lv || (!lv.country && !lv.state)) isEmpty = true
                break
              }
              case 'credit-card': {
                const cv = v as { cardholderName?: string; cardNumber?: string; expiryMonth?: string; expiryYear?: string; cvv?: string }
                if (!cv || !(cv.cardholderName && cv.cardNumber && cv.expiryMonth && cv.expiryYear && cv.cvv)) isEmpty = true
                break
              }
            }
          }
          if (isEmpty) newErrors[field.name] = 'This field is required'

          // Basic validity checks for some types
          if (!newErrors[field.name] && field.type === 'smart-datetime') {
            const str = v as string
            if (typeof str === 'string' && str) {
              const ts = Date.parse(str)
              if (Number.isNaN(ts)) newErrors[field.name] = 'Invalid date/time'
            }
          }

          if (!newErrors[field.name] && field.type === 'file') {
            const files = (v as File[]) || []
            const maxFiles = (field as any).maxFiles as number | undefined
            const maxSizeMb = (field as any).maxSizeMb as number | undefined
            if (maxFiles && files.length > maxFiles) newErrors[field.name] = `Max ${maxFiles} files`
            if (maxSizeMb && files.some((f) => f.size > maxSizeMb * 1024 * 1024)) newErrors[field.name] = `Each file must be <= ${maxSizeMb}MB`
            const accept = (field as any).accept as string[] | undefined
            if (accept && accept.length && files.some((f) => !accept.some((a) => f.type.startsWith(a) || f.name.endsWith(a)))) newErrors[field.name] = `Invalid file type`
          }
        }
      })
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    onSubmit(values as Record<string, any>)
  })

  const handleChange = () => {
    const values = form.getValues()
    onChange?.(values as Record<string, any>)
  }

  const handleReset = () => {
    form.reset({})
    onReset?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {schema.fields.map((item) => (
          <div key={item.name} className="">
            <div className="grid gap-3">
              {item.fields.map((field: SchemaField) => {
                const api: HeadlessFieldApi = {
                  ...field,
                  value: form.watch(field.name) as any,
                  onChange: (v: any) => {
                    form.setValue(field.name, v, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
                    handleChange()
                  },
                  error: errors[field.name],
                  // @ts-expect-error allow ctx for custom renderers like 'display'
                  ctx: context,
                }
                return (
                  <FieldRenderer key={field.name} mode="renderer" field={api} />
                )
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 pt-2">
          <Button type="submit">Submit</Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}


