'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'
import { HeadlessFieldApi } from '@/types'

type BaseProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
type HeadlessProp = { field?: HeadlessFieldApi<'slider'> }

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, BaseProps & HeadlessProp>(
  ({ className, field, ...props }, ref) => {
    const controlled = field
      ? {
          value: Array.isArray(field.value) ? field.value : [0],
          onValueChange: (v: number[]) => field.onChange(v),
          disabled: field.disabled,
          'aria-required': field.required ? true : undefined,
          'aria-invalid': field.error ? true : undefined,
        }
      : {}
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...controlled}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    )
  },
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
