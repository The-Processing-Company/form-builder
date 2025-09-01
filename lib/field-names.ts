import { FormFieldOrGroup, FormFieldType } from '@/types'

const isDisplayOnly = (f: FormFieldType) => f.type === 'text-block' || f.type === 'divider' || f.type === 'spacer'

export function generateNextOutputName(fields: FormFieldOrGroup[]): string {
  const names: string[] = []
  const collect = (arr: FormFieldOrGroup[]) => {
    for (const item of arr) {
      if (Array.isArray(item)) {
        collect(item)
      } else {
        const f = item as FormFieldType
        if (!isDisplayOnly(f)) names.push(f.name)
      }
    }
  }
  collect(fields)

  let max = 0
  const re = /^output_(\d{1,})$/
  for (const n of names) {
    const m = re.exec(n)
    if (m) {
      const num = parseInt(m[1], 10)
      if (!Number.isNaN(num)) max = Math.max(max, num)
    }
  }
  return `output_${max + 1}`
}


