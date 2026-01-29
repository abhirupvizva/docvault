import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDocumentById, downloadDocument } from '@/lib/models/document.model'
import { getUserByClerkId } from '@/lib/models/user.model'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/documents/[id]/view - View document inline (for PDF viewer)
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

    // Use 'inline' disposition for viewing in browser
    return new Response(webStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
      }
    })

  } catch (error) {
    console.error('Error viewing document:', error)
    return NextResponse.json(
      { error: 'Failed to view document' },
      { status: 500 }
    )
  }
}
