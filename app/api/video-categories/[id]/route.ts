import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { deleteVideoCategory, updateVideoCategory } from '@/lib/models/video-category.model'
import { syncCurrentUser } from '@/lib/models/user.model'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await syncCurrentUser()
    if (user?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, description } = body as { name?: string; description?: string }

    if (!name?.trim()) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const category = await updateVideoCategory(id, { name: name.trim(), description })
    if (!category) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating video category:', error)
    if (error instanceof Error && error.message.includes('already exists')) {
      return new NextResponse(error.message, { status: 409 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await syncCurrentUser()
    if (user?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = await params
    const success = await deleteVideoCategory(id)
    if (!success) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting video category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

