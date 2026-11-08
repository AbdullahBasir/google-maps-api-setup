import './style.css'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

type Place = {
  displayName: { text: string }
  formattedAddress: string
  location: { latitude: number; longitude: number }
}

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <form id="search">
    <input id="q" placeholder="e.g. coffee in London" />
    <button type="submit">Search</button>
  </form>
  <div id="map"></div>
  <ul id="results"></ul>
`

const form = document.querySelector<HTMLFormElement>('#search')!
const input = document.querySelector<HTMLInputElement>('#q')!
const list = document.querySelector<HTMLUListElement>('#results')!

// 1. Tell the loader your key, then load the libraries you need
setOptions({ key: import.meta.env.VITE_MAPS_API_KEY, v: 'weekly' })

const { Map: GoogleMap } = await importLibrary('maps')
const { AdvancedMarkerElement } = await importLibrary('marker')
const { LatLngBounds } = await importLibrary('core')

// 2. Create the map, centred on London
const map = new GoogleMap(document.querySelector<HTMLDivElement>('#map')!, {
  center: { lat: 51.5074, lng: -0.1278 },
  zoom: 12,
  mapId: 'DEMO_MAP_ID',
})

let markers: google.maps.marker.AdvancedMarkerElement[] = []

// 3. Put one marker on the map per place, and zoom to fit them all
function showOnMap(places: Place[]) {
  markers.forEach((m) => (m.map = null))
  markers = []

  if (places.length === 0) return
  const bounds = new LatLngBounds()

  for (const p of places) {
    const position = { lat: p.location.latitude, lng: p.location.longitude }
    markers.push(new AdvancedMarkerElement({ map, position, title: p.displayName.text }))
    bounds.extend(position)
  }

  map.fitBounds(bounds)
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  list.innerHTML = '<li>Loading…</li>'

  const res = await fetch(`/api/places?q=${encodeURIComponent(input.value)}`)
  const data = await res.json()

  if (!res.ok) {
    list.innerHTML = `<li>Error: ${data.error}</li>`
    return
  }

  const places: Place[] = data.places
  list.innerHTML = places.length
    ? places.map((p) => `<li><b>${p.displayName.text}</b> — ${p.formattedAddress}</li>`).join('')
    : '<li>No results</li>'

  showOnMap(places)
})