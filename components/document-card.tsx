'use client'

import { useState } from 'react'
import { Download, FileText, Eye } from 'lucide-react'
import { PDFViewerModal } from './pdf-viewer-modal'

interface DocumentCardProps {
  id: string
  title: string
  description: string
  category: string
  fileName: string
  fileSize: number
  downloadEnabled: boolean
}

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
}: DocumentCardProps) {
  const [showViewer, setShowViewer] = useState(false)

  return (
    <>
      <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-800 rounded-lg text-emerald-500 group-hover:bg-emerald-500/10 transition-colors">
            <FileText className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg mb-1 truncate">{title}</h3>
            {description && (
              <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{description}</p>
            )}

            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="px-2 py-1 bg-zinc-800 rounded">{category}</span>
              <span>{formatFileSize(fileSize)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* View button */}
            <button
              onClick={() => setShowViewer(true)}
              className="p-3 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-800 rounded-lg transition-colors"
              title="View document"
            >
              <Eye className="w-5 h-5" />
            </button>

            {/* Download button - only show if enabled */}
            {downloadEnabled && (
              <a
                href={`/api/documents/${id}`}
                className="p-3 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-800 rounded-lg transition-colors"
                title={`Download ${fileName}`}
              >
                <Download className="w-5 h-5" />
              </a>
            )}
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
