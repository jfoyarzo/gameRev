import { cache } from "react";
import { GameAdapter } from "../types/adapter";
import { UnifiedGameData, GameSourceInfo } from "../types/game";
import { SearchResult } from "../types/search";

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
                // Prefer IGDB as primary source if available
                if (res.sourceName === "IGDB") {
                    primaryResult = res;
                }
            }
        });

        // If IGDB is not available or didn't return data, pick the first one that did
        if (!primaryResult) {
            primaryResult = results.find(r => r !== null) || null;
        }

        if (!primaryResult) return null;

        // Merge logic
        const unified: UnifiedGameData = {
            sourceIds,
            name: primaryResult.name || name || "Unknown Game",
            mainCoverUrl: primaryResult.coverUrl || results.find(r => r?.coverUrl)?.coverUrl || "/placeholder-game.jpg",
            mainDescription: primaryResult.description || results.find(r => r?.description)?.description,
            releaseDate: primaryResult.releaseDate || results.find(r => r?.releaseDate)?.releaseDate,
            developer: primaryResult.developer || results.find(r => r?.developer)?.developer,
            sources,
            primarySource: primaryResult.sourceName
        };

        return unified;
    });

    async getPopularGames(limit?: number): Promise<SearchResult[]> {
        // Prefer IGDB for popular games lists if available
        const igdbAdapter = this.adapters.find(a => a.name === "IGDB");
        if (igdbAdapter) {
            return igdbAdapter.getPopularGames(limit);
        }

        // Fallback to first adapter
        if (this.adapters.length > 0) {
            return this.adapters[0].getPopularGames(limit);
        }

        return [];
    }

    async getNewGames(limit?: number): Promise<SearchResult[]> {
        // Prefer IGDB for new releases lists if available
        const igdbAdapter = this.adapters.find(a => a.name === "IGDB");
        if (igdbAdapter) {
            return igdbAdapter.getNewGames(limit);
        }

        // Fallback to first adapter
        if (this.adapters.length > 0) {
            return this.adapters[0].getNewGames(limit);
        }

        return [];
    }
}
