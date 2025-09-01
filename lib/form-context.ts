import { FormFieldOrGroup, FormFieldType } from '@/types'

export type ContextInputDef = { name: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; itemType?: 'string' | 'number' | 'boolean' }

const isOutputField = (f: FormFieldType) => !(
  f.type === 'text-block' || f.type === 'divider' || f.type === 'spacer'
)

export function buildFormContext(
  formName: string,
  formFields: FormFieldOrGroup[],
  contextInputs: ContextInputDef[]
) {
  const input = (contextInputs || []).reduce<Record<string, any>>((acc, cur) => {
    if (!cur?.name) return acc
    if (cur.type === 'array') {
      const item = cur.itemType === 'number' ? 0 : cur.itemType === 'boolean' ? false : ''
      acc[cur.name] = [item]
    } else if (cur.type === 'object') {
      acc[cur.name] = {}
    } else if (cur.type === 'number') {
      acc[cur.name] = 0
    } else if (cur.type === 'boolean') {
      acc[cur.name] = false
    } else {
      acc[cur.name] = ''
    }
    return acc
  }, {})

  const fields = (formFields || []).reduce<Record<string, any>>((acc, entry) => {
    if (Array.isArray(entry)) {
      entry.forEach((sf) => { if (isOutputField(sf as FormFieldType)) acc[sf.name] = '' })
    } else {
      const f = entry as FormFieldType
      if (isOutputField(f)) acc[f.name] = ''
    }
    return acc
  }, {})

  return {
    info: { name: formName },
    input,
    fields,
  }
}


