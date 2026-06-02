'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Home, Loader2, Pencil, Plus, Trash2, Video } from 'lucide-react'
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

interface VideoItem {
  _id: string
  title: string
  description: string
  youtubeVideoId: string
  categoryId: string
  createdAt: string
}

interface VideoCategory {
  _id: string
  name: string
  slug: string
}

export default function AdminVideosPage() {
  const { isLoaded } = useAuth()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<VideoItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeVideoId: '',
    categoryId: ''
  })

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories) map.set(c._id, c.name)
    return map
  }, [categories])

  const fetchData = useCallback(async () => {
    try {
      const [videosRes, catsRes] = await Promise.all([
        fetch('/api/videos?limit=500'),
        fetch('/api/video-categories')
      ])

      const videosData = await videosRes.json()
      const catsData = await catsRes.json()

      setVideos(Array.isArray(videosData?.videos) ? videosData.videos : [])
      setCategories(Array.isArray(catsData) ? catsData : [])
    } catch (e) {
      toast.error('Failed to load videos')
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
    setFormData({ title: '', description: '', youtubeVideoId: '', categoryId: '' })
  }

  const openCreate = () => {
    resetForm()
    if (categories.length > 0) {
      setFormData((p) => ({ ...p, categoryId: categories[0]._id }))
    }
    setOpen(true)
  }

  const openEdit = (v: VideoItem) => {
    setEditing(v)
    setFormData({
      title: v.title,
      description: v.description || '',
      youtubeVideoId: v.youtubeVideoId,
      categoryId: v.categoryId
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to delete video')
      }
      await fetchData()
      toast.success('Video deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete video')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const title = formData.title.trim()
    const youtubeVideoId = formData.youtubeVideoId.trim()
    const categoryId = formData.categoryId

    if (!title) {
      toast.error('Title is required')
      return
    }
    if (!youtubeVideoId) {
      toast.error('YouTube videoId is required')
      return
    }
    if (!categoryId) {
      toast.error('Category is required')
      return
    }

    setSubmitting(true)
    try {
      const url = editing ? `/api/videos/${editing._id}` : '/api/videos'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: formData.description,
          youtubeVideoId,
          categoryId
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save video')
      }

      await fetchData()
      setOpen(false)
      resetForm()
      toast.success(editing ? 'Video updated' : 'Video created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save video')
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
            <h1 className="text-lg font-semibold text-emerald-500">Videos</h1>
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
                  Add Video
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>{editing ? 'Edit Video' : 'New Video'}</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Paste the YouTube videoId (11 characters), not a full URL.
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
                    <Label htmlFor="youtubeVideoId" className="text-zinc-200">YouTube videoId</Label>
                    <Input
                      id="youtubeVideoId"
                      value={formData.youtubeVideoId}
                      onChange={(e) => setFormData((p) => ({ ...p, youtubeVideoId: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                      placeholder="e.g. dQw4w9WgXcQ"
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
                      {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Video'}
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
          <h2 className="text-3xl font-bold">Manage Videos</h2>
          <p className="text-zinc-400 mt-2">{videos.length} videos</p>
        </div>

        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
          <Table>
            <TableHeader className="bg-zinc-900">
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="text-zinc-400">Title</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Category</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">VideoId</TableHead>
                <TableHead className="text-zinc-400 w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={4} className="text-center py-10 text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <Video className="w-8 h-8 text-zinc-600" />
                      No videos yet. Add your first video.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((v) => (
                  <TableRow key={v._id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <div className="truncate">{v.title}</div>
                        <div className="text-xs text-zinc-500 line-clamp-1 mt-1">{v.description || '—'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-400">
                      {categoryNameById.get(v.categoryId) || '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-500 font-mono text-sm">
                      {v.youtubeVideoId}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(v)}
                          className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(v._id)}
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

