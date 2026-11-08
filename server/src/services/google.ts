export async function googlePost<T>(url: string, fieldMask: string, body: unknown): Promise<T> {
    const key = process.env.MAPS_API_KEY
    if (!key) {
        throw new Error("MAPS_API_KEY not set")
    }

    const res = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.error?.message ?? `Google returned ${res.status}`)
    }

    return data as T
}