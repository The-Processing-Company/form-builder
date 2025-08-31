'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, ArrowRight } from 'lucide-react'

export default function PlaygroundPage() {
  const router = useRouter()

  const handleCreateNew = () => {
    router.push('/playground/new')
  }

  const handleViewForms = () => {
    router.push('/forms')
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Form Builder Playground</h1>
        <p className="text-xl text-muted-foreground">
          Create, edit, and manage your form designs with our intuitive builder
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCreateNew}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create New Form</CardTitle>
            <CardDescription>
              Start building a new form from scratch with our drag-and-drop builder
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" className="w-full">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewForms}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-secondary-foreground" />
            </div>
            <CardTitle className="text-2xl">My Forms</CardTitle>
            <CardDescription>
              View, edit, and manage your existing form designs
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" size="lg" className="w-full">
              View Forms
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          Your forms are automatically saved locally in your browser
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>All data is stored locally - no account required</span>
        </div>
      </div>
    </div>
  )
}
