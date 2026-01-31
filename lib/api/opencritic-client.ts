import 'server-only';
import { createAPIClient } from './base-client';
import { appConfig } from '@/lib/dal/config';
import {
    OpenCriticGame,
    OpenCriticSearchResult,
    OpenCriticGameListItem
} from '@/lib/types/opencritic';

/** OpenCritic RapidAPI host */
const OPENCRITIC_RAPIDAPI_HOST = 'opencritic-api.p.rapidapi.com';

const openCriticClient = createAPIClient({
    baseUrl: `https://${OPENCRITIC_RAPIDAPI_HOST}`,
    defaultHeaders: {
        'Accept': 'application/json',
        'X-RapidAPI-Host': OPENCRITIC_RAPIDAPI_HOST,
        'X-RapidAPI-Key': appConfig.opencritic.rapidApiKey,
    },
});

/**
 * Search for games by name
 * Endpoint: GET /game/search?criteria={query}
 */
export async function searchOpenCritic(query: string): Promise<OpenCriticSearchResult[]> {
    return openCriticClient<OpenCriticSearchResult[]>({
        endpoint: '/game/search',
        params: { criteria: query },
    });
}

/**
 * Fetch game details by ID
 * Endpoint: GET /game/{id}
 */
export async function getOpenCriticGame(gameId: number): Promise<OpenCriticGame> {
    return openCriticClient<OpenCriticGame>({
        endpoint: `/game/${gameId}`,
    });
}

/**
 * Fetch popular games
 * Endpoint: GET /game/popular
 */
export async function getOpenCriticPopularGames(): Promise<OpenCriticGameListItem[]> {
    return openCriticClient<OpenCriticGameListItem[]>({
        endpoint: '/game/popular',
    });
}

/**
 * Fetch recently released games
 * Endpoint: GET /game/recently-released
 */
export async function getOpenCriticRecentlyReleased(): Promise<OpenCriticGameListItem[]> {
    return openCriticClient<OpenCriticGameListItem[]>({
        endpoint: '/game/recently-released',
    });
}
