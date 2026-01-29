'use client'

import { useEffect, useCallback } from 'react'
import { Download, X, FileText, Calendar, HardDrive, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Document } from '@/lib/types'
import { formatFileSize, formatDate } from '@/lib/data'

interface PDFPreviewModalProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PDFPreviewModal({ document, open, onOpenChange }: PDFPreviewModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    },
    [onOpenChange]
  )

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  const handleDownload = () => {
    if (!document) return
    // In production, this would trigger an actual download with signed URL
    console.log('[v0] Download triggered for:', document.fileName)
  }

  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg truncate">{document.title}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {document.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button onClick={handleDownload} aria-label="Download document">
                <Download className="size-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Close preview"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Metadata Bar */}
        <div className="px-6 py-3 border-b border-border bg-secondary/30 shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <span className="font-mono">{formatDate(document.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="size-4" />
              <span className="font-mono">{formatFileSize(document.sizeCompressed)}</span>
            </div>
            <Badge variant="secondary">{document.category}</Badge>
            {document.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {document.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {document.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-secondary/50">
          {/* 
            In production, this would be an embedded PDF viewer.
            For demo purposes, we show a placeholder.
            Options: react-pdf, pdf.js, or iframe with signed URL
          */}
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-secondary">
              <FileText className="size-10 text-muted-foreground" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-lg font-medium">PDF Preview</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                In production, this area would display an embedded PDF viewer for{' '}
                <span className="font-mono text-foreground">{document.fileName}</span>
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                The PDF viewer would support scrolling, zooming, and keyboard navigation.
                Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs">Esc</kbd> to close.
              </p>
            </div>
            <Button variant="outline" onClick={handleDownload} className="mt-4 bg-transparent">
              <Download className="size-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
