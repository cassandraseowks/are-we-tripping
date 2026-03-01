'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { MapPin, Film, Instagram, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrip } from '@/context/TripContext'
import { geocodeByText } from '@/lib/maps'
import type { Contribution, ContributionCategory, GeoLocation, InputType } from '@/lib/types'
import AddressInput from './AddressInput'
import SocialLinkInput, { type SocialMeta } from './SocialLinkInput'
import Button from '@/components/ui/Button'

type InputTab = InputType

const TABS: { id: InputTab; label: string; icon: React.ReactNode }[] = [
  { id: 'address', label: 'Address', icon: <MapPin size={13} /> },
  { id: 'tiktok', label: 'TikTok', icon: <Film size={13} /> },
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={13} /> },
]

const CATEGORIES: { id: ContributionCategory; label: string }[] = [
  { id: 'place', label: 'Place' },
  { id: 'food', label: 'Food' },
  { id: 'activity', label: 'Activity' },
]

const CATEGORY_ACTIVE: Record<ContributionCategory, string> = {
  food: 'bg-orange-100 text-orange-700 border-orange-200',
  activity: 'bg-green-100 text-green-700 border-green-200',
  place: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function ContributionInput() {
  const { currentUser, updateTrip } = useTrip()
  const [inputType, setInputType] = useState<InputTab>('address')
  const [rawInput, setRawInput] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ContributionCategory>('place')
  const [location, setLocation] = useState<GeoLocation | undefined>()
  const [geocoding, setGeocoding] = useState(false)
  const [socialMeta, setSocialMeta] = useState<SocialMeta | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleLocationResolved(loc: GeoLocation, placeName: string) {
    setLocation(loc)
    if (!name) setName(placeName)
  }

  async function handleSocialMeta(meta: SocialMeta) {
    setSocialMeta(meta)

    // Pre-fill text fields from AI extraction
    const resolvedName = meta.extractedName || meta.title.slice(0, 80)
    if (!name) setName(resolvedName)
    if (meta.extractedDescription && !description) setDescription(meta.extractedDescription)
    if (meta.extractedCategory) setCategory(meta.extractedCategory)

    // Only try geocoding once we have the AI extraction (not on the first oEmbed pass)
    if (meta.extractedName && !location) {
      const query = meta.locationHint
        ? `${meta.extractedName} ${meta.locationHint}`
        : meta.extractedName

      setGeocoding(true)
      const resolved = await geocodeByText(query)
      setGeocoding(false)
      if (resolved) setLocation(resolved)
    }
  }

  function handleTypeChange(type: InputTab) {
    setInputType(type)
    setRawInput('')
    setName('')
    setDescription('')
    setLocation(undefined)
    setSocialMeta(null)
    setCategory('place')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)

    const contribution: Contribution = {
      id: nanoid(),
      user: currentUser,
      inputType,
      rawInput,
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      location,
      thumbnail: socialMeta?.thumbnail_url,
      votes: [],
      timestamp: Date.now(),
    }

    updateTrip((prev) => ({
      ...prev,
      contributions: [contribution, ...prev.contributions],
    }))

    // Reset
    setRawInput('')
    setName('')
    setDescription('')
    setLocation(undefined)
    setSocialMeta(null)
    setCategory('place')
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      {/* Type selector */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTypeChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              inputType === tab.id
                ? 'bg-sand-500 text-white border-sand-500'
                : 'bg-white text-stone-600 border-stone-200 hover:border-sand-300 hover:text-sand-600'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* URL / Address input */}
        {inputType === 'address' ? (
          <AddressInput
            value={rawInput}
            onChange={setRawInput}
            onLocationResolved={handleLocationResolved}
          />
        ) : (
          <SocialLinkInput
            value={rawInput}
            onChange={setRawInput}
            onMetaResolved={handleSocialMeta}
            meta={socialMeta}
          />
        )}

        {/* Name + category */}
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this place..."
            required
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
          />
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  category === cat.id
                    ? CATEGORY_ACTIVE[cat.id]
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's special about this? (auto-filled from video caption)"
          rows={2}
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300 resize-none"
        />

        {/* Location status */}
        {inputType !== 'address' && (
          <div className="flex items-center gap-1.5 text-xs">
            {geocoding ? (
              <>
                <Loader2 size={11} className="animate-spin text-stone-400" />
                <span className="text-stone-400">Looking up location…</span>
              </>
            ) : location ? (
              <>
                <MapPin size={11} className="text-green-500" />
                <span className="text-stone-500 truncate">{location.address}</span>
              </>
            ) : socialMeta?.extractedName ? (
              <>
                <MapPin size={11} className="text-stone-300" />
                <span className="text-stone-400">No location found — will show without map pin</span>
              </>
            ) : null}
          </div>
        )}

        <Button type="submit" loading={submitting || geocoding} className="w-full">
          Add to wishlist
        </Button>
      </form>
    </div>
  )
}
