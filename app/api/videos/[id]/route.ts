import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { syncCurrentUser } from '@/lib/models/user.model'
import { deleteVideo, getVideoById, isValidYoutubeVideoId, updateVideo } from '@/lib/models/video.model'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const video = await getVideoById(id)

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await syncCurrentUser()
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
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

    const updated = await updateVideo(id, {
      title: title.trim(),
      description: description || '',
      youtubeVideoId: youtubeVideoId.trim(),
      categoryId: new ObjectId(categoryId)
    })

    if (!updated) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, video: updated })
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await syncCurrentUser()
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const ok = await deleteVideo(id)
    if (!ok) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}

