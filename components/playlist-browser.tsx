'use client'

import { useEffect, useMemo, useState } from 'react'
import { Filter, ListVideo, Loader2 } from 'lucide-react'
import { PlaylistCard } from './playlist-card'

interface PlaylistItem {
  _id: string
  title: string
  description: string
  youtubePlaylistId: string
  categoryId: string
}

interface PlaylistCategory {
  _id: string
  name: string
  slug: string
}

export function PlaylistBrowser({ limit = 50 }: { limit?: number }) {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])
  const [categories, setCategories] = useState<PlaylistCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories) map.set(c._id, c.name)
    return map
  }, [categories])

  useEffect(() => {
    let cancelled = false

    async function fetchCategories() {
      try {
        const res = await fetch('/api/playlist-categories')
        if (!res.ok) throw new Error('Failed to load categories')
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) setCategories(data)
      } catch (e) {
        if (!cancelled) setCategories([])
      }
    }

    fetchCategories()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchPlaylists() {
      setLoading(true)
      setError('')
      try {
        const sp = new URLSearchParams()
        sp.set('limit', String(limit))
        if (searchQuery.trim()) sp.set('q', searchQuery.trim())
        if (selectedCategoryId) sp.set('categoryId', selectedCategoryId)

        const res = await fetch(`/api/playlists?${sp.toString()}`)
        if (!res.ok) throw new Error('Failed to load playlists')
        const data = await res.json()
        if (!cancelled) setPlaylists(Array.isArray(data?.playlists) ? data.playlists : [])
      } catch (e) {
        if (!cancelled) setError('Failed to load playlists')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPlaylists()

    return () => {
      cancelled = true
    }
  }, [limit, searchQuery, selectedCategoryId])

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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-zinc-500" />
        </div>
        <input
          type="text"
          placeholder="Search playlists..."
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-2.5 placeholder-zinc-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {categories.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategoryId === null
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategoryId === cat._id
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      ) : null}

      {playlists.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <ListVideo className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
          <h3 className="font-medium mb-1">
            {searchQuery ? 'No matching playlists' : 'No playlists available'}
          </h3>
          <p className="text-sm text-zinc-500">
            {searchQuery ? 'Try a different search term' : 'Check back later for curated playlists'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlists.map((p) => (
            <PlaylistCard
              key={p._id}
              id={p._id}
              title={p.title}
              description={p.description}
              categoryName={categoryNameById.get(p.categoryId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

