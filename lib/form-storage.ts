import { StoredForm, FormMetadata, FormFieldOrGroup } from '@/types'

const FORMS_STORAGE_KEY = 'form-builder-forms'

export class FormStorage {
  private static generateId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getAllForms(): StoredForm[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(FORMS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading forms from storage:', error)
      return []
    }
  }

  static getFormById(id: string): StoredForm | null {
    const forms = this.getAllForms()
    return forms.find(form => form.id === id) || null
  }

  static saveForm(formData: Omit<StoredForm, 'id' | 'createdAt' | 'updatedAt'>, id?: string): StoredForm {
    const forms = this.getAllForms()
    const now = Date.now()
    
    let form: StoredForm
    
    if (id) {
      // Update existing form
      const existingIndex = forms.findIndex(f => f.id === id)
      if (existingIndex !== -1) {
        form = {
          ...forms[existingIndex],
          ...formData,
          updatedAt: now
        }
        forms[existingIndex] = form
      } else {
        throw new Error(`Form with id ${id} not found`)
      }
    } else {
      // Create new form
      form = {
        ...formData,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now
      }
      forms.push(form)
    }
    
    try {
      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms))
      return form
    } catch (error) {
      console.error('Error saving form to storage:', error)
      throw new Error('Failed to save form')
    }
  }

  static deleteForm(id: string): boolean {
    const forms = this.getAllForms()
    const filteredForms = forms.filter(form => form.id !== id)
    
    if (filteredForms.length === forms.length) {
      return false // Form not found
    }
    
    try {
      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(filteredForms))
      return true
    } catch (error) {
      console.error('Error deleting form from storage:', error)
      return false
    }
  }

  static getFormMetadata(): FormMetadata[] {
    const forms = this.getAllForms()
    return forms.map(form => ({
      id: form.id,
      name: form.name,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      description: form.description,
      fieldCount: this.countFields(form.fields)
    }))
  }

  private static countFields(fields: FormFieldOrGroup[]): number {
    let count = 0
    for (const field of fields) {
      if (Array.isArray(field)) {
        count += field.length
      } else {
        count += 1
      }
    }
    return count
  }

  static exportForm(id: string): string | null {
    const form = this.getFormById(id)
    if (!form) return null
    
    try {
      return JSON.stringify(form, null, 2)
    } catch (error) {
      console.error('Error exporting form:', error)
      return null
    }
  }

  static importForm(jsonString: string): StoredForm | null {
    try {
      const formData = JSON.parse(jsonString)
      // Validate that it has the required fields
      if (!formData.fields || !Array.isArray(formData.fields)) {
        throw new Error('Invalid form data: missing or invalid fields')
      }
      
      // Generate new ID and timestamps for imported form
      const now = Date.now()
      const form: StoredForm = {
        ...formData,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now
      }
      
      return form
    } catch (error) {
      console.error('Error importing form:', error)
      return null
    }
  }
}
