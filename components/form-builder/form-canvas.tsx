'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Eye, Code } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormFieldType, FormFieldOrGroup, FormSchema, SchemaField } from '@/types'
import { ComponentItem } from './component-palette'
import { FormDesigner } from '@/components/form-renderer'
import { FormFieldRenderer } from './form-field-renderer'
import { CodeBlock } from '@/components/ui/code-block'
import { useFormBuilderStore } from '@/store/formBuilderStore'
import { generateNextOutputName } from '@/lib/field-names'

interface FormCanvasProps {
  filename: string
  formFields: FormFieldOrGroup[]
  onFormChange: (fields: FormFieldOrGroup[]) => void
  selectedField: FormFieldType | null
  onFieldSelect: (field: FormFieldType | null) => void
  onFieldDelete?: (id: string) => void
}

export function FormCanvas({
  filename,
  formFields,
  onFormChange,
  selectedField,
  onFieldSelect,
  onFieldDelete,
}: FormCanvasProps) {
  const { setSelectedField, selectByName } = useFormBuilderStore()
  const [viewMode, setViewMode] = useState<'design' | 'json'>('design')
  const canvasRef = useRef<HTMLDivElement>(null)

  const addComponentToForm = useCallback((
    component: ComponentItem,
    insertIndex?: number,
  ) => {
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
      rowIndex: insertIndex || formFields.length,
      required: false,
      className: '',
    }

    let newFields: FormFieldOrGroup[]

    if (insertIndex !== undefined && insertIndex < formFields.length) {
      // Insert at specific position
      newFields = [...formFields]
      newFields.splice(insertIndex, 0, newField)
    } else {
      // Append to end
      newFields = [...formFields, newField]
    }

    onFormChange(newFields)
  }, [formFields, onFormChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-primary', 'bg-accent/20')
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-primary', 'bg-accent/20')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-primary', 'bg-accent/20')

    try {
      const componentData = JSON.parse(
        e.dataTransfer.getData('application/json'),
      ) as ComponentItem

      // Get the drop position relative to existing fields
      const dropY = e.clientY
      const canvasRect = canvasRef.current?.getBoundingClientRect()

      if (canvasRect) {
        const relativeY = dropY - canvasRect.top
        const insertIndex = Math.floor(relativeY / 100) // Approximate field height

        addComponentToForm(componentData, insertIndex)
      } else {
        addComponentToForm(componentData)
      }
    } catch (error) {
      console.error('Error parsing dropped component:', error)
    }
  }, [addComponentToForm])

  // Removing inline removeField UI; deletion is handled via properties or future controls

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onFieldSelect(null)
    }
  }

  // Render preview via FormDesigner below

  const renderJSONView = () => {
    return (
      <div className="p-4">
        <CodeBlock
          language="json"
          code={JSON.stringify(formFields, null, 2)}
          filename={`${filename}.json`}
          onSelection={({ text, lines }) => {
            // Prefer extracting the name from the selected block bounds
            try {
              const src = JSON.stringify(formFields, null, 2)
              const allLines = src.split('\n')
              const start = Math.max(1, lines[0] || 1)
              const end = Math.min(allLines.length, lines[lines.length - 1] || start)
              const block = allLines.slice(start - 1, end).join('\n')
              const m = block.match(/"name"\s*:\s*"([^"]+)"/)
              const derivedName = m?.[1]
              const fallbackToken = text.replace(/["',:\s]/g, '')
              const targetName = derivedName || fallbackToken

              if (!targetName) return
              const all: FormFieldType[] = []
              formFields.forEach((f) => {
                if (Array.isArray(f)) all.push(...f)
                else all.push(f as FormFieldType)
              })
              const match = all.find((f) => f.name === targetName)
              if (match) {
                onFieldSelect(match)
                setSelectedField(match)
              }
            } catch {
              // ignore
            }
          }}
          highlightLines={(() => {
            if (!selectedField) return []
            // naive: highlight by selected name occurrence bounds
            try {
              const src = JSON.stringify(formFields, null, 2)
              const allLines = src.split('\n')
              const name = (selectedField as FormFieldType).name
              const idx = allLines.findIndex((ln) => ln.includes(`"name": "${name}"`))
              if (idx === -1) return []
              // scan braces to get block
              const countOpens = (s: string) => (s.match(/\{/g) || []).length
              const countCloses = (s: string) => (s.match(/\}/g) || []).length
              const stack: number[] = []
              for (let i = 1; i <= idx + 1; i++) {
                const opens = countOpens(allLines[i - 1] || '')
                const closes = countCloses(allLines[i - 1] || '')
                for (let k = 0; k < opens; k++) stack.push(i)
                for (let k = 0; k < closes; k++) stack.pop()
              }
              const start = stack.length ? stack[stack.length - 1] : idx + 1
              let depth = 0
              let end = start
              for (let j = start; j <= allLines.length; j++) {
                depth += countOpens(allLines[j - 1] || '')
                depth -= countCloses(allLines[j - 1] || '')
                if (depth === 0) { end = j; break }
              }
              const linesArr: number[] = []
              for (let n = start; n <= end; n++) linesArr.push(n)
              return linesArr
            } catch {
              return []
            }
          })()}
        />
      </div>
    )
  }

  // Map current builder state to simplified schema for designer preview
  const toSchema = (): FormSchema => {
    const items: { name: string; fields: SchemaField[] }[] = []
    let buffer: SchemaField[] = []
    formFields.forEach((entry, idx) => {
      if (Array.isArray(entry)) {
        if (buffer.length) {
          items.push({ name: 'Fields', fields: buffer })
          buffer = []
        }
        items.push({
          name: `Group ${idx + 1}`,
          fields: entry.map((f) => ({
            name: f.name,
            type: mapVariantToType(f.variant || f.type),
            label: f.label,
            placeholder: f.placeholder,
            description: f.description,
            required: f.required,
            disabled: f.disabled,
            options: f.options,
          })),
        })
      } else {
        buffer.push({
          name: entry.name,
          type: mapVariantToType(entry.variant || entry.type),
          label: entry.label,
          placeholder: entry.placeholder,
          description: entry.description,
          required: entry.required,
          disabled: entry.disabled,
          options: (entry as any).options,
        })
      }
    })
    if (buffer.length) {
      items.push({ name: 'Fields', fields: buffer })
    }
    return { name: 'Form', fields: items }
  }

  const mapVariantToType = (variant: string): SchemaField['type'] => {
    switch (variant) {
      case 'Input':
      case 'Text':
      case 'TextField':
        return 'text'
      case 'Textarea':
        return 'textarea'
      case 'password':
      case 'Password':
        return 'password'
      case 'phone':
      case 'Phone':
        return 'phone'
      case 'date-picker':
        return 'date'
      case 'datetime-picker':
        return 'datetime'
      case 'smart-datetime':
      case 'Smart DateTime':
        return 'smart-datetime'
      case 'Checkbox':
        return 'checkbox'
      case 'Switch':
        return 'switch'
      case 'Select':
        return 'select'
      case 'file-input':
      case 'File Upload':
        return 'file'
      case 'location-input':
      case 'Location':
        return 'location'
      case 'signature-input':
      case 'Signature Input':
        return 'signature'
      case 'credit-card':
      case 'Credit Card':
        return 'credit-card'
      case 'Multi Select':
      case 'multi-select':
        return 'multiselect'
      case 'Tags Input':
      case 'tags-input':
        return 'tags'
      case 'RadioGroup':
        return 'radio'
      case 'Slider':
        return 'slider'
      default:
        return 'text'
    }
  }

  return (
    <div className="w-full flex flex-col pb-8">
      {/* Canvas Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'design' | 'json')}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              JSON
            </TabsTrigger>
          </TabsList>
          <TabsContent value="design" className="flex-1 min-h-0 overflow-auto">
            <div
              ref={canvasRef}
              className="h-full min-h-0 mt-4 p-6"
              onClick={handleCanvasClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {formFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No components yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag components from the left panel to start building your form
                  </p>
                  <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Drop zone</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {formFields.map((field, index) => {
                    if (Array.isArray(field)) {
                      return (
                        <div key={`group_${index}`} className="grid grid-cols-12 gap-4">
                          {field.map((subField) => {
                            const isSelected = selectedField?.id === subField.id
                            return (
                              <div
                                key={subField.id}
                                className={`relative col-span-6 border rounded-md p-4 bg-card ${isSelected ? 'ring-2 ring-ring' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onFieldSelect(subField)
                                }}
                              >
                                <div className="absolute -top-3 left-2 rounded-full border border-border bg-background shadow text-[10px] text-muted-foreground px-2 h-6 flex items-center gap-2">
                                  <span className="capitalize">{(subField as FormFieldType).variant || (subField as FormFieldType).type}</span>
                                  <span className="w-px h-3 bg-border" />
                                  <span className="font-mono">{(subField as FormFieldType).name}</span>
                                </div>
                                <button
                                  type="button"
                                  className="absolute -top-3 right-2 h-6 w-6 rounded-full border border-border bg-background shadow text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center"
                                  title="Delete"
                                  aria-label="Delete"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onFieldDelete?.(subField.id)
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                                <FormFieldRenderer field={subField} />
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    const isSelected = selectedField?.id === (field as FormFieldType).id
                    return (
                      <div
                        key={(field as FormFieldType).id}
                        className={`relative border rounded-md p-4 bg-card ${isSelected ? 'ring-2 ring-ring' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onFieldSelect(field as FormFieldType)
                        }}
                      >
                        <div className="absolute -top-3 left-2 rounded-full border border-border bg-background shadow text-[10px] text-muted-foreground px-2 h-6 flex items-center gap-2">
                          <span className="capitalize">{((field as FormFieldType).variant || (field as FormFieldType).type)}</span>
                          <span className="w-px h-3 bg-border" />
                          <span className="font-mono">{(field as FormFieldType).name}</span>
                        </div>
                        <button
                          type="button"
                          className="absolute -top-3 right-2 h-6 w-6 rounded-full border border-border bg-background shadow text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center"
                          title="Delete"
                          aria-label="Delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            onFieldDelete?.((field as FormFieldType).id)
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                        <FormFieldRenderer field={field as FormFieldType} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full min-h-0 overflow-auto p-4">
              {renderJSONView()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
