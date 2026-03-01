import { supabase } from './supabase'
import type { Trip } from './types'

// ── Local index ─────────────────────────────────────────────────────────────
// localStorage only stores: (1) which trip IDs this browser has visited,
// (2) the user's chosen name per trip.  All trip data lives in Supabase.

const LOCAL_INDEX_KEY = 'awt_trips'

function getLocalTripIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_INDEX_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function trackTripLocally(id: string): void {
  if (typeof window === 'undefined') return
  const ids = getLocalTripIds()
  if (!ids.includes(id)) {
    localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify([...ids, id]))
  }
}

export function getLocalUser(tripId: string): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(`awt_user_${tripId}`) ?? ''
}

export function setLocalUser(tripId: string, name: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`awt_user_${tripId}`, name)
  trackTripLocally(tripId)
}

// ── Supabase CRUD ────────────────────────────────────────────────────────────

export async function getTrip(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('data')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null

  const trip = data.data as Trip
  const localUser = getLocalUser(id)
  return { ...trip, currentUser: localUser }
}

export async function saveTrip(trip: Trip): Promise<void> {
  // Persist the user's name locally; store trip without currentUser in Supabase
  // so no browser's personal identity leaks into the shared record.
  if (trip.currentUser) setLocalUser(trip.id, trip.currentUser)

  const { currentUser: _cu, ...sharedData } = trip

  await supabase.from('trips').upsert(
    { id: trip.id, data: { ...sharedData, currentUser: '' }, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  )
}

export async function listTrips(): Promise<Trip[]> {
  const ids = getLocalTripIds()
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('trips')
    .select('data')
    .in('id', ids)

  if (error || !data) return []

  return data
    .map((row) => {
      const trip = row.data as Trip
      const localUser = getLocalUser(trip.id)
      return { ...trip, currentUser: localUser }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteTrip(id: string): Promise<void> {
  await supabase.from('trips').delete().eq('id', id)
  if (typeof window !== 'undefined') {
    const ids = getLocalTripIds().filter((i) => i !== id)
    localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify(ids))
    localStorage.removeItem(`awt_user_${id}`)
  }
}
