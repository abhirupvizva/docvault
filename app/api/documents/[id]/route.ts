import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getDocumentById,
  downloadDocument,
  deleteDocument
} from '@/lib/models/document.model'
import { getUserByClerkId } from '@/lib/models/user.model'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/documents/[id] - Download document
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const document = await getDocumentById(id)

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user can access this document
    const user = await getUserByClerkId(userId)
    const isAdmin = user?.role === 'admin'

    if (!isAdmin && document.status !== 'enabled') {
      return NextResponse.json({ error: 'Document not available' }, { status: 403 })
    }

    // Check if downloads are enabled for this document
    if (!isAdmin && !document.downloadEnabled) {
      return NextResponse.json({ error: 'Downloads are disabled for this document' }, { status: 403 })
    }

    // Stream file from GridFS
    const { stream, filename, contentType } = await downloadDocument(document.fileId)

    // Convert Node.js stream to Web ReadableStream
    const webStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(chunk)
        }
        controller.close()
      }
    })

    return new Response(webStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      }
    })

  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete document (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const deleted = await deleteDocument(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
