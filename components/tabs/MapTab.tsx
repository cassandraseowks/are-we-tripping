'use client'

import { useTrip } from '@/context/TripContext'
import MapView from '@/components/map/MapView'

export default function MapTab() {
  const { trip } = useTrip()
  if (!trip) return null

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-semibold text-stone-900">Map view</h2>
        <p className="text-sm text-stone-500">
          Showing {trip.contributions.filter((c) => c.location).length} locations from the wishlist
        </p>
      </div>
      <MapView contributions={trip.contributions} itinerary={trip.itinerary} />
    </div>
  )
}
