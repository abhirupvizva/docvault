import { describe, expect, test } from 'bun:test'

import { createPlaylistCategorySlug } from '../lib/models/playlist-category.model'
import { extractYoutubePlaylistId, isValidYoutubePlaylistId } from '../lib/models/playlist.model'

describe('isValidYoutubePlaylistId', () => {
  test('accepts typical playlist ids', () => {
    expect(isValidYoutubePlaylistId('PL1234567890_AbC-def')).toBe(true)
    expect(isValidYoutubePlaylistId('UU1234567890_AbC-def')).toBe(true)
  })

  test('rejects ids with spaces or invalid chars', () => {
    expect(isValidYoutubePlaylistId('PL 123')).toBe(false)
    expect(isValidYoutubePlaylistId('PL123!')).toBe(false)
  })
})

describe('extractYoutubePlaylistId', () => {
  test('extracts from a playlist URL', () => {
    expect(
      extractYoutubePlaylistId('https://www.youtube.com/playlist?list=PL1234567890_AbC-def')
    ).toBe('PL1234567890_AbC-def')
  })

  test('extracts from a watch URL containing list', () => {
    expect(
      extractYoutubePlaylistId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL1234567890_AbC-def')
    ).toBe('PL1234567890_AbC-def')
  })

  test('accepts a raw playlist id', () => {
    expect(extractYoutubePlaylistId('PL1234567890_AbC-def')).toBe('PL1234567890_AbC-def')
  })

  test('returns null for invalid input', () => {
    expect(extractYoutubePlaylistId('')).toBeNull()
    expect(extractYoutubePlaylistId('not a playlist')).toBeNull()
  })
})

describe('createPlaylistCategorySlug', () => {
  test('creates a URL-friendly slug', () => {
    expect(createPlaylistCategorySlug('  My Category!  ')).toBe('my-category')
  })

  test('removes repeated separators', () => {
    expect(createPlaylistCategorySlug('My___Category   Name')).toBe('my-category-name')
  })
})

