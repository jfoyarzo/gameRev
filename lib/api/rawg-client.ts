import { CACHE_REVALIDATE_SECONDS } from "@/lib/constants";

const RAWG_API_KEY = process.env.RAWG_API_KEY;

export async function fetchRAWG<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!RAWG_API_KEY) {
        console.warn("Missing RAWG_API_KEY in .env.local");
        // We throw an error instead of returning null to ensure the caller handles failure
        throw new Error("Missing RAWG_API_KEY in .env.local");
    }

    const queryParams = new URLSearchParams({
        ...params,
        key: RAWG_API_KEY,
    });

    const response = await fetch(`https://api.rawg.io/api${endpoint}?${queryParams.toString()}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
        // Cache the results for 1 hour
        next: { revalidate: CACHE_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`RAWG API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}
