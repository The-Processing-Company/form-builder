'use client'

import React from 'react'
import { FieldRenderer } from './field-renderer'
import { FormSchema, SchemaField, HeadlessFieldApi } from '@/types'

export interface FormDesignerProps {
  schema: FormSchema
  selectedFieldName?: string
  onFieldSelect?: (fieldName: string) => void
}

export const FormDesigner: React.FC<FormDesignerProps> = ({ schema, selectedFieldName, onFieldSelect }) => {
  return (
    <div className="space-y-4">
      {schema.fields.map((item) => (
        <div key={item.name} className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">{item.name}</div>
          <div className="grid gap-3">
            {item.fields.map((field: SchemaField) => {
              const isSelected = selectedFieldName === field.name
              const api: HeadlessFieldApi = { ...field, value: undefined as any, onChange: () => {} }
              return (
                <div
                  key={field.name}
                  role="button"
                  onClick={() => onFieldSelect?.(field.name)}
                  className={`rounded-md border p-3 ${isSelected ? 'ring-2 ring-ring' : ''}`}
                >
                  <FieldRenderer mode="designer" field={api} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}


