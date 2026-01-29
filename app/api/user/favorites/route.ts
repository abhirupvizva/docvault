import { auth } from '@clerk/nextjs/server'
import { toggleFavorite, getUserFavorites } from '@/lib/models/user.model'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { documentId } = await req.json()
    if (!documentId) {
      return new NextResponse('Document ID required', { status: 400 })
    }

    await toggleFavorite(userId, documentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const favorites = await getUserFavorites(userId)
    return NextResponse.json({ favorites: favorites.map(id => id.toString()) })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
