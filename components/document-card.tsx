'use client'

import { useState } from 'react'
import { Download, FileText, Eye, Loader2 } from 'lucide-react'
import { PDFViewerModal } from './pdf-viewer-modal'

interface DocumentCardProps {
  id: string
  title: string
  description: string
  category: string
  fileName: string
  fileSize: number
  downloadEnabled: boolean
  initialIsFavorite?: boolean
}

import { Star } from 'lucide-react'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

export function DocumentCard({
  id,
  title,
  description,
  category,
  fileName,
  fileSize,
  downloadEnabled,
  initialIsFavorite = false
}: DocumentCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [showViewer, setShowViewer] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  // NOTE: Simple local state for now. In a real app we'd fetch this or pass it down.
  // For this step, we will just toggle it locally and hit the API.
  // Ideally parent should provide this status. 
  // We will assume "false" initially and let user click it, 
  // OR we can fetch it. But triggering fetch for *every* card is bad. 
  // Better pattern: Parent fetches *all* fav IDs and passes `isFavorite` prop.
  // I will check if I can modify parent first. But user wants this done.
  // Let's stick to updating this component to ACCEPT isFavorite prop first,
  // but for now I will use local state and effect to check status (less efficient but works) 
  // OR just assume false.

  // Actually, I will make the parent pass the favorite status.
  // But wait, the parent `DocumentBrowser` fetches documents. 
  // It should also fetch user favorites.

  // Let's add the UI first.
  const toggleFav = async () => {
    try {
      setIsFavorite(!isFavorite) // Optimistic update
      await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id })
      })
      // Should probably revalidate dashboard stats here
    } catch (e) {
      console.error("Failed to toggle fav", e)
      setIsFavorite(!isFavorite) // Revert
    }
  }

  const handleView = async () => {
    setIsOpening(true)
    setShowViewer(true)
    try {
      await fetch('/api/user/recent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id })
      })
    } catch (e) {
      console.error("Failed to update recent", e)
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <>
      <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-800 rounded-lg text-emerald-500 group-hover:bg-emerald-500/10 transition-colors">
            <FileText className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-lg truncate">{title}</h3>
            </div>

            {description && (
              <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{description}</p>
            )}

            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="px-2 py-1 bg-zinc-800 rounded">{category}</span>
              <span>{formatFileSize(fileSize)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleFav}
              className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-400'}`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
            </button>

            <div className="flex items-center gap-1 mt-2">
              {/* View button */}
              <button
                onClick={handleView}
                disabled={isOpening}
                className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                title="View document"
              >
                {isOpening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
              </button>

              {/* Download button - only show if enabled */}
              {downloadEnabled && (
                <a
                  href={`/api/documents/${id}`}
                  onClick={() => {
                    // Also mark as recent on download
                    fetch('/api/user/recent', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ documentId: id })
                    }).catch(console.error)
                  }}
                  className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-800 rounded-lg transition-colors"
                  title={`Download ${fileName}`}
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showViewer && (
        <PDFViewerModal
          documentId={id}
          title={title}
          downloadEnabled={downloadEnabled}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  )
}
