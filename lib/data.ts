import type { Document, User } from './types'

// Mock admin user - in production, this would come from auth
export const currentUser: User = {
  id: 'admin-1',
  name: 'Prof. Sarah Chen',
  email: 'sarah.chen@university.edu',
  role: 'admin',
  lastLogin: new Date('2026-01-29T10:30:00'),
  createdAt: new Date('2024-08-15'),
}

// Mock users for admin management
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Prof. Sarah Chen',
    email: 'sarah.chen@university.edu',
    role: 'admin',
    lastLogin: new Date('2026-01-29T10:30:00'),
    createdAt: new Date('2024-08-15'),
  },
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.j@student.edu',
    role: 'user',
    lastLogin: new Date('2026-01-29T09:15:00'),
    createdAt: new Date('2025-09-01'),
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    email: 'maria.g@student.edu',
    role: 'user',
    lastLogin: new Date('2026-01-28T18:45:00'),
    createdAt: new Date('2025-09-01'),
  },
  {
    id: 'user-3',
    name: 'James Wilson',
    email: 'james.w@student.edu',
    role: 'user',
    lastLogin: new Date('2026-01-27T14:20:00'),
    createdAt: new Date('2025-09-05'),
  },
  {
    id: 'user-4',
    name: 'Emily Brown',
    email: 'emily.b@student.edu',
    role: 'user',
    lastLogin: null,
    createdAt: new Date('2026-01-15'),
  },
  {
    id: 'user-5',
    name: 'David Kim',
    email: 'david.k@student.edu',
    role: 'user',
    lastLogin: new Date('2026-01-26T11:00:00'),
    createdAt: new Date('2025-10-12'),
  },
]

// Mock documents - study materials
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Data Structures - Complete Lecture Notes',
    description: 'Comprehensive notes covering arrays, linked lists, trees, graphs, and hash tables with examples.',
    category: 'Lecture Notes',
    tags: ['cs101', 'data-structures', 'algorithms'],
    fileName: 'data-structures-notes.pdf',
    fileUrl: '/documents/data-structures-notes.pdf',
    sizeOriginal: 4458624,
    sizeCompressed: 2245312,
    status: 'enabled',
    uploadedBy: 'admin-1',
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2025-12-10'),
  },
  {
    id: 'doc-2',
    title: 'Calculus II - Final Exam 2025',
    description: 'Past final examination paper with solutions for Calculus II course.',
    category: 'Past Papers',
    tags: ['math', 'calculus', 'final-exam', '2025'],
    fileName: 'calc2-final-2025.pdf',
    fileUrl: '/documents/calc2-final-2025.pdf',
    sizeOriginal: 1242880,
    sizeCompressed: 621440,
    status: 'enabled',
    uploadedBy: 'admin-1',
    createdAt: new Date('2025-12-20'),
    updatedAt: new Date('2025-12-20'),
  },
  {
    id: 'doc-3',
    title: 'Introduction to Psychology Textbook',
    description: 'Core textbook for PSY101 covering fundamental psychology concepts and theories.',
    category: 'Textbooks',
    tags: ['psychology', 'psy101', 'textbook'],
    fileName: 'intro-psychology.pdf',
    fileUrl: '/documents/intro-psychology.pdf',
    sizeOriginal: 15048576,
    sizeCompressed: 7524288,
    status: 'enabled',
    uploadedBy: 'admin-1',
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-08-01'),
  },
  {
    id: 'doc-4',
    title: 'Physics Lab Report Template',
    description: 'Standard template for physics laboratory reports with formatting guidelines.',
    category: 'Lab Reports',
    tags: ['physics', 'lab', 'template'],
    fileName: 'physics-lab-template.pdf',
    fileUrl: '/documents/physics-lab-template.pdf',
    sizeOriginal: 786432,
    sizeCompressed: 393216,
    status: 'enabled',
    uploadedBy: 'admin-1',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-01'),
  },
  {
    id: 'doc-5',
    title: 'Organic Chemistry Study Guide',
    description: 'Comprehensive study guide for midterm preparation covering reactions and mechanisms.',
    category: 'Study Guides',
    tags: ['chemistry', 'organic', 'midterm'],
    fileName: 'ochem-study-guide.pdf',
    fileUrl: '/documents/ochem-study-guide.pdf',
    sizeOriginal: 2572864,
    sizeCompressed: 1286432,
    status: 'enabled',
    uploadedBy: 'admin-1',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-11-01'),
  },
  {
    id: 'doc-6',
    title: 'Machine Learning Assignment 3',
    description: 'Assignment on neural networks and deep learning fundamentals.',
    category: 'Assignments',
    tags: ['cs', 'machine-learning', 'neural-networks'],
    fileName: 'ml-assignment-3.pdf',
    fileUrl: '/documents/ml-assignment-3.pdf',
    sizeOriginal: 1097152,
    sizeCompressed: 548576,
    status: 'disabled',
    uploadedBy: 'admin-1',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: 'doc-7',
    title: 'Statistics Reference Sheet',
    description: 'Quick reference for statistical formulas and distributions.',
    category: 'Reference Materials',
    tags: ['statistics', 'math', 'reference'],
    fileName: 'stats-reference.pdf',
    fileUrl: '/documents/stats-reference.pdf',
    sizeOriginal: 524288,
    sizeCompressed: 262144,
    status: 'enabled',
    uploadedBy: 'admin-1',
    createdAt: new Date('2025-09-10'),
    updatedAt: new Date('2025-09-10'),
  },
  {
    id: 'doc-8',
    title: 'Biology 201 - Midterm Review',
    description: 'Review materials for the upcoming Biology 201 midterm examination.',
    category: 'Study Guides',
    tags: ['biology', 'midterm', 'review'],
    fileName: 'bio201-midterm-review.pdf',
    fileUrl: '/documents/bio201-midterm-review.pdf',
    sizeOriginal: 1835008,
    sizeCompressed: 917504,
    status: 'disabled',
    uploadedBy: 'admin-1',
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-01-25'),
  },
]

// Helper functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function getCompressionRatio(original: number, compressed: number): number {
  if (original === 0) return 0
  return Math.round(((original - compressed) / original) * 100)
}
