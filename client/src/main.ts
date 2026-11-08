import './style.css'

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
  <ul id="results"></ul>
`

const form = document.querySelector<HTMLFormElement>('#search')!
const input = document.querySelector<HTMLInputElement>('#q')!
const list = document.querySelector<HTMLUListElement>('#results')!

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
})