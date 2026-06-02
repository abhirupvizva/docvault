import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'

export interface PlaylistCategory {
  _id?: ObjectId
  name: string
  description?: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'playlist_categories'

export function createPlaylistCategorySlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createPlaylistCategory(data: Pick<PlaylistCategory, 'name' | 'description'>) {
  const db = await getDb()
  const now = new Date()

  const category: PlaylistCategory = {
    name: data.name,
    description: data.description,
    slug: createPlaylistCategorySlug(data.name),
    createdAt: now,
    updatedAt: now
  }

  const existing = await db.collection<PlaylistCategory>(COLLECTION).findOne({ slug: category.slug })
  if (existing) {
    throw new Error('Playlist category with this name already exists')
  }

  const result = await db.collection<PlaylistCategory>(COLLECTION).insertOne(category)
  return { ...category, _id: result.insertedId }
}

export async function getPlaylistCategories(): Promise<PlaylistCategory[]> {
  const db = await getDb()
  return db.collection<PlaylistCategory>(COLLECTION)
    .find()
    .sort({ name: 1 })
    .toArray()
}

export async function getPlaylistCategoryById(id: string): Promise<PlaylistCategory | null> {
  const db = await getDb()
  return db.collection<PlaylistCategory>(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function updatePlaylistCategory(
  id: string,
  data: Partial<Pick<PlaylistCategory, 'name' | 'description'>>
): Promise<PlaylistCategory | null> {
  const db = await getDb()
  const updates: Partial<PlaylistCategory> = { ...data, updatedAt: new Date() }

  if (data.name) {
    updates.slug = createPlaylistCategorySlug(data.name)
    const existing = await db.collection<PlaylistCategory>(COLLECTION).findOne({
      slug: updates.slug,
      _id: { $ne: new ObjectId(id) }
    })
    if (existing) {
      throw new Error('Playlist category with this name already exists')
    }
  }

  const result = await db.collection<PlaylistCategory>(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  )

  return result
}

export async function deletePlaylistCategory(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<PlaylistCategory>(COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}

