import 'server-only';
import { CACHE_TAG_GAMES } from "@/lib/constants";
import { createAPIClient } from "./base-client";
import { appConfig } from "@/lib/dal/config";
import { RAWGGame, RAWGSearchResponse } from "@/lib/types/rawg";

const RAWG_API_KEY = appConfig.rawg.apiKey;

const rawgClient = createAPIClient({
    baseUrl: appConfig.rawg.baseUrl,
});

/**
 * Generic fetcher for RAWG API
 */
async function fetchRAWG<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    return rawgClient<T>({
        endpoint,
        params: {
            ...params,
            key: RAWG_API_KEY,
        },
        tags: [CACHE_TAG_GAMES],
    });
}

/**
 * Search for games
 */
export async function searchRAWGGames(query: string, pageSize: number): Promise<RAWGSearchResponse> {
    return fetchRAWG<RAWGSearchResponse>("/games", {
        search: query,
        page_size: pageSize.toString(),
    });
}

/**
 * Get game details by ID
 */
export async function getRAWGGameDetails(id: number | string): Promise<RAWGGame> {
    return fetchRAWG<RAWGGame>(`/games/${id}`);
}

/**
 * Get game screenshots
 */
export async function getRAWGScreenshots(id: number | string): Promise<{ id: number; image: string }[]> {
    const data = await fetchRAWG<{ results: { id: number; image: string }[] }>(`/games/${id}/screenshots`);
    return data.results;
}

/**
 * Get games ranked by a specific criteria (e.g. -metacritic, -released)
 */
export async function getRAWGRankedGames(ordering: string, limit: number): Promise<RAWGSearchResponse> {
    return fetchRAWG<RAWGSearchResponse>("/games", {
        ordering,
        page_size: limit.toString(),
    });
}
