export type DocumentStatus = 'disabled' | 'enabled'

export type UserRole = 'admin' | 'user'

export interface Document {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  fileName: string
  fileUrl: string
  sizeOriginal: number
  sizeCompressed: number
  status: DocumentStatus
  uploadedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  lastLogin: Date | null
  createdAt: Date
}

export const CATEGORIES = [
  'Lecture Notes',
  'Past Papers',
  'Textbooks',
  'Assignments',
  'Lab Reports',
  'Study Guides',
  'Reference Materials',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]
