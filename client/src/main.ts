import './style.css'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

type Place = {
  displayName: { text: string }
  id: string
  formattedAddress: string
  location: { latitude: number; longitude: number }
}

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <form id="search">
    <input id="q" placeholder="e.g. coffee in London" />
    <button type="submit">Search</button>
  </form>
  <div id="route-buttons"></div>
  <p id="route-info"></p>
  <div id="map"></div>
  <ul id="results"></ul>
`

const form = document.querySelector<HTMLFormElement>('#search')!
const input = document.querySelector<HTMLInputElement>('#q')!
const list = document.querySelector<HTMLUListElement>('#results')!

// 1. Tell the loader your key, then load the libraries you need
setOptions({ key: import.meta.env.VITE_MAPS_API_KEY, v: 'weekly' })

const { Map: GoogleMap, Polyline } = await importLibrary('maps')
const { encoding } = await importLibrary('geometry')
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
    ? places.map((p) => `<li><b>${p.displayName.text}</b> — ${p.formattedAddress}<br><code>${p.id}</code></li>`).join('')
    : '<li>No results</li>'

  showOnMap(places)
})

type RouteOption = { id: string; name: string }

type Directions = {
  name: string
  distanceMeters: number
  duration: string
  polyline: { encodedPolyline: string }
}

const routeButtons = document.querySelector<HTMLDivElement>('#route-buttons')!
const routeInfo = document.querySelector<HTMLParagraphElement>('#route-info')!
let routeLine: google.maps.Polyline | null = null

async function showRoute(id: string) {
  routeInfo.textContent = 'Loading…'

  const res = await fetch(`/api/directions/${encodeURIComponent(id)}`)
  const data = await res.json()

  if (!res.ok) {
    routeInfo.textContent = `Error: ${data.error}`
    return
  }

  const route = data as Directions
  const path = encoding.decodePath(route.polyline.encodedPolyline)

  routeLine?.setMap(null)
  routeLine = new Polyline({ map, path, strokeColor: '#aa3bff', strokeWeight: 5 })

  const bounds = new LatLngBounds()
  path.forEach((point) => bounds.extend(point))
  map.fitBounds(bounds)

  const km = (route.distanceMeters / 1000).toFixed(1)
  const mins = Math.round(parseInt(route.duration) / 60)
  routeInfo.textContent = `${route.name}: ${km} km · ${mins} min by car`
}

// Make one button per route the server offers
const options: RouteOption[] = await (await fetch('/api/directions')).json()
routeButtons.innerHTML = options
  .map((r) => `<button type="button" data-id="${r.id}">${r.name}</button>`)
  .join('')

routeButtons.addEventListener('click', (e) => {
  const button = (e.target as HTMLElement).closest('button')
  if (button?.dataset.id) showRoute(button.dataset.id)
})