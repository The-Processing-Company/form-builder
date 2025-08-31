'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FormBuilder from '@/screens/form-builder'
import { FormStorage } from '@/lib/form-storage'
import { StoredForm, FormFieldOrGroup } from '@/types'

export default function PlaygroundPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string
  
  const [form, setForm] = useState<StoredForm | null>(null)
  const [formName, setFormName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    loadForm()
  }, [formId])

  const loadForm = () => {
    console.log('Loading form with ID:', formId)
    
    if (formId === 'new') {
      // Create a new form
      console.log('Creating new form')
      setForm({
        id: 'new',
        name: 'Untitled Form',
        fields: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      setFormName('Untitled Form')
      setIsLoading(false)
      return
    }

    try {
      const storedForm = FormStorage.getFormById(formId)
      console.log('Retrieved stored form:', storedForm)
      if (storedForm) {
        setForm(storedForm)
        setFormName(storedForm.name)
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

  const handleFormChange = (newFields: FormFieldOrGroup[]) => {
    if (form) {
      setForm({
        ...form,
        fields: newFields
      })
      setHasUnsavedChanges(true)
    }
  }

  const handleSave = async () => {
    console.log('Saving form:', { form, formName })
    
    if (!form || !formName.trim()) {
      toast.error('Please enter a form name')
      return
    }

    try {
      const updatedForm = FormStorage.saveForm({
        name: formName.trim(),
        description: form.description,
        fields: form.fields
      }, form.id === 'new' ? undefined : form.id)

      console.log('Form saved successfully:', updatedForm)
      setForm(updatedForm)
      setHasUnsavedChanges(false)
      toast.success('Form saved successfully!')
      
      // If this was a new form, update the URL
      if (form.id === 'new') {
        router.replace(`/playground/${updatedForm.id}`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      toast.error('Failed to save form')
    }
  }

  const handleNameChange = (newName: string) => {
    setFormName(newName)
    if (form && form.name !== newName) {
      setHasUnsavedChanges(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Form not found</h3>
          <p className="text-muted-foreground mb-4">
            The form you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/forms')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forms
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Builder */}
      <div className="min-h-[calc(100vh-100px)]">
        <FormBuilder 
          formId={formId} 
          filename={formName}
        />
      </div>
    </div>
  )
}
