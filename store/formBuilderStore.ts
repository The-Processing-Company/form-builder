import { create } from 'zustand'
import { FormFieldType, FormFieldOrGroup } from '@/types'

type FormBuilderState = {
  formFields: FormFieldOrGroup[]
  selectedField: FormFieldType | null
  setFormFields: (fields: FormFieldOrGroup[]) => void
  selectByName: (name: string) => void
  selectById: (id: string) => void
  setSelectedField: (field: FormFieldType | null) => void
  // Context inputs (external inputs available via $ctx.input)
  contextInputs: { name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; itemType?: 'string' | 'number' | 'boolean' }[]
  setContextInputs: (entries: { name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; itemType?: 'string' | 'number' | 'boolean' }[]) => void
  addContextInput: (entry?: { name?: string; type?: 'string' | 'number' | 'boolean' | 'object' | 'array'; itemType?: 'string' | 'number' | 'boolean' }) => void
  updateContextInput: (index: number, entry: Partial<{ name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; itemType?: 'string' | 'number' | 'boolean' }>) => void
  removeContextInput: (index: number) => void
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  formFields: [],
  selectedField: null,
  contextInputs: [],
  setContextInputs: (entries) => set({ contextInputs: entries || [] }),
  setFormFields: (fields) => set({ formFields: fields }),
  selectByName: (name) => {
    const all: FormFieldType[] = []
    get().formFields.forEach((f) => {
      if (Array.isArray(f)) all.push(...f)
      else all.push(f as FormFieldType)
    })
    const match = all.find((f) => f.name === name) || null
    set({ selectedField: match })
  },
  selectById: (id) => {
    const all: FormFieldType[] = []
    get().formFields.forEach((f) => {
      if (Array.isArray(f)) all.push(...f)
      else all.push(f as FormFieldType)
    })
    const match = all.find((f) => f.id === id) || null
    set({ selectedField: match })
  },
  setSelectedField: (field) => set({ selectedField: field }),
  addContextInput: (entry) =>
    set((state) => ({
      contextInputs: [
        ...state.contextInputs,
        { name: entry?.name || '', type: entry?.type || 'string', itemType: entry?.itemType },
      ],
    })),
  updateContextInput: (index, entry) =>
    set((state) => ({
      contextInputs: state.contextInputs.map((it, i) =>
        i === index ? { ...it, ...entry } : it,
      ),
    })),
  removeContextInput: (index) =>
    set((state) => ({
      contextInputs: state.contextInputs.filter((_, i) => i !== index),
    })),
}))


