'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { HeadlessFieldApi } from '@/types'

import { cn } from '@/lib/utils'

type BaseProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
type HeadlessProp = { field?: HeadlessFieldApi<'switch'> }
type LabelingProps = {
  label?: string
  description?: string
  required?: boolean
  variant?: 'inline' | 'contained'
  id?: string
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  BaseProps & HeadlessProp & LabelingProps
>(
  ({ className, field, label, description, required, variant = 'inline', id, ...props }, ref) => {
    const controlled = field
      ? {
          checked: Boolean(field.value),
          onCheckedChange: (v: boolean) => field.onChange(Boolean(v)),
          disabled: field.disabled,
          required: field.required,
          'aria-required': field.required ? true : undefined,
          'aria-invalid': field.error ? true : undefined,
        }
      : {}

    const effLabel = label ?? field?.label
    const effDescription = description ?? field?.description
    const effRequired = (required ?? field?.required) ? true : undefined
    const switchId = id ?? (field?.name ? `switch-${field.name}` : undefined)

    // Raw switch when no label/description provided (back-compat)
    // if (!effLabel) {
    //   return (
    //     <SwitchPrimitives.Root
    //       id={switchId}
    //       className={cn(
    //         'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
    //         className,
    //       )}
    //       ref={ref}
    //       {...controlled}
    //       {...props}
    //     >
    //       <SwitchPrimitives.Thumb
    //         className={cn(
    //           'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
    //         )}
    //       />
    //     </SwitchPrimitives.Root>
    //   )
    // }

    const containerClass = variant === 'contained'
      ? 'border border-border rounded-lg p-4'
      : ''

    return (
      <div className={cn('flex items-center justify-between gap-4', containerClass)}>
        <label htmlFor={switchId} className="flex-1 cursor-pointer select-none">
          <div className="text-sm font-medium">
            {effLabel}
            {effRequired ? ' *' : ''}
          </div>
          {effDescription && (
            <div className="text-xs text-muted-foreground mt-1">{effDescription}</div>
          )}
        </label>
        <SwitchPrimitives.Root
          id={switchId}
          className={cn(
            'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
            className,
          )}
          ref={ref}
          {...controlled}
          {...{...props
            , label: undefined,
          }}
        >
          <SwitchPrimitives.Thumb
            className={cn(
              'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
            )}
          />
        </SwitchPrimitives.Root>
      </div>
    )
  },
)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
