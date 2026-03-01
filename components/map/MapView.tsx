'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '@/lib/maps'
import type { Contribution, ItineraryDay } from '@/lib/types'

interface MapViewProps {
  contributions: Contribution[]
  itinerary?: ItineraryDay[]
}

const CATEGORY_COLORS = {
  place: '#3B82F6',
  food: '#F97316',
  activity: '#22C55E',
}

export default function MapView({ contributions, itinerary }: MapViewProps) {
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const [showDirections, setShowDirections] = useState(false)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Points with geo data
  const geoContributions = contributions.filter((c) => c.location)
  const itineraryPoints =
    itinerary
      ?.flatMap((d) => d.items.filter((it) => it.location))
      .map((it) => it.location!) ?? []

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsLoaded(true))
      .catch(() => setLoadError(true))
  }, [])

  useEffect(() => {
    if (!mapsLoaded || !mapDivRef.current) return

    // Init map if not yet created
    if (!mapRef.current) {
      const center =
        geoContributions[0]?.location ?? { lat: 35.6762, lng: 139.6503 } // Tokyo default
      mapRef.current = new google.maps.Map(mapDivRef.current, {
        center,
        zoom: 12,
        disableDefaultUI: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      })
    }

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    // Add contribution markers
    geoContributions.forEach((c) => {
      if (!c.location) return
      const marker = new google.maps.Marker({
        position: { lat: c.location.lat, lng: c.location.lng },
        map: mapRef.current!,
        title: c.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: CATEGORY_COLORS[c.category],
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:4px 0">
          <strong style="font-size:13px">${c.name}</strong>
          <div style="font-size:11px;color:#78716c;margin-top:2px">${c.category} · by ${c.user}</div>
          ${c.location.address ? `<div style="font-size:11px;color:#a8a29e;margin-top:2px">${c.location.address}</div>` : ''}
        </div>`,
      })

      marker.addListener('click', () => {
        infoWindow.open(mapRef.current!, marker)
      })

      markersRef.current.push(marker)
    })

    // Fit bounds
    if (geoContributions.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      geoContributions.forEach((c) => {
        if (c.location) bounds.extend({ lat: c.location.lat, lng: c.location.lng })
      })
      mapRef.current.fitBounds(bounds, 60)
    }
  }, [mapsLoaded, geoContributions])

  // Directions toggle
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: { strokeColor: '#8B7355', strokeWeight: 3 },
      })
    }

    if (!showDirections) {
      directionsRendererRef.current.setMap(null)
      return
    }

    const points = itineraryPoints.length > 0 ? itineraryPoints : geoContributions.map((c) => c.location!)
    if (points.length < 2) return

    const directionsService = new google.maps.DirectionsService()
    directionsRendererRef.current.setMap(mapRef.current)

    directionsService.route(
      {
        origin: { lat: points[0].lat, lng: points[0].lng },
        destination: { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng },
        waypoints: points.slice(1, -1).map((p) => ({
          location: { lat: p.lat, lng: p.lng },
          stopover: true,
        })),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current!.setDirections(result)
        }
      }
    )
  }, [showDirections, mapsLoaded, itineraryPoints, geoContributions])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96 bg-stone-50 rounded-2xl border border-stone-100">
        <div className="text-center">
          <div className="text-3xl mb-2">🗺️</div>
          <p className="text-stone-500 text-sm">Google Maps failed to load. Check your API key.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Places
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Food
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Activities
          </span>
        </div>
        {geoContributions.length >= 2 && (
          <button
            onClick={() => setShowDirections((v) => !v)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              showDirections
                ? 'bg-sand-500 text-white border-sand-500'
                : 'bg-white text-stone-600 border-stone-200 hover:border-sand-300'
            }`}
          >
            {showDirections ? 'Hide directions' : 'Show directions'}
          </button>
        )}
      </div>

      <div
        ref={mapDivRef}
        className="w-full rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
        style={{ height: '500px' }}
      />

      {geoContributions.length === 0 && (
        <p className="text-center text-stone-400 text-sm py-2">
          Add wishes with addresses to see them on the map.
        </p>
      )}
    </div>
  )
}
