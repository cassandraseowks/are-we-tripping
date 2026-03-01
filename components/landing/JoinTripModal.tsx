'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { getTrip, saveTrip } from '@/lib/storage'

interface JoinTripModalProps {
  open: boolean
  onClose: () => void
}

export default function JoinTripModal({ open, onClose }: JoinTripModalProps) {
  const router = useRouter()
  const [form, setForm] = useState({ code: '', yourName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code || !form.yourName) return
    setLoading(true)

    const trip = await getTrip(form.code.trim())
    if (!trip) {
      setError('No trip found with that code. Double-check and try again.')
      setLoading(false)
      return
    }

    // Add member if not already in list
    const updatedTrip = {
      ...trip,
      currentUser: form.yourName,
      members: trip.members.includes(form.yourName)
        ? trip.members
        : [...trip.members, form.yourName],
    }
    await saveTrip(updatedTrip)
    router.push(`/trip/${trip.id}`)
  }

  return (
    <Modal open={open} onClose={onClose} title="Join an existing trip">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Share code
          </label>
          <input
            type="text"
            placeholder="e.g. Hk93mXpQ"
            value={form.code}
            onChange={(e) => handleChange('code', e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Your name
          </label>
          <input
            type="text"
            placeholder="e.g. Jordan"
            value={form.yourName}
            onChange={(e) => handleChange('yourName', e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="pt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Join trip
          </Button>
        </div>
      </form>
    </Modal>
  )
}
