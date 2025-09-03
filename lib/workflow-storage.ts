import { StoredWorkflow, WorkflowVersion } from '@/types'

const WORKFLOWS_STORAGE_KEY = 'form-builder-workflows'

export class WorkflowStorage {
  private static generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getAll(): StoredWorkflow[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(WORKFLOWS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static getById(id: string): StoredWorkflow | null {
    return this.getAll().find(w => w.id === id) || null
  }

  static save(info: Omit<StoredWorkflow, 'id' | 'createdAt' | 'updatedAt'>, id?: string): StoredWorkflow {
    const list = this.getAll()
    const now = Date.now()
    let item: StoredWorkflow
    if (id) {
      const idx = list.findIndex(x => x.id === id)
      if (idx === -1) throw new Error('Workflow not found')
      item = { ...list[idx], ...info, updatedAt: now }
      list[idx] = item
    } else {
      item = { ...info, id: this.generateId(), createdAt: now, updatedAt: now }
      list.push(item)
    }
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(list))
    return item
  }

  static remove(id: string): boolean {
    const list = this.getAll()
    const next = list.filter(w => w.id !== id)
    if (next.length === list.length) return false
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(next))
    return true
  }

  static addVersion(workflowId: string, version: Omit<WorkflowVersion, 'id' | 'uploadedAt'>): StoredWorkflow | null {
    const list = this.getAll()
    const idx = list.findIndex(w => w.id === workflowId)
    if (idx === -1) return null
    const v: WorkflowVersion = { ...version, id: this.generateId(), uploadedAt: Date.now() }
    const versions = [v, ...list[idx].versions]
    // Ensure exactly one active
    let hasActive = false
    const normalized = versions.map(item => {
      if (item.isActive && !hasActive) {
        hasActive = true
        return item
      }
      return { ...item, isActive: false }
    })
    list[idx] = { ...list[idx], versions: normalized, updatedAt: Date.now() }
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(list))
    return list[idx]
  }

  static activateVersion(workflowId: string, versionId: string): StoredWorkflow | null {
    const list = this.getAll()
    const idx = list.findIndex(w => w.id === workflowId)
    if (idx === -1) return null
    const versions = list[idx].versions.map(v => ({ ...v, isActive: v.id === versionId }))
    list[idx] = { ...list[idx], versions, updatedAt: Date.now() }
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(list))
    return list[idx]
  }
}


