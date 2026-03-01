import { Utensils, Footprints, Car, Coffee, Lightbulb } from 'lucide-react'
import type { ItineraryItem as IItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

const TYPE_CONFIG = {
  food: { icon: <Utensils size={14} />, color: 'text-orange-500 bg-orange-50 border-orange-100' },
  activity: { icon: <Footprints size={14} />, color: 'text-blue-500 bg-blue-50 border-blue-100' },
  travel: { icon: <Car size={14} />, color: 'text-purple-500 bg-purple-50 border-purple-100' },
  rest: { icon: <Coffee size={14} />, color: 'text-stone-400 bg-stone-50 border-stone-100' },
}

interface ItineraryItemProps {
  item: IItem
  isLast: boolean
}

export default function ItineraryItemComponent({ item, isLast }: ItineraryItemProps) {
  const config = TYPE_CONFIG[item.type]

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={cn('w-8 h-8 rounded-full border flex items-center justify-center shrink-0', config.color)}>
          {config.icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-stone-100 mt-1" />}
      </div>

      {/* Content */}
      <div className={cn('pb-5 flex-1', isLast && 'pb-0')}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-stone-400 shrink-0">{item.time}</span>
          <h4 className="text-sm font-semibold text-stone-900">{item.name}</h4>
        </div>
        <p className="text-sm text-stone-500 leading-relaxed mb-2">{item.description}</p>

        {item.tips && (
          <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
            <Lightbulb size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">{item.tips}</p>
          </div>
        )}

        {item.contributedBy.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-400">from</span>
            {item.contributedBy.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 bg-sand-50 text-sand-700 border border-sand-100 rounded-full px-2 py-0.5 text-xs"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-sand-200 flex items-center justify-center text-[8px] font-bold">
                  {getInitials(name)}
                </span>
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
