import { CACHE_REVALIDATE_SECONDS } from "@/lib/constants";
import { appConfig } from "@/lib/dal/config";

const RAWG_API_KEY = appConfig.rawg.apiKey;

export async function fetchRAWG<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
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
