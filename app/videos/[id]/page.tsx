import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { ArrowLeft, Home } from 'lucide-react'
import { YouTubePlayer } from '@/components/youtube-player'
import { getVideoById } from '@/lib/models/video.model'
import { getVideoCategoryById } from '@/lib/models/video-category.model'

export default async function VideoWatchPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const { id } = await params
  const video = await getVideoById(id)

  if (!video) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link href="/videos" className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
            ← Back to videos
          </Link>
          <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-zinc-300">Video not found.</p>
          </div>
        </div>
      </div>
    )
  }

  const category = await getVideoCategoryById(video.categoryId.toString())

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <Link href="/videos" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Videos
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">{video.title}</h1>
          {category ? (
            <div className="text-xs text-zinc-500">
              <span className="px-2 py-1 bg-zinc-800 rounded">{category.name}</span>
            </div>
          ) : null}
        </div>

        <YouTubePlayer videoId={video.youtubeVideoId} title={video.title} />

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="font-medium mb-2">About</h2>
          <p className="text-sm text-zinc-300 whitespace-pre-line">
            {video.description || 'No description provided.'}
          </p>
        </div>
      </div>
    </div>
  )
}

