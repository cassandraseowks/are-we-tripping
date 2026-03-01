import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Are We Tripping?',
  description: 'Group travel planning — drop your dream spots, vote, and let AI build the perfect itinerary.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF8] text-[#1C1917]">
        {children}
      </body>
    </html>
  )
}
