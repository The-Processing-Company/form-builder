import { NextResponse } from 'next/server'
import { createWorkflow, readWorkflows } from '@/lib/workflow-file-store'

export async function GET() {
  const items = await readWorkflows()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { name, description, tags } = await req.json()
  const item = await createWorkflow(name, description, tags)
  return NextResponse.json(item, { status: 201 })
}


