import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { syncCurrentUser } from '@/lib/models/user.model'
import { deletePlaylist, extractYoutubePlaylistId, getPlaylistById, updatePlaylist } from '@/lib/models/playlist.model'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const playlist = await getPlaylistById(id)

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    return NextResponse.json({ playlist })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 })
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
    const { title, description, youtubePlaylist, categoryId } = body as {
      title?: string
      description?: string
      youtubePlaylist?: string
      categoryId?: string
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const playlistId = youtubePlaylist ? extractYoutubePlaylistId(youtubePlaylist) : null
    if (!playlistId) {
      return NextResponse.json(
        { error: 'Invalid YouTube playlist URL or id' },
        { status: 400 }
      )
    }

    if (!categoryId || !ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: 'Valid categoryId is required' }, { status: 400 })
    }

    const updated = await updatePlaylist(id, {
      title: title.trim(),
      description: description || '',
      youtubePlaylistId: playlistId,
      categoryId: new ObjectId(categoryId)
    })

    if (!updated) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, playlist: updated })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 })
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
    const ok = await deletePlaylist(id)
    if (!ok) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 })
  }
}

