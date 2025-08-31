import * as Locales from 'date-fns/locale'

// Define the FormField type
export type FormFieldType = {
  type: string
  variant: string
  name: string
  label: string
  placeholder?: string
  description?: string
  disabled: boolean
  value: string | boolean | Date | number | string[]
  setValue: (value: string | boolean) => void
  checked: boolean
  onChange: (
    value: string | string[] | boolean | Date | number | number[],
  ) => void
  onSelect: (
    value: string | string[] | boolean | Date | number | number[],
  ) => void
  rowIndex: number
  required?: boolean
  min?: number
  max?: number
  step?: number
  locale?: keyof typeof Locales
  hour12?: boolean
  className?: string
}

export type FieldType = { name: string; isNew: boolean; index?: number }

export interface EditorColumn {
  id: string
  content: string
  width: number // 1-12 representing tailwind grid columns
}

export interface EditorBlock {
  id: string
  type: 'text' | 'heading' | 'checkbox' | 'columns'
  content: string
  columns?: EditorColumn[]
}

export interface EditorHistoryState {
  blocks: EditorBlock[]
  timestamp: number
}

// New types for form storage
export interface StoredForm {
  id: string
  name: string
  fields: FormFieldOrGroup[]
  createdAt: number
  updatedAt: number
  description?: string
}

export interface FormMetadata {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  description?: string
  fieldCount: number
}

export type FormFieldOrGroup = FormFieldType | FormFieldType[]