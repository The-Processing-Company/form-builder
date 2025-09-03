import { StoredWorkflow, WorkflowVersion } from '@/types'
import fs from 'fs/promises'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'workflows.json')

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_PATH)
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
    await fs.writeFile(DATA_PATH, '[]', 'utf8')
  }
}

export async function readWorkflows(): Promise<StoredWorkflow[]> {
  await ensureFile()
  const raw = await fs.readFile(DATA_PATH, 'utf8')
  try {
    return JSON.parse(raw) as StoredWorkflow[]
  } catch {
    return []
  }
}

export async function writeWorkflows(items: StoredWorkflow[]): Promise<void> {
  await ensureFile()
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), 'utf8')
}

export async function createWorkflow(name: string, description?: string, tags?: string[]): Promise<StoredWorkflow> {
  const list = await readWorkflows()
  const now = Date.now()
  const wf: StoredWorkflow = {
    id: `wf_${now}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    description,
    tags,
    createdAt: now,
    updatedAt: now,
    versions: [],
  }
  list.push(wf)
  await writeWorkflows(list)
  return wf
}

export async function getWorkflowById(id: string): Promise<StoredWorkflow | null> {
  const list = await readWorkflows()
  return list.find(w => w.id === id) || null
}

export async function addWorkflowVersion(
  workflowId: string,
  version: Omit<WorkflowVersion, 'id' | 'uploadedAt'>,
): Promise<StoredWorkflow | null> {
  const list = await readWorkflows()
  const idx = list.findIndex(w => w.id === workflowId)
  if (idx === -1) return null
  const v: WorkflowVersion = { ...version, id: `ver_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, uploadedAt: Date.now() }
  const versions = [v, ...list[idx].versions]
  let hasActive = false
  const normalized = versions.map(item => {
    if (item.isActive && !hasActive) {
      hasActive = true
      return item
    }
    return { ...item, isActive: false }
  })
  list[idx] = { ...list[idx], versions: normalized, updatedAt: Date.now() }
  await writeWorkflows(list)
  return list[idx]
}


