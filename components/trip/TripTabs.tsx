'use client'

import { cn } from '@/lib/utils'

export type TabId =
  | 'wishlist'
  | 'itinerary'
  | 'tripsheet'
  | 'map'
  | 'accommodation'
  | 'food'
  | 'budget'
  | 'flights'

const TABS: { id: TabId; label: string }[] = [
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'tripsheet', label: 'Trip Sheet' },
  { id: 'map', label: 'Map' },
  { id: 'accommodation', label: 'Stays' },
  { id: 'food', label: 'Food' },
  { id: 'budget', label: 'Budget' },
  { id: 'flights', label: 'Flights' },
]

interface TripTabsProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export default function TripTabs({ active, onChange }: TripTabsProps) {
  return (
    <div className="bg-white border-b border-stone-100 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'tab-underline whitespace-nowrap',
                active === tab.id && 'active'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
