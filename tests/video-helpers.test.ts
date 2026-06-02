import { describe, expect, test } from 'bun:test'

import { isValidYoutubeVideoId } from '../lib/models/video.model'
import { createVideoCategorySlug } from '../lib/models/video-category.model'

describe('isValidYoutubeVideoId', () => {
  test('accepts a valid 11-char YouTube videoId', () => {
    expect(isValidYoutubeVideoId('dQw4w9WgXcQ')).toBe(true)
  })

  test('rejects an id with wrong length', () => {
    expect(isValidYoutubeVideoId('short')).toBe(false)
    expect(isValidYoutubeVideoId('dQw4w9WgXcQ123')).toBe(false)
  })

  test('rejects invalid characters', () => {
    expect(isValidYoutubeVideoId('dQw4w9WgXc!')).toBe(false)
    expect(isValidYoutubeVideoId('dQw4w9WgXc ')).toBe(false)
  })
})

describe('createVideoCategorySlug', () => {
  test('creates a URL-friendly slug', () => {
    expect(createVideoCategorySlug('  My Category!  ')).toBe('my-category')
  })

  test('removes repeated separators', () => {
    expect(createVideoCategorySlug('My___Category   Name')).toBe('my-category-name')
  })
})

