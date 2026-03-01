'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, RotateCcw, AlertCircle, TableProperties, Check, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useTrip } from '@/context/TripContext'
import ItineraryDayComponent from '@/components/itinerary/ItineraryDay'
import Button from '@/components/ui/Button'
import type { ItineraryDay, TripSheetDay } from '@/lib/types'
import { cn } from '@/lib/utils'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

function parseItinerary(text: string): ItineraryDay[] | null {
  const match = text.match(/```json\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1].trim()) as { itinerary?: ItineraryDay[] }
    if (Array.isArray(parsed.itinerary) && parsed.itinerary.length > 0) return parsed.itinerary
    return null
  } catch {
    return null
  }
}

function parseTripSheet(text: string): TripSheetDay[] | null {
  const match = text.match(/```tripsheet\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1].trim()) as { tripSheet?: Omit<TripSheetDay, 'id'>[] }
    if (Array.isArray(parsed.tripSheet) && parsed.tripSheet.length > 0) {
      return parsed.tripSheet.map((d) => ({ ...d, id: nanoid(), activities: d.activities ?? [] }))
    }
    return null
  } catch {
    return null
  }
}

function displayContent(content: string): string {
  return content
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/```tripsheet[\s\S]*?```/g, '')
    .trim()
}

// ── Trip Sheet confirmation card ────────────────────────────────────────────
function TripSheetConfirmCard({
  days,
  onConfirm,
  onDismiss,
}: {
  days: TripSheetDay[]
  onConfirm: () => void
  onDismiss: () => void
}) {
  const preview = days.slice(0, 4)
  return (
    <div className="border border-sand-200 bg-sand-50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <TableProperties size={15} className="text-sand-500" />
          Trip Sheet draft ready
        </div>
        <button onClick={onDismiss} className="text-stone-300 hover:text-stone-500 transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Mini preview */}
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-sand-100">
              <th className="text-left px-3 py-2 text-stone-400 font-medium whitespace-nowrap">Date</th>
              <th className="text-left px-3 py-2 text-stone-400 font-medium whitespace-nowrap">Day</th>
              <th className="text-left px-3 py-2 text-stone-400 font-medium whitespace-nowrap">City</th>
              <th className="text-left px-3 py-2 text-stone-400 font-medium">Activities</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((day, i) => (
              <tr key={i} className="border-b border-stone-50 last:border-0">
                <td className="px-3 py-2 text-stone-600 whitespace-nowrap">{day.date ?? '—'}</td>
                <td className="px-3 py-2 text-stone-500 whitespace-nowrap">{day.dayOfWeek ?? '—'}</td>
                <td className="px-3 py-2 text-stone-600 whitespace-nowrap">{day.city ?? '—'}</td>
                <td className="px-3 py-2 text-stone-500 max-w-xs truncate">
                  {day.activities.map((a) => a.title).join(' · ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {days.length > 4 && (
          <p className="text-xs text-stone-400 text-center py-2">
            +{days.length - 4} more day{days.length - 4 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Check size={12} />
          Push to Trip Sheet
        </button>
        <button
          onClick={onDismiss}
          className="text-xs text-stone-400 hover:text-stone-600 px-3 py-2 rounded-lg transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ItineraryTab() {
  const { trip, updateTrip } = useTrip()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [chatStarted, setChatStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const modMessagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [modMessages, setModMessages] = useState<ChatMessage[]>([])
  const [modInputValue, setModInputValue] = useState('')
  const [pendingTripSheet, setPendingTripSheet] = useState<TripSheetDay[] | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  useEffect(() => {
    modMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [modMessages, streamingText])

  if (!trip) return null

  const days =
    trip.startDate && trip.endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 3

  async function streamFromAPI(msgs: ChatMessage[], existingItinerary?: ItineraryDay[]): Promise<string> {
    const res = await fetch('/api/itinerary-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: msgs,
        contributions: trip!.contributions,
        country: trip!.country,
        tripName: trip!.name,
        startDate: trip!.startDate,
        endDate: trip!.endDate,
        days,
        members: trip!.members,
        existingItinerary,
        existingTripSheet: trip!.tripSheet,
      }),
    })
    if (!res.ok || !res.body) throw new Error('Stream failed')
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      fullText += decoder.decode(value, { stream: true })
      setStreamingText(fullText)
    }
    return fullText
  }

  async function sendMessage(content: string, history: ChatMessage[]) {
    const userMsg: ChatMessage = { role: 'user', content }
    const updated = [...history, userMsg]
    setMessages(updated)
    setInputValue('')
    setIsStreaming(true)
    setStreamingText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    try {
      const fullText = await streamFromAPI(updated)
      const itinerary = parseItinerary(fullText)
      if (itinerary) updateTrip((prev) => ({ ...prev, itinerary, itineraryUpdatedAt: Date.now() }))
      const sheet = parseTripSheet(fullText)
      if (sheet) setPendingTripSheet(sheet)
      setMessages((prev) => [...prev, { role: 'assistant', content: fullText }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong — please try again.' }])
    } finally {
      setIsStreaming(false)
      setStreamingText('')
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  async function sendModification(content: string, history: ChatMessage[]) {
    const userMsg: ChatMessage = { role: 'user', content }
    const updated = [...history, userMsg]
    setModMessages(updated)
    setModInputValue('')
    setIsStreaming(true)
    setStreamingText('')
    if (modTextareaRef.current) modTextareaRef.current.style.height = 'auto'
    try {
      const fullText = await streamFromAPI(updated, trip!.itinerary)
      const itinerary = parseItinerary(fullText)
      if (itinerary) updateTrip((prev) => ({ ...prev, itinerary, itineraryUpdatedAt: Date.now() }))
      const sheet = parseTripSheet(fullText)
      if (sheet) setPendingTripSheet(sheet)
      setModMessages((prev) => [...prev, { role: 'assistant', content: fullText }])
    } catch {
      setModMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong — please try again.' }])
    } finally {
      setIsStreaming(false)
      setStreamingText('')
      setTimeout(() => modTextareaRef.current?.focus(), 50)
    }
  }

  function startPlanning() {
    setChatStarted(true)
    sendMessage("Let's plan our trip itinerary!", [])
  }

  function handleReplan() {
    setMessages([])
    setModMessages([])
    setPendingTripSheet(null)
    setChatStarted(false)
    // tripSheet intentionally NOT cleared — it persists across re-plans
    updateTrip((prev) => ({ ...prev, itinerary: undefined, itineraryUpdatedAt: undefined }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim() || isStreaming) return
    sendMessage(inputValue.trim(), messages)
  }

  function handleModSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!modInputValue.trim() || isStreaming) return
    sendModification(modInputValue.trim(), modMessages)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isStreaming) sendMessage(inputValue.trim(), messages)
    }
  }

  function handleModKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (modInputValue.trim() && !isStreaming) sendModification(modInputValue.trim(), modMessages)
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  function handleModTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setModInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const newItems = trip.itinerary
    ? trip.contributions.filter((c) => c.timestamp > (trip.itineraryUpdatedAt ?? 0))
    : []

  function handleUpdatePlan() {
    const names = newItems.map((c) => c.name).join(', ')
    sendModification(
      `Please update the itinerary to incorporate these new wishlist items: ${names}. Keep everything else the same.`,
      modMessages
    )
  }

  function confirmTripSheet() {
    if (!pendingTripSheet) return
    updateTrip((prev) => ({ ...prev, tripSheet: pendingTripSheet }))
    setPendingTripSheet(null)
  }

  const streamingBubble = isStreaming ? (
    <div className="flex gap-2.5 justify-start">
      <div className="w-7 h-7 rounded-full bg-sand-100 border border-sand-200 flex items-center justify-center text-xs shrink-0 mt-0.5">✦</div>
      {streamingText ? (
        <div className="max-w-[82%] bg-stone-50 border border-stone-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
          {displayContent(streamingText)}
          <span className="inline-block w-1.5 h-3.5 bg-sand-400 rounded-sm ml-0.5 animate-pulse align-middle" />
        </div>
      ) : (
        <div className="bg-stone-50 border border-stone-100 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex gap-1 items-center h-5">
            {[0, 150, 300].map((delay) => (
              <span key={delay} className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  ) : null

  // ── Itinerary exists view ──────────────────────────────────────────────────
  if (trip.itinerary) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-stone-900">
              Your itinerary · {trip.itinerary.length} day{trip.itinerary.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-stone-500">Click "Re-plan" to start fresh with AI</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleReplan}>
            <RotateCcw size={13} />
            Re-plan
          </Button>
        </div>

        {newItems.length > 0 && (
          <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <AlertCircle size={15} className="shrink-0 text-amber-500" />
              <span>{newItems.length} new wish{newItems.length !== 1 ? 'es' : ''} added since your last plan — want to update it?</span>
            </div>
            <button onClick={handleUpdatePlan} disabled={isStreaming} className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-900 border border-amber-300 hover:border-amber-400 bg-white rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50">
              Update plan
            </button>
          </div>
        )}

        <div className="space-y-4">
          {trip.itinerary.map((day) => (
            <ItineraryDayComponent key={day.day} day={day} />
          ))}
        </div>

        {/* Modification chat */}
        <div className="border-t border-stone-100 pt-6 space-y-4">
          <p className="text-sm font-medium text-stone-600">Ask to change anything</p>
          {(modMessages.length > 0 || isStreaming) && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {modMessages.map((msg, i) => {
                const text = displayContent(msg.content)
                const hadItinerary = msg.role === 'assistant' && parseItinerary(msg.content) !== null
                return (
                  <div key={i} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-sand-100 border border-sand-200 flex items-center justify-center text-xs shrink-0 mt-0.5">✦</div>
                    )}
                    <div className={cn('max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', msg.role === 'user' ? 'bg-stone-900 text-white rounded-tr-sm' : 'bg-stone-50 text-stone-800 border border-stone-100 rounded-tl-sm whitespace-pre-wrap')}>
                      {text}
                      {hadItinerary && (
                        <div className="mt-2 pt-2 border-t border-stone-200 text-xs text-sand-600 font-medium">Itinerary updated — see above ↑</div>
                      )}
                    </div>
                  </div>
                )
              })}
              {isStreaming && streamingBubble}
              <div ref={modMessagesEndRef} />
            </div>
          )}
          <form onSubmit={handleModSubmit} className="flex gap-2 items-end">
            <textarea ref={modTextareaRef} value={modInputValue} onChange={handleModTextareaChange} onKeyDown={handleModKeyDown} placeholder={isStreaming ? 'Claude is thinking…' : 'Ask to change anything…'} rows={1} disabled={isStreaming} className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300 resize-none disabled:opacity-40 transition-opacity" style={{ maxHeight: '120px' }} />
            <Button type="submit" disabled={!modInputValue.trim() || isStreaming} size="md" className="shrink-0 self-end"><Send size={14} /></Button>
          </form>
          <p className="text-xs text-stone-400 text-center">Enter to send · Shift+Enter for new line</p>
        </div>

        {pendingTripSheet && (
          <TripSheetConfirmCard days={pendingTripSheet} onConfirm={confirmTripSheet} onDismiss={() => setPendingTripSheet(null)} />
        )}
      </div>
    )
  }

  // ── Initial screen ─────────────────────────────────────────────────────────
  if (!chatStarted) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🗓️</div>
        <h2 className="text-lg font-semibold text-stone-900 mb-2">Plan your itinerary with AI</h2>
        <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
          {trip.contributions.length > 0
            ? `Claude will ask a few questions about your travel style, then weave your ${trip.contributions.length} wishlist item${trip.contributions.length !== 1 ? 's' : ''} into a perfect day-by-day plan.`
            : 'Claude will ask about your preferences and build a personalised day-by-day plan for your group.'}
        </p>
        <Button onClick={startPlanning} size="lg" loading={isStreaming}>✨ Start planning</Button>
      </div>
    )
  }

  // ── Planning chat view ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-sand-100 border border-sand-200 flex items-center justify-center text-xs">✦</div>
            <span className="text-sm font-medium text-stone-700">Itinerary Planner</span>
          </div>
          {messages.length > 0 && !isStreaming && (
            <button onClick={handleReplan} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors">
              <RotateCcw size={11} />Start over
            </button>
          )}
        </div>

        <div className="overflow-y-auto p-5 space-y-5 flex-1" style={{ minHeight: '380px', maxHeight: '58vh' }}>
          {messages.map((msg, i) => {
            const text = displayContent(msg.content)
            const hadItinerary = msg.role === 'assistant' && parseItinerary(msg.content) !== null
            return (
              <div key={i} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-sand-100 border border-sand-200 flex items-center justify-center text-xs shrink-0 mt-0.5">✦</div>
                )}
                <div className={cn('max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed', msg.role === 'user' ? 'bg-stone-900 text-white rounded-tr-sm' : 'bg-stone-50 text-stone-800 border border-stone-100 rounded-tl-sm whitespace-pre-wrap')}>
                  {text}
                  {hadItinerary && (
                    <div className="mt-3 pt-3 border-t border-stone-200 text-xs text-sand-600 font-medium">Itinerary generated — see below ↓</div>
                  )}
                </div>
              </div>
            )
          })}
          {isStreaming && streamingBubble}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-stone-100 px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea ref={textareaRef} value={inputValue} onChange={handleTextareaChange} onKeyDown={handleKeyDown} placeholder={isStreaming ? 'Claude is thinking…' : 'Reply to Claude…'} rows={1} disabled={isStreaming} className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 placeholder-stone-300 resize-none disabled:opacity-40 transition-opacity" style={{ maxHeight: '120px' }} />
            <Button type="submit" disabled={!inputValue.trim() || isStreaming} size="md" className="shrink-0 self-end"><Send size={14} /></Button>
          </form>
          <p className="text-xs text-stone-400 mt-2 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {pendingTripSheet && (
        <TripSheetConfirmCard days={pendingTripSheet} onConfirm={confirmTripSheet} onDismiss={() => setPendingTripSheet(null)} />
      )}
    </div>
  )
}
