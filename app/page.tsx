"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormStorage } from '@/lib/form-storage'
import { WorkflowStorage } from '@/lib/workflow-storage'

export default function Home() {
  const [formCount, setFormCount] = useState(0)
  const [workflowCount, setWorkflowCount] = useState(0)

  useEffect(() => {
    setFormCount(FormStorage.getAllForms().length)
    setWorkflowCount(WorkflowStorage.getAll().length)
  }, [])

  return (
    <main>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">Quick summary of your workspace</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Forms</div>
              <div className="text-3xl font-bold">{formCount}</div>
            </div>
            <Button asChild>
              <Link href="/forms">Go to forms</Link>
            </Button>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Workflows</div>
              <div className="text-3xl font-bold">{workflowCount}</div>
            </div>
            <Button asChild>
              <Link href="/workflows">Go to workflows</Link>
            </Button>
          </Card>
        </div>
      </div>
    </main>
  )
}
