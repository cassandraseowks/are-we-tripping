'use client'

import { useState } from 'react'
import { Plus, X, ChevronRight, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useTrip } from '@/context/TripContext'
import { cn } from '@/lib/utils'
import type { TripSheetDay, TripSheetActivity, Accommodation } from '@/lib/types'

// ── Helpers ──────────────────────────────────────────────────────────────────
function getDayOfWeek(dateStr?: string): string {
  if (!dateStr) return ''
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  // Use noon to avoid timezone shift
  return days[new Date(dateStr + 'T12:00:00').getDay()] ?? ''
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function findAccommodationForDate(date: string | undefined, accommodations: Accommodation[]): Accommodation | null {
  if (!date) return null
  return (
    accommodations.find((acc) => {
      if (!acc.checkIn || !acc.checkOut) return false
      return date >= acc.checkIn && date < acc.checkOut
    }) ?? null
  )
}

// ── Side panel ────────────────────────────────────────────────────────────────
function SidePanel({
  day,
  accommodations,
  onSave,
  onDelete,
  onClose,
}: {
  day: TripSheetDay
  accommodations: Accommodation[]
  onSave: (updated: TripSheetDay) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState<TripSheetDay>({ ...day, activities: day.activities.map((a) => ({ ...a, details: [...a.details] })) })

  function setField<K extends keyof TripSheetDay>(key: K, value: TripSheetDay[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-derive day of week from date
      if (key === 'date') next.dayOfWeek = getDayOfWeek(value as string)
      return next
    })
  }

  function addActivity() {
    setForm((prev) => ({
      ...prev,
      activities: [...prev.activities, { title: '', details: [] }],
    }))
  }

  function updateActivity(index: number, field: keyof TripSheetActivity, value: string | string[]) {
    setForm((prev) => {
      const activities = prev.activities.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      )
      return { ...prev, activities }
    })
  }

  function removeActivity(index: number) {
    setForm((prev) => ({ ...prev, activities: prev.activities.filter((_, i) => i !== index) }))
  }

  function addDetail(actIndex: number) {
    setForm((prev) => {
      const activities = prev.activities.map((a, i) =>
        i === actIndex ? { ...a, details: [...a.details, ''] } : a
      )
      return { ...prev, activities }
    })
  }

  function updateDetail(actIndex: number, detIndex: number, value: string) {
    setForm((prev) => {
      const activities = prev.activities.map((a, i) => {
        if (i !== actIndex) return a
        const details = a.details.map((d, j) => (j === detIndex ? value : d))
        return { ...a, details }
      })
      return { ...prev, activities }
    })
  }

  function removeDetail(actIndex: number, detIndex: number) {
    setForm((prev) => {
      const activities = prev.activities.map((a, i) => {
        if (i !== actIndex) return a
        return { ...a, details: a.details.filter((_, j) => j !== detIndex) }
      })
      return { ...prev, activities }
    })
  }

  const inputCls = 'w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300'
  const labelCls = 'block text-xs font-medium text-stone-500 mb-1'

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-40 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-900 text-sm">
            {form.date ? formatDisplayDate(form.date) : 'Edit day'}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Date + Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date</label>
              <input
                type="date"
                value={form.date ?? ''}
                onChange={(e) => setField('date', e.target.value || undefined)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Day of week</label>
              <input
                type="text"
                value={form.dayOfWeek ?? ''}
                onChange={(e) => setField('dayOfWeek', e.target.value || undefined)}
                placeholder="Auto from date"
                className={inputCls}
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>City / Location</label>
            <input
              type="text"
              value={form.city ?? ''}
              onChange={(e) => setField('city', e.target.value || undefined)}
              placeholder="e.g. Tokyo or Osaka → Kyoto"
              className={inputCls}
            />
          </div>

          {/* Accommodation */}
          <div>
            <label className={labelCls}>Accommodation</label>
            <select
              value={form.accommodationId ?? ''}
              onChange={(e) => setField('accommodationId', e.target.value || undefined)}
              className={inputCls}
            >
              <option value="">
                {accommodations.length === 0
                  ? 'No stays added yet'
                  : form.date && findAccommodationForDate(form.date, accommodations)
                  ? `Auto: ${findAccommodationForDate(form.date, accommodations)!.name}`
                  : '— Select stay —'}
              </option>
              {accommodations.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + ' mb-0'}>Activities</label>
              <button
                onClick={addActivity}
                className="text-xs text-sand-600 hover:text-sand-700 flex items-center gap-1 font-medium"
              >
                <Plus size={12} /> Add activity
              </button>
            </div>
            <div className="space-y-3">
              {form.activities.map((act, ai) => (
                <div key={ai} className="bg-stone-50 rounded-xl p-3 space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={act.title}
                      onChange={(e) => updateActivity(ai, 'title', e.target.value)}
                      placeholder="e.g. Lunch at Ichiran Ramen"
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
                    />
                    <button onClick={() => removeActivity(ai)} className="text-stone-300 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {/* Details */}
                  {act.details.map((det, di) => (
                    <div key={di} className="flex gap-2 items-center pl-3">
                      <span className="text-stone-300 text-xs">↳</span>
                      <input
                        type="text"
                        value={det}
                        onChange={(e) => updateDetail(ai, di, e.target.value)}
                        placeholder="Detail or tip"
                        className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300"
                      />
                      <button onClick={() => removeDetail(ai, di)} className="text-stone-300 hover:text-red-400 transition-colors shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addDetail(ai)}
                    className="text-xs text-stone-400 hover:text-stone-600 pl-5 flex items-center gap-1"
                  >
                    <Plus size={10} /> Add detail
                  </button>
                </div>
              ))}
              {form.activities.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-3">No activities yet — click "Add activity"</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setField('notes', e.target.value || undefined)}
              placeholder="e.g. Book tickets in advance"
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-100 flex justify-between items-center">
          <button
            onClick={onDelete}
            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={13} /> Delete row
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm text-stone-400 hover:text-stone-600 px-4 py-2 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { onSave(form); onClose() }}
              className="bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function TripSheetTab() {
  const { trip, updateTrip } = useTrip()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeNavId, setActiveNavId] = useState<string | null>(null)

  if (!trip) return null

  const sheet = trip.tripSheet ?? []
  const selectedDay = sheet.find((d) => d.id === selectedId) ?? null

  function addRow() {
    const newDay: TripSheetDay = { id: nanoid(), activities: [] }
    updateTrip((prev) => ({ ...prev, tripSheet: [...(prev.tripSheet ?? []), newDay] }))
    setSelectedId(newDay.id)
  }

  function saveDay(updated: TripSheetDay) {
    updateTrip((prev) => ({
      ...prev,
      tripSheet: (prev.tripSheet ?? []).map((d) => (d.id === updated.id ? updated : d)),
    }))
  }

  function deleteDay(id: string) {
    setSelectedId(null)
    updateTrip((prev) => ({
      ...prev,
      tripSheet: (prev.tripSheet ?? []).filter((d) => d.id !== id),
    }))
  }

  const thCls = 'text-left px-4 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider whitespace-nowrap border-b border-stone-100 bg-stone-50/50'
  const tdCls = 'px-4 py-3 text-sm align-top'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stone-900">Trip Sheet</h2>
          <p className="text-sm text-stone-500">
            {sheet.length === 0 ? 'Add rows manually or let Claude fill it in during planning' : `${sheet.length} day${sheet.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors"
        >
          <Plus size={13} /> Add row
        </button>
      </div>

      {sheet.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🗒️</div>
          <p className="text-stone-500 text-sm mb-1">Your trip sheet is empty.</p>
          <p className="text-stone-400 text-xs max-w-xs mx-auto">
            Plan your itinerary in the Itinerary tab and Claude will offer to push a summary here, or add rows manually.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 items-start">
          {/* Left nav */}
          <nav className="w-44 shrink-0">
            <div className="sticky top-14 bg-white rounded-2xl border border-stone-100 shadow-sm p-2 space-y-0.5 max-h-[calc(100vh-120px)] overflow-y-auto z-50">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-3 pt-1 pb-2">Days</p>
              {sheet.map((day) => (
                <button
                  key={day.id}
                  onClick={() => {
                    setActiveNavId(day.id)
                    document.getElementById(`row-${day.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-xs transition-colors',
                    activeNavId === day.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  )}
                >
                  <div className="font-medium">{formatDisplayDate(day.date)}</div>
                  {(day.city || day.dayOfWeek) && (
                    <div className={cn('truncate mt-0.5', activeNavId === day.id ? 'text-stone-300' : 'text-stone-400')}>
                      {day.city ?? day.dayOfWeek}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Table */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed">
              <colgroup>
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-32" />
                <col className="w-36" />
                <col />
                <col className="w-40" />
                <col className="w-8" />
              </colgroup>
              <thead>
                <tr>
                  <th className={thCls}>Date</th>
                  <th className={thCls}>Day</th>
                  <th className={thCls}>City</th>
                  <th className={thCls}>Accommodation</th>
                  <th className={thCls}>Activities</th>
                  <th className={thCls}>Notes</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody>
                {sheet.map((day) => {
                  const autoAcc = day.date
                    ? findAccommodationForDate(day.date, trip.accommodation)
                    : null
                  const acc = day.accommodationId
                    ? trip.accommodation.find((a) => a.id === day.accommodationId)
                    : autoAcc

                  return (
                    <tr
                      key={day.id}
                      id={`row-${day.id}`}
                      onClick={() => setSelectedId(day.id)}
                      className="border-t border-stone-50 hover:bg-stone-50/60 cursor-pointer transition-colors group"
                    >
                      {/* Date */}
                      <td className={tdCls + ' whitespace-nowrap font-medium text-stone-700'}>
                        {formatDisplayDate(day.date)}
                      </td>

                      {/* Day of week */}
                      <td className={tdCls + ' whitespace-nowrap text-stone-500'}>
                        {day.dayOfWeek ?? (day.date ? getDayOfWeek(day.date) : '—')}
                      </td>

                      {/* City */}
                      <td className={tdCls + ' whitespace-nowrap text-stone-700'}>
                        {day.city ?? <span className="text-stone-300">—</span>}
                      </td>

                      {/* Accommodation */}
                      <td className={tdCls + ' whitespace-nowrap text-stone-600'}>
                        {acc ? (
                          <span className="text-stone-700">{acc.name}</span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      {/* Activities */}
                      <td className={tdCls}>
                        {day.activities.length === 0 ? (
                          <span className="text-stone-300">—</span>
                        ) : (
                          <ul className="space-y-1.5">
                            {day.activities.map((act, i) => (
                              <li key={i}>
                                <span className="text-stone-700">• {act.title}</span>
                                {act.details.length > 0 && (
                                  <ul className="mt-0.5 space-y-0.5 pl-3">
                                    {act.details.map((det, j) => (
                                      <li key={j} className="text-stone-400 text-xs">↳ {det}</li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>

                      {/* Notes */}
                      <td className={tdCls + ' text-stone-500 text-xs'}>
                        {day.notes ? (
                          <span className="line-clamp-3">{day.notes}</span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      {/* Edit arrow */}
                      <td className={tdCls}>
                        <ChevronRight size={15} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {selectedDay && (
        <SidePanel
          day={selectedDay}
          accommodations={trip.accommodation}
          onSave={saveDay}
          onDelete={() => deleteDay(selectedDay.id)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
