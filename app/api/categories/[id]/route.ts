import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { updateCategory, deleteCategory } from '@/lib/models/category.model'
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

    // Verify admin status
    const user = await syncCurrentUser()
    if (user?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, description } = body

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const category = await updateCategory(id, { name, description })

    if (!category) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
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

    // Verify admin status
    const user = await syncCurrentUser()
    if (user?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = await params
    const success = await deleteCategory(id)

    if (!success) {
      return new NextResponse('Category not found', { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
