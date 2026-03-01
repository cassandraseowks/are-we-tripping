'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { saveTrip } from '@/lib/storage'
import type { Trip } from '@/lib/types'

interface CreateTripModalProps {
  open: boolean
  onClose: () => void
}

export default function CreateTripModal({ open, onClose }: CreateTripModalProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    country: '',
    yourName: '',
    startDate: '',
    endDate: '',
  })
  const [loading, setLoading] = useState(false)

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.country || !form.yourName) return
    setLoading(true)

    const id = nanoid(8)
    const trip: Trip = {
      id,
      name: form.name,
      country: form.country,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      currentUser: form.yourName,
      members: [form.yourName],
      contributions: [],
      accommodation: [],
      flights: [],
      budget: [],
      createdAt: Date.now(),
    }
    saveTrip(trip)
    router.push(`/trip/${id}`)
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a new trip">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Trip name
          </label>
          <input
            type="text"
            placeholder="e.g. Japan Adventure 2025"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Destination country
          </label>
          <input
            type="text"
            placeholder="e.g. Japan"
            value={form.country}
            onChange={(e) => handleChange('country', e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Your name
          </label>
          <input
            type="text"
            placeholder="e.g. Alex"
            value={form.yourName}
            onChange={(e) => handleChange('yourName', e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Start date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              End date
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400"
            />
          </div>
        </div>
        <div className="pt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Create trip
          </Button>
        </div>
      </form>
    </Modal>
  )
}
