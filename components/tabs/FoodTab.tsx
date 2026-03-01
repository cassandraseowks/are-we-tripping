'use client'

import { useTrip } from '@/context/TripContext'
import ContributionCard from '@/components/wishlist/ContributionCard'

export default function FoodTab() {
  const { trip } = useTrip()
  if (!trip) return null

  const foodItems = [...trip.contributions]
    .filter((c) => c.category === 'food')
    .sort((a, b) => b.votes.length - a.votes.length)

  if (foodItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🍜</div>
        <p className="text-stone-500 text-sm">
          No food spots yet — add some from the Wishlist tab using the &quot;Food&quot; category!
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-semibold text-stone-900">Food & Restaurants</h2>
        <p className="text-sm text-stone-500">
          {foodItems.length} spot{foodItems.length !== 1 ? 's' : ''}, sorted by votes
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {foodItems.map((c) => (
          <ContributionCard key={c.id} contribution={c} />
        ))}
      </div>
    </div>
  )
}
