import { cache } from "react";
import { GameAdapter } from "../types/adapter";
import { UnifiedGameData, GameSourceInfo } from "../types/game";
import { SearchResult } from "../types/search";

const PRIMARY_SOURCE_NAME = "IGDB";
const DEFAULT_COVER_IMAGE = "/placeholder-game.jpg";
const DEFAULT_GAME_NAME = "Unknown Game";

export class GameService {
    private adapters: GameAdapter[] = [];

    constructor(initialAdapters: GameAdapter[] = []) {
        this.adapters = initialAdapters;
    }

    registerAdapter(adapter: GameAdapter) {
        this.adapters.push(adapter);
    }

    /**
     * Fetches unified game data from all registered adapters.
     * Uses React cache() to deduplicate calls within the same request
     * (e.g., when both generateMetadata() and page component fetch the same game).
     */
    getGame = cache(async (sourceIds: Record<string, string | number>, name?: string, releaseDate?: string): Promise<UnifiedGameData | null> => {
        // Fetch from all adapters in parallel
        // We pass the sourceIds map and releaseDate for verification.
        const promises = this.adapters.map(adapter => adapter.getGameDetails(sourceIds, name, releaseDate));
        const results = await Promise.all(promises);

        const sources: Record<string, GameSourceInfo> = {};
        let primaryResult: GameSourceInfo | null = null;

        results.forEach(res => {
            if (res) {
                sources[res.sourceName] = res;
                // Prefer primary source if available
                if (res.sourceName === PRIMARY_SOURCE_NAME) {
                    primaryResult = res;
                }
            }
        });

        // Debug logging to track which sources contributed
        const contributedSources = Object.keys(sources);
        if (contributedSources.length > 0) {
            console.log(`[GameService] Merged data from sources: ${contributedSources.join(', ')} for game "${name || 'unknown'}"`);
        }

        // If primary source is not available or didn't return data, pick the first one that did
        if (!primaryResult) {
            primaryResult = results.find(r => r !== null) || null;
        }

        if (!primaryResult) return null;

        // Merge logic
        const unified: UnifiedGameData = {
            sourceIds,
            name: primaryResult.name || name || DEFAULT_GAME_NAME,
            mainCoverUrl: primaryResult.coverUrl || results.find(r => r?.coverUrl)?.coverUrl || DEFAULT_COVER_IMAGE,
            mainDescription: primaryResult.description || results.find(r => r?.description)?.description,
            releaseDate: primaryResult.releaseDate || results.find(r => r?.releaseDate)?.releaseDate,
            developer: primaryResult.developer || results.find(r => r?.developer)?.developer,
            sources,
            primarySource: primaryResult.sourceName
        };

        return unified;
    });

    /**
     * Fetches popular games from the primary adapter, with fallback to first available.
     */
    async getPopularGames(limit?: number): Promise<SearchResult[]> {
        const primaryAdapter = this.adapters.find(a => a.name === PRIMARY_SOURCE_NAME);
        if (primaryAdapter) {
            return primaryAdapter.getPopularGames(limit);
        }

        // Fallback to first adapter
        if (this.adapters.length > 0) {
            return this.adapters[0].getPopularGames(limit);
        }

        return [];
    }

    /**
     * Fetches new game releases from the primary adapter, with fallback to first available.
     */
    async getNewGames(limit?: number): Promise<SearchResult[]> {
        const primaryAdapter = this.adapters.find(a => a.name === PRIMARY_SOURCE_NAME);
        if (primaryAdapter) {
            return primaryAdapter.getNewGames(limit);
        }

        // Fallback to first adapter
        if (this.adapters.length > 0) {
            return this.adapters[0].getNewGames(limit);
        }

        return [];
    }
}

// Create a singleton instance for the preload function
// Note: The actual instance is created in index.ts, this is just for the preload function signature
let _gameServiceInstance: GameService | null = null;

/**
 * Sets the game service instance for preloading.
 * Called internally by the services index.
 */
export function setGameServiceInstance(instance: GameService) {
    _gameServiceInstance = instance;
}

/**
 * Preload function for warming the cache before components render.
 * Use in Page components to initiate data fetching early and avoid waterfalls.
 */
export function preloadGame(
    sourceIds: Record<string, string | number>,
    name?: string,
    releaseDate?: string
): void {
    if (_gameServiceInstance) {
        void _gameServiceInstance.getGame(sourceIds, name, releaseDate);
    }
}
