import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'

export interface Video {
  _id?: ObjectId
  title: string
  description: string
  youtubeVideoId: string
  categoryId: ObjectId
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'videos'

export function isValidYoutubeVideoId(videoId: string) {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
}

export async function createVideo(data: Omit<Video, '_id' | 'createdAt' | 'updatedAt'>): Promise<Video> {
  const db = await getDb()
  const now = new Date()

  const video: Omit<Video, '_id'> = {
    ...data,
    createdAt: now,
    updatedAt: now
  }

  const result = await db.collection<Video>(COLLECTION).insertOne(video as Video)
  return { ...video, _id: result.insertedId }
}

export async function getVideos(options?: {
  limit?: number
  skip?: number
  q?: string
  categoryId?: string
}): Promise<Video[]> {
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

  return db.collection<Video>(COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .skip(options?.skip || 0)
    .limit(options?.limit || 50)
    .toArray()
}

export async function getVideoCount(options?: { q?: string; categoryId?: string }): Promise<number> {
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

  return db.collection<Video>(COLLECTION).countDocuments(query)
}

export async function getVideoById(id: string): Promise<Video | null> {
  const db = await getDb()
  return db.collection<Video>(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function updateVideo(
  id: string,
  data: Partial<Omit<Video, '_id' | 'createdAt'>>
): Promise<Video | null> {
  const db = await getDb()
  const result = await db.collection<Video>(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  return result
}

export async function deleteVideo(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<Video>(COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}

