import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { syncCurrentUser } from '@/lib/models/user.model'
import { createVideo, getVideoCount, getVideos, isValidYoutubeVideoId } from '@/lib/models/video.model'

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const limit = Number.parseInt(sp.get('limit') || '50', 10)
    const skip = Number.parseInt(sp.get('skip') || '0', 10)
    const q = sp.get('q') || undefined
    const categoryId = sp.get('categoryId') || undefined

    const [videos, total] = await Promise.all([
      getVideos({ limit, skip, q, categoryId }),
      getVideoCount({ q, categoryId })
    ])

    return NextResponse.json({
      videos,
      total,
      hasMore: skip + videos.length < total
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await syncCurrentUser()
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, youtubeVideoId, categoryId } = body as {
      title?: string
      description?: string
      youtubeVideoId?: string
      categoryId?: string
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!youtubeVideoId?.trim() || !isValidYoutubeVideoId(youtubeVideoId.trim())) {
      return NextResponse.json({ error: 'Invalid YouTube videoId' }, { status: 400 })
    }

    if (!categoryId || !ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: 'Valid categoryId is required' }, { status: 400 })
    }

    const video = await createVideo({
      title: title.trim(),
      description: description || '',
      youtubeVideoId: youtubeVideoId.trim(),
      categoryId: new ObjectId(categoryId)
    })

    return NextResponse.json({ success: true, video }, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}

