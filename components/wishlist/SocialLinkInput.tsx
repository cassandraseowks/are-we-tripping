'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Image from 'next/image'

export interface SocialMeta {
  title: string
  thumbnail_url?: string
  author_name?: string
  // AI-extracted fields
  extractedName?: string
  extractedDescription?: string
  extractedCategory?: 'place' | 'food' | 'activity'
  locationHint?: string
}

interface SocialLinkInputProps {
  value: string
  onChange: (value: string) => void
  onMetaResolved: (meta: SocialMeta) => void
  meta: SocialMeta | null
}

export default function SocialLinkInput({
  value,
  onChange,
  onMetaResolved,
  meta,
}: SocialLinkInputProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchMeta() {
    if (!value.trim()) return
    setLoading(true)
    setError('')
    try {
      // Step 1: oEmbed
      const oembedRes = await fetch(`/api/oembed?url=${encodeURIComponent(value.trim())}`)
      if (!oembedRes.ok) throw new Error('Could not fetch metadata')
      const oembed = (await oembedRes.json()) as SocialMeta

      // Show oEmbed preview immediately
      onMetaResolved(oembed)

      // Step 2: AI extraction — best-effort, never blocks or errors the UI
      if (oembed.title) {
        try {
          const extractRes = await fetch('/api/extract-social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caption: oembed.title, author: oembed.author_name }),
          })
          if (extractRes.ok) {
            const extracted = (await extractRes.json()) as {
              name: string
              description: string
              category: 'place' | 'food' | 'activity'
              locationHint: string
            }
            onMetaResolved({
              ...oembed,
              extractedName: extracted.name || undefined,
              extractedDescription: extracted.description || undefined,
              extractedCategory: extracted.category || undefined,
              locationHint: extracted.locationHint || undefined,
            })
          }
        } catch {
          // AI extraction failed silently — oEmbed preview already shown
        }
      }
    } catch {
      setError('Could not fetch link info. Check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste TikTok or Instagram link..."
          className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
        />
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={fetchMeta}
          disabled={!value.trim() || loading}
          className="shrink-0"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Fetch'}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {meta && (
        <div className="flex items-start gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100">
          {meta.thumbnail_url && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <Image src={meta.thumbnail_url} alt={meta.title} fill className="object-cover" />
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs text-stone-400 line-clamp-2">{meta.title}</p>
            {meta.author_name && (
              <p className="text-xs text-stone-400">@{meta.author_name}</p>
            )}
            {meta.extractedDescription && (
              <p className="text-xs text-sand-600 font-medium mt-1">{meta.extractedDescription}</p>
            )}
            {meta.locationHint && (
              <p className="text-xs text-stone-500">📍 {meta.locationHint}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
