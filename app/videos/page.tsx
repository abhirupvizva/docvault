import Link from 'next/link'
import { Home, Video as VideoIcon } from 'lucide-react'
import { VideoBrowser } from '@/components/video-browser'

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-emerald-500" />
              <h1 className="text-lg font-semibold">Videos</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <VideoBrowser />
      </div>
    </div>
  )
}

