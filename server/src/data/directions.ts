export type FixedRoute = {
    id: string
    name: string
    fromPlaceId: string
    toPlaceId: string
}

export const FIXED_ROUTES: FixedRoute[] = [
    {
        id: "Al-Mouj-to-Wadi-Al-Khoud",
        name: "Al Mouj → Wadi Al-Khoud",
        fromPlaceId: "ChIJM8Stxdf9jT4R79M9vrLgyas",
        toPlaceId: "ChIJUUIcDADjjT4RjspS8dOhu0U", // Wadi Al Khoud وادي الخوض
    },
]