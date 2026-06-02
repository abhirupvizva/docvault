'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Video } from 'lucide-react'
import { VideoCard } from './video-card'

interface VideoItem {
  _id: string
  title: string
  description: string
  categoryId: string
}

interface VideoCategory {
  _id: string
  name: string
  slug: string
}

export function VideosPreview() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [loading, setLoading] = useState(true)

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories) map.set(c._id, c.name)
    return map
  }, [categories])

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      try {
        const [videosRes, catsRes] = await Promise.all([
          fetch('/api/videos?limit=4'),
          fetch('/api/video-categories')
        ])

        const videosData = await videosRes.json()
        const catsData = await catsRes.json()

        if (!cancelled) {
          setVideos(Array.isArray(videosData?.videos) ? videosData.videos : [])
          setCategories(Array.isArray(catsData) ? catsData : [])
        }
      } catch {
        if (!cancelled) {
          setVideos([])
          setCategories([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Videos</h2>
        <Link href="/videos" className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
          View all →
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-10 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <Video className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
          <h3 className="font-medium mb-1">No videos available</h3>
          <p className="text-sm text-zinc-500">Check back later for learning content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((v) => (
            <VideoCard
              key={v._id}
              id={v._id}
              title={v.title}
              description={v.description}
              categoryName={categoryNameById.get(v.categoryId)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

