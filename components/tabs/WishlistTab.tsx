'use client'

import { useState } from 'react'
import { useTrip } from '@/context/TripContext'
import ContributionInput from '@/components/wishlist/ContributionInput'
import ContributionCard from '@/components/wishlist/ContributionCard'
import { cn } from '@/lib/utils'
import type { ContributionCategory } from '@/lib/types'

type Filter = 'all' | ContributionCategory

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'place', label: 'Places' },
  { id: 'food', label: 'Food' },
  { id: 'activity', label: 'Activities' },
]

export default function WishlistTab() {
  const { trip } = useTrip()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = (trip?.contributions ?? []).filter(
    (c) => filter === 'all' || c.category === filter
  )

  return (
    <div>
      <ContributionInput />

      {/* Filter chips */}
      {(trip?.contributions.length ?? 0) > 0 && (
        <div className="flex gap-2 mt-5 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                filter === f.id
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              )}
            >
              {f.label}
              {f.id === 'all' && trip && (
                <span className="ml-1 opacity-60">{trip.contributions.length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✈️</div>
          <p className="text-stone-500 text-sm">
            {trip?.contributions.length === 0
              ? "No wishes yet — be the first to add something!"
              : "No results for this filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ContributionCard key={c.id} contribution={c} />
          ))}
        </div>
      )}
    </div>
  )
}
