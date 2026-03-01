'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listTrips } from '@/lib/storage'
import type { Trip } from '@/lib/types'

function formatDateRange(start?: string, end?: string): string | null {
  if (!start || !end) return null
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function TripsList() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    listTrips().then((all) => {
      setTrips(all) // already sorted in storage.ts
      setMounted(true)
    })
  }, [])

  if (!mounted || trips.length === 0) return null

  return (
    <div className="mt-12 max-w-xl mx-auto w-full text-left">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3 px-1">
        Your trips
      </p>
      <div className="space-y-2">
        {trips.map((trip) => {
          const dateRange = formatDateRange(trip.startDate, trip.endDate)
          return (
            <Link
              key={trip.id}
              href={`/trip/${trip.id}`}
              className="flex items-center justify-between gap-4 bg-white border border-stone-100 hover:border-sand-300 rounded-2xl px-4 py-3.5 shadow-sm transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0" role="img" aria-label={trip.country}>
                  {countryFlag(trip.country)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate group-hover:text-sand-600 transition-colors">
                    {trip.name}
                  </p>
                  <p className="text-xs text-stone-400 truncate">
                    {trip.country}
                    {dateRange ? ` · ${dateRange}` : ''}
                    {' · '}
                    {trip.members.length} {trip.members.length === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {trip.contributions.length > 0 && (
                  <span className="text-xs text-stone-400 bg-stone-50 border border-stone-100 rounded-full px-2 py-0.5">
                    {trip.contributions.length} wish{trip.contributions.length !== 1 ? 'es' : ''}
                  </span>
                )}
                {trip.itinerary && (
                  <span className="text-xs text-sand-700 bg-sand-50 border border-sand-200 rounded-full px-2 py-0.5 font-medium">
                    Itinerary ✓
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Derive a country flag emoji from a country name using Intl where possible,
// otherwise fall back to a globe.
function countryFlag(country: string): string {
  try {
    // Use Intl.DisplayNames to look up the ISO code from the English name
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
    // We need to go the other way: name → code. Brute-force search over all
    // ISO-3166-1 alpha-2 codes (A..Z × A..Z) is fast enough on the client.
    const codes = Array.from({ length: 26 }, (_, i) =>
      Array.from({ length: 26 }, (_, j) =>
        String.fromCharCode(65 + i) + String.fromCharCode(65 + j)
      )
    ).flat()

    const normalised = country.trim().toLowerCase()
    const match = codes.find(
      (code) => regionNames.of(code)?.toLowerCase() === normalised
    )
    if (match) {
      // Convert alpha-2 code to flag emoji via regional indicator symbols
      return String.fromCodePoint(
        ...match.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
      )
    }
  } catch {
    // Intl not supported
  }
  return '🌍'
}
