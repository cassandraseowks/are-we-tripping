'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { Plus, Plane, Trash2 } from 'lucide-react'
import { useTrip } from '@/context/TripContext'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { FlightInfo } from '@/lib/types'

function FlightCard({
  flight,
  onDelete,
}: {
  flight: FlightInfo
  onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Plane size={18} className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">
              {flight.airline} {flight.flightNumber}
            </h3>
            <p className="text-xs text-stone-500">booked by {flight.bookedBy}</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-stone-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center">
          <p className="font-bold text-stone-900 text-lg">{flight.from}</p>
          <p className="text-xs text-stone-400">
            {new Date(flight.departure).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex-1 flex items-center gap-1">
          <div className="flex-1 h-px bg-stone-200" />
          <Plane size={12} className="text-stone-400 rotate-90" />
          <div className="flex-1 h-px bg-stone-200" />
        </div>
        <div className="text-center">
          <p className="font-bold text-stone-900 text-lg">{flight.to}</p>
          <p className="text-xs text-stone-400">
            {new Date(flight.arrival).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-semibold text-stone-900">
          {flight.currency} {flight.price}
        </span>
        {flight.confirmationCode && (
          <span className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-2.5 py-0.5 font-mono">
            {flight.confirmationCode}
          </span>
        )}
      </div>
    </div>
  )
}

function AddFlightModal({
  open,
  onClose,
  onAdd,
  currentUser,
}: {
  open: boolean
  onClose: () => void
  onAdd: (f: FlightInfo) => void
  currentUser: string
}) {
  const [form, setForm] = useState({
    airline: '',
    flightNumber: '',
    from: '',
    to: '',
    departure: '',
    arrival: '',
    price: '',
    currency: 'USD',
    bookedBy: currentUser,
    confirmationCode: '',
  })

  function handleChange(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      id: nanoid(),
      airline: form.airline,
      flightNumber: form.flightNumber,
      from: form.from,
      to: form.to,
      departure: form.departure,
      arrival: form.arrival,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      bookedBy: form.bookedBy,
      confirmationCode: form.confirmationCode || undefined,
    })
    onClose()
  }

  const inputClass = 'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300'

  return (
    <Modal open={open} onClose={onClose} title="Add flight" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Airline</label>
            <input type="text" value={form.airline} onChange={(e) => handleChange('airline', e.target.value)} placeholder="JAL" required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Flight #</label>
            <input type="text" value={form.flightNumber} onChange={(e) => handleChange('flightNumber', e.target.value)} placeholder="JL123" required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">From</label>
            <input type="text" value={form.from} onChange={(e) => handleChange('from', e.target.value)} placeholder="LAX" required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">To</label>
            <input type="text" value={form.to} onChange={(e) => handleChange('to', e.target.value)} placeholder="NRT" required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Departure</label>
            <input type="datetime-local" value={form.departure} onChange={(e) => handleChange('departure', e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Arrival</label>
            <input type="datetime-local" value={form.arrival} onChange={(e) => handleChange('arrival', e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Price</label>
            <input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="850" min="0" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Currency</label>
            <input type="text" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} placeholder="USD" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Booked by</label>
            <input type="text" value={form.bookedBy} onChange={(e) => handleChange('bookedBy', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Confirmation (optional)</label>
            <input type="text" value={form.confirmationCode} onChange={(e) => handleChange('confirmationCode', e.target.value)} placeholder="ABC123" className={inputClass} />
          </div>
        </div>
        <div className="pt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1">Add flight</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function FlightsTab() {
  const { trip, currentUser, updateTrip } = useTrip()
  const [showModal, setShowModal] = useState(false)

  if (!trip) return null

  function addFlight(f: FlightInfo) {
    updateTrip((prev) => ({ ...prev, flights: [...prev.flights, f] }))
  }

  function deleteFlight(id: string) {
    updateTrip((prev) => ({ ...prev, flights: prev.flights.filter((f) => f.id !== id) }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-stone-900">Flights</h2>
          <p className="text-sm text-stone-500">{trip.flights.length} flight{trip.flights.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add flight
        </Button>
      </div>

      {trip.flights.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✈️</div>
          <p className="text-stone-500 text-sm">No flights added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trip.flights.map((f) => (
            <FlightCard key={f.id} flight={f} onDelete={() => deleteFlight(f.id)} />
          ))}
        </div>
      )}

      <AddFlightModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addFlight}
        currentUser={currentUser}
      />
    </div>
  )
}
