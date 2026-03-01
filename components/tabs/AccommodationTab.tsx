'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { Plus, Hotel, ExternalLink, Trash2 } from 'lucide-react'
import { useTrip } from '@/context/TripContext'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { Accommodation } from '@/lib/types'
import { formatDate } from '@/lib/utils'

function AccommodationCard({
  acc,
  onDelete,
}: {
  acc: Accommodation
  onDelete: () => void
}) {
  const nights =
    acc.checkIn && acc.checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(acc.checkOut).getTime() - new Date(acc.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0
  const total = nights * acc.pricePerNight

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Hotel size={18} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">{acc.name}</h3>
            <p className="text-xs text-stone-500">{acc.address}</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-stone-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Check-in</p>
          <p className="font-medium text-stone-800">{formatDate(acc.checkIn)}</p>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Check-out</p>
          <p className="font-medium text-stone-800">{formatDate(acc.checkOut)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-stone-900">
            {acc.currency} {acc.pricePerNight}/night
          </span>
          {nights > 0 && (
            <span className="text-xs text-stone-400 ml-2">
              ({nights} nights = {acc.currency} {total})
            </span>
          )}
        </div>
        {acc.link && (
          <a
            href={acc.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sand-500 hover:text-sand-600"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {acc.notes && (
        <p className="mt-2 text-xs text-stone-400 italic">{acc.notes}</p>
      )}
    </div>
  )
}

function AddAccommodationModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (acc: Accommodation) => void
}) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    checkIn: '',
    checkOut: '',
    pricePerNight: '',
    currency: 'USD',
    link: '',
    notes: '',
  })

  function handleChange(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      id: nanoid(),
      name: form.name,
      address: form.address,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      pricePerNight: parseFloat(form.pricePerNight) || 0,
      currency: form.currency,
      link: form.link || undefined,
      notes: form.notes || undefined,
    })
    onClose()
    setForm({ name: '', address: '', checkIn: '', checkOut: '', pricePerNight: '', currency: 'USD', link: '', notes: '' })
  }

  return (
    <Modal open={open} onClose={onClose} title="Add accommodation" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { field: 'name' as const, label: 'Name', placeholder: 'e.g. Shibuya Excel Hotel' },
          { field: 'address' as const, label: 'Address', placeholder: '1-12-2 Dogenzaka, Shibuya' },
        ].map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
            <input
              type="text"
              value={form[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder}
              required
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Check-in</label>
            <input type="date" value={form.checkIn} onChange={(e) => handleChange('checkIn', e.target.value)} required className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Check-out</label>
            <input type="date" value={form.checkOut} onChange={(e) => handleChange('checkOut', e.target.value)} required className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Price per night</label>
            <input type="number" value={form.pricePerNight} onChange={(e) => handleChange('pricePerNight', e.target.value)} placeholder="120" min="0" className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Currency</label>
            <input type="text" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} placeholder="USD" className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Link (optional)</label>
          <input type="url" value={form.link} onChange={(e) => handleChange('link', e.target.value)} placeholder="https://..." className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Notes (optional)</label>
          <input type="text" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Free breakfast included..." className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300" />
        </div>
        <div className="pt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1">Add stay</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function AccommodationTab() {
  const { trip, updateTrip } = useTrip()
  const [showModal, setShowModal] = useState(false)

  if (!trip) return null

  function addAccommodation(acc: Accommodation) {
    updateTrip((prev) => ({ ...prev, accommodation: [...prev.accommodation, acc] }))
  }

  function deleteAccommodation(id: string) {
    updateTrip((prev) => ({ ...prev, accommodation: prev.accommodation.filter((a) => a.id !== id) }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-stone-900">Accommodation</h2>
          <p className="text-sm text-stone-500">{trip.accommodation.length} stay{trip.accommodation.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add stay
        </Button>
      </div>

      {trip.accommodation.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🏨</div>
          <p className="text-stone-500 text-sm">No stays added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trip.accommodation.map((acc) => (
            <AccommodationCard key={acc.id} acc={acc} onDelete={() => deleteAccommodation(acc.id)} />
          ))}
        </div>
      )}

      <AddAccommodationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addAccommodation}
      />
    </div>
  )
}
