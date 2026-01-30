'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Download,
  XCircle,
  Home,
  ArrowLeft,
  Loader2,
  X
} from 'lucide-react'
import Link from 'next/link'

interface Document {
  _id: string
  title: string
  description: string
  category: string
  fileName: string
  fileSize: number
  status: 'enabled' | 'disabled'
  downloadEnabled: boolean
  createdAt: string
}

interface Category {
  _id: string
  name: string
  slug: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

export default function AdminDocumentsPage() {
  const { isLoaded } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [docsRes, catsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/categories')
      ])

      const docsData = await docsRes.json()
      if (docsData.documents) {
        setDocuments(docsData.documents)
      }

      if (catsRes.ok) {
        setCategories(await catsRes.json())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      fetchData()
    }
  }, [isLoaded, fetchData])

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}/toggle`, { method: 'PATCH' })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const handleToggleDownload = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}/toggle-download`, { method: 'PATCH' })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling download:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Admin
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <h1 className="text-lg font-semibold">Documents</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Manage Documents</h2>
          <p className="text-zinc-400 mt-1">{documents.length} documents uploaded</p>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
            <FileText className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents yet</h3>
            <p className="text-zinc-500 mb-6">Upload your first document to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 hidden md:table-cell">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 hidden lg:table-cell">Size</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Download</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-zinc-500 truncate max-w-xs">{doc.fileName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 hidden md:table-cell">{doc.category}</td>
                    <td className="px-6 py-4 text-zinc-400 hidden lg:table-cell">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${doc.status === 'enabled'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-zinc-500/10 text-zinc-500'
                        }`}>
                        {doc.status === 'enabled' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleDownload(doc._id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${doc.downloadEnabled !== false
                          ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20'
                          }`}
                        title={doc.downloadEnabled !== false ? 'Click to disable downloads' : 'Click to enable downloads'}
                      >
                        {doc.downloadEnabled !== false ? (
                          <>
                            <Download className="w-3 h-3" />
                            enabled
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/documents/${doc._id}`}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleToggleStatus(doc._id)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title={doc.status === 'enabled' ? 'Disable' : 'Enable'}
                        >
                          {doc.status === 'enabled' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          categories={categories}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

function UploadModal({
  categories,
  onClose,
  onSuccess
}: {
  categories: Category[]
  onClose: () => void;
  onSuccess: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')

  // Set default category if available
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name)
    }
  }, [categories, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      let data
      const text = await res.text()
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error('Upload response parse error:', e)
        console.error('Raw response:', text)
        if (text.includes('Request Entity Too Large')) {
          throw new Error('File is too large for the server. Please check your connection or try a smaller file.')
        }
        throw new Error(`Upload failed: ${res.statusText} (${res.status})`)
      }

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium mb-2">PDF File *</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-zinc-600 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-sm text-zinc-300">{file.name}</p>
                    <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                    <p className="text-sm text-zinc-400">Click to upload PDF</p>
                    <p className="text-xs text-zinc-500">Max 50MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Document title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              placeholder="Brief description of the document"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !title || uploading}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
