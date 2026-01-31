import { RatingAdapter, RatingData } from "@/lib/types/ratings";
import { SearchAdapter, SearchResult } from "@/lib/types/search";
import { GameSourceInfo } from "@/lib/types/game";
import { BaseAdapter } from "./base-adapter";
import { parseDate, calculateSearchScore } from "./adapter-utils";
import { formatImageUrl } from "@/lib/utils";
import {
    searchOpenCritic,
    getOpenCriticGame,
    getOpenCriticPopularGames,
    getOpenCriticRecentlyReleased,
} from "@/lib/api/opencritic-client";
import {
    OpenCriticGame,
    OpenCriticSearchResult,
    OpenCriticGameListItem,
} from "@/lib/types/opencritic";
import { NAME_SEARCH_LIMIT } from "@/lib/constants";

/** Base URL for OpenCritic images */
const OPENCRITIC_IMAGE_BASE = 'https://img.opencritic.com/';

/** Max results to enrich with full game details */
const ENRICH_LIMIT = 5;

export class OpencriticAdapter extends BaseAdapter implements RatingAdapter, SearchAdapter {
    name = "OpenCritic";

    // --- Search Implementation ---
    async search(query: string): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const results = await searchOpenCritic(query);

                // Score and sort results by relevance, take top N
                const scoredResults = results
                    .map(game => ({
                        game,
                        score: calculateSearchScore(query, game.name),
                    }))
                    .filter(({ score }) => score >= 50)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, ENRICH_LIMIT);

                // Enrich top results with full game details (to get release dates)
                const enrichedResults = await Promise.all(
                    scoredResults.map(async ({ game }) => {
                        try {
                            const fullGame = await getOpenCriticGame(game.id);
                            if (fullGame) {
                                return this.mapFullGameToSearchResult(fullGame);
                            }
                        } catch {
                            // Fall back to basic result if enrichment fails
                        }
                        return this.mapSearchResultToSearchResult(game);
                    })
                );

                this.logSearch(query, enrichedResults.length);
                return enrichedResults;
            },
            "Search Failed",
            []
        );
    }

    async getGameDetails(
        sourceIds: Record<string, string | number>,
        name?: string
    ): Promise<GameSourceInfo | null> {
        return this.handleError(
            async () => {
                const openCriticId = sourceIds.OpenCritic;

                // Only fetch if we have an OpenCritic ID from the search phase
                // This prevents unnecessary search API calls (25/day limit on free tier)
                if (!openCriticId) {
                    this.logDetailsFetch(name || "unknown", false);
                    return null;
                }

                const game = await getOpenCriticGame(Number(openCriticId));

                if (!game) {
                    this.logDetailsFetch(openCriticId, false);
                    return null;
                }

                const ratings = this.extractRatings(game);
                this.logDetailsFetch(game.id, true);

                return {
                    sourceName: "OpenCritic",
                    name: game.name,
                    description: game.description,
                    coverUrl: this.extractCoverUrl(game),
                    screenshots: this.extractScreenshots(game),
                    ratings,
                    releaseDate: this.formatDate(game.firstReleaseDate),
                    developer: this.extractDeveloper(game),
                };
            },
            "Details Fetch Failed",
            null
        );
    }

    // --- Popular & New Implementation ---
    async getPopularGames(): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const games = await getOpenCriticPopularGames();
                return games.map(game => this.mapListItemToSearchResult(game));
            },
            "Popular Games Fetch Failed",
            []
        );
    }

    async getNewGames(): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const games = await getOpenCriticRecentlyReleased();
                return games.map(game => this.mapListItemToSearchResult(game));
            },
            "New Games Fetch Failed",
            []
        );
    }

    // --- Rating Implementation ---
    async getGameRatings(gameId: string | number): Promise<RatingData[]> {
        const game = await getOpenCriticGame(Number(gameId));
        if (!game) return [];
        return this.extractRatings(game);
    }

    // --- Private Helper Methods ---



    private extractRatings(game: OpenCriticGame): RatingData[] {
        const ratings: RatingData[] = [];
        const gameUrl = game.url || `https://opencritic.com/game/${game.id}`;

        if (game.topCriticScore && game.topCriticScore > 0) {
            ratings.push({
                sourceName: "OpenCritic Top Critics",
                score: Math.round(game.topCriticScore),
                count: game.numTopCriticReviews || 0,
                url: gameUrl,
                summary: "Average score from top gaming publications.",
            });
        }

        if (game.medianScore && game.medianScore > 0) {
            ratings.push({
                sourceName: "OpenCritic Median",
                score: Math.round(game.medianScore),
                count: game.numReviews || 0,
                url: gameUrl,
                summary: "Median score from all critic reviews.",
            });
        }

        if (game.percentRecommended && game.percentRecommended > 0) {
            ratings.push({
                sourceName: "OpenCritic Recommended",
                score: Math.round(game.percentRecommended),
                count: game.numReviews || 0,
                url: gameUrl,
                summary: "Percentage of critics who recommend this game.",
            });
        }

        return ratings;
    }

    private extractCoverUrl(game: OpenCriticGame): string | undefined {
        // Priority: square > box > masthead from images attribute
        const imagePath =
            game.images?.square?.og ||
            game.images?.box?.og ||
            game.images?.masthead?.og;

        return imagePath ? this.formatOpenCriticImageUrl(imagePath) : undefined;
    }

    private extractScreenshots(game: OpenCriticGame): { id: string | number; url: string }[] {
        if (!game.images?.screenshots) return [];

        return game.images.screenshots
            .filter(s => s.og || s.sm)
            .map((s, index) => ({
                id: s._id || `oc-screenshot-${index}`,
                url: this.formatOpenCriticImageUrl(s.og || s.sm || ''),
            }));
    }

    private extractDeveloper(game: OpenCriticGame): string | undefined {
        const developer = game.Companies?.find(c => c.type === 'DEVELOPER');
        return developer?.name;
    }

    private formatDate(dateString?: string): string | undefined {
        if (!dateString) return undefined;
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return undefined;
        }
    }

    /**
     * Converts OpenCritic relative image paths to full URLs.
     * Handles both relative paths (e.g., "game/123/o/image.jpg") and absolute URLs.
     */
    private formatOpenCriticImageUrl(path: string): string {
        if (!path) return '';

        // If already a full URL, pass through to global formatter
        const fullPath = path.startsWith('http') || path.startsWith('//')
            ? path
            : `${OPENCRITIC_IMAGE_BASE}${path}`;

        return formatImageUrl(fullPath);
    }

    private mapSearchResultToSearchResult(game: OpenCriticSearchResult): SearchResult {
        return this.createSearchResult(game, {
            sourceName: "OpenCritic",
            getId: (g) => g.id,
            getName: (g) => g.name,
        });
    }

    private mapListItemToSearchResult(game: OpenCriticGameListItem): SearchResult {
        return this.createSearchResult(game, {
            sourceName: "OpenCritic",
            getId: (g) => g.id,
            getName: (g) => g.name,
            getCoverUrl: (g) => {
                const imagePath = g.images?.square?.og || g.images?.box?.og;
                return imagePath ? this.formatOpenCriticImageUrl(imagePath) : undefined;
            },
            getReleaseDate: (g) => this.formatDate(g.firstReleaseDate),
            getRating: (g) => g.topCriticScore,
            getPlatforms: (g) => g.Platforms?.map(p => p.name) || [],
        });
    }

    /**
     * Maps a full OpenCritic game details response to SearchResult.
     * Used when enriching search results with full game details.
     */
    private mapFullGameToSearchResult(game: OpenCriticGame): SearchResult {
        return this.createSearchResult(game, {
            sourceName: "OpenCritic",
            getId: (g) => g.id,
            getName: (g) => g.name,
            getCoverUrl: (g) => this.extractCoverUrl(g),
            getReleaseDate: (g) => this.formatDate(g.firstReleaseDate),
            getRating: (g) => g.topCriticScore,
            getPlatforms: (g) => g.Platforms?.map(p => p.name) || [],
        });
    }
}
