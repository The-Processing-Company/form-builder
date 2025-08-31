'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, ArrowLeft } from 'lucide-react'

import { FormFieldType, FormFieldOrGroup, StoredForm } from '@/types'
import { defaultFieldConfig } from '@/constants'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Separator } from '@/components/ui/separator'
import If from '@/components/ui/if'
import SpecialComponentsNotice from '@/components/playground/special-component-notice'
import { FieldSelector } from '@/screens/field-selector'
import { FormFieldList } from '@/screens/form-field-list'
import { FormPreview } from '@/screens/form-preview'
import { EditFieldDialog } from '@/screens/edit-field-dialog'
import EmptyListSvg from '@/assets/oc-thinking.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormStorage } from '@/lib/form-storage'

interface FormBuilderProps {
  formId?: string
  filename?: string
}

export default function FormBuilder({ formId, filename }: FormBuilderProps) {
  const router = useRouter()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const [formFields, setFormFields] = useState<FormFieldOrGroup[]>([])
  const [selectedField, setSelectedField] = useState<FormFieldType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formName, setFormName] = useState(filename || 'Untitled Form')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load form data when component mounts or formId changes
  useEffect(() => {
    loadForm()
  }, [formId])

  const loadForm = () => {
    if (!formId || formId === 'new') {
      // New form - start with empty state
      setFormFields([])
      setFormName(filename || 'Untitled Form')
      setHasUnsavedChanges(false)
      setIsLoading(false)
      return
    }

    try {
      const storedForm = FormStorage.getFormById(formId)
      if (storedForm) {
        setFormFields(storedForm.fields)
        setFormName(storedForm.name)
        setHasUnsavedChanges(false)
      } else {
        toast.error('Form not found')
        router.push('/forms')
        return
      }
    } catch (error) {
      console.error('Error loading form:', error)
      toast.error('Failed to load form')
      router.push('/forms')
      return
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a form name')
      return
    }

    try {
      const formData = {
        name: formName.trim(),
        fields: formFields
      }

      let updatedForm: StoredForm
      
      if (formId && formId !== 'new') {
        // Update existing form
        updatedForm = FormStorage.saveForm(formData, formId)
      } else {
        // Create new form
        updatedForm = FormStorage.saveForm(formData)
        // Update URL with new form ID
        router.replace(`/playground/${updatedForm.id}`)
      }

      setHasUnsavedChanges(false)
      toast.success('Form saved successfully!')
    } catch (error) {
      console.error('Error saving form:', error)
      toast.error('Failed to save form')
    }
  }

  const handleNameChange = (newName: string) => {
    setFormName(newName)
    if (formName !== newName) {
      setHasUnsavedChanges(true)
    }
  }

  const handleFormChange = (newFields: FormFieldOrGroup[]) => {
    setFormFields(newFields)
    setHasUnsavedChanges(true)
  }

  const handleFormFieldsSet = (value: FormFieldOrGroup[] | ((prev: FormFieldOrGroup[]) => FormFieldOrGroup[])) => {
    const newFields = typeof value === 'function' ? value(formFields) : value
    setFormFields(newFields)
    setHasUnsavedChanges(true)
  }

  const addFormField = (variant: string, index: number) => {
    const newFieldName = `name_${Math.random().toString().slice(-10)}`

    const { label, description, placeholder } = defaultFieldConfig[variant] || {
      label: '',
      description: '',
      placeholder: '',
    }

    const newField: FormFieldType = {
      checked: true,
      description: description || '',
      disabled: false,
      label: label || newFieldName,
      name: newFieldName,
      onChange: () => {},
      onSelect: () => {},
      placeholder: placeholder || 'Placeholder',
      required: true,
      rowIndex: index,
      setValue: () => {},
      type: '',
      value: '',
      variant,
    }
    
    const updatedFields = [...formFields, newField]
    handleFormFieldsSet(updatedFields)
  }

  const findFieldPath = (
    fields: FormFieldOrGroup[],
    name: string,
  ): number[] | null => {
    const search = (
      currentFields: FormFieldOrGroup[],
      currentPath: number[],
    ): number[] | null => {
      for (let i = 0; i < currentFields.length; i++) {
        const field = currentFields[i]
        if (Array.isArray(field)) {
          const result = search(field, [...currentPath, i])
          if (result) return result
        } else if (field.name === name) {
          return [...currentPath, i]
        }
      }
      return null
    }
    return search(fields, [])
  }

  const updateFormField = (path: number[], updates: Partial<FormFieldType>) => {
    const updatedFields = JSON.parse(JSON.stringify(formFields)) // Deep clone
    let current: any = updatedFields
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]]
    }
    current[path[path.length - 1]] = {
      ...current[path[path.length - 1]],
      ...updates,
    }
    setFormFields(updatedFields)
    setHasUnsavedChanges(true)
  }

  const openEditDialog = (field: FormFieldType) => {
    setSelectedField(field)
    setIsDialogOpen(true)
  }

  const handleSaveField = (updatedField: FormFieldType) => {
    if (selectedField) {
      const path = findFieldPath(formFields, selectedField.name)
      if (path) {
        updateFormField(path, updatedField)
      }
    }
    setIsDialogOpen(false)
  }

  const FieldSelectorWithSeparator = ({
    addFormField,
  }: {
    addFormField: (variant: string, index?: number) => void
  }) => (
    <div className="flex flex-col md:flex-row gap-3">
      <FieldSelector addFormField={addFormField} />
      <Separator orientation={isDesktop ? 'vertical' : 'horizontal'} />
    </div>
  )

  return (
    <section className="md:max-h-screen space-y-8">
      {/* Form Header with Name and Save */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/forms')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forms
          </Button>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="form-name" className="text-sm font-medium">
              Form Name:
            </Label>
            <Input
              id="form-name"
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter form name..."
              className="w-48"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-muted-foreground">
              Unsaved changes
            </span>
          )}
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <If
        condition={formFields.length > 0}
        render={() => (
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-8 md:px-5 h-full">
            <div className="w-full h-full col-span-1 md:space-x-3 md:max-h-[75vh] flex flex-col md:flex-row ">
              <FieldSelectorWithSeparator
                addFormField={(variant: string, index: number = 0) =>
                  addFormField(variant, index)
                }
              />
              <div className="overflow-y-auto flex-1 ">
                <FormFieldList
                  formFields={formFields}
                  setFormFields={handleFormFieldsSet}
                  updateFormField={updateFormField}
                  openEditDialog={openEditDialog}
                />
              </div>
            </div>
            <div className="col-span-1 w-full h-full space-y-3">
              <SpecialComponentsNotice formFields={formFields} />
              <FormPreview
                key={JSON.stringify(formFields)}
                formFields={formFields}
              />
            </div>
          </div>
        )}
        otherwise={() => (
          <div className="flex flex-col md:flex-row items-center gap-3 md:px-5">
            <FieldSelectorWithSeparator
              addFormField={(variant: string, index: number = 0) =>
                addFormField(variant, index)
              }
            />
            <EmptyListSvg className="mx-auto" />
          </div>
        )}
      />
      <EditFieldDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        field={selectedField}
        onSave={handleSaveField}
      />
    </section>
  )
}
