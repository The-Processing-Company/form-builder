'use client'

import React, { useState, useEffect } from 'react'
import { Box, Stack } from '@mui/system'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, ArrowLeft } from 'lucide-react'

import { FormFieldType, FormFieldOrGroup, StoredForm } from '@/types'
import { defaultFieldConfig } from '@/constants'
import { ModernFormBuilder } from '@/components/form-builder/modern-form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormStorage } from '@/lib/form-storage'

interface FormBuilderProps {
  formId: string
  filename: string
}

export default function FormBuilder({ formId, filename }: FormBuilderProps) {
  const router = useRouter()

  const [formFields, setFormFields] = useState<FormFieldOrGroup[]>([])

  const [formName, setFormName] = useState(filename || 'Untitled Form')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load form data when component mounts or formId changes
  useEffect(() => {
    loadForm()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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



  return (
    <Box component="section" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexGrow: 1 }}>
      {/* Header moved inside left palette. No top bar to save vertical space */}

      {/* Body: 3 columns (components | viewer | properties) */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
        <ModernFormBuilder
          filename={filename}
          formFields={formFields}
          onFormChange={handleFormChange}
          formId={formId}
          formName={formName}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          onFormNameChange={handleNameChange}
        />
      </Box>
    </Box>
  )
}
