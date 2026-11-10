import { Hono } from "hono"
import { FIXED_ROUTES } from "../data/directions.js"
import { getDirections } from "../services/directions.js"

const directions = new Hono()

directions.get("/", (c) => {
    return c.json(FIXED_ROUTES.map(({ id, name }) => ({ id, name })))
})

directions.get("/:id", async (c) => {
    const fixed = FIXED_ROUTES.find((r) => r.id === c.req.param("id"))
    if (!fixed) {
        return c.json({ error: "Unknown route" }, 404)
    }

    try {
        const route = await getDirections(fixed.fromPlaceId, fixed.toPlaceId)
        if (!route) {
            return c.json({ error: "No route found" }, 404)
        }
        return c.json({ name: fixed.name, ...route })
    } catch (err) {
        return c.json({ error: (err as Error).message }, 502)
    }
})

export default directions