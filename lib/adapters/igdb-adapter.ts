import { RatingAdapter, RatingData } from "@/lib/types/ratings";
import { SearchAdapter, SearchResult } from "@/lib/types/search";
import {
    searchIGDBGames,
    getIGDBGameById,
    getIGDBGameRatings,
    getIGDBPopularGames,
    getIGDBNewGames
} from "@/lib/api/igdb-client";
import { IGDBGame } from "@/lib/types/igdb";
import { GameSourceInfo } from "@/lib/types/game";
import { BaseAdapter } from "./base-adapter";
import { unixToISODate, parseDate } from "./adapter-utils";
import { formatImageUrl } from "@/lib/utils";
import {
    AdapterName,
    NAME_SEARCH_LIMIT,
    POPULAR_GAMES_LIMIT,
    NEW_GAMES_LIMIT
} from "@/lib/constants";

/** Number of results per page for search requests */
const SEARCH_PAGE_SIZE = 20;

// IGDB Game Types
const IGDB_GAME_TYPE_MAIN = 0;
const IGDB_GAME_TYPE_DLC = 1;
const IGDB_GAME_TYPE_EXPANSION = 2;
const IGDB_GAME_TYPE_BUNDLE = 3;
const IGDB_GAME_TYPE_STANDALONE_EXPANSION = 4;
/*
// Not used yet
const IGDB_GAME_TYPE_MOD = 5;
const IGDB_GAME_TYPE_EPISODE = 6;
const IGDB_GAME_TYPE_SEASON = 7;
const IGDB_GAME_TYPE_REMAKE = 8;
const IGDB_GAME_TYPE_REMASTER = 9;
const IGDB_GAME_TYPE_EXPANDED_GAME = 10;
const IGDB_GAME_TYPE_PORT = 11;
const IGDB_GAME_TYPE_FORK = 12;
const IGDB_GAME_TYPE_PACK = 13;
const IGDB_GAME_TYPE_UPDATE = 14;
*/


export class IgdbAdapter extends BaseAdapter implements RatingAdapter, SearchAdapter {
    name: AdapterName = "IGDB";

    // --- Search Implementation ---
    async search(query: string): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const games = await searchIGDBGames(query, SEARCH_PAGE_SIZE);

                const results = games.map(game => this.mapToSearchResult(game));

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
                let game: IGDBGame | null = null;
                const igdbId = sourceIds.IGDB;

                if (igdbId) {
                    // Fetch by ID
                    game = await getIGDBGameById(igdbId);
                } else if (name) {
                    // Fallback: search by name and match
                    game = await this.findGameByNameAndDate(name, releaseDate);

                    if (game) {
                        // Recursive call with the found ID for complete data
                        return this.getGameDetails({ IGDB: game.id });
                    }
                }

                if (!game) {
                    this.logDetailsFetch(igdbId || name || "unknown", false);
                    return null;
                }

                const ratings = await this.getGameRatings(game.id);

                this.logDetailsFetch(game.id, true);

                const releaseType = this.mapGameTypeToReleaseType(game.game_type);

                return {
                    sourceName: "IGDB",
                    name: game.name,
                    description: game.summary,
                    coverUrl: formatImageUrl(game.cover?.url, {
                        replaceThumbnail: "t_720p"
                    }),
                    screenshots: game.screenshots?.map(s => ({
                        id: s.id,
                        url: formatImageUrl(s.url, {
                            replaceThumbnail: "t_720p"
                        })
                    })),
                    ratings,
                    releaseDate: unixToISODate(game.first_release_date),
                    developer: game.involved_companies?.[0]?.company?.name,
                    platforms: game.platforms?.map(p => p.name) || [],
                    releaseType
                };
            },
            "Details Fetch Failed",
            null
        );
    }

    // --- IGDB-Specific Methods ---

    /**
     * Finds a game by name with optional date matching for verification
     */
    private async findGameByNameAndDate(
        name: string,
        releaseDate?: string
    ): Promise<IGDBGame | null> {
        const games = await searchIGDBGames(name, NAME_SEARCH_LIMIT);

        return this.findMatchingGame(
            games,
            name,
            releaseDate,
            (game) => game.name,
            (game) => parseDate(unixToISODate(game.first_release_date))
        );
    }

    // --- Rating Implementation ---
    async getGameRatings(gameId: string | number): Promise<RatingData[]> {
        const game = await getIGDBGameRatings(gameId);

        if (!game) return [];

        const ratings: RatingData[] = [];

        this.addRating(ratings, {
            score: game.total_rating,
            count: game.total_rating_count,
            sourceName: "IGDB Aggregate",
            url: game.url,
            summary: "Weighted average of critic and user scores."
        });

        this.addRating(ratings, {
            score: game.aggregated_rating,
            count: game.aggregated_rating_count,
            sourceName: "IGDB Critics",
            url: game.url,
            summary: "Aggregated score from external critics (Ign, GameSpot, etc)."
        });

        this.addRating(ratings, {
            score: game.rating,
            count: game.rating_count,
            sourceName: "IGDB Users",
            url: game.url,
            summary: "Average score submitted by IGDB community members."
        });

        return ratings;
    }

    private addRating(
        ratings: RatingData[],
        data: {
            score: number | undefined;
            count: number | undefined;
            sourceName: string;
            url: string | undefined;
            summary: string;
        }
    ) {
        if (data.score) {
            ratings.push({
                sourceName: data.sourceName,
                score: Math.round(data.score),
                count: data.count || 0,
                url: data.url,
                summary: data.summary,
            });
        }
    }

    // --- Popular & New Implementation ---
    async getPopularGames(limit = POPULAR_GAMES_LIMIT): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const games = await getIGDBPopularGames(limit);
                return games.map(game => this.mapToSearchResult(game));
            },
            "Popular Games Fetch Failed",
            []
        );
    }

    async getNewGames(limit = NEW_GAMES_LIMIT): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const games = await getIGDBNewGames(limit);
                return games.map(game => this.mapToSearchResult(game));
            },
            "New Games Fetch Failed",
            []
        );
    }

    /**
     * Maps an IGDB game object to a SearchResult
     */
    private mapToSearchResult(game: IGDBGame): SearchResult {
        return this.createSearchResult(game, {
            sourceName: "IGDB",
            getId: (g) => g.id,
            getName: (g) => g.name,
            getCoverUrl: (g) => formatImageUrl(g.cover?.url, {
                replaceThumbnail: "t_720p"
            }),
            getReleaseDate: (g) => unixToISODate(g.first_release_date),
            getRating: (g) => g.total_rating,
            getPlatforms: (g) => g.platforms?.map(p => p.name) || [],
            getReleaseType: (g) => this.mapGameTypeToReleaseType(g.game_type)
        });
    }

    private mapGameTypeToReleaseType(gameType?: number): "BASE_GAME" | "DLC" | "BUNDLE" | "EXPANSION" | "UNKNOWN" {
        if (gameType === undefined) return "UNKNOWN";

        switch (gameType) {
            case IGDB_GAME_TYPE_MAIN:
                return "BASE_GAME";
            case IGDB_GAME_TYPE_DLC:
                return "DLC";
            case IGDB_GAME_TYPE_EXPANSION:
            case IGDB_GAME_TYPE_STANDALONE_EXPANSION:
                return "EXPANSION";
            case IGDB_GAME_TYPE_BUNDLE:
                return "BUNDLE";
            default:
                return "UNKNOWN";
        }
    }
}
