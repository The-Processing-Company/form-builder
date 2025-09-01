import * as Locales from 'date-fns/locale'

// Define the FormField type
export type FormFieldType = {
  id: string
  type: string
  variant: string
  name: string
  label: string
  placeholder?: string
  description?: string
  disabled: boolean
  options?: { label: string; value: string }[]
  optionSource?: 'static' | 'context'
  optionContextKey?: string
  // File constraints (builder only; mapped into schema)
  accept?: string[]
  maxFiles?: number
  maxSizeMb?: number
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
  // Text block appearance (presentation only)
  fontSizePt?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
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
  contextInputs?: { name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; itemType?: 'string' | 'number' | 'boolean' }[]
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

// --------------------------------------------
// Simplified schema for new FormDesigner/Renderer
// --------------------------------------------

// A minimal, implementation-friendly field definition used by the new renderer
export type FieldTypeKey =
  | 'text'
  | 'textarea'
  | 'number'
  | 'password'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'smart-datetime'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'slider'
  | 'multiselect'
  | 'tags'
  | 'checkbox-group'
  | 'rating'
  | 'file'
  | 'location'
  | 'signature'
  | 'credit-card'

export type FieldValueFor<T extends FieldTypeKey> =
  T extends 'text' | 'textarea' | 'password' | 'phone' | 'date' | 'datetime' | 'select' | 'radio' ? string :
  T extends 'number' ? number :
  T extends 'smart-datetime' ? string :
  T extends 'checkbox' | 'switch' ? boolean :
  T extends 'slider' ? number[] :
  T extends 'multiselect' | 'tags' | 'checkbox-group' ? string[] :
  T extends 'rating' ? number :
  T extends 'file' ? File[] :
  T extends 'location' ? { country?: string; state?: string } :
  T extends 'signature' ? string | null :
  T extends 'credit-card' ? { cardholderName: string; cardNumber: string; expiryMonth: string; expiryYear: string; cvv: string } :
  unknown

export interface SchemaField {
  // Unique field name within the form; serves as identifier
  name: string
  // UI/control type identifier (e.g., 'text', 'textarea', 'select', 'checkbox')
  type: FieldTypeKey
  // Human label shown next to/above the control
  label?: string
  // Optional placeholder text
  placeholder?: string
  // Optional description/help text
  description?: string
  // Whether the field is required
  required?: boolean
  // Whether the field is disabled
  disabled?: boolean
  // Optional list of options for selects, radios, etc.
  options?: { label: string; value: string }[]
  // File constraints
  accept?: string[]
  maxFiles?: number
  maxSizeMb?: number
  // Optional default value
  defaultValue?: any
}

// A logical group of fields. Groups can be used for future layout/features
export interface FormGroup {
  name: string
  fields: SchemaField[]
}

// An item in the top-level form array. It can either be a group or a flat set of fields
export type FormItem = {
  name: string
  fields: SchemaField[]
}

// The top-level form schema
export interface FormSchema {
  name: string
  fields: FormItem[]
}

// Headless Field API used by FormRenderer to wire a field's state uniformly
export interface HeadlessFieldApi<T extends FieldTypeKey = FieldTypeKey> {
  type: T
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  options?: { label: string; value: string }[]
  value: FieldValueFor<T>
  onChange: (value: FieldValueFor<T>) => void
  error?: string
}