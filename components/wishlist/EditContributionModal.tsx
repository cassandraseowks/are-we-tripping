'use client'

import { useEffect, useRef, useState } from 'react'
import { Trash2, MapPin, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { loadGoogleMaps } from '@/lib/maps'
import type { Contribution, ContributionCategory, GeoLocation } from '@/lib/types'

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

interface EditContributionModalProps {
  contribution: Contribution | null
  open: boolean
  onClose: () => void
  onSave: (updated: Contribution) => void
  onDelete: (id: string) => void
}

export default function EditContributionModal({
  contribution,
  open,
  onClose,
  onSave,
  onDelete,
}: EditContributionModalProps) {
  const [name, setName] = useState(contribution?.name ?? '')
  const [description, setDescription] = useState(contribution?.description ?? '')
  const [category, setCategory] = useState<ContributionCategory>(contribution?.category ?? 'place')
  const [location, setLocation] = useState<GeoLocation | undefined>(contribution?.location)
  const [locationInput, setLocationInput] = useState(contribution?.location?.address ?? '')
  const [editingLocation, setEditingLocation] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const locationInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Sync all fields when the modal opens
  useEffect(() => {
    if (open && contribution) {
      setName(contribution.name)
      setDescription(contribution.description ?? '')
      setCategory(contribution.category)
      setLocation(contribution.location)
      setLocationInput(contribution.location?.address ?? '')
      setEditingLocation(false)
      setConfirmDelete(false)
      autocompleteRef.current = null
    }
  }, [open, contribution])

  // Attach Places autocomplete when location edit mode opens
  useEffect(() => {
    if (!editingLocation || !locationInputRef.current || autocompleteRef.current) return
    let active = true
    loadGoogleMaps()
      .then(() => {
        if (!active || !locationInputRef.current) return
        const ac = new google.maps.places.Autocomplete(locationInputRef.current, {
          fields: ['formatted_address', 'geometry', 'name'],
        })
        autocompleteRef.current = ac
        ac.addListener('place_changed', () => {
          const place = ac.getPlace()
          const lat = place.geometry?.location?.lat()
          const lng = place.geometry?.location?.lng()
          const address = place.formatted_address ?? place.name ?? ''
          if (lat !== undefined && lng !== undefined) {
            setLocation({ lat, lng, address })
            setLocationInput(address)
            setEditingLocation(false)
          }
        })
      })
      .catch(() => { /* Maps key not configured — input still works as plain text */ })
    return () => { active = false }
  }, [editingLocation])

  function clearLocation() {
    setLocation(undefined)
    setLocationInput('')
    setEditingLocation(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contribution || !name.trim()) return
    onSave({
      ...contribution,
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      location,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit wishlist item">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-xs font-medium border transition-colors',
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
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What's special about this place?"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 resize-none placeholder-stone-300"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>

          {editingLocation ? (
            <div className="flex gap-2">
              <input
                ref={locationInputRef}
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Search for an address…"
                autoFocus
                className="flex-1 border border-sand-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
              />
              <button
                type="button"
                onClick={() => {
                  setLocationInput(location?.address ?? '')
                  setEditingLocation(false)
                }}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ) : location ? (
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2">
              <MapPin size={13} className="text-sand-500 shrink-0" />
              <span className="text-sm text-stone-700 flex-1 truncate">{location.address}</span>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setLocationInput(location.address)
                    setEditingLocation(true)
                  }}
                  className="text-xs text-sand-500 hover:text-sand-700 font-medium px-2 py-0.5 rounded-lg hover:bg-sand-50 transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={clearLocation}
                  className="text-xs text-stone-400 hover:text-red-500 font-medium px-2 py-0.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingLocation(true)}
              className="w-full flex items-center gap-2 border border-dashed border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-400 hover:border-sand-300 hover:text-sand-500 transition-colors"
            >
              <MapPin size={13} />
              Add a location
            </button>
          )}
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-2">
            <p className="text-sm text-red-700 font-medium">Remove this item from the wishlist?</p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmDelete(false)} className="flex-1">
                Keep it
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (contribution) onDelete(contribution.id)
                  onClose()
                }}
              >
                Yes, remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
            Remove from wishlist
          </button>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
