import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { toggleDocumentStatus } from '@/lib/models/document.model'
import { getUserByClerkId } from '@/lib/models/user.model'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH /api/documents/[id]/toggle - Toggle document status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const document = await toggleDocumentStatus(id)

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      document
    })

  } catch (error) {
    console.error('Error toggling document status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle document status' },
      { status: 500 }
    )
  }
}
