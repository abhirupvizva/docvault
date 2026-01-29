import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb'
import { currentUser } from '@clerk/nextjs/server'

export type UserRole = 'admin' | 'user'

export interface User {
  _id?: ObjectId
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  favorites?: ObjectId[]
  recentDocs?: {
    documentId: ObjectId
    viewedAt: Date
  }[]
}

const COLLECTION = 'users'

export async function createUser(data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const db = await getDb()
  const now = new Date()

  const user: Omit<User, '_id'> = {
    ...data,
    role: data.role || 'user',
    createdAt: now,
    updatedAt: now,
  }

  const result = await db.collection<User>(COLLECTION).insertOne(user as User)
  return { ...user, _id: result.insertedId }
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const db = await getDb()
  return db.collection<User>(COLLECTION).findOne({ clerkId })
}

export async function updateUserByClerkId(
  clerkId: string,
  data: Partial<Omit<User, '_id' | 'clerkId' | 'createdAt'>>
): Promise<User | null> {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTION).findOneAndUpdate(
    { clerkId },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  return result
}

export async function deleteUserByClerkId(clerkId: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTION).deleteOne({ clerkId })
  return result.deletedCount === 1
}

export async function getUserRole(clerkId: string): Promise<UserRole | null> {
  const user = await getUserByClerkId(clerkId)
  return user?.role ?? null
}

/**
 * Sync user from Clerk to MongoDB on access
 * This ensures users exist in our database even without webhooks (useful for local dev)
 */
export async function syncCurrentUser(): Promise<User | null> {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  const db = await getDb()
  const collection = db.collection<User>(COLLECTION)

  // Check if user exists
  let user = await collection.findOne({ clerkId: clerkUser.id })

  if (user) {
    // Update user info if it changed
    const updates: Partial<User> = {
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName ?? undefined,
      lastName: clerkUser.lastName ?? undefined,
      imageUrl: clerkUser.imageUrl ?? undefined,
      updatedAt: new Date(),
    }

    await collection.updateOne({ clerkId: clerkUser.id }, { $set: updates })
    return { ...user, ...updates }
  }

  // Create new user
  const now = new Date()
  const newUser: Omit<User, '_id'> = {
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    firstName: clerkUser.firstName ?? undefined,
    lastName: clerkUser.lastName ?? undefined,
    imageUrl: clerkUser.imageUrl ?? undefined,
    role: 'user', // Default role - first user could be made admin manually
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newUser as User)
  console.log('✅ Created new user in MongoDB:', clerkUser.id)

  return { ...newUser, _id: result.insertedId }
}

// Get total user count
export async function getUserCount(): Promise<number> {
  const db = await getDb()
  return db.collection<User>(COLLECTION).countDocuments()
}

// Get all users (for admin)
export async function getAllUsers(options?: {
  limit?: number
  skip?: number
}): Promise<User[]> {
  const db = await getDb()
  return db.collection<User>(COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .skip(options?.skip || 0)
    .limit(options?.limit || 100)
    .toArray()
}

// Update user role (admin only)
export async function updateUserRole(clerkId: string, role: UserRole): Promise<User | null> {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTION).findOneAndUpdate(
    { clerkId },
    { $set: { role, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  return result
}

// Toggle favorite status for a document
export async function toggleFavorite(clerkId: string, documentId: string): Promise<User | null> {
  const db = await getDb()
  const docId = new ObjectId(documentId)

  const user = await db.collection<User>(COLLECTION).findOne({ clerkId })
  if (!user) return null

  const isFavorite = user.favorites?.some(id => id.equals(docId))

  let update
  if (isFavorite) {
    update = { $pull: { favorites: docId } as any }
  } else {
    update = { $addToSet: { favorites: docId } as any }
  }

  const result = await db.collection<User>(COLLECTION).findOneAndUpdate(
    { clerkId },
    {
      ...update,
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  )

  return result
}

// Add document to recent list
export async function addToRecent(clerkId: string, documentId: string): Promise<User | null> {
  const db = await getDb()
  const docId = new ObjectId(documentId)

  // Remove existing entry for this doc if present, then push to front (cap at 10)
  await db.collection<User>(COLLECTION).findOneAndUpdate(
    { clerkId },
    {
      $pull: { recentDocs: { documentId: docId } } as any
    }
  )

  const finalResult = await db.collection<User>(COLLECTION).findOneAndUpdate(
    { clerkId },
    {
      $push: {
        recentDocs: {
          $each: [{ documentId: docId, viewedAt: new Date() }],
          $position: 0,
          $slice: 10
        }
      } as any,
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  )

  return finalResult
}

// Get user favorites
export async function getUserFavorites(clerkId: string): Promise<ObjectId[]> {
  const user = await getUserByClerkId(clerkId)
  return user?.favorites || []
}

// Get user recent docs
export async function getUserRecent(clerkId: string): Promise<NonNullable<User['recentDocs']>> {
  const user = await getUserByClerkId(clerkId)
  return user?.recentDocs || []
}
