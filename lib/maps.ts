import { Loader } from '@googlemaps/js-api-loader'

let loaderInstance: Loader | null = null
let loadPromise: Promise<typeof google> | null = null

export function getMapsLoader(): Loader {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      version: 'weekly',
      libraries: ['places'],
    })
  }
  return loaderInstance
}

export async function loadGoogleMaps(): Promise<typeof google> {
  if (loadPromise) return loadPromise
  loadPromise = getMapsLoader().load().catch((err) => {
    loadPromise = null // allow retry on next call
    throw err
  })
  return loadPromise
}

export async function geocodeByText(
  query: string
): Promise<{ lat: number; lng: number; address: string } | null> {
  try {
    await loadGoogleMaps()
    // PlacesService needs a map or a div — use a throwaway div
    const div = document.createElement('div')
    const service = new google.maps.places.PlacesService(div)

    return new Promise((resolve) => {
      service.findPlaceFromQuery(
        { query, fields: ['geometry', 'formatted_address', 'name'] },
        (results, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results[0]?.geometry?.location
          ) {
            const place = results[0]
            resolve({
              lat: place.geometry!.location!.lat(),
              lng: place.geometry!.location!.lng(),
              address: place.formatted_address ?? place.name ?? query,
            })
          } else {
            resolve(null)
          }
        }
      )
    })
  } catch {
    return null
  }
}
