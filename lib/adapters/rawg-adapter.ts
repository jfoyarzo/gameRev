import { SearchResult } from "@/lib/types/search";
import { GameSourceInfo } from "@/lib/types/game";
import {
    searchRAWGGames,
    getRAWGGameDetails,
    getRAWGScreenshots,
    getRAWGRankedGames
} from "@/lib/api/rawg-client";
import { RAWGGame } from "@/lib/types/rawg";
import { RatingData } from "@/lib/types/ratings";
import { BaseAdapter } from "./base-adapter";
import { parseDate, normalizeRating } from "./adapter-utils";
import { formatImageUrl } from "@/lib/utils";
import {
    NAME_SEARCH_LIMIT,
    POPULAR_GAMES_LIMIT,
    NEW_GAMES_LIMIT,
} from "@/lib/constants";

/** Maximum rating on RAWG's 0-5 scale */
const RATING_RAWG_SCALE = 5;

/** Number of results per page for search requests */
const SEARCH_PAGE_SIZE = 20;

export class RawgAdapter extends BaseAdapter {
    name = "RAWG";

    async search(query: string): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const data = await searchRAWGGames(query, SEARCH_PAGE_SIZE);

                const results = data.results.map(game => this.mapToSearchResult(game));

                this.logSearch(query, results.length);
                return results;
            },
            "Search Failed",
            []
        );
    }

    async getGameDetails(
        sourceIds: Record<string, string | number>,
        name?: string,
        releaseDate?: string
    ): Promise<GameSourceInfo | null> {
        return this.handleError(
            async () => {
                let game: RAWGGame | null = null;
                const rawgId = sourceIds.RAWG;

                if (rawgId) {
                    game = await getRAWGGameDetails(rawgId);
                } else if (name) {
                    // Fallback: search by name and match
                    game = await this.findGameByNameAndDate(name, releaseDate);

                    if (game) {
                        game = await getRAWGGameDetails(game.id);
                    }
                }

                if (!game) {
                    this.logDetailsFetch(rawgId || name || "unknown", false);
                    return null;
                }

                const ratings = this.buildRatings(game);
                const screenshots = await this.fetchScreenshots(game.id);

                this.logDetailsFetch(game.id, true);

                return {
                    sourceName: "RAWG",
                    name: game.name,
                    description: game.description_raw || game.description,
                    coverUrl: formatImageUrl(game.background_image),
                    screenshots,
                    ratings,
                    releaseDate: game.released,
                    developer: game.developers?.[0]?.name,
                    platforms: game.platforms?.map(p => p.platform.name) || [],
                    releaseType: (game.parents_count && game.parents_count > 0) ? "DLC" : "BASE_GAME"
                };
            },
            "Details Fetch Failed",
            null
        );
    }

    // --- RAWG-Specific Methods ---

    /**
     * Finds a game by name with optional date matching for verification
     */
    private async findGameByNameAndDate(
        name: string,
        releaseDate?: string
    ): Promise<RAWGGame | null> {
        const searchData = await searchRAWGGames(name, NAME_SEARCH_LIMIT);

        return this.findMatchingGame(
            searchData.results,
            name,
            releaseDate,
            (game) => game.name,
            (game) => parseDate(game.released)
        );
    }

    /**
     * Builds rating data from RAWG game information
     */
    private buildRatings(game: RAWGGame): RatingData[] {
        const ratings: RatingData[] = [];

        if (game.metacritic) {
            ratings.push({
                sourceName: "Metacritic",
                score: game.metacritic,
                summary: "Aggregated review score from critics.",
                url: `https://www.metacritic.com/search/game/${encodeURIComponent(game.name)}/results`
            });
        }

        if (game.rating) {
            ratings.push({
                sourceName: "RAWG Users",
                score: normalizeRating(game.rating, RATING_RAWG_SCALE),
                count: game.ratings_count,
                summary: "Average rating from RAWG community."
            });
        }

        return ratings;
    }

    /**
     * Maps a RAWG game object to a SearchResult
     */
    private mapToSearchResult(game: RAWGGame): SearchResult {
        return this.createSearchResult(game, {
            sourceName: "RAWG",
            getId: (g) => g.id,
            getName: (g) => g.name,
            getCoverUrl: (g) => formatImageUrl(g.background_image),
            getReleaseDate: (g) => g.released,
            getRating: (g) => g.metacritic || (g.rating ? normalizeRating(g.rating, RATING_RAWG_SCALE) : undefined),
            getPlatforms: (g) => g.platforms?.map(p => p.platform.name) || [],
            getReleaseType: (g) => (g.parents_count && g.parents_count > 0) ? "DLC" : "BASE_GAME"
        });
    }

    /**
     * Fetches screenshots for a game
     */
    private async fetchScreenshots(gameId: number): Promise<{ id: number; url: string }[]> {
        try {
            const results = await getRAWGScreenshots(gameId);
            return results.map(s => ({
                id: s.id,
                url: s.image
            }));
        } catch (error) {
            console.error(`${this.name} Screenshots Fetch Failed:`, error);
            return [];
        }
    }

    async getPopularGames(limit = POPULAR_GAMES_LIMIT): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const data = await getRAWGRankedGames("-metacritic", limit);
                return data.results.map(game => this.mapToSearchResult(game));
            },
            "Popular Games Fetch Failed",
            []
        );
    }

    async getNewGames(limit = NEW_GAMES_LIMIT): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const data = await getRAWGRankedGames("-released", limit);
                return data.results.map(game => this.mapToSearchResult(game));
            },
            "New Games Fetch Failed",
            []
        );
    }
}
