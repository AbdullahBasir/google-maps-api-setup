import { googlePost } from "./google.js";

export type TravelMode = "DRIVE"

export type Directions = {
    distanceMeters: number
    duration: string
    polyline: { encodedPolyline: string }
}

export async function getDirections(fromPlaceId: string, toPlaceId: string): Promise<Directions | null> {
    const travelMode: TravelMode = "DRIVE"

    const data = await googlePost<{ routes: Directions[] }>(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
        {
            origin: { placeId: fromPlaceId },
            destination: { placeId: toPlaceId },
            travelMode,
        },
    )

    return data.routes?.[0] ?? null
}

