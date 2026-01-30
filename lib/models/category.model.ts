import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'

export interface Category {
  _id?: ObjectId
  name: string
  description?: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'categories'

// Helper to create slug from name
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createCategory(data: Pick<Category, 'name' | 'description'>): Promise<Category> {
  const db = await getDb()
  const now = new Date()

  const category: Category = {
    ...data,
    slug: createSlug(data.name),
    createdAt: now,
    updatedAt: now
  }

  // Check for duplicate slug
  const existing = await db.collection<Category>(COLLECTION).findOne({ slug: category.slug })
  if (existing) {
    throw new Error('Category with this name already exists')
  }

  const result = await db.collection<Category>(COLLECTION).insertOne(category)
  return { ...category, _id: result.insertedId }
}

export async function getCategories(): Promise<Category[]> {
  const db = await getDb()
  return db.collection<Category>(COLLECTION)
    .find()
    .sort({ name: 1 })
    .toArray()
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = await getDb()
  return db.collection<Category>(COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function updateCategory(id: string, data: Partial<Pick<Category, 'name' | 'description'>>): Promise<Category | null> {
  const db = await getDb()
  const updates: Partial<Category> = { ...data, updatedAt: new Date() }

  if (data.name) {
    updates.slug = createSlug(data.name)
    // Check for duplicate slug if name changed
    const existing = await db.collection<Category>(COLLECTION).findOne({
      slug: updates.slug,
      _id: { $ne: new ObjectId(id) }
    })
    if (existing) {
      throw new Error('Category with this name already exists')
    }
  }

  const result = await db.collection<Category>(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  )

  return result
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<Category>(COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}
