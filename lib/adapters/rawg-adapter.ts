import { SearchResult } from "@/lib/types/search";
import { GameSourceInfo } from "@/lib/types/game";
import { fetchRAWG } from "@/lib/api/rawg-client";
import { RAWGGame, RAWGSearchResponse } from "@/lib/types/rawg";
import { RatingData } from "@/lib/types/ratings";
import { BaseAdapter } from "./base-adapter";
import { parseDate } from "./adapter-utils";
import { formatImageUrl } from "@/lib/utils";
import {
    SEARCH_PAGE_SIZE_RAWG,
    NAME_SEARCH_LIMIT,
    POPULAR_GAMES_LIMIT,
    NEW_GAMES_LIMIT,
    RATING_NORMALIZED_SCALE,
    RATING_RAWG_SCALE
} from "@/lib/constants";

export class RawgAdapter extends BaseAdapter {
    name = "RAWG";

    async search(query: string): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const data = await fetchRAWG<RAWGSearchResponse>("/games", {
                    search: query,
                    page_size: SEARCH_PAGE_SIZE_RAWG.toString()
                });

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
                    game = await fetchRAWG<RAWGGame>(`/games/${rawgId}`);
                } else if (name) {
                    // Fallback: search by name and match
                    game = await this.findGameByNameAndDate(name, releaseDate);

                    if (game) {
                        game = await fetchRAWG<RAWGGame>(`/games/${game.id}`);
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
                    developer: game.developers?.[0]?.name
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
        const searchData = await fetchRAWG<RAWGSearchResponse>("/games", {
            search: name,
            page_size: NAME_SEARCH_LIMIT.toString()
        });

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
                score: Math.round(game.rating * (RATING_NORMALIZED_SCALE / RATING_RAWG_SCALE)), // Normalize 0-5 to 0-100
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
            getRating: (g) => g.metacritic || (g.rating ? g.rating * (RATING_NORMALIZED_SCALE / RATING_RAWG_SCALE) : undefined),
            getPlatforms: (g) => g.platforms?.map(p => p.platform.name) || []
        });
    }

    /**
     * Fetches screenshots for a game
     */
    private async fetchScreenshots(gameId: number): Promise<{ id: number; url: string }[]> {
        try {
            const screenshotData = await fetchRAWG<{ results: { id: number; image: string }[] }>(
                `/games/${gameId}/screenshots`
            );
            return screenshotData.results.map(s => ({
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
                const data = await fetchRAWG<RAWGSearchResponse>("/games", {
                    ordering: "-metacritic",
                    page_size: limit.toString()
                });

                return data.results.map(game => this.mapToSearchResult(game));
            },
            "Popular Games Fetch Failed",
            []
        );
    }

    async getNewGames(limit = NEW_GAMES_LIMIT): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const data = await fetchRAWG<RAWGSearchResponse>("/games", {
                    ordering: "-released",
                    page_size: limit.toString()
                });

                return data.results.map(game => this.mapToSearchResult(game));
            },
            "New Games Fetch Failed",
            []
        );
    }
}
