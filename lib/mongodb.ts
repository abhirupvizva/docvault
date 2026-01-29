import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env')
}

const uri = process.env.MONGODB_URI
const options = {
  family: 4 // Force IPv4 to avoid potential DNS issues with SRV records
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

let client: MongoClient
let db: Db

// Use global variable in development to persist connection across hot reloads
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options)
  }
  client = global._mongoClient
} else {
  client = new MongoClient(uri, options)
}

let isConnected = false

export async function getDb(): Promise<Db> {
  if (!isConnected) {
    try {
      await client.connect()
      isConnected = true
      console.log('✅ Connected to MongoDB')
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error)
      throw error
    }
  }

  db = client.db('docvault') // Explicitly select database
  return db
}

export async function getClient(): Promise<MongoClient> {
  if (!isConnected) {
    try {
      await client.connect()
      isConnected = true
      console.log('✅ Connected to MongoDB')
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error)
      throw error
    }
  }
  return client
}

export async function getGridFSBucket(bucketName: string = 'documents') {
  const { GridFSBucket } = await import('mongodb')
  const db = await getDb()
  return new GridFSBucket(db, { bucketName })
}

// Get storage statistics
export async function getStorageStats(): Promise<{
  dataSize: number
  storageSize: number
  totalDocuments: number
  gridFSSize: number
}> {
  const db = await getDb()

  // Get database stats
  const stats = await db.command({ dbStats: 1 })

  // Get GridFS files size
  const gridFSFiles = await db.collection('documents.files').aggregate([
    { $group: { _id: null, totalSize: { $sum: '$length' } } }
  ]).toArray()

  const gridFSSize = gridFSFiles[0]?.totalSize || 0

  return {
    dataSize: stats.dataSize || 0,
    storageSize: stats.storageSize || 0,
    totalDocuments: stats.objects || 0,
    gridFSSize
  }
}

// Get total storage used by uploaded files
export async function getTotalFilesSize(): Promise<number> {
  const db = await getDb()
  const result = await db.collection('documents.files').aggregate([
    { $group: { _id: null, totalSize: { $sum: '$length' } } }
  ]).toArray()

  return result[0]?.totalSize || 0
}
