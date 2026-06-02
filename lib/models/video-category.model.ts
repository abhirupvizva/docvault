import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'

export interface VideoCategory {
  _id?: ObjectId
  name: string
  description?: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'video_categories'

export function createVideoCategorySlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createVideoCategory(data: Pick<VideoCategory, 'name' | 'description'>) {
  const db = await getDb()
  const now = new Date()

  const category: VideoCategory = {
    name: data.name,
    description: data.description,
    slug: createVideoCategorySlug(data.name),
    createdAt: now,
    updatedAt: now
  }

  const existing = await db.collection<VideoCategory>(COLLECTION).findOne({ slug: category.slug })
  if (existing) {
    throw new Error('Video category with this name already exists')
  }

  const result = await db.collection<VideoCategory>(COLLECTION).insertOne(category)
  return { ...category, _id: result.insertedId }
}

export async function getVideoCategories(): Promise<VideoCategory[]> {
  const db = await getDb()
  return db.collection<VideoCategory>(COLLECTION)
    .find()
    .sort({ name: 1 })
    .toArray()
}

export async function getVideoCategoryById(id: string): Promise<VideoCategory | null> {
  const db = await getDb()
  return db.collection<VideoCategory>(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function updateVideoCategory(
  id: string,
  data: Partial<Pick<VideoCategory, 'name' | 'description'>>
): Promise<VideoCategory | null> {
  const db = await getDb()
  const updates: Partial<VideoCategory> = { ...data, updatedAt: new Date() }

  if (data.name) {
    updates.slug = createVideoCategorySlug(data.name)
    const existing = await db.collection<VideoCategory>(COLLECTION).findOne({
      slug: updates.slug,
      _id: { $ne: new ObjectId(id) }
    })
    if (existing) {
      throw new Error('Video category with this name already exists')
    }
  }

  const result = await db.collection<VideoCategory>(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  )

  return result
}

export async function deleteVideoCategory(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<VideoCategory>(COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}

