import { NextResponse } from 'next/server'
import { addWorkflowVersion, getWorkflowById } from '@/lib/workflow-file-store'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await getWorkflowById(params.id)
  return NextResponse.json(item)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const updated = await addWorkflowVersion(params.id, body)
  return NextResponse.json(updated)
}


