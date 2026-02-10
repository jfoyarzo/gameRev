import { SearchResult } from "./search";
import { GameSourceInfo } from "./game";
import { AdapterName } from "@/lib/constants";

/**
 * GameAdapter Interface
 * 
 * Defines the contract for all game data source adapters.
 * Each adapter represents a different source (e.g., IGDB, RAWG, Steam, etc.)
 * and provides standardized access to game data.
 * 
 * Implementation Guidelines:
 * - Extend BaseAdapter for common functionality
 * - Implement source-specific API calls
 * - Handle errors gracefully and return appropriate fallback values
 * - Use utility functions from adapter-utils.ts for common operations
 */
export interface GameAdapter {
    /**
     * The name of the data source (e.g., "IGDB", "RAWG")
     */
    name: AdapterName;

    /**
     * Searches for games matching the query
     * 
     * @param query Search query string
     * @returns Array of search results with basic game information
     */
    search(query: string): Promise<SearchResult[]>;

    /**
     * Fetches detailed game information from this specific source
     * 
     * This method supports two modes:
     * 1. Direct ID lookup: If sourceIds contains an ID for this adapter's source
     * 2. Fallback matching: If no ID is available, use name and releaseDate to find the game
     * 
     * @param sourceIds Map of source names to game IDs (e.g., { IGDB: 123, RAWG: 456 })
     * @param name The name of the game (used for fallback matching)
     * @param releaseDate The release date of the game (used to verify fallback matches)
     * @returns Detailed game information or null if not found
     */
    getGameDetails(
        sourceIds: Record<string, string | number>,
        name?: string,
        releaseDate?: string
    ): Promise<GameSourceInfo | null>;

    /**
     * Fetches a list of popular games for this source
     * @param limit Maximum number of games to return
     */
    getPopularGames(limit?: number): Promise<SearchResult[]>;

    /**
     * Fetches a list of new releases for this source
     * @param limit Maximum number of games to return
     */
    getNewGames(limit?: number): Promise<SearchResult[]>;
}
