'use client'

import { useState } from 'react'
import { useTrip } from '@/context/TripContext'
import TripHeader from '@/components/trip/TripHeader'
import TripTabs, { type TabId } from '@/components/trip/TripTabs'
import WishlistTab from '@/components/tabs/WishlistTab'
import ItineraryTab from '@/components/tabs/ItineraryTab'
import MapTab from '@/components/tabs/MapTab'
import AccommodationTab from '@/components/tabs/AccommodationTab'
import FoodTab from '@/components/tabs/FoodTab'
import BudgetTab from '@/components/tabs/BudgetTab'
import FlightsTab from '@/components/tabs/FlightsTab'
import TripSheetTab from '@/components/tabs/TripSheetTab'

export default function TripPage() {
  const { trip, currentUser, setCurrentUser, isLoading } = useTrip()
  const [activeTab, setActiveTab] = useState<TabId>('wishlist')
  const [nameInput, setNameInput] = useState('')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-sand-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-5xl">🗺️</div>
        <h2 className="text-xl font-semibold text-stone-900">Trip not found</h2>
        <p className="text-stone-500 max-w-sm">
          No trip with that code exists. Ask the trip creator to share the correct link or code.
        </p>
        <a href="/" className="text-sand-500 hover:text-sand-600 font-medium text-sm">
          ← Back home
        </a>
      </div>
    )
  }

  // First time visiting this trip on this device — ask for a name
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">✈️</div>
          <h2 className="text-lg font-semibold text-stone-900 mb-1">
            Joining <span className="text-sand-500">{trip.name}</span>
          </h2>
          <p className="text-sm text-stone-500 mb-6">What should we call you on this trip?</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (nameInput.trim()) setCurrentUser(nameInput.trim())
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              required
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300 text-center"
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
            >
              Join trip
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TripHeader />
      <TripTabs active={activeTab} onChange={setActiveTab} />

      <main className={(activeTab === 'tripsheet' || activeTab === 'itinerary') ? 'px-6 py-8' : 'max-w-5xl mx-auto px-6 py-8'}>
        <div className="tab-content" key={activeTab}>
          {activeTab === 'wishlist' && <WishlistTab />}
          {activeTab === 'itinerary' && <ItineraryTab />}
          {activeTab === 'tripsheet' && <TripSheetTab />}
          {activeTab === 'map' && <MapTab />}
          {activeTab === 'accommodation' && <AccommodationTab />}
          {activeTab === 'food' && <FoodTab />}
          {activeTab === 'budget' && <BudgetTab />}
          {activeTab === 'flights' && <FlightsTab />}
        </div>
      </main>
    </div>
  )
}
