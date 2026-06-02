'use client'

import Link from 'next/link'
import { ListVideo } from 'lucide-react'

export function PlaylistCard({
  id,
  title,
  description,
  categoryName
}: {
  id: string
  title: string
  description: string
  categoryName?: string
}) {
  return (
    <Link
      href={`/playlists/${id}`}
      className="group block bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-zinc-800 rounded-lg text-emerald-500 group-hover:bg-emerald-500/10 transition-colors">
          <ListVideo className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg truncate">{title}</h3>
          {description ? (
            <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{description}</p>
          ) : (
            <p className="text-sm text-zinc-500 mt-1">No description</p>
          )}
          {categoryName ? (
            <div className="mt-3 text-xs text-zinc-500">
              <span className="px-2 py-1 bg-zinc-800 rounded">{categoryName}</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

