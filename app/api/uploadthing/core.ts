import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { z } from 'zod'

const f = createUploadthing()
const fileSchema = z.object({
  name: z.string(),
  url: z.string(),
  id: z.string(),
  size: z.number(),
  uploadedBy: z.string(),
})

export type FileResult = z.infer<typeof fileSchema>

const auth = (_req: Request) => ({ id: 'anonymous' })

export const ourFileRouter = {
  bpmnUploader: f({
    // Accept BPMN (XML) files; UploadThing doesn't have a built-in "bpmn" type,
    // so we use "text" and enforce extension in middleware/onUploadComplete.
    blob: { maxFileSize: '16MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = auth(req)
      if (!user) throw new Error('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const name = (file as any).name || ''
      if (!/\.(bpmn|xml)$/i.test(name)) {
        throw new Error('Only .bpmn or .xml files are allowed')
      }
      return {
        uploadedBy: metadata.userId,
        url: (file as any).ufsUrl ?? (file as any).url,
        id: file.key,
        size: file.size,
        name: file.name,
      } satisfies FileResult
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter


