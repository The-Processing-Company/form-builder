'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useFormBuilderStore } from '@/store/formBuilderStore'
import { CodeBlock } from '@/components/ui/code-block'
import { buildFormContext } from '@/lib/form-context'

interface ContextPanelProps {
  formName: string
  formFields: any[]
}

export function ContextPanel({ formName, formFields }: ContextPanelProps) {
  const { contextInputs, addContextInput, updateContextInput, removeContextInput } = useFormBuilderStore()

  const ctxObject = React.useMemo(() => buildFormContext(formName, formFields, contextInputs), [formName, formFields, contextInputs])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b border-border p-4">
        <h3 className="font-semibold text-sm">Context</h3>
        <p className="text-xs text-muted-foreground mt-1">$ctx available in expressions and validation</p>
      </div>

      <div className="p-4 space-y-3">
        <CodeBlock
          language="json"
          code={JSON.stringify(ctxObject, null, 2)}
          filename="context.json"
          onSelection={() => {}}
        />
      </div>

      <Separator />

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">External Inputs ($ctx.input)</h4>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => addContextInput()}
          >
            Add input
          </Button>
        </div>

        {contextInputs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No inputs yet. Add inputs that your form can read from $ctx.input.</p>
        ) : (
          <div className="space-y-2">
            {contextInputs.map((entry, idx) => (
              <div key={idx} className="grid grid-cols-8 gap-2 items-center">
                <div className="col-span-3">
                  <Label className="sr-only">Name</Label>
                  <Input
                    placeholder="name"
                    value={entry.name}
                    onChange={(e) => updateContextInput(idx, { name: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="sr-only">Type</Label>
                  <Select value={entry.type} onValueChange={(v) => updateContextInput(idx, { type: v as any, itemType: v === 'array' ? (entry.itemType || 'string') : undefined })}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">string</SelectItem>
                      <SelectItem value="number">number</SelectItem>
                      <SelectItem value="boolean">boolean</SelectItem>
                      <SelectItem value="array">array</SelectItem>
                      <SelectItem value="object">object</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {entry.type === 'array' && (
                  <div className="col-span-2">
                    <Label className="sr-only">Item type</Label>
                    <Select value={entry.itemType || 'string'} onValueChange={(v) => updateContextInput(idx, { itemType: v as any })}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">string</SelectItem>
                        <SelectItem value="number">number</SelectItem>
                        <SelectItem value="boolean">boolean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="col-span-5 flex justify-end">
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => removeContextInput(idx)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContextPanel


