export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function countryFlag(country: string): string {
  // Map common country names to flag emoji
  const map: Record<string, string> = {
    japan: '🇯🇵', france: '🇫🇷', italy: '🇮🇹', spain: '🇪🇸',
    thailand: '🇹🇭', greece: '🇬🇷', uk: '🇬🇧', usa: '🇺🇸',
    germany: '🇩🇪', portugal: '🇵🇹', mexico: '🇲🇽', bali: '🇮🇩',
    indonesia: '🇮🇩', australia: '🇦🇺', canada: '🇨🇦', brazil: '🇧🇷',
    'south korea': '🇰🇷', korea: '🇰🇷', vietnam: '🇻🇳', singapore: '🇸🇬',
    'new zealand': '🇳🇿', iceland: '🇮🇸', morocco: '🇲🇦', peru: '🇵🇪',
  }
  return map[country.toLowerCase()] ?? '🌍'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
