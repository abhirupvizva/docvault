'use client'

import React from "react"

import { FileText, Download, Eye, MoreVertical, Trash2, EyeOff, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Document } from '@/lib/types'
import { formatFileSize, formatDate } from '@/lib/data'
import { useDocuments } from '@/lib/document-context'

interface DocumentCardProps {
  document: Document
  onPreview: (doc: Document) => void
}

export function DocumentCard({ document, onPreview }: DocumentCardProps) {
  const { isAdmin, toggleStatus, deleteDocument } = useDocuments()
  const isDisabled = document.status === 'disabled'
  const isDraft = document.status === 'draft' // Declare isDraft variable

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    // In production, this would trigger an actual download
    console.log('[v0] Download triggered for:', document.fileName)
  }

  const handlePreview = () => {
    onPreview(document)
  }

  return (
    <Card
      className="group cursor-pointer transition-shadow duration-200 hover:shadow-lg border-border/50 hover:border-border"
      onClick={handlePreview}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handlePreview()
        }
      }}
      aria-label={`View ${document.title}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-foreground text-pretty">
                  {document.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {document.description}
                </p>
              </div>
              
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Document options"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleStatus(document.id)}>
                      {isDisabled ? (
                        <>
                          <Check className="mr-2 size-4" />
                          Enable
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-2 size-4" />
                          Disable
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => deleteDocument(document.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {document.category}
              </Badge>
              {isAdmin && (
                <Badge
                  variant="outline"
                  className={
                    isDisabled
                      ? 'border-doc-draft/50 bg-doc-draft/10 text-doc-draft'
                      : 'border-doc-published/50 bg-doc-published/10 text-doc-published'
                  }
                >
                  {isDisabled ? 'Disabled' : 'Enabled'}
                </Badge>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                <span>{formatFileSize(document.sizeCompressed)}</span>
                <span>{formatDate(document.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePreview()
                  }}
                  aria-label={`Preview ${document.title}`}
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDownload}
                  aria-label={`Download ${document.title}`}
                >
                  <Download className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
