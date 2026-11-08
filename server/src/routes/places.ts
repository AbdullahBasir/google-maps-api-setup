import { Hono } from 'hono'
import { searchPlaces } from '../services/places.js'

const places = new Hono()

places.get("/", async (c) => {
    const query = c.req.query("q")
    if (!query) {
        return c.json({ error: "Missing ?q=" }, 400)
    }

    try {
        return c.json({ places: await searchPlaces(query) })
    } catch (err) {
        return c.json({ error: (err as Error).message }, 502)
    }
})

export default places