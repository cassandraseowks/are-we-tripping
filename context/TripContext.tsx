'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Trip } from '@/lib/types'
import { getTrip, saveTrip, getLocalUser, setLocalUser, trackTripLocally } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

type TripContextValue = {
  trip: Trip | null
  currentUser: string
  updateTrip: (updater: (prev: Trip) => Trip) => void
  setCurrentUser: (name: string) => void
  isLoading: boolean
}

const TripContext = createContext<TripContextValue>({
  trip: null,
  currentUser: '',
  updateTrip: () => {},
  setCurrentUser: () => {},
  isLoading: true,
})

export function TripProvider({
  tripId,
  children,
}: {
  tripId: string
  children: React.ReactNode
}) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [currentUser, setCurrentUserState] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Initial load + realtime subscription
  useEffect(() => {
    let cancelled = false

    async function load() {
      const loaded = await getTrip(tripId)
      if (cancelled) return
      setTrip(loaded)
      setCurrentUserState(getLocalUser(tripId))
      setIsLoading(false)
      if (loaded) trackTripLocally(tripId)
    }

    load()

    // Subscribe to changes other browsers make to this trip
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTrip(null)
            return
          }
          const row = payload.new as { id: string; data: Trip }
          const localUser = getLocalUser(tripId)
          setTrip({ ...row.data, currentUser: localUser })
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [tripId])

  const updateTrip = useCallback((updater: (prev: Trip) => Trip) => {
    setTrip((prev) => {
      if (!prev) return prev
      const next = updater(prev)
      saveTrip(next) // async fire-and-forget; realtime will confirm
      return next
    })
  }, [])

  const setCurrentUser = useCallback((name: string) => {
    setLocalUser(tripId, name)
    setCurrentUserState(name)
    // Add to members list if not already there
    setTrip((prev) => {
      if (!prev) return prev
      if (prev.members.includes(name)) return { ...prev, currentUser: name }
      const next = { ...prev, currentUser: name, members: [...prev.members, name] }
      saveTrip(next)
      return next
    })
  }, [tripId])

  return (
    <TripContext.Provider value={{ trip, currentUser, updateTrip, setCurrentUser, isLoading }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip(): TripContextValue {
  return useContext(TripContext)
}
