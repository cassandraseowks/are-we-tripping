import { TripProvider } from '@/context/TripContext'

export default function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tripId: string }
}) {
  return (
    <TripProvider tripId={params.tripId}>
      {children}
    </TripProvider>
  )
}
