import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'

export interface Playlist {
  _id?: ObjectId
  title: string
  description: string
  youtubePlaylistId: string
  categoryId: ObjectId
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'playlists'

export function isValidYoutubePlaylistId(playlistId: string) {
  return /^[a-zA-Z0-9_-]{10,80}$/.test(playlistId)
}

export function extractYoutubePlaylistId(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null

  if (raw.startsWith('PL') || raw.startsWith('UU') || raw.startsWith('LL') || raw.startsWith('RD')) {
    if (isValidYoutubePlaylistId(raw)) return raw
  }

  try {
    const url = new URL(raw)
    const list = url.searchParams.get('list')
    if (list && isValidYoutubePlaylistId(list)) return list
  } catch {
  }

  const m = /(?:\?|&|#)list=([a-zA-Z0-9_-]+)/.exec(raw)
  if (m?.[1] && isValidYoutubePlaylistId(m[1])) return m[1]

  if (isValidYoutubePlaylistId(raw)) return raw
  return null
}

export async function createPlaylist(
  data: Omit<Playlist, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Playlist> {
  const db = await getDb()
  const now = new Date()

  const playlist: Omit<Playlist, '_id'> = {
    ...data,
    createdAt: now,
    updatedAt: now
  }

  const result = await db.collection<Playlist>(COLLECTION).insertOne(playlist as Playlist)
  return { ...playlist, _id: result.insertedId }
}

export async function getPlaylists(options?: {
  limit?: number
  skip?: number
  q?: string
  categoryId?: string
}): Promise<Playlist[]> {
  const db = await getDb()

  const query: Record<string, unknown> = {}

  if (options?.categoryId) {
    query.categoryId = new ObjectId(options.categoryId)
  }

  if (options?.q) {
    const q = options.q.trim()
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }
  }

  return db.collection<Playlist>(COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .skip(options?.skip || 0)
    .limit(options?.limit || 50)
    .toArray()
}

export async function getPlaylistCount(options?: { q?: string; categoryId?: string }): Promise<number> {
  const db = await getDb()
  const query: Record<string, unknown> = {}

  if (options?.categoryId) {
    query.categoryId = new ObjectId(options.categoryId)
  }

  if (options?.q) {
    const q = options.q.trim()
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }
  }

  return db.collection<Playlist>(COLLECTION).countDocuments(query)
}

export async function getPlaylistById(id: string): Promise<Playlist | null> {
  const db = await getDb()
  return db.collection<Playlist>(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function updatePlaylist(
  id: string,
  data: Partial<Omit<Playlist, '_id' | 'createdAt'>>
): Promise<Playlist | null> {
  const db = await getDb()
  const result = await db.collection<Playlist>(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  return result
}

export async function deletePlaylist(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<Playlist>(COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}

