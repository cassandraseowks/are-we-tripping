import { cn } from '@/lib/utils'

type BadgeVariant = 'place' | 'food' | 'activity' | 'neutral' | 'accent'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  place: 'bg-blue-50 text-blue-700 border border-blue-100',
  food: 'bg-orange-50 text-orange-700 border border-orange-100',
  activity: 'bg-green-50 text-green-700 border border-green-100',
  neutral: 'bg-stone-100 text-stone-600 border border-stone-200',
  accent: 'bg-sand-100 text-sand-700 border border-sand-200',
}

export default function Badge({ label, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
