import { ObjectId } from 'mongodb'
import { getDb, getGridFSBucket } from '../mongodb'
import { Readable } from 'stream'
import { gzip } from 'zlib'
import { promisify } from 'util'
import * as zlib from 'zlib'

const doGzip = promisify(gzip)

export type DocumentStatus = 'enabled' | 'disabled'

export interface DocumentMetadata {
  _id?: ObjectId
  title: string
  description: string
  category: string
  fileName: string
  fileId: ObjectId // GridFS file reference
  fileSize: number
  mimeType: string
  status: DocumentStatus
  downloadEnabled: boolean
  uploadedBy: string // clerkId
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'documents'

// Create document metadata and upload file to GridFS
export async function uploadDocument(
  file: Buffer,
  metadata: Omit<DocumentMetadata, '_id' | 'fileId' | 'createdAt' | 'updatedAt' | 'downloadEnabled'>
): Promise<DocumentMetadata> {
  const db = await getDb()
  const bucket = await getGridFSBucket()

  // Compress file
  const compressedFile = await doGzip(file)

  // Upload file to GridFS
  const uploadStream = bucket.openUploadStream(metadata.fileName, {
    metadata: {
      contentType: metadata.mimeType,
      uploadedBy: metadata.uploadedBy,
      title: metadata.title,
      isCompressed: true,
      originalSize: file.length
    }
  })

  const fileId = uploadStream.id

  // Convert buffer to readable stream and pipe to GridFS
  const readable = Readable.from(compressedFile)
  await new Promise<void>((resolve, reject) => {
    readable.pipe(uploadStream)
      .on('finish', resolve)
      .on('error', reject)
  })

  // Create document metadata
  const now = new Date()
  const doc: Omit<DocumentMetadata, '_id'> = {
    ...metadata,
    fileId,
    downloadEnabled: true,
    createdAt: now,
    updatedAt: now,
  }

  const result = await db.collection<DocumentMetadata>(COLLECTION).insertOne(doc as DocumentMetadata)

  return { ...doc, _id: result.insertedId }
}

// Get all documents (optionally filter by status)
export async function getDocuments(options?: {
  status?: DocumentStatus
  limit?: number
  skip?: number
}): Promise<DocumentMetadata[]> {
  const db = await getDb()

  const query: Record<string, unknown> = {}
  if (options?.status) {
    query.status = options.status
  }

  return db.collection<DocumentMetadata>(COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .skip(options?.skip || 0)
    .limit(options?.limit || 50)
    .toArray()
}

// Get single document by ID
export async function getDocumentById(id: string): Promise<DocumentMetadata | null> {
  const db = await getDb()
  return db.collection<DocumentMetadata>(COLLECTION).findOne({
    _id: new ObjectId(id)
  })
}

// Get document count
export async function getDocumentCount(status?: DocumentStatus): Promise<number> {
  const db = await getDb()
  const query: Record<string, unknown> = {}
  if (status) {
    query.status = status
  }
  return db.collection<DocumentMetadata>(COLLECTION).countDocuments(query)
}

// Download file from GridFS
export async function downloadDocument(fileId: ObjectId): Promise<{
  stream: NodeJS.ReadableStream
  filename: string
  contentType: string
}> {
  const bucket = await getGridFSBucket()
  const db = await getDb()

  // Get file info
  const files = await bucket.find({ _id: fileId }).toArray()
  if (files.length === 0) {
    throw new Error('File not found')
  }

  const file = files[0]
  let stream: NodeJS.ReadableStream = bucket.openDownloadStream(fileId)

  // Decompress if needed
  if (file.metadata?.isCompressed) {
    stream = stream.pipe(zlib.createGunzip())
  }

  return {
    stream,
    filename: file.filename,
    contentType: (file.metadata?.contentType as string) || 'application/pdf'
  }
}

// Toggle document status
export async function toggleDocumentStatus(id: string): Promise<DocumentMetadata | null> {
  const db = await getDb()

  const doc = await db.collection<DocumentMetadata>(COLLECTION).findOne({
    _id: new ObjectId(id)
  })

  if (!doc) return null

  const newStatus: DocumentStatus = doc.status === 'enabled' ? 'disabled' : 'enabled'

  const result = await db.collection<DocumentMetadata>(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status: newStatus, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  return result
}

// Delete document and its file
export async function deleteDocument(id: string): Promise<boolean> {
  const db = await getDb()
  const bucket = await getGridFSBucket()

  const doc = await db.collection<DocumentMetadata>(COLLECTION).findOne({
    _id: new ObjectId(id)
  })

  if (!doc) return false

  // Delete file from GridFS
  try {
    await bucket.delete(doc.fileId)
  } catch (error) {
    console.error('Error deleting file from GridFS:', error)
  }

  // Delete metadata
  const result = await db.collection<DocumentMetadata>(COLLECTION).deleteOne({
    _id: new ObjectId(id)
  })

  return result.deletedCount === 1
}

// Toggle download enabled for a document
export async function toggleDownloadEnabled(id: string): Promise<DocumentMetadata | null> {
  const db = await getDb()

  const doc = await db.collection<DocumentMetadata>(COLLECTION).findOne({
    _id: new ObjectId(id)
  })

  if (!doc) return null

  const newDownloadEnabled = !doc.downloadEnabled

  const result = await db.collection<DocumentMetadata>(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { downloadEnabled: newDownloadEnabled, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )

  return result
}
