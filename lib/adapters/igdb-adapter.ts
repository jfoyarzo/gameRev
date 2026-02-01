import { RatingAdapter, RatingData } from "@/lib/types/ratings";
import { SearchAdapter, SearchResult } from "@/lib/types/search";
import { fetchIGDB } from "@/lib/api/igdb-client";
import { IGDBGame } from "@/lib/types/igdb";
import { GameSourceInfo } from "@/lib/types/game";
import { BaseAdapter } from "./base-adapter";
import { unixToISODate, parseDate } from "./adapter-utils";
import { formatImageUrl } from "@/lib/utils";
import {
    NAME_SEARCH_LIMIT,
    POPULAR_GAMES_LIMIT,
    NEW_GAMES_LIMIT,
    ONE_SECOND_MS,
    SEARCH_PAGE_SIZE_IGDB,
    IGDB_GAME_TYPE_MAIN,
    IGDB_GAME_TYPE_DLC,
    IGDB_GAME_TYPE_EXPANSION,
    IGDB_GAME_TYPE_BUNDLE,
    IGDB_GAME_TYPE_STANDALONE_EXPANSION
} from "@/lib/constants";

export class IgdbAdapter extends BaseAdapter implements RatingAdapter, SearchAdapter {
    name = "IGDB";

    // --- Search Implementation ---
    async search(query: string): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const games = await this.fetchGamesBySearch(query);

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
                    game = await this.fetchGameById(igdbId);
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
     * Fetches a game by its IGDB ID
     */
    private async fetchGameById(igdbId: string | number): Promise<IGDBGame | null> {
        const query = `
            fields name, cover.url, summary, first_release_date, involved_companies.company.name, screenshots.url,
                   total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, rating, rating_count, url,
                   platforms.name, game_type;
            where id = ${igdbId};
        `;
        const games = await fetchIGDB<IGDBGame[]>("/games", query);
        return games[0] || null;
    }

    /**
     * Finds a game by name with optional date matching for verification
     */
    private async findGameByNameAndDate(
        name: string,
        releaseDate?: string
    ): Promise<IGDBGame | null> {
        const games = await this.fetchGamesBySearch(name, NAME_SEARCH_LIMIT);

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
        const query = `
            fields total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, rating, rating_count, url;
            where id = ${gameId};
        `;

        const games = await fetchIGDB<IGDBGame[]>("/games", query);
        const game = games[0];

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
                const query = `
                    fields name, cover.url, total_rating, first_release_date, platforms.name, game_type;
                    sort popularity desc;
                    where cover != null & total_rating != null;
                    limit ${limit};
                `;

                const games = await fetchIGDB<IGDBGame[]>("/games", query);
                return games.map(game => this.mapToSearchResult(game));
            },
            "Popular Games Fetch Failed",
            []
        );
    }

    async getNewGames(limit = NEW_GAMES_LIMIT): Promise<SearchResult[]> {
        return this.handleError(
            async () => {
                const currentTimestamp = Math.floor(Date.now() / ONE_SECOND_MS);
                const query = `
                    fields name, cover.url, total_rating, first_release_date, platforms.name, game_type;
                    sort first_release_date desc;
                    where first_release_date < ${currentTimestamp} & cover != null & total_rating != null;
                    limit ${limit};
                `;

                const games = await fetchIGDB<IGDBGame[]>("/games", query);
                return games.map(game => this.mapToSearchResult(game));
            },
            "New Games Fetch Failed",
            []
        );
    }

    /**
     * Searches for games on IGDB
     */
    private async fetchGamesBySearch(query: string, limit = SEARCH_PAGE_SIZE_IGDB): Promise<IGDBGame[]> {
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
