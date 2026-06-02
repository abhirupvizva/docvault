import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createVideoCategory, getVideoCategories } from '@/lib/models/video-category.model'
import { syncCurrentUser } from '@/lib/models/user.model'

export async function GET() {
  try {
    const categories = await getVideoCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching video categories:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await syncCurrentUser()
    if (user?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const { name, description } = body as { name?: string; description?: string }

    if (!name?.trim()) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const category = await createVideoCategory({ name: name.trim(), description })
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating video category:', error)
    if (error instanceof Error && error.message.includes('already exists')) {
      return new NextResponse(error.message, { status: 409 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

