import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import places from './routes/places.js'
import directions from "./routes/directions.js"

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))
app.get('/api/health', (c) => c.json({ ok: true }))

app.route('/api/places', places)
app.route("/api/directions", directions)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})