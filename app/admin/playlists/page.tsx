'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Home, Loader2, Pencil, Plus, Trash2, ListVideo } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PlaylistItem {
  _id: string
  title: string
  description: string
  youtubePlaylistId: string
  categoryId: string
  createdAt: string
}

interface PlaylistCategory {
  _id: string
  name: string
  slug: string
}

export default function AdminPlaylistsPage() {
  const { isLoaded } = useAuth()
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])
  const [categories, setCategories] = useState<PlaylistCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<PlaylistItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubePlaylist: '',
    categoryId: ''
  })

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories) map.set(c._id, c.name)
    return map
  }, [categories])

  const fetchData = useCallback(async () => {
    try {
      const [playlistsRes, catsRes] = await Promise.all([
        fetch('/api/playlists?limit=500'),
        fetch('/api/playlist-categories')
      ])

      const playlistsData = await playlistsRes.json()
      const catsData = await catsRes.json()

      setPlaylists(Array.isArray(playlistsData?.playlists) ? playlistsData.playlists : [])
      setCategories(Array.isArray(catsData) ? catsData : [])
    } catch (e) {
      toast.error('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      fetchData()
    }
  }, [fetchData, isLoaded])

  const resetForm = () => {
    setEditing(null)
    setFormData({ title: '', description: '', youtubePlaylist: '', categoryId: '' })
  }

  const openCreate = () => {
    resetForm()
    if (categories.length > 0) {
      setFormData((p) => ({ ...p, categoryId: categories[0]._id }))
    }
    setOpen(true)
  }

  const openEdit = (p: PlaylistItem) => {
    setEditing(p)
    setFormData({
      title: p.title,
      description: p.description || '',
      youtubePlaylist: p.youtubePlaylistId,
      categoryId: p.categoryId
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this playlist?')) return
    try {
      const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to delete playlist')
      }
      await fetchData()
      toast.success('Playlist deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete playlist')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const title = formData.title.trim()
    const youtubePlaylist = formData.youtubePlaylist.trim()
    const categoryId = formData.categoryId

    if (!title) {
      toast.error('Title is required')
      return
    }
    if (!youtubePlaylist) {
      toast.error('YouTube playlist URL or id is required')
      return
    }
    if (!categoryId) {
      toast.error('Category is required')
      return
    }

    setSubmitting(true)
    try {
      const url = editing ? `/api/playlists/${editing._id}` : '/api/playlists'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: formData.description,
          youtubePlaylist,
          categoryId
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save playlist')
      }

      await fetchData()
      setOpen(false)
      resetForm()
      toast.success(editing ? 'Playlist updated' : 'Playlist created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save playlist')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Admin
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <h1 className="text-lg font-semibold text-emerald-500">Playlists</h1>
          </div>

          <div className="flex items-center gap-4">
            <Dialog
              open={open}
              onOpenChange={(val) => {
                setOpen(val)
                if (!val) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Playlist' : 'New Playlist'}</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Paste a YouTube playlist URL or the playlist id (the value after list=).
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-zinc-200">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtubePlaylist" className="text-zinc-200">YouTube playlist</Label>
                    <Input
                      id="youtubePlaylist"
                      value={formData.youtubePlaylist}
                      onChange={(e) => setFormData((p) => ({ ...p, youtubePlaylist: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                      placeholder="e.g. https://www.youtube.com/playlist?list=PL..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-zinc-200">Category</Label>
                    <select
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-zinc-200">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpen(false)}
                      className="hover:bg-zinc-800 text-zinc-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Playlist'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Manage Playlists</h2>
          <p className="text-zinc-400 mt-2">{playlists.length} playlists</p>
        </div>

        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
          <Table>
            <TableHeader className="bg-zinc-900">
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="text-zinc-400">Title</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Category</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">PlaylistId</TableHead>
                <TableHead className="text-zinc-400 w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlists.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={4} className="text-center py-10 text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <ListVideo className="w-8 h-8 text-zinc-600" />
                      No playlists yet. Add your first playlist.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                playlists.map((p) => (
                  <TableRow key={p._id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <div className="truncate">{p.title}</div>
                        <div className="text-xs text-zinc-500 line-clamp-1 mt-1">{p.description || '—'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-400">
                      {categoryNameById.get(p.categoryId) || '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-500 font-mono text-sm">
                      {p.youtubePlaylistId}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                          className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(p._id)}
                          className="h-8 w-8 hover:bg-red-900/20 text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

