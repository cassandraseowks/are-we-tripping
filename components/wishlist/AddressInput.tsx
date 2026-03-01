'use client'

import { useEffect, useRef } from 'react'
import { loadGoogleMaps } from '@/lib/maps'
import type { GeoLocation } from '@/lib/types'

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  onLocationResolved: (loc: GeoLocation, name: string) => void
}

export default function AddressInput({ value, onChange, onLocationResolved }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    let active = true
    loadGoogleMaps()
      .then(() => {
        if (!active || !inputRef.current || autocompleteRef.current) return
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'name'],
        })
        autocompleteRef.current = ac
        ac.addListener('place_changed', () => {
          const place = ac.getPlace()
          const lat = place.geometry?.location?.lat()
          const lng = place.geometry?.location?.lng()
          const address = place.formatted_address ?? ''
          const name = place.name ?? address
          if (lat !== undefined && lng !== undefined) {
            onLocationResolved({ lat, lng, address }, name)
          }
          onChange(address)
        })
      })
      .catch(() => { /* Maps key not configured — input still works as plain text */ })
    return () => { active = false }
  }, [onChange, onLocationResolved])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search for a place, restaurant, or attraction..."
      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
    />
  )
}
