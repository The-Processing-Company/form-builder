"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StoredWorkflow } from '@/types'
import { UploadDropzone } from '@/lib/uploadthing'
import { TagsInput } from '@/components/ui/tags-input'
import { FileResult } from '@/app/api/uploadthing/core'
import { Stack } from '@mui/system'
import prettyBytes from 'pretty-bytes';
import { FileUploadZone } from '@/components/ui/file-upload-zone'

export default function Page() {
  const [query, setQuery] = useState('')
  const [workflows, setWorkflows] = useState<StoredWorkflow[]>([])
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [file, setFile] = useState<FileResult | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newWorkflowTags, setNewWorkflowTags] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('form-builder-workflows')
    setWorkflows(stored ? JSON.parse(stored) : [])
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return workflows
    return workflows.filter(w => {
      const tags = (w.tags || []).join(' ').toLowerCase()
      const filenames = w.versions.map(v => v.fileName.toLowerCase()).join(' ')
      return (
        w.name.toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        tags.includes(q) ||
        filenames.includes(q)
      )
    })
  }, [query, workflows])

  const uploadWorkflow = () => {
    if (!fileUrl || !newWorkflowName) return
    const now = Date.now()
    const wf: StoredWorkflow = {
      id: `wf_${now}_${Math.random().toString(36).slice(2, 9)}`,
      name: newWorkflowName || 'BPMN Workflow',
      description: 'Uploaded BPMN processes',
      tags: newWorkflowTags,
      createdAt: now,
      updatedAt: now,
      versions: [{
        id: `ver_${now}_${Math.random().toString(36).slice(2, 9)}`,
        label: 'v1.0',
        isActive: true,
        uploadedAt: now,
        author: 'You',
        changeDescription: 'Initial upload',
        fileName: fileUrl,
        fileSizeBytes: 0,
        fileType: 'text/xml',
        fileUrl: fileUrl,
      }],
    }

    const list: StoredWorkflow[] = JSON.parse(localStorage.getItem('form-builder-workflows') || '[]')
    const next = [wf, ...list]
    localStorage.setItem('form-builder-workflows', JSON.stringify(next))
    setWorkflows(next)
    setIsUploadOpen(false)
    setNewWorkflowName('')
    setNewWorkflowTags([])
    setFileUrl(null)
  }

  // No revision upload from list; creation only

  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">BPMN Management System</h1>
          <p className="text-sm text-muted-foreground">Manage and deploy your BPMN processes</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>Upload New</Button>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <Input placeholder="Search BPMN processes..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">BPMN Processes</h2>
        <span className="text-xs text-muted-foreground">{filtered.length} processes</span>
      </div>

      <div className="space-y-3">
        {filtered.map(w => {
          const active = w.versions.find(v => v.isActive)
          return (
            <Card key={w.id} className="p-4 bg-background/60">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-semibold">{w.name}</div>
                  <div className="text-xs text-muted-foreground">{w.description || 'Workflow'}</div>
                  <div className="text-xs text-muted-foreground flex gap-4">
                    <span>{w.versions.length} versions</span>
                    <span>Updated {new Date(w.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-xs flex items-center gap-2">
                  <span className="rounded-full bg-emerald-600/15 text-emerald-400 px-2 py-1">{active?.label || '—'}</span>
                  <Button size="sm" variant="outline" onClick={() => window.location.assign(`/workflows/${w.id}`)}>Open</Button>
                </div>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground p-10 text-center">No workflows yet</div>
        )}
      </div>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Upload BPMN File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workflow Name</label>
                  <Input value={newWorkflowName} onChange={e => setNewWorkflowName(e.target.value)} placeholder="e.g. Order Processing" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <TagsInput value={newWorkflowTags} onValueChange={setNewWorkflowTags} placeholder="type a tag and press enter" />
                </div>
                <FileUploadZone file={file} onFileChange={setFile} />
              </div>
          </div>
          <Separator />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button disabled={newWorkflowName.trim().length === 0} onClick={uploadWorkflow}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


