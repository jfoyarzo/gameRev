import 'server-only';
import { CACHE_TAG_GAMES, ONE_MINUTE_MS, ONE_SECOND_MS } from "@/lib/constants";
import { createAPIClient } from "./base-client";
import { appConfig } from "@/lib/dal/config";
import { IGDBGame } from "@/lib/types/igdb";

const IGDB_CLIENT_ID = appConfig.twitch.clientId;
const IGDB_CLIENT_SECRET = appConfig.twitch.clientSecret;

// Basic in-memory token cache
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getValidToken(): Promise<string> {
    const now = Date.now();
    if (accessToken && tokenExpiry && now < tokenExpiry) {
        return accessToken;
    }

    const tokenUrl = `https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`;

    try {
        const response = await fetch(tokenUrl, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to fetch IGDB token');

        const data: { access_token: string; expires_in: number } = await response.json();
        accessToken = data.access_token;
        // Buffer 1 min before expiry
        tokenExpiry = now + (data.expires_in * ONE_SECOND_MS) - ONE_MINUTE_MS;
        return accessToken;
    } catch (error) {
        console.error('IGDB Token Error:', error);
        throw error;
    }
}

// Custom client creation to include async auth injection
const igdbClient = createAPIClient({
    baseUrl: appConfig.igdb.baseUrl,
    defaultHeaders: {
        'Client-ID': IGDB_CLIENT_ID,
        'Accept': 'application/json',
    },
});

/**
 * Generic fetcher for IGDB API that handles authentication
 */
async function fetchIGDB<T>(endpoint: string, queryBody: string): Promise<T> {
    const token = await getValidToken();

    return igdbClient<T>({
        endpoint,
        method: 'POST',
        body: queryBody,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        tags: [CACHE_TAG_GAMES],
    });
}

/**
 * Search for games
 */
export async function searchIGDBGames(query: string, limit: number): Promise<IGDBGame[]> {
    // Sanitize query to prevent injection
    const sanitizedQuery = query.replace(/"/g, '\\"');

    const igdbQuery = `
        search "${sanitizedQuery}";
        fields name, cover.url, total_rating, summary, first_release_date, platforms.name, game_type;
        where cover != null;
        limit ${limit};
    `;

    return fetchIGDB<IGDBGame[]>("/games", igdbQuery);
}

/**
 * Get game details by ID
 */
export async function getIGDBGameById(id: number | string): Promise<IGDBGame | null> {
    const query = `
        fields name, cover.url, summary, first_release_date, involved_companies.company.name, screenshots.url,
               total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, rating, rating_count, url,
               platforms.name, game_type;
        where id = ${id};
    `;

    const games = await fetchIGDB<IGDBGame[]>("/games", query);
    return games[0] || null;
}

/**
 * Get game ratings details
 */
export async function getIGDBGameRatings(id: number | string): Promise<IGDBGame | null> {
    const query = `
        fields total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, rating, rating_count, url;
        where id = ${id};
    `;

    const games = await fetchIGDB<IGDBGame[]>("/games", query);
    return games[0] || null;
}

/**
 * Get popular games by rating/popularity
 */
export async function getIGDBPopularGames(limit: number): Promise<IGDBGame[]> {
    const query = `
        fields name, cover.url, total_rating, first_release_date, platforms.name, game_type;
        sort popularity desc;
        where cover != null & total_rating != null;
        limit ${limit};
    `;

    return fetchIGDB<IGDBGame[]>("/games", query);
}

/**
 * Get recently released games
 */
export async function getIGDBNewGames(limit: number): Promise<IGDBGame[]> {
    const currentTimestamp = Math.floor(Date.now() / ONE_SECOND_MS);

    const query = `
        fields name, cover.url, total_rating, first_release_date, platforms.name, game_type;
        sort first_release_date desc;
        where first_release_date < ${currentTimestamp} & cover != null & total_rating != null;
        limit ${limit};
    `;

    return fetchIGDB<IGDBGame[]>("/games", query);
}
