'use client'

import React, { useState } from 'react'
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronDown, 
  Settings, 
  Palette, 
  Layout, 
  Shield, 
  Plus,
  Trash2,
  Trash,
  Copy,
  Check,
  Bold,
  Italic,
  Underline
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FormFieldType, FormFieldOrGroup } from '@/types'
import { useFormBuilderStore } from '@/store/formBuilderStore'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PropertiesPanelProps {
  selectedField: FormFieldType | null
  onFieldUpdate: (updates: Partial<FormFieldType>) => void
  onFieldDelete: (id: string) => void
  onBackClick: () => void
  formFields: FormFieldOrGroup[]
  formId: string
}

interface PropertySectionProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  defaultExpanded?: boolean
}

function PropertySection({ title, icon: Icon, children, defaultExpanded = false }: PropertySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

export function PropertiesPanel({ 
  selectedField, 
  onFieldUpdate, 
  onFieldDelete,
  onBackClick,
  formFields,
  formId
}: PropertiesPanelProps) {
  const { selectedField: storeSelected, setSelectedField, selectById } = useFormBuilderStore()
  const activeField = storeSelected ?? selectedField
  const [customProperties, setCustomProperties] = useState<Array<{ key: string; value: string }>>([])

  const addCustomProperty = () => {
    setCustomProperties([...customProperties, { key: '', value: '' }])
  }

  const updateCustomProperty = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customProperties]
    updated[index][field] = value
    setCustomProperties(updated)
  }

  const removeCustomProperty = (index: number) => {
    setCustomProperties(customProperties.filter((_, i) => i !== index))
  }

  const renderComponentList = () => {
    const componentCounts = new Map<string, number>()
    
    const countComponents = (fields: FormFieldOrGroup[]) => {
      fields.forEach(field => {
        if (Array.isArray(field)) {
          countComponents(field)
        } else {
          const count = componentCounts.get(field.type) || 0
          componentCounts.set(field.type, count + 1)
        }
      })
    }
    
    countComponents(formFields)

    return (
      <div className="p-4 space-y-4">
        {/* Form Key Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Form Key</h4>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <code className="text-xs font-mono flex-1 truncate">{formId || 'new'}</code>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={() => {
                if (formId) {
                  navigator.clipboard.writeText(formId)
                  toast.success('Form key copied!')
                }
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Form Components</h3>
          <Badge variant="secondary">{formFields.length}</Badge>
        </div>
        
        {formFields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No components added yet</p>
            <p className="text-xs mt-1">Drag components from the left panel</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Clickable flat list of fields */}
            {formFields.map((entry, idx) => (
              Array.isArray(entry) ? (
                <div key={`group_${idx}`} className="space-y-1">
                  {entry.map((f) => (
                    <button
                      key={f.id}
                      className="w-full text-left p-2 rounded-md hover:bg-accent/50 flex items-center justify-between"
                      onClick={() => { setSelectedField(f); }}
                    >
                      <span className="text-sm">{f.label || f.name}</span>
                      <Badge variant="outline" className="text-xs capitalize">{f.type}</Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  key={entry.id}
                  className="w-full text-left p-2 rounded-md hover:bg-accent/50 flex items-center justify-between"
                  onClick={() => { setSelectedField(entry); }}
                >
                  <span className="text-sm">{entry.label || entry.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">{entry.type}</Badge>
                </button>
              )
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderFieldProperties = () => {
    if (!activeField) return null

    return (
      <div className="p-4 space-y-4">
        {/* Field Header */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="font-semibold text-sm capitalize">{activeField.type}</h3>
              <p className="text-xs text-muted-foreground">Field properties</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* General Properties */}
        <PropertySection title="General" icon={Settings} defaultExpanded>
          <div className="space-y-3">
            <div>
              <Label htmlFor="label" className="text-xs">Label</Label>
              <Input
                id="label"
                value={activeField.label || ''}
                onChange={(e) => onFieldUpdate({ label: e.target.value })}
                placeholder="Enter field label"
                className="h-8 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input
                id="name"
                value={activeField.name || ''}
                onChange={(e) => onFieldUpdate({ name: e.target.value })}
                placeholder="Enter field name"
                className="h-8 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea
                id="description"
                value={activeField.description || ''}
                onChange={(e) => onFieldUpdate({ description: e.target.value })}
                placeholder="Enter field description"
                className="min-h-[60px] text-sm resize-none"
              />
            </div>
            
            <div>
              <Label htmlFor="placeholder" className="text-xs">Placeholder</Label>
              <Input
                id="placeholder"
                value={activeField.placeholder || ''}
                onChange={(e) => onFieldUpdate({ placeholder: e.target.value })}
                placeholder="Enter placeholder text"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </PropertySection>

        {/* Layout Properties */}
        <PropertySection title="Layout" icon={Layout}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="required" className="text-xs">Required</Label>
              <Switch
                id="required"
                checked={activeField.required || false}
                onCheckedChange={(checked) => onFieldUpdate({ required: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="disabled" className="text-xs">Disabled</Label>
              <Switch
                id="disabled"
                checked={activeField.disabled || false}
                onCheckedChange={(checked) => onFieldUpdate({ disabled: checked })}
              />
            </div>
            
            <div>
              <Label htmlFor="className" className="text-xs">CSS Classes</Label>
              <Input
                id="className"
                value={activeField.className || ''}
                onChange={(e) => onFieldUpdate({ className: e.target.value })}
                placeholder="Enter CSS classes"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </PropertySection>

        {/* Appearance Properties */}
        <PropertySection title="Appearance" icon={Palette}>
          <div className="space-y-3">
            <div>
              <Label htmlFor="rowIndex" className="text-xs">Row Index</Label>
              <Input
                id="rowIndex"
                type="number"
                value={activeField.rowIndex || 0}
                onChange={(e) => onFieldUpdate({ rowIndex: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </PropertySection>

        {/* Validation Properties */}
        <PropertySection title="Validation" icon={Shield}>
          <div className="space-y-3">
            {activeField.type === 'number' && (
              <>
                <div>
                  <Label htmlFor="min" className="text-xs">Minimum Value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={activeField.min || ''}
                    onChange={(e) => onFieldUpdate({ min: parseFloat(e.target.value) || undefined })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="max" className="text-xs">Maximum Value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={activeField.max || ''}
                    onChange={(e) => onFieldUpdate({ max: parseFloat(e.target.value) || undefined })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="step" className="text-xs">Step</Label>
                  <Input
                    id="step"
                    type="number"
                    value={activeField.step || ''}
                    onChange={(e) => onFieldUpdate({ step: parseFloat(e.target.value) || undefined })}
                    className="h-8 text-sm"
                  />
                </div>
              </>
            )}
          </div>
        </PropertySection>

        {/* Type-specific Properties */}
        {(activeField.type === 'select' || activeField.type === 'radio-group' || activeField.type === 'checkbox-group') && (
          <PropertySection title="Options" icon={Settings} defaultExpanded>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Use context as source</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch
                        disabled
                        checked={activeField.optionSource === 'context'}
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Coming soon</TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Static options</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const next = [...(activeField.options || []), { label: `Option ${(activeField.options?.length || 0) + 1}`, value: `option${(activeField.options?.length || 0) + 1}` }]
                      onFieldUpdate({ options: next, optionSource: 'static' })
                    }}
                  >
                    Add option
                  </Button>
                </div>

                {(activeField.options || []).map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={opt.label}
                      onChange={(e) => {
                        const next = (activeField.options || []).map((o, i) => i === idx ? { ...o, label: e.target.value } : o)
                        onFieldUpdate({ options: next })
                      }}
                      placeholder="Label"
                      className="h-8 text-sm flex-1"
                    />
                    <Input
                      value={opt.value}
                      onChange={(e) => {
                        const next = (activeField.options || []).map((o, i) => i === idx ? { ...o, value: e.target.value } : o)
                        onFieldUpdate({ options: next })
                      }}
                      placeholder="Value"
                      className="h-8 text-sm flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8"
                      onClick={() => {
                        const next = (activeField.options || []).filter((_, i) => i !== idx)
                        onFieldUpdate({ options: next })
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8"
                      onClick={() => {
                        if (idx === 0) return
                        const next = [...(activeField.options || [])]
                        const [item] = next.splice(idx, 1)
                        next.splice(idx - 1, 0, item)
                        onFieldUpdate({ options: next })
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8"
                      onClick={() => {
                        const opts = activeField.options || []
                        if (idx >= opts.length - 1) return
                        const next = [...opts]
                        const [item] = next.splice(idx, 1)
                        next.splice(idx + 1, 0, item)
                        onFieldUpdate({ options: next })
                      }}
                    >
                      ↓
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </PropertySection>
        )}

        {/* File Field Properties */}
        {activeField.type === 'file-input' && (
          <PropertySection title="File Constraints" icon={Settings} defaultExpanded>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Accepted Types</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['image/*', 'application/pdf', '.csv', '.zip'].map((t) => (
                    <Button key={t} variant={(activeField.accept || []).includes(t) ? 'secondary' : 'outline'} size="sm" className="h-7 text-xs"
                      onClick={() => {
                        const acc = new Set(activeField.accept || [])
                        if (acc.has(t)) acc.delete(t); else acc.add(t)
                        onFieldUpdate({ accept: Array.from(acc) })
                      }}
                    >{t}</Button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input placeholder="Add custom (e.g. .docx or image/*)" className="h-8 text-sm" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (!val) return
                      const acc = new Set(activeField.accept || [])
                      acc.add(val)
                      onFieldUpdate({ accept: Array.from(acc) })
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Max Files</Label>
                  <Input type="number" className="h-8 text-sm" value={activeField.maxFiles ?? ''} onChange={(e) => onFieldUpdate({ maxFiles: e.target.value ? parseInt(e.target.value) : undefined })} />
                </div>
                <div>
                  <Label className="text-xs">Max Size (MB)</Label>
                  <Input type="number" className="h-8 text-sm" value={activeField.maxSizeMb ?? ''} onChange={(e) => onFieldUpdate({ maxSizeMb: e.target.value ? parseInt(e.target.value) : undefined })} />
                </div>
              </div>
            </div>
          </PropertySection>
        )}

        {/* Text Block Properties */}
        {activeField.type === 'text-block' && (
          <PropertySection title="Text Settings" icon={Settings} defaultExpanded>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Variant</Label>
                <Select value={(activeField as any).variant || 'paragraph'} onValueChange={(v) => {
                  const next: any = { variant: v }
                  // Reset styles on variant change
                  if (v === 'heading' || v === 'sub-heading') {
                    next.bold = true
                    next.italic = false
                    next.underline = false
                  } else {
                    next.bold = false
                    next.italic = false
                    next.underline = false
                  }
                  onFieldUpdate(next)
                }}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Choose variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heading">Heading</SelectItem>
                    <SelectItem value="sub-heading">Sub-heading</SelectItem>
                    <SelectItem value="caption">Caption</SelectItem>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={(activeField as any).bold ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0 font-serif"
                    onClick={() => onFieldUpdate({ bold: !Boolean((activeField as any).bold) } as any)}
                    title="Bold"
                    aria-label="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={(activeField as any).italic ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0 font-serif"
                    onClick={() => onFieldUpdate({ italic: !Boolean((activeField as any).italic) } as any)}
                    title="Italic"
                    aria-label="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={(activeField as any).underline ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0 font-serif"
                    onClick={() => onFieldUpdate({ underline: !Boolean((activeField as any).underline) } as any)}
                    title="Underline"
                    aria-label="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <Label className="text-xs">Size</Label>
                  <Input
                    type="number"
                    className="h-8 text-sm w-20"
                    value={activeField.fontSizePt ?? ''}
                    onChange={(e) => onFieldUpdate({ fontSizePt: e.target.value ? parseInt(e.target.value) : undefined } as any)}
                    placeholder="pt"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Content</Label>
                <Textarea className="min-h-[80px] text-sm" value={activeField.description || ''} onChange={(e) => onFieldUpdate({ description: e.target.value })} />
              </div>
            </div>
          </PropertySection>
        )}

        {/* Custom Properties */}
        <PropertySection title="Custom Properties" icon={Settings}>
          <div className="space-y-3">
            {customProperties.map((prop, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={prop.key}
                  onChange={(e) => updateCustomProperty(index, 'key', e.target.value)}
                  placeholder="Property name"
                  className="h-8 text-sm flex-1"
                />
                <Input
                  value={prop.value}
                  onChange={(e) => updateCustomProperty(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="h-8 text-sm flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomProperty(index)}
                  className="p-1 h-8 w-8"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomProperty}
              className="w-full h-8 text-xs"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Custom Property
            </Button>
          </div>
        </PropertySection>
      </div>
    )
  }

  return (
    <TooltipProvider>
    <div className="w-full h-full flex flex-col border-l border-border">
      <div className="border-b border-border">
        <div className="p-4">
          <h3 className="font-semibold text-sm">Properties</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedField ? 'Edit field properties' : 'Form overview'}
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {selectedField ? renderFieldProperties() : renderComponentList()}
      </div>
    </div>
    </TooltipProvider>
  )
}

