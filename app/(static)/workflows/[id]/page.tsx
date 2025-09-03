"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { StoredWorkflow, WorkflowVersion } from '@/types'
import { UploadDropzone } from '@/lib/uploadthing'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TagsInput } from '@/components/ui/tags-input'
import type { FileResult } from '@/app/api/uploadthing/core'
import prettyBytes from 'pretty-bytes'
import { FileUploadZone } from '@/components/ui/file-upload-zone'

function readAll(): StoredWorkflow[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('form-builder-workflows') || '[]')
  } catch {
    return []
  }
}

function writeAll(items: StoredWorkflow[]) {
  localStorage.setItem('form-builder-workflows', JSON.stringify(items))
}

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [workflows, setWorkflows] = useState<StoredWorkflow[]>([])
  const [file, setFile] = useState<FileResult | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [versionLabel, setVersionLabel] = useState('')
  const [changeDescription, setChangeDescription] = useState('')
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [tagsDraft, setTagsDraft] = useState<string[]>([])

  useEffect(() => {
    setWorkflows(readAll())
  }, [])

  const workflow = useMemo(() => workflows.find(w => w.id === params.id), [workflows, params.id])
  const active = workflow?.versions.find(v => v.isActive)

  const activate = (versionId: string) => {
    if (!workflow) return
    const updatedVersions = workflow.versions.map(v => ({ ...v, isActive: v.id === versionId }))
    const updated = { ...workflow, versions: updatedVersions, updatedAt: Date.now() }
    const next = workflows.map(w => (w.id === workflow.id ? updated : w))
    writeAll(next)
    setWorkflows(next)
  }

  const beginEditTags = () => {
    if (!workflow) return
    setTagsDraft(workflow.tags || [])
    setIsEditingTags(true)
  }

  const saveTags = () => {
    if (!workflow) return
    const next = workflows.map(w => w.id === workflow.id ? { ...w, tags: tagsDraft, updatedAt: Date.now() } : w)
    writeAll(next)
    setWorkflows(next)
    setIsEditingTags(false)
  }

  const saveRevision = () => {
    if (!workflow || !file) return
    const ver: WorkflowVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      label: versionLabel || `v${(workflow.versions.length + 1).toFixed(1)}`,
      isActive: false,
      uploadedAt: Date.now(),
      author: 'You',
      changeDescription: changeDescription || 'Update',
      fileName: file.name,
      fileSizeBytes: file.size || 0,
      fileType: 'text/xml',
      fileUrl: file.url,
    }
    const nextVersions = [ver, ...workflow.versions]
    const next = workflows.map(w => w.id === workflow.id ? { ...w, versions: nextVersions, updatedAt: Date.now() } : w)
    writeAll(next)
    setWorkflows(next)
    setIsUploadOpen(false)
    setVersionLabel('')
    setChangeDescription('')
    setFile(null)
  }

  if (!workflow) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">Workflow not found.</div>
        <Button variant="link" onClick={() => router.push('/workflows')}>Back</Button>
      </div>
    )
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{workflow.name}</h1>
          <p className="text-sm text-muted-foreground">{workflow.description || 'Workflow'}</p>
        </div>
        <Button onClick={() => router.push('/workflows')}>Back to list</Button>
      </div>

      <Card className="p-4 bg-background/60">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Total Versions</div>
            <div className="font-medium">{workflow.versions.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Active Version</div>
            <div className="font-medium">{active?.label || '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Last Updated</div>
            <div className="font-medium">{new Date(workflow.updatedAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Tags</div>
            <div className="font-medium flex items-center gap-2">
              {(workflow.tags || []).join(', ') || '—'}
              <Button size="sm" variant="outline" onClick={beginEditTags}>Edit</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Version History</h2>
          <Button onClick={() => setIsUploadOpen(true)}>Upload Revision</Button>
        </div>
        {workflow.versions.map((v: WorkflowVersion) => (
          <Card key={v.id} className="p-4 bg-background/60">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{v.label}</span>
                  {v.isActive && (
                    <span className="text-xs rounded-full bg-emerald-600/15 text-emerald-400 px-2 py-0.5">Active</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{v.changeDescription}</div>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span>{new Date(v.uploadedAt).toLocaleDateString()}</span>
                  <span>{v.author || '—'}</span>
                  <span>{(v.fileSizeBytes / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {v.fileUrl && (
                  <a href={v.fileUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline">Download</Button>
                  </a>
                )}
                {!v.isActive && (
                  <Button onClick={() => activate(v.id)}>Activate</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Upload New Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Version Label</label>
              <Input value={versionLabel} onChange={e => setVersionLabel(e.target.value)} placeholder={workflow?.versions.length ? `v${(workflow.versions.length + 1).toFixed(1)}` : 'v1.1'} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Change Description</label>
              <Textarea value={changeDescription} onChange={e => setChangeDescription(e.target.value)} placeholder="Describe what changed in this version..." />
            </div>
            <FileUploadZone file={file} onFileChange={setFile} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button disabled={!file} onClick={saveRevision}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingTags} onOpenChange={setIsEditingTags}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <TagsInput value={tagsDraft} onValueChange={setTagsDraft} placeholder="type a tag and press enter" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTags(false)}>Cancel</Button>
            <Button onClick={saveTags}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


