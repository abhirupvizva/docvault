'use client'

import { useState } from 'react'
import { X, Download, Maximize2, Minimize2 } from 'lucide-react'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col transition-all duration-300 ${isFullscreen ? 'w-full h-full m-0 rounded-none' : 'w-[95vw] h-[90vh] max-w-6xl'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="text-lg font-semibold truncate pr-4">{title}</h2>

          <div className="flex items-center gap-2">
            {downloadEnabled && (
              <a
                href={`/api/documents/${documentId}`}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}

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
        <div className="flex-1 bg-zinc-950">
          <iframe
            src={`/api/documents/${documentId}/view`}
            className="w-full h-full"
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
