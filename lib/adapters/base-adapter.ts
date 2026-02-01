import { SearchResult } from "@/lib/types/search";
import { GameSourceInfo } from "@/lib/types/game";
import { GameAdapter } from "@/lib/types/adapter";
import { matchesByNameAndDate, parseDate } from "@/lib/adapters/adapter-utils";
import { DAYS_IN_MONTH } from "@/lib/constants";

/**
 * Abstract base class for game data source adapters.
 * Provides common functionality and utilities for all adapters.
 * 
 * Subclasses must implement:
 * - search(): Search for games
 * - getGameDetails(): Fetch detailed game information
 * - getPopularGames(): Fetch popular games
 * - getNewGames(): Fetch new games
 */
export abstract class BaseAdapter implements GameAdapter {
    abstract name: string;
    abstract search(query: string): Promise<SearchResult[]>;
    abstract getGameDetails(
        sourceIds: Record<string, string | number>,
        name?: string,
        releaseDate?: string
    ): Promise<GameSourceInfo | null>;

    abstract getPopularGames(limit?: number): Promise<SearchResult[]>;
    abstract getNewGames(limit?: number): Promise<SearchResult[]>;

    /**
     * Wraps adapter operations with standardized error handling
     * @param operation The async operation to execute
     * @param errorMessage Message to log on error
     * @param fallback Fallback value to return on error
     * @protected
     */
    protected async handleError<T>(
        operation: () => Promise<T>,
        errorMessage: string,
        fallback: T
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            console.error(`${this.name} ${errorMessage}: `, error);
            return fallback;
        }
    }

    /**
     * Finds a game in a list that matches the given name and optional release date
     * @param games Array of games to search
     * @param targetName Name to match
     * @param targetReleaseDate Optional release date to match
     * @param getGameName Function to extract name from game object
     * @param getGameDate Function to extract date from game object
     * @param dateToleranceDays Number of days tolerance for date matching
     * @protected
     */
    protected findMatchingGame<T>(
        games: T[],
        targetName: string,
        targetReleaseDate: string | undefined,
        getGameName: (game: T) => string,
        getGameDate: (game: T) => Date | null,
        dateToleranceDays: number = DAYS_IN_MONTH
    ): T | null {
        const targetDate = parseDate(targetReleaseDate);

        return games.find(game => {
            const gameName = getGameName(game);
            const gameDate = getGameDate(game);

            return matchesByNameAndDate(
                targetName,
                targetDate,
                gameName,
                gameDate,
                dateToleranceDays
            );
        }) || null;
    }

    /**
     * Logs a search operation
     * @param query The search query
     * @param resultCount Number of results found
     * @protected
     */
    protected logSearch(query: string, resultCount: number): void {
        console.log(`${this.name}: Searched for "${query}", found ${resultCount} results`);
    }

    /**
     * Logs a details fetch operation
     * @param identifier Game identifier (ID or name)
     * @param success Whether the fetch was successful
     * @protected
     */
    protected logDetailsFetch(identifier: string | number, success: boolean): void {
        const status = success ? "Successfully fetched" : "Failed to fetch";
        console.log(`${this.name}: ${status} details for ${identifier}`);
    }

    /**
     * Creates a SearchResult object from source-specific game data
     * This method eliminates duplication by providing a standard pattern for transforming
     * API responses into the common SearchResult interface.
     * 
     * @param sourceData The raw game data from the API
     * @param config Configuration object with accessor functions for extracting data
     * @returns A properly formatted SearchResult object
     * @protected
     */
    protected createSearchResult<T>(
        sourceData: T,
        config: {
            sourceName: string;
            getId: (data: T) => string | number;
            getName: (data: T) => string;
            getCoverUrl?: (data: T) => string | undefined;
            getReleaseDate?: (data: T) => string | undefined;
            getRating?: (data: T) => number | undefined;
            getPlatforms?: (data: T) => string[];
            getReleaseType?: (data: T) => 'BASE_GAME' | 'DLC' | 'BUNDLE' | 'EXPANSION' | 'UNKNOWN';
        }
    ): SearchResult {
        return {
            sourceIds: { [config.sourceName]: config.getId(sourceData) },
            name: config.getName(sourceData),
            coverUrl: config.getCoverUrl?.(sourceData),
            coverSource: config.getCoverUrl?.(sourceData) ? config.sourceName : undefined,
            releaseDate: config.getReleaseDate?.(sourceData),
            rating: config.getRating?.(sourceData),
            sources: [config.sourceName],
            platforms: config.getPlatforms?.(sourceData) || [],
            releaseType: config.getReleaseType?.(sourceData)
        };
    }
}
