'use client'

import React, { useCallback, useEffect } from 'react'
import { Box, Stack } from '@mui/system'
import { ComponentPalette, ComponentItem } from './component-palette'
import { FormCanvas } from './form-canvas'
import { PropertiesPanel } from './properties-panel'
import { ContextPanel } from './context-panel'
import { FormFieldType, FormFieldOrGroup } from '@/types'
import { useFormBuilderStore } from '@/store/formBuilderStore'
import { generateNextOutputName } from '@/lib/field-names'

interface ModernFormBuilderProps {
  formFields: FormFieldOrGroup[]
  onFormChange: (fields: FormFieldOrGroup[]) => void
  formId: string
  filename: string
  formName: string
  hasUnsavedChanges: boolean
  onSave: () => void
  onFormNameChange: (newName: string) => void
  contextInputs: { name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; itemType?: 'string' | 'number' | 'boolean' }[]
  onContextInputsChange: (next: { name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; itemType?: 'string' | 'number' | 'boolean' }[]) => void
}

export function ModernFormBuilder({ formFields, onFormChange, formId, filename, formName, hasUnsavedChanges, onSave, onFormNameChange, contextInputs, onContextInputsChange }: ModernFormBuilderProps) {
  const { setFormFields, selectedField, setSelectedField, setContextInputs } = useFormBuilderStore()
  const [rightPanel, setRightPanel] = React.useState<'properties' | 'context'>('context')

  useEffect(() => { setFormFields(formFields) }, [formFields, setFormFields])
  useEffect(() => { setContextInputs(contextInputs) }, [contextInputs, setContextInputs])

  const handleComponentSelect = useCallback((component: ComponentItem) => {
    // Add component to form
    const nextName = generateNextOutputName(formFields)
    const newField: FormFieldType = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: component.id,
      variant: component.id === 'text-block' ? 'paragraph' : component.id,
      name: nextName,
      label: component.name,
      placeholder: '',
      description: '',
      disabled: false,
      value: '',
      setValue: () => {},
      checked: false,
      onChange: () => {},
      onSelect: () => {},
      rowIndex: formFields.length,
      required: false,
      className: ''
    }

    const newFields = [...formFields, newField]
    onFormChange(newFields)
    
    // Select the newly added field
    setSelectedField(newField)
  }, [formFields, onFormChange, setSelectedField])

  const handleFieldSelect = useCallback((field: FormFieldType | null) => {
    setSelectedField(field)
    if (field) setRightPanel('properties')
  }, [setSelectedField])

  const handleFieldUpdate = useCallback((updates: Partial<FormFieldType>) => {
    if (!selectedField) return

    const updateFieldInArray = (fields: FormFieldOrGroup[]): FormFieldOrGroup[] => {
      return fields.map(field => {
        if (Array.isArray(field)) {
          return field.map(subField => 
            subField.id === selectedField.id 
              ? { ...subField, ...updates }
              : subField
          )
        }
        return field.id === selectedField.id 
          ? { ...field, ...updates }
          : field
      })
    }

    const updatedFields = updateFieldInArray(formFields)
    onFormChange(updatedFields)
    
    // Update selected field with new values
    setSelectedField({ ...selectedField, ...updates })
  }, [selectedField, formFields, onFormChange, setSelectedField])

  const handleBackClick = useCallback(() => {
    setSelectedField(null)
  }, [setSelectedField])

  const handleFieldDelete = useCallback((id: string) => {
    const removeById = (fields: FormFieldOrGroup[]): FormFieldOrGroup[] => {
      return fields
        .map((field) => {
          if (Array.isArray(field)) {
            const nextGroup = field.filter((f) => f.id !== id)
            return nextGroup.length > 0 ? nextGroup : null
          }
          return (field as FormFieldType).id === id ? null : field
        })
        .filter(Boolean) as FormFieldOrGroup[]
    }

    const updated = removeById(formFields)
    onFormChange(updated)
    setSelectedField(null)
  }, [formFields, onFormChange, setSelectedField])

  return (
    <Stack direction="row" sx={{ height: '100%', minHeight: 0, width: '100%', overflow: 'hidden' }} className="w-full max-w-screen h-full border-t">
      {/* Left Panel - Component Palette */}
      <Box sx={{ width: 320, flexShrink: 0, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }} className="border-r border-border h-full">        
          <ComponentPalette 
            onComponentSelect={handleComponentSelect}
            formName={formName}
            onFormNameChange={onFormNameChange}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={onSave}
          />
      </Box>

      {/* Center Panel - Form Canvas */}
      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto' }}>
        <FormCanvas
          filename={filename}
          formName={formName}
          formFields={formFields}
          onFormChange={onFormChange}
          selectedField={selectedField}
          onFieldSelect={handleFieldSelect}
          onFieldDelete={handleFieldDelete}
        />
      </Box>

      {/* Right Panel - Properties/Context toggle */}
      <Box sx={{ width: 360, flexShrink: 0, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }} className="border-l border-border">
          <Box sx={{ height: '100%', minHeight: 0 }}>
        <div className="flex items-center gap-2 p-2 border-b">
          <button
            className={`px-2 py-1 rounded text-xs ${rightPanel === 'properties' ? 'bg-accent' : 'hover:bg-accent/40'}`}
            onClick={() => setRightPanel('properties')}
          >
            Properties
          </button>
          <button
            className={`px-2 py-1 rounded text-xs ${rightPanel === 'context' ? 'bg-accent' : 'hover:bg-accent/40'}`}
            onClick={() => setRightPanel('context')}
          >
            Context
          </button>
        </div>
          {rightPanel === 'properties' ? (
            <PropertiesPanel
              selectedField={selectedField}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              onBackClick={handleBackClick}
              formFields={formFields}
              formId={formId}
            />
          ) : (
            <ContextPanel formName={formName} formFields={formFields as any} />
          )}
        </Box>
      </Box>
    </Stack>
  )
}

