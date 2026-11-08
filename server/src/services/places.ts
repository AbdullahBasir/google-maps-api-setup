import { googlePost } from './google.js'

export type Place = {
    displayName: { text: string }
    formattedAddress: string
    location: { latitude: number; longitude: number }
}

export async function searchPlaces(query: string): Promise<Place[]> {
    const data = await googlePost<{ places?: Place[] }>(
        'https://places.googleapis.com/v1/places:searchText',
        'places.displayName,places.formattedAddress,places.location',
        { textQuery: query },
    )
    return data.places ?? []
}