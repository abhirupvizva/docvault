'use client'

import { useState } from 'react'
import { X, Download, Maximize2, Minimize2, Loader2 } from 'lucide-react'

interface PDFViewerModalProps {
  documentId: string
  title: string
  downloadEnabled: boolean
  onClose: () => void
}

export function PDFViewerModal({
  documentId,
  title,
  downloadEnabled,
  onClose
}: PDFViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col transition-all duration-300 ${isFullscreen ? 'w-full h-full m-0 rounded-none' : 'w-[95vw] h-[90vh] max-w-6xl'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="text-lg font-semibold truncate pr-4">{title}</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative flex-1 bg-zinc-950">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-sm text-zinc-400">Loading document...</p>
              </div>
            </div>
          )}
          <iframe
            src={`/api/documents/${documentId}/view#toolbar=0&navpanes=0`}
            className="w-full h-full"
            title={title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  )
}
