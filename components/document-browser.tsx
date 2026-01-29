'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { DocumentCard } from './document-card'

interface Document {
  _id: string
  title: string
  description: string
  category: string
  fileName: string
  fileSize: number
  downloadEnabled: boolean
}

export function DocumentBrowser() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch('/api/documents')
        const data = await res.json()
        if (data.documents) {
          setDocuments(data.documents)
        }
      } catch (err) {
        console.error('Error fetching documents:', err)
        setError('Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <FileText className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
        <h3 className="font-medium mb-1">No documents available</h3>
        <p className="text-sm text-zinc-500">Check back later for study materials</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc._id}
          id={doc._id}
          title={doc.title}
          description={doc.description}
          category={doc.category}
          fileName={doc.fileName}
          fileSize={doc.fileSize}
          downloadEnabled={doc.downloadEnabled ?? true}
        />
      ))}
    </div>
  )
}
