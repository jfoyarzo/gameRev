import { SearchAdapter, SearchResult } from "@/lib/types/search";
import { normalizeGameName } from "@/lib/adapters/adapter-utils";
import {
    DAYS_IN_MONTH,
    ONE_DAY_MS,
} from "@/lib/constants";

/**
 * Central search service that coordinates multiple search adapters.
 * Handles result aggregation, de-duplication, and merging of data from different sources.
 */
export class SearchService {
    private adapters: SearchAdapter[] = [];

    constructor(initialAdapters: SearchAdapter[] = []) {
        this.adapters = initialAdapters;
    }

    registerAdapter(adapter: SearchAdapter) {
        this.adapters.push(adapter);
    }

    /**
     * Searches across all registered adapters and aggregates results.
     * Results from the same game across different sources are merged together.
     * 
     * @param query The search query string
     * @returns Aggregated and deduplicated search results, sorted by rating
     */
    async search(query: string): Promise<SearchResult[]> {
        const promises = this.adapters.map(adapter => adapter.search(query));
        const resultsArrays = await Promise.all(promises);
        const allResults = resultsArrays.flat();

        return this.aggregateResults(allResults);
    }

    /**
     * Aggregates search results by merging entries that represent the same game.
     * 
     * Strategy:
     * 1. Group results by normalized name (removes special characters)
     * 2. Within each name group, merge results with matching release dates (within 1 month)
     * 3. Sort final results by rating (highest first)
     * 
     * @param results All search results from all adapters
     * @returns Aggregated and sorted results
     */
    private aggregateResults(results: SearchResult[]): SearchResult[] {
        // Step 1: Group by normalized name
        const groups = new Map<string, SearchResult[]>();
        for (const result of results) {
            // Use the centralized normalization utility
            const nameKey = normalizeGameName(result.name);
            const list = groups.get(nameKey) || [];
            list.push(result);
            groups.set(nameKey, list);
        }

        const finalResults: SearchResult[] = [];

        // Step 2: Within each name group, merge results with matching release dates
        for (const nameGroup of groups.values()) {
            const matched: SearchResult[] = [];

            for (const result of nameGroup) {
                let foundMatch = false;

                // Try to find an existing result that matches by release date
                for (let i = 0; i < matched.length; i++) {
                    if (this.isWithinOneMonth(matched[i], result)) {
                        // Merge the source data into the existing result
                        matched[i] = this.mergeResults(matched[i], result);
                        foundMatch = true;
                        break;
                    }
                }

                // If no match found, add as a new result
                if (!foundMatch) {
                    matched.push(result);
                }
            }
            finalResults.push(...matched);
        }

        // Step 3: Sort by rating (highest first, with ratings prioritized over no ratings)
        return finalResults.sort((a, b) => {
            // Games with ratings come first
            if (a.rating && !b.rating) return -1;
            if (!a.rating && b.rating) return 1;
            // Both have ratings: sort by value (highest first)
            if (a.rating && b.rating) return b.rating - a.rating;
            // Neither has rating: maintain original order
            return 0;
        });
    }

    /**
     * Checks if two search results have release dates within one month of each other.
     * Used to determine if results from different sources represent the same game.
     * 
     * @param a First search result
     * @param b Second search result
     * @returns true if release dates are within 31 days
     */
    private isWithinOneMonth(a: SearchResult, b: SearchResult): boolean {
        if (!a.releaseDate || !b.releaseDate) return false;

        try {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);

            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return false;

            const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
            const oneMonthMs = DAYS_IN_MONTH * ONE_DAY_MS;

            return diffMs <= oneMonthMs;
        } catch {
            return false;
        }
    }


    /**
     * Merges two search results that represent the same game from different sources.
     * 
     * Merge strategy:
     * 1. Combine sourceIds from both results
     * 2. Prefer existing metadata (cover, date) if present, otherwise use incoming
     * 3. Prefer existing rating if present, otherwise use incoming
     * 4. Combine sources and platforms arrays (de-duplicated)
     * 
     * @param existing The existing search result
     * @param incoming The new search result to merge in
     * @returns Merged search result
     */
    private mergeResults(existing: SearchResult, incoming: SearchResult): SearchResult {

        const merged: SearchResult = {
            ...existing,
            sourceIds: { ...existing.sourceIds, ...incoming.sourceIds },
            coverUrl: existing.coverUrl || incoming.coverUrl,
            releaseDate: existing.releaseDate || incoming.releaseDate,
            rating: existing.rating ?? incoming.rating,
            sources: Array.from(new Set([...existing.sources, ...incoming.sources])),
            platforms: Array.from(new Set([...(existing.platforms || []), ...(incoming.platforms || [])]))
        };

        return merged;
    }
}
