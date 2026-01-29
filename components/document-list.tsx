'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, X, FileX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { DocumentCard } from '@/components/document-card'
import { DocumentListSkeleton } from '@/components/document-skeleton'
import { useDocuments } from '@/lib/document-context'
import { CATEGORIES } from '@/lib/types'
import type { Document } from '@/lib/types'

interface DocumentListProps {
  onPreview: (doc: Document) => void
}

export function DocumentList({ onPreview }: DocumentListProps) {
  const { getVisibleDocuments, isAdmin } = useDocuments()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const documents = getVisibleDocuments()

  const filteredDocuments = useMemo(() => {
    let result = documents

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((doc) => doc.category === selectedCategory)
    }

    return result
  }, [documents, searchQuery, selectedCategory])

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  // Get unique categories from documents
  const availableCategories = useMemo(() => {
    const cats = new Set(documents.map((doc) => doc.category))
    return CATEGORIES.filter((cat) => cats.has(cat))
  }, [documents])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-9 w-full max-w-sm bg-secondary/50 rounded-md animate-pulse" />
          <div className="h-9 w-40 bg-secondary/50 rounded-md animate-pulse" />
        </div>
        <DocumentListSkeleton count={4} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search documents"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {searchQuery.trim() && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory('all')}
                className="ml-1 hover:text-foreground"
                aria-label="Clear category filter"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          {hasActiveFilters && ` found`}
        </span>
        {isAdmin && (
          <span className="text-xs">
            Showing all materials (including disabled)
          </span>
        )}
      </div>

      {/* Document List */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onPreview={onPreview} />
          ))}
        </div>
      ) : (
        <Empty className="py-16 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileX />
            </EmptyMedia>
            <EmptyTitle>No documents found</EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no documents in the library yet.'}
            </EmptyDescription>
          </EmptyHeader>
          {hasActiveFilters && (
            <EmptyContent>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}
    </div>
  )
}
