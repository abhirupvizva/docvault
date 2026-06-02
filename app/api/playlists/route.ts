import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { syncCurrentUser } from '@/lib/models/user.model'
import {
  createPlaylist,
  extractYoutubePlaylistId,
  getPlaylistCount,
  getPlaylists,
} from '@/lib/models/playlist.model'

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const limit = Number.parseInt(sp.get('limit') || '50', 10)
    const skip = Number.parseInt(sp.get('skip') || '0', 10)
    const q = sp.get('q') || undefined
    const categoryId = sp.get('categoryId') || undefined

    const [playlists, total] = await Promise.all([
      getPlaylists({ limit, skip, q, categoryId }),
      getPlaylistCount({ q, categoryId })
    ])

    return NextResponse.json({
      playlists,
      total,
      hasMore: skip + playlists.length < total
    })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 })
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

    const playlist = await createPlaylist({
      title: title.trim(),
      description: description || '',
      youtubePlaylistId: playlistId,
      categoryId: new ObjectId(categoryId)
    })

    return NextResponse.json({ success: true, playlist }, { status: 201 })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 })
  }
}

