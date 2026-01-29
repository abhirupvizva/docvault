import { auth } from '@clerk/nextjs/server'
import { addToRecent, getUserRecent } from '@/lib/models/user.model'
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

    await addToRecent(userId, documentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding to recent:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const recent = await getUserRecent(userId)
    return NextResponse.json({ recent })
  } catch (error) {
    console.error('Error fetching recent docs:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
