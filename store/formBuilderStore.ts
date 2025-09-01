import { create } from 'zustand'
import { FormFieldType, FormFieldOrGroup } from '@/types'

type FormBuilderState = {
  formFields: FormFieldOrGroup[]
  selectedField: FormFieldType | null
  setFormFields: (fields: FormFieldOrGroup[]) => void
  selectByName: (name: string) => void
  selectById: (id: string) => void
  setSelectedField: (field: FormFieldType | null) => void
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  formFields: [],
  selectedField: null,
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
}))


