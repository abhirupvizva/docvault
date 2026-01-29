'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, Filter } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [docsRes, favsRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/user/favorites') // We need to create/verify this endpoint
        ])

        const docsData = await docsRes.json()
        if (docsData.documents) {
          setDocuments(docsData.documents)
        }

        const favsData = await favsRes.json()
        if (favsData.favorites) {
          setFavorites(favsData.favorites)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-zinc-500" />
        </div>
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-2.5 placeholder-zinc-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <FileText className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
          <h3 className="font-medium mb-1">
            {searchQuery ? 'No matching documents' : 'No documents available'}
          </h3>
          <p className="text-sm text-zinc-500">
            {searchQuery ? 'Try a different search term' : 'Check back later for study materials'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc._id}
              id={doc._id}
              title={doc.title}
              description={doc.description}
              category={doc.category}
              fileName={doc.fileName}
              fileSize={doc.fileSize}
              downloadEnabled={doc.downloadEnabled ?? true}
              initialIsFavorite={favorites.includes(doc._id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
