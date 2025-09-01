'use client'

import React, { useMemo, useState } from 'react'
import { FormRenderer } from '@/components/form-renderer'
import { FormSchema } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestRendererPage() {
  const schema: FormSchema = useMemo(
    () => ({
      name: 'Test Form',
      fields: [
        {
          name: 'Personal',
          fields: [
            { name: 'firstName', type: 'text', label: 'First name', placeholder: 'John', required: true },
            { name: 'lastName', type: 'text', label: 'Last name', placeholder: 'Doe', required: true },
            { name: 'bio', type: 'textarea', label: 'Bio', placeholder: 'Tell us about yourself' },
          ],
        },
        {
          name: 'Preferences',
          fields: [
            { name: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' },
            {
              name: 'language',
              type: 'select',
              label: 'Language',
              placeholder: 'Select language',
              options: [
                { label: 'English', value: 'en' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' },
              ],
            },
          ],
        },
      ],
    }),
    [],
  )

  const [liveValues, setLiveValues] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState<Record<string, any> | null>(null)

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FormRenderer</CardTitle>
          </CardHeader>
          <CardContent>
            <FormRenderer
              schema={schema}
              onChange={(data) => setLiveValues(data)}
              onSubmit={(data) => setSubmitted(data)}
              onReset={() => {
                setLiveValues({})
                setSubmitted(null)
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Values</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs rounded-md bg-slate-950 p-4 text-white overflow-auto max-h-[400px]">
                {JSON.stringify(liveValues, null, 2)}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs rounded-md bg-slate-950 p-4 text-white overflow-auto max-h-[400px]">
                {submitted ? JSON.stringify(submitted, null, 2) : '—'}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


