'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MapPin, Film, Instagram, Pencil } from 'lucide-react'
import { useTrip } from '@/context/TripContext'
import Badge from '@/components/ui/Badge'
import EditContributionModal from './EditContributionModal'
import type { Contribution } from '@/lib/types'
import { cn, getInitials } from '@/lib/utils'

const INPUT_ICONS = {
  address: <MapPin size={11} />,
  tiktok: <Film size={11} />,
  instagram: <Instagram size={11} />,
}

const INPUT_LABEL = {
  address: 'Place',
  tiktok: 'TikTok',
  instagram: 'Instagram',
}

const CATEGORY_BADGE_VARIANTS = {
  place: 'place',
  food: 'food',
  activity: 'activity',
} as const

interface ContributionCardProps {
  contribution: Contribution
}

export default function ContributionCard({ contribution: c }: ContributionCardProps) {
  const { currentUser, updateTrip } = useTrip()
  const [editOpen, setEditOpen] = useState(false)
  const hasVoted = c.votes.includes(currentUser)

  function toggleVote() {
    updateTrip((prev) => ({
      ...prev,
      contributions: prev.contributions.map((item) =>
        item.id !== c.id
          ? item
          : {
              ...item,
              votes: hasVoted
                ? item.votes.filter((v) => v !== currentUser)
                : [...item.votes, currentUser],
            }
      ),
    }))
  }

  function handleSave(updated: Contribution) {
    updateTrip((prev) => ({
      ...prev,
      contributions: prev.contributions.map((item) =>
        item.id === updated.id ? updated : item
      ),
    }))
  }

  function handleDelete(id: string) {
    updateTrip((prev) => ({
      ...prev,
      contributions: prev.contributions.filter((item) => item.id !== id),
    }))
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col group">
        {/* Thumbnail */}
        {c.thumbnail && (
          <div className="relative h-36 w-full bg-stone-100">
            <Image src={c.thumbnail} alt={c.name} fill className="object-cover" />
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                {INPUT_ICONS[c.inputType]}
                {INPUT_LABEL[c.inputType]}
              </span>
            </div>
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          {/* Name row */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 flex-1">
              {c.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Badge
                label={c.category.charAt(0).toUpperCase() + c.category.slice(1)}
                variant={CATEGORY_BADGE_VARIANTS[c.category]}
              />
              {/* Edit button */}
              <button
                onClick={() => setEditOpen(true)}
                title="Edit"
                className="p-1 rounded-lg text-stone-300 hover:text-sand-500 hover:bg-sand-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Pencil size={13} />
              </button>
            </div>
          </div>

          {/* Description */}
          {c.description && (
            <p className="text-xs text-stone-500 leading-relaxed mb-2 line-clamp-3">
              {c.description}
            </p>
          )}

          {/* Location */}
          {c.location?.address && (
            <div className="flex items-start gap-1 mb-2">
              <MapPin size={11} className="text-stone-300 mt-0.5 shrink-0" />
              <span className="text-xs text-stone-400 line-clamp-1">{c.location.address}</span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-2 flex items-center justify-between">
            {/* Contributor */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-sand-100 flex items-center justify-center text-[9px] font-semibold text-sand-700">
                {getInitials(c.user)}
              </div>
              <span className="text-xs text-stone-400">{c.user}</span>
            </div>

            {/* Vote */}
            <button
              onClick={toggleVote}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                hasVoted
                  ? 'bg-red-50 text-red-500 border-red-100'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-red-50 hover:text-red-400 hover:border-red-100'
              )}
            >
              <Heart size={12} className={cn(hasVoted && 'fill-red-500')} />
              {c.votes.length}
            </button>
          </div>
        </div>
      </div>

      <EditContributionModal
        contribution={c}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  )
}
