'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  FileText,
  Calendar,
  Hash
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { FormStorage } from '@/lib/form-storage'
import { FormMetadata, StoredForm } from '@/types'

export default function FormsPage() {
  const [forms, setForms] = useState<FormMetadata[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [newFormName, setNewFormName] = useState('')
  const [newFormDescription, setNewFormDescription] = useState('')
  const [importJson, setImportJson] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = () => {
    const formsData = FormStorage.getFormMetadata()
    setForms(formsData)
  }

  const handleCreateForm = () => {
    if (!newFormName.trim()) {
      toast.error('Please enter a form name')
      return
    }

    try {
      const newForm = FormStorage.saveForm({
        name: newFormName.trim(),
        description: newFormDescription.trim() || undefined,
        fields: []
      })

      toast.success('Form created successfully!')
      setIsCreateDialogOpen(false)
      setNewFormName('')
      setNewFormDescription('')
      loadForms()
      
      // Navigate to the new form in playground
      router.push(`/playground/${newForm.id}`)
    } catch (error) {
      toast.error('Failed to create form')
      console.error('Error creating form:', error)
    }
  }

  const handleDeleteForm = (id: string) => {
    if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      const success = FormStorage.deleteForm(id)
      if (success) {
        toast.success('Form deleted successfully')
        loadForms()
      } else {
        toast.error('Failed to delete form')
      }
    }
  }

  const handleExportForm = (id: string) => {
    const jsonData = FormStorage.exportForm(id)
    if (jsonData) {
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `form-${id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Form exported successfully')
    } else {
      toast.error('Failed to export form')
    }
  }

  const handleImportForm = () => {
    if (!importJson.trim()) {
      toast.error('Please enter JSON data')
      return
    }

    try {
      const importedForm = FormStorage.importForm(importJson)
      if (importedForm) {
        FormStorage.saveForm(importedForm)
        toast.success('Form imported successfully!')
        setIsImportDialogOpen(false)
        setImportJson('')
        loadForms()
      } else {
        toast.error('Invalid form data')
      }
    } catch (error) {
      toast.error('Failed to import form')
      console.error('Error importing form:', error)
    }
  }

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Forms</h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage your form designs
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Form</DialogTitle>
                <DialogDescription>
                  Paste the JSON data from an exported form to import it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="import-json">Form JSON</Label>
                <Textarea
                  id="import-json"
                  placeholder="Paste your form JSON here..."
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  rows={8}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportForm}>Import Form</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Form
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Form</DialogTitle>
                <DialogDescription>
                  Give your new form a name and optional description.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="form-name">Form Name</Label>
                  <Input
                    id="form-name"
                    placeholder="Enter form name..."
                    value={newFormName}
                    onChange={(e) => setNewFormName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="form-description">Description (Optional)</Label>
                  <Textarea
                    id="form-description"
                    placeholder="Describe your form..."
                    value={newFormDescription}
                    onChange={(e) => setNewFormDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateForm}>Create Form</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>
      </div>

      {filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'No forms found' : 'No forms yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first form to get started'
            }
          </p>
          {!searchTerm && (
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Form
              </Button>
              <Button variant="outline" onClick={() => router.push('/playground/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Quick Start
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{form.name}</CardTitle>
                    {form.description && (
                      <CardDescription className="mt-2 line-clamp-2">
                        {form.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Hash className="w-4 h-4 mr-2" />
                    {form.fieldCount} field{form.fieldCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Updated {formatDate(form.updatedAt)}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/playground/${form.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportForm(form.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteForm(form.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
