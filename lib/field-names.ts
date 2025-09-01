import { FormFieldOrGroup, FormFieldType } from '@/types'

export function generateNextOutputName(fields: FormFieldOrGroup[]): string {
  const names: string[] = []
  const collect = (arr: FormFieldOrGroup[]) => {
    for (const item of arr) {
      if (Array.isArray(item)) {
        collect(item)
      } else {
        names.push((item as FormFieldType).name)
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


