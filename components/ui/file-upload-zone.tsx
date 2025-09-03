'use client'

import { Button } from '@/components/ui/button'
import { UploadDropzone } from '@/lib/uploadthing'
import type { FileResult } from '@/app/api/uploadthing/core'
import prettyBytes from 'pretty-bytes'

type Props = {
  file: FileResult | null
  onFileChange: (file: FileResult | null) => void
  className?: string
}

export function FileUploadZone({ file, onFileChange }: Props) {
  return (
    <div className="space-y-3">
      {file ? (
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">File</label>
            <div className="text-sm text-muted-foreground">{file.name} ({prettyBytes(file.size)})</div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onFileChange(null)}>Remove</Button>
        </div>
      ) : (
        <UploadDropzone
          endpoint="bpmnUploader"
          onClientUploadComplete={(res) => {
            const uploaded = res?.[0]
            if (!uploaded) return
            onFileChange(uploaded.serverData)
          }}
          onUploadError={(e) => console.error(e)}
        />
      )}
    </div>
  )
}


