import { cache } from "react";
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
     * Uses cache() for request memoization to prevent duplicate searches within the same request.
     * 
     * @param query The search query string
     * @returns Aggregated and deduplicated search results, sorted by rating
     */
    search = cache(async (query: string): Promise<SearchResult[]> => {
        const promises = this.adapters.map(adapter => adapter.search(query));
        const resultsArrays = await Promise.all(promises);
        const allResults = resultsArrays.flat();

        return this.aggregateResults(allResults);
    });

    /**
     * Aggregates search results by merging entries that represent the same game.
     * 
     * Strategy:
     * 1. Iterate through all results and compare with already merged results.
     * 2. Merge if names match exactly and release dates are within 1 month.
     * 3. Merge if one name contains the other and release dates are identical.
     * 4. Sort final results by rating (highest first).
     * 
     * @param results All search results from all adapters
     * @returns Aggregated and sorted results
     */
    private aggregateResults(results: SearchResult[]): SearchResult[] {
        const mergedResults: SearchResult[] = [];

        for (const incoming of results) {
            let foundMatch = false;

            for (let i = 0; i < mergedResults.length; i++) {
                if (this.shouldMerge(mergedResults[i], incoming)) {
                    mergedResults[i] = this.mergeResults(mergedResults[i], incoming);
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                mergedResults.push(incoming);
            }
        }

        // Step 3: Sort by rating (highest first, with ratings prioritized over no ratings)
        return mergedResults.sort((a, b) => {
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
     * Determines if two search results represent the same game and should be merged.
     */
    private shouldMerge(a: SearchResult, b: SearchResult): boolean {
        const nameA = normalizeGameName(a.name);
        const nameB = normalizeGameName(b.name);

        // Case 1: Exact name match + within 1 month date tolerance
        if (nameA === nameB && this.isWithinOneMonth(a, b)) {
            return true;
        }

        // Case 2: Substring match + exact release date match
        // This handles cases like "Final Fantasy 7" and "Final Fantasy 7: Remake" 
        // that share the same release date (e.g. for a specific platform's release).
        if ((nameA.includes(nameB) || nameB.includes(nameA)) && this.isSameDate(a, b)) {
            return true;
        }

        return false;
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
     * Checks if two search results have exactly the same release date.
     */
    private isSameDate(a: SearchResult, b: SearchResult): boolean {
        if (!a.releaseDate || !b.releaseDate) return false;
        return a.releaseDate === b.releaseDate;
    }

    /**
     * Merges two search results that represent the same game from different sources.
     * 
     * Merge strategy:
     * 1. Combine sourceIds from both results
     * 2. Prefer the longer name (likely more accurate)
     * 3. Prefer existing metadata (cover, date) if present, otherwise use incoming
     * 4. Prefer existing rating if present, otherwise use incoming
     * 5. Combine sources and platforms arrays (de-duplicated)
     * 
     * @param existing The existing search result
     * @param incoming The new search result to merge in
     * @returns Merged search result
     */
    private mergeResults(existing: SearchResult, incoming: SearchResult): SearchResult {
        const merged: SearchResult = {
            ...existing,
            sourceIds: { ...existing.sourceIds, ...incoming.sourceIds },
            name: existing.name.length >= incoming.name.length ? existing.name : incoming.name,
            coverUrl: existing.coverUrl || incoming.coverUrl,
            releaseDate: existing.releaseDate || incoming.releaseDate,
            rating: existing.rating ?? incoming.rating,
            sources: Array.from(new Set([...existing.sources, ...incoming.sources])),
            platforms: Array.from(new Set([...(existing.platforms || []), ...(incoming.platforms || [])]))
        };

        return merged;
    }
}
