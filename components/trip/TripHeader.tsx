'use client'

import { useState } from 'react'
import { Copy, Check, Calendar, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTrip } from '@/context/TripContext'
import { countryFlag, formatDate, getInitials } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

export default function TripHeader() {
  const { trip } = useTrip()
  const [copied, setCopied] = useState(false)

  if (!trip) return null

  async function copyCode() {
    await navigator.clipboard.writeText(trip!.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const flag = countryFlag(trip.country)

  return (
    <div className="bg-white border-b border-stone-100">
      <div className="max-w-5xl mx-auto px-6 py-5">
        {/* Brand bar */}
        <div className="flex items-center gap-1.5 mb-4">
          <Link href="/" className="flex items-center gap-1.5 group">
            <ArrowLeft size={13} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
            <span className="font-display italic font-bold text-stone-400 group-hover:text-stone-600 text-sm tracking-tight transition-colors">
              Are We Tripping?
            </span>
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          {/* Left: trip info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{flag}</span>
              <h1 className="text-xl font-bold text-stone-900">{trip.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <span className="font-medium text-stone-700">{trip.country}</span>
              </span>
              {(trip.startDate || trip.endDate) && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {formatDate(trip.startDate)}
                  {trip.endDate && ` — ${formatDate(trip.endDate)}`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={13} />
                {trip.members.length} {trip.members.length === 1 ? 'person' : 'people'}
              </span>
            </div>
          </div>

          {/* Right: members + share code */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {/* Member avatars */}
            <div className="flex -space-x-2">
              {trip.members.slice(0, 6).map((member, i) => (
                <div
                  key={member}
                  title={member}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {getInitials(member)}
                </div>
              ))}
              {trip.members.length > 6 && (
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-500 border-2 border-white">
                  +{trip.members.length - 6}
                </div>
              )}
            </div>
            {/* Share code */}
            <button
              onClick={copyCode}
              className="flex items-center gap-2 bg-sand-50 hover:bg-sand-100 border border-sand-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <span className="text-xs text-stone-500">Code:</span>
              <span className="text-xs font-mono font-semibold text-stone-800">{trip.id}</span>
              {copied ? (
                <Check size={13} className="text-green-500" />
              ) : (
                <Copy size={13} className="text-stone-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
