import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllUsers, getUserByClerkId } from '@/lib/models/user.model'

// GET /api/users - Get all users (admin only)
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await getUserByClerkId(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await getAllUsers()

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
