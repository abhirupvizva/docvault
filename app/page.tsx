'use client'

import { useState } from 'react'
import { DocumentProvider, useDocuments } from '@/lib/document-context'
import { Header, type TabType } from '@/components/header'
import { DocumentList } from '@/components/document-list'
import { UserList } from '@/components/user-list'
import { UploadModal } from '@/components/upload-modal'
import { PDFPreviewModal } from '@/components/pdf-preview-modal'
import type { Document } from '@/lib/types'

function StudyPlatform() {
  const { isAdmin } = useDocuments()
  const [activeTab, setActiveTab] = useState<TabType>('materials')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc)
    setPreviewOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onUploadClick={() => setUploadOpen(true)} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'materials' ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">Study Materials</h2>
              <p className="mt-1 text-muted-foreground">
                Browse, search, and download lecture notes, past papers, and more
              </p>
            </div>
            <DocumentList onPreview={handlePreview} />
          </>
        ) : isAdmin ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">User Management</h2>
              <p className="mt-1 text-muted-foreground">
                View and manage registered users and their activity
              </p>
            </div>
            <UserList />
          </>
        ) : null}
      </main>

      {/* Modals */}
      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
      <PDFPreviewModal
        document={selectedDocument}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}

export default function Page() {
  return (
    <DocumentProvider>
      <StudyPlatform />
    </DocumentProvider>
  )
}
