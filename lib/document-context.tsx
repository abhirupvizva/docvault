'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Document, User } from './types'
import { mockDocuments, mockUsers, currentUser } from './data'

interface DocumentContextType {
  documents: Document[]
  users: User[]
  user: User
  isAdmin: boolean
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  toggleStatus: (id: string) => void
  getVisibleDocuments: () => Document[]
}

const DocumentContext = createContext<DocumentContextType | null>(null)

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [users] = useState<User[]>(mockUsers)
  const user = currentUser
  const isAdmin = user.role === 'admin'

  const addDocument = useCallback((doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDoc: Document = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setDocuments((prev) => [newDoc, ...prev])
  }, [])

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
      )
    )
  }, [])

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }, [])

  const toggleStatus = useCallback((id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              status: doc.status === 'disabled' ? 'enabled' : 'disabled',
              updatedAt: new Date(),
            }
          : doc
      )
    )
  }, [])

  const getVisibleDocuments = useCallback(() => {
    if (isAdmin) return documents
    return documents.filter((doc) => doc.status === 'enabled')
  }, [documents, isAdmin])

  return (
    <DocumentContext.Provider
      value={{
        documents,
        users,
        user,
        isAdmin,
        addDocument,
        updateDocument,
        deleteDocument,
        toggleStatus,
        getVisibleDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider')
  }
  return context
}
