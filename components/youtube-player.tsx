'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let iframeApiPromise: Promise<void> | null = null

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (iframeApiPromise) return iframeApiPromise

  iframeApiPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (!existing) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      tag.onerror = () => reject(new Error('Failed to load YouTube IFrame API'))
      document.head.appendChild(tag)
    }

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
  })

  return iframeApiPromise
}

export function YouTubePlayer({
  videoId,
  playlistId,
  title
}: {
  videoId?: string
  playlistId?: string
  title: string
}) {
  const rawId = useId()
  const containerId = useMemo(() => rawId.replaceAll(':', ''), [rawId])
  const playerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let disposed = false

    async function init() {
      try {
        setReady(false)
        await loadYouTubeIframeApi()
        if (disposed) return

        const hasVideo = Boolean(videoId?.trim())
        const hasPlaylist = Boolean(playlistId?.trim())
        if (hasVideo === hasPlaylist) {
          if (!disposed) setReady(true)
          return
        }

        try {
          playerRef.current?.destroy?.()
        } finally {
          playerRef.current = null
        }

        const basePlayerVars = {
          rel: 0,
          modestbranding: 1
        }

        playerRef.current = new window.YT.Player(containerId, {
          videoId: hasVideo ? videoId!.trim() : '',
          width: '100%',
          height: '100%',
          playerVars: hasPlaylist
            ? { ...basePlayerVars, listType: 'playlist', list: playlistId!.trim() }
            : basePlayerVars,
          events: {
            onReady: () => {
              if (!disposed) setReady(true)
            }
          }
        })
      } catch {
        if (!disposed) setReady(true)
      }
    }

    init()

    return () => {
      disposed = true
    }
  }, [containerId, videoId, playlistId])

  useEffect(() => {
    return () => {
      try {
        playerRef.current?.destroy?.()
      } finally {
        playerRef.current = null
      }
    }
  }, [])

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800">
        <div id={containerId} className="absolute inset-0" aria-label={title} />
        {!ready ? (
          <div className="absolute inset-0 grid place-items-center text-sm text-zinc-400 bg-zinc-950/60">
            Loading player...
          </div>
        ) : null}
      </div>
    </div>
  )
}
