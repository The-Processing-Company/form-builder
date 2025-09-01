'use client'

import React from 'react'
import { 
  Type, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Hash, 
  MapPin, 
  PenTool, 
  Smartphone,
  Lock,
  Sliders,
  Star,
  Radio,
  CreditCard,
  Image,
  Table,
  FileUp,
  List,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Search, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Box, Stack } from '@mui/system'

export interface ComponentItem {
  id: string
  name: string
  category: 'input' | 'selection' | 'presentation'
  icon: React.ComponentType<{ className?: string }>
  isNew?: boolean
  preview?: React.ReactNode
}

const componentItems: ComponentItem[] = [
  // Input category
  {
    id: 'input',
    name: 'Text Input',
    category: 'input',
    icon: Type,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">Text</div>
  },
  {
    id: 'textarea',
    name: 'Text Area',
    category: 'input',
    icon: FileText,
    preview: <div className="w-16 h-12 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">Text area</div>
  },
  {
    id: 'number',
    name: 'Number',
    category: 'input',
    icon: Hash,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">123</div>
  },
  {
    id: 'date-picker',
    name: 'Date Picker',
    category: 'input',
    icon: Calendar,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">Date</div>
  },
  {
    id: 'datetime-picker',
    name: 'Date Time',
    category: 'input',
    icon: Calendar,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">Date/Time</div>
  },
  {
    id: 'file-input',
    name: 'File Upload',
    category: 'input',
    icon: FileUp,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">📁</div>
  },
  {
    id: 'password',
    name: 'Password',
    category: 'input',
    icon: Lock,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">••••</div>
  },
  {
    id: 'phone',
    name: 'Phone',
    category: 'input',
    icon: Smartphone,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">📱</div>
  },
  {
    id: 'location-input',
    name: 'Location',
    category: 'input',
    icon: MapPin,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">📍</div>
  },
  {
    id: 'signature-input',
    name: 'Signature',
    category: 'input',
    icon: PenTool,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">✍️</div>
  },
  {
    id: 'credit-card',
    name: 'Credit Card',
    category: 'input',
    icon: CreditCard,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">💳</div>
  },
  {
    id: 'smart-datetime',
    name: 'Smart DateTime',
    category: 'input',
    icon: Calendar,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">⏰</div>
  },

  // Selection category
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'selection',
    icon: CheckSquare,
    preview: <div className="w-4 h-4 border rounded flex items-center justify-center">✓</div>
  },
  {
    id: 'checkbox-group',
    name: 'Checkbox Group',
    category: 'selection',
    icon: List,
    preview: <div className="flex gap-1"><div className="w-3 h-3 border rounded">✓</div><div className="w-3 h-3 border rounded">✓</div></div>
  },
  {
    id: 'radio-group',
    name: 'Radio Group',
    category: 'selection',
    icon: Radio,
    preview: <div className="flex gap-1"><div className="w-3 h-3 border rounded-full bg-primary"></div><div className="w-3 h-3 border rounded-full"></div></div>
  },
  {
    id: 'select',
    name: 'Select',
    category: 'selection',
    icon: List,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">▼</div>
  },
  {
    id: 'multi-select',
    name: 'Multi Select',
    category: 'selection',
    icon: List,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">Multi</div>
  },
  {
    id: 'tags-input',
    name: 'Tags Input',
    category: 'selection',
    icon: Tag,
    preview: <div className="w-16 h-8 bg-muted rounded border flex items-center px-2 text-xs text-muted-foreground">Tags</div>
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'selection',
    icon: Sliders,
    preview: <div className="w-8 h-4 bg-primary rounded-full flex items-center justify-end px-0.5"><div className="w-3 h-3 bg-background rounded-full"></div></div>
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'selection',
    icon: Sliders,
    preview: <div className="w-16 h-2 bg-muted rounded-full flex items-center"><div className="w-8 h-2 bg-primary rounded-full"></div></div>
  },
  {
    id: 'rating',
    name: 'Rating',
    category: 'selection',
    icon: Star,
    preview: <div className="flex gap-0.5"><div className="w-3 h-3 text-yellow-500">★</div><div className="w-3 h-3 text-yellow-500">★</div><div className="w-3 h-3 text-yellow-500">★</div><div className="w-3 h-3 text-muted-foreground">★</div><div className="w-3 h-3 text-muted-foreground">★</div></div>
  },

  // Presentation category
  {
    id: 'text-block',
    name: 'Text',
    category: 'presentation',
    icon: Type,
    preview: <div className="w-16 h-6 bg-muted rounded text-xs font-medium flex items-center justify-center">Aa</div>
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'presentation',
    icon: Type,
    preview: <div className="w-16 h-px bg-border"></div>
  },
  {
    id: 'spacer',
    name: 'Spacer',
    category: 'presentation',
    icon: Type,
    preview: <div className="w-16 h-4 bg-muted/20 rounded border-2 border-dashed border-muted-foreground/20"></div>
  }
]

interface ComponentPaletteProps {
  onComponentSelect: (component: ComponentItem) => void
  formName?: string
  onFormNameChange?: (newName: string) => void
  hasUnsavedChanges?: boolean
  onSave?: () => void
}

export function ComponentPalette({ onComponentSelect, formName, onFormNameChange, hasUnsavedChanges, onSave }: ComponentPaletteProps) {
  const router = useRouter()
  const categories = [
    { key: 'input', label: 'Input', color: 'bg-blue-500' },
    { key: 'selection', label: 'Selection', color: 'bg-green-500' },
    { key: 'presentation', label: 'Presentation', color: 'bg-purple-500' }
  ]

  return (
    <Stack sx={{ minHeight: 0 }} className="h-full">
      {/* Header */}
      <Box className="p-4 border-b space-y-2" sx={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => router.push('/forms')} aria-label="Back to Forms">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-sm font-semibold">Tacton Forms</h2>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <InlineEditableName value={formName || ''} onChange={onFormNameChange} />
          <Button size="icon" variant={hasUnsavedChanges ? 'default' : 'outline'} disabled={!hasUnsavedChanges} onClick={onSave} className="h-8 w-8">
            <Save className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between pt-1">
          <h3 className="font-semibold text-sm">Components</h3>
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Search components">
            <Search className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }} className="p-2 space-y-4 h-full">
          {categories.map((category) => (
            <div key={category.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <h4 className="text-sm font-medium">{category.label}</h4>
              </div>
              
              <div className="flex flex-col gap-1">
                {componentItems
                  .filter(item => item.category === category.key)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="group cursor-pointer px-2 py-1 rounded-md hover:bg-accent/50 transition-all duration-200 flex items-center gap-2"
                      onClick={() => onComponentSelect(item)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(item))
                      }}
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      <span className="text-xs font-medium group-hover:text-foreground">{item.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </Box>
    </Stack>
  )
}

// Inline editable label used for filename
const InlineEditableName: React.FC<{ value: string; onChange?: (v: string) => void }> = ({ value, onChange }) => {
  const [editing, setEditing] = React.useState(false)
  const [local, setLocal] = React.useState(value)
  React.useEffect(() => setLocal(value), [value])
  return (
    <div className="flex-1">
      {editing ? (
        <Input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => { setEditing(false); onChange?.(local) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); onChange?.(local) } }}
          className="h-8 text-sm"
          autoFocus
        />
      ) : (
        <button className="text-sm font-medium text-left w-full hover:underline" onClick={() => setEditing(true)}>
          {value || 'Untitled Form'}
        </button>
      )}
    </div>
  )
}

