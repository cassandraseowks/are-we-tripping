'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { Plus, Trash2 } from 'lucide-react'
import { useTrip } from '@/context/TripContext'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { BudgetCategory, BudgetItem } from '@/lib/types'

const CATEGORY_CONFIG: Record<BudgetCategory, { label: string; emoji: string; color: string }> = {
  flights: { label: 'Flights', emoji: '✈️', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  accommodation: { label: 'Stays', emoji: '🏨', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  food: { label: 'Food', emoji: '🍜', color: 'bg-orange-50 text-orange-700 border-orange-100' },
  activities: { label: 'Activities', emoji: '🎯', color: 'bg-green-50 text-green-700 border-green-100' },
  transport: { label: 'Transport', emoji: '🚌', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  other: { label: 'Other', emoji: '📦', color: 'bg-stone-50 text-stone-700 border-stone-200' },
}

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as BudgetCategory[]

function AddExpenseModal({
  open,
  onClose,
  onAdd,
  currentUser,
}: {
  open: boolean
  onClose: () => void
  onAdd: (item: BudgetItem) => void
  currentUser: string
}) {
  const [form, setForm] = useState({
    category: 'food' as BudgetCategory,
    label: '',
    amount: '',
    currency: 'USD',
    paidBy: currentUser,
  })

  function handleChange(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      id: nanoid(),
      category: form.category,
      label: form.label,
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      paidBy: form.paidBy || undefined,
    })
    onClose()
    setForm({ category: 'food', label: '', amount: '', currency: 'USD', paidBy: currentUser })
  }

  const inputClass = 'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300'

  return (
    <Modal open={open} onClose={onClose} title="Add expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat]
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleChange('category', cat)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-colors ${
                    form.category === cat
                      ? cfg.color + ' border-current'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span>{cfg.emoji}</span>
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <input type="text" value={form.label} onChange={(e) => handleChange('label', e.target.value)} placeholder="e.g. Dinner at Nobu" required className={inputClass} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Amount</label>
            <input type="number" value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="75" min="0" step="0.01" required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Currency</label>
            <input type="text" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} placeholder="USD" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Paid by</label>
          <input type="text" value={form.paidBy} onChange={(e) => handleChange('paidBy', e.target.value)} className={inputClass} />
        </div>
        <div className="pt-2 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1">Add expense</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function BudgetTab() {
  const { trip, currentUser, updateTrip } = useTrip()
  const [showModal, setShowModal] = useState(false)

  if (!trip) return null

  const total = trip.budget.reduce((sum, b) => sum + b.amount, 0)
  const perPerson = trip.members.length > 0 ? total / trip.members.length : 0

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    items: trip.budget.filter((b) => b.category === cat),
    subtotal: trip.budget.filter((b) => b.category === cat).reduce((s, b) => s + b.amount, 0),
  })).filter((g) => g.items.length > 0)

  function addExpense(item: BudgetItem) {
    updateTrip((prev) => ({ ...prev, budget: [...prev.budget, item] }))
  }

  function deleteExpense(id: string) {
    updateTrip((prev) => ({ ...prev, budget: prev.budget.filter((b) => b.id !== id) }))
  }

  const currency = trip.budget[0]?.currency ?? 'USD'

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-stone-900">Budget</h2>
          <p className="text-sm text-stone-500">{trip.budget.length} expense{trip.budget.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add expense
        </Button>
      </div>

      {/* Summary cards */}
      {trip.budget.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sand-500 text-white rounded-2xl p-5">
            <p className="text-sand-200 text-xs mb-1">Total spend</p>
            <p className="text-2xl font-bold">{currency} {total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            <p className="text-stone-400 text-xs mb-1">Per person ({trip.members.length})</p>
            <p className="text-2xl font-bold text-stone-900">{currency} {perPerson.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      )}

      {byCategory.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-stone-500 text-sm">No expenses yet. Start tracking your trip budget!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {byCategory.map(({ cat, items, subtotal }) => {
            const cfg = CATEGORY_CONFIG[cat]
            return (
              <div key={cat} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span>{cfg.emoji}</span>
                    <span className="font-medium text-stone-800 text-sm">{cfg.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-stone-900">
                    {currency} {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="divide-y divide-stone-50">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-stone-800">{item.label}</p>
                        {item.paidBy && (
                          <p className="text-xs text-stone-400">paid by {item.paidBy}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-900">
                          {item.currency} {item.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => deleteExpense(item.id)}
                          className="p-1 text-stone-300 hover:text-red-400 transition-colors rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addExpense}
        currentUser={currentUser}
      />
    </div>
  )
}
