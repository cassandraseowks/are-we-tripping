import type { ItineraryDay } from '@/lib/types'
import ItineraryItemComponent from './ItineraryItem'
import { formatDate } from '@/lib/utils'

interface ItineraryDayProps {
  day: ItineraryDay
}

export default function ItineraryDayComponent({ day }: ItineraryDayProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      {/* Day header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-stone-50">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sand-500 text-white text-sm font-bold shrink-0">
          {day.day}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900">Day {day.day}</h3>
            {day.date && (
              <span className="text-xs text-stone-400">{formatDate(day.date)}</span>
            )}
          </div>
          {day.theme && (
            <p className="text-sm text-sand-600">{day.theme}</p>
          )}
        </div>
      </div>

      {/* Timeline items */}
      <div>
        {day.items.map((item, i) => (
          <ItineraryItemComponent
            key={`${day.day}-${i}`}
            item={item}
            isLast={i === day.items.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
