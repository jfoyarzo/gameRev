import { cache } from "react";
import { SearchAdapter, SearchResult } from "@/lib/types/search";
import { normalizeGameName, calculateSearchScore } from "@/lib/adapters/adapter-utils";
import {
    DAYS_IN_MONTH,
    ONE_DAY_MS,
} from "@/lib/constants";

/** Minimum relevance score for a result to be included */
const MIN_RELEVANCE_SCORE = 50;

/** Maximum results to return per search */
const MAX_RESULTS = 20;

/**
 * Central search service that coordinates multiple search adapters.
 * Handles result aggregation, de-duplication, and merging of data from different sources.
 */
export class SearchService {
    private adapters: SearchAdapter[] = [];
    private currentQuery = "";

    constructor(initialAdapters: SearchAdapter[] = []) {
        this.adapters = initialAdapters;
    }

    registerAdapter(adapter: SearchAdapter) {
        this.adapters.push(adapter);
    }

    /**
     * Searches across all registered adapters and aggregates results.
     * Results are scored by relevance, filtered, merged, and sorted.
     * 
     * @param query The search query string
     * @returns Aggregated and deduplicated search results, sorted by relevance
     */
    search = cache(async (query: string): Promise<SearchResult[]> => {
        this.currentQuery = query;

        const promises = this.adapters.map(adapter => adapter.search(query));
        const resultsArrays = await Promise.all(promises);
        const allResults = resultsArrays.flat();

        // Score each result by relevance to the query
        const scoredResults = allResults.map(result => ({
            result,
            score: calculateSearchScore(query, result.name),
        }));

        // Filter out low-relevance results
        const relevantResults = scoredResults
            .filter(({ score }) => score >= MIN_RELEVANCE_SCORE)
            .sort((a, b) => {
                // Primary Sort: Release Type Tier
                const tierA = this.getReleaseTypeTier(a.result);
                const tierB = this.getReleaseTypeTier(b.result);

                if (tierA !== tierB) {
                    return tierA - tierB; // Lower tier number is better
                }

                // Secondary Sort: Search Score
                return b.score - a.score;
            })
            .map(({ result }) => result);

        return this.aggregateResults(relevantResults);
    });

    /**
     * Determines the sorting tier for a search result.
     * Tier 1: Base Games with > 2 platforms (Major Multi-platform)
     * Tier 2: Base Games with <= 2 platforms (Ports/Exclusives)
     * Tier 3: DLCs, Expansions, Bundles, Unknown
     */
    private getReleaseTypeTier(result: SearchResult): number {
        const isBaseGame = result.releaseType === 'BASE_GAME' || !result.releaseType;
        const platformCount = result.platforms?.length || 0;

        if (isBaseGame) {
            if (platformCount > 2) return 1;
            return 2;
        }

        return 3;
    }

    /**
     * Aggregates search results by merging entries that represent the same game.
     * 
     * Strategy:
     * 1. Iterate through pre-sorted results (highest relevance first)
     * 2. Merge if names match exactly and release dates are within 1 month
     * 3. Keep results sorted by initial relevance order (best matches first)
     * 
     * @param results Pre-sorted search results from all adapters
     * @returns Aggregated results, limited to MAX_RESULTS
     */
    private aggregateResults(results: SearchResult[]): SearchResult[] {
        const mergedResults: SearchResult[] = [];

        for (const incoming of results) {
            let foundMatch = false;

            for (let i = 0; i < mergedResults.length; i++) {
                if (this.shouldMerge(mergedResults[i], incoming)) {
                    // Check if this source already contributed to prevent duplicate merges
                    const incomingSource = incoming.sources[0];
                    if (!mergedResults[i].sources.includes(incomingSource)) {
                        mergedResults[i] = this.mergeResults(mergedResults[i], incoming);
                    }
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                mergedResults.push(incoming);
            }
        }

        // Return top results (already sorted by relevance)
        return mergedResults.slice(0, MAX_RESULTS);
    }

    /**
     * Determines if two search results represent the same game and should be merged.
     * 
     * Strategy is CONSERVATIVE to avoid incorrect merges:
     * - Requires date validation for all merge cases
     * - Requires platform overlap when both sources have platform data
     * - Sources without dates/platforms won't merge to avoid false positives
     */
    private shouldMerge(a: SearchResult, b: SearchResult): boolean {
        const nameA = normalizeGameName(a.name);
        const nameB = normalizeGameName(b.name);

        // If both have platforms, require at least one platform overlap
        // This prevents merging "Cuphead" (PC/Xbox) with "Cuphead" (Tesla)
        if (!this.platformsCompatible(a, b)) {
            return false;
        }

        // Case 1: Exact name match
        if (nameA === nameB) {
            // Case 1a: Strong date match
            if (this.isWithinOneMonth(a, b)) return true;

            // Case 1b: One lacks release date (common with Search API results)
            // If names are identical after normalization, we accept the merge
            if (!a.releaseDate || !b.releaseDate) return true;
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
     * Checks if two results have compatible platforms.
     * Returns true if: both lack platforms, either lacks platforms, or they share at least one platform.
     * Returns false if: both have platforms but none overlap.
     */
    private platformsCompatible(a: SearchResult, b: SearchResult): boolean {
        const platformsA = a.platforms || [];
        const platformsB = b.platforms || [];

        // If either lacks platforms, we can't verify - be conservative and don't merge
        if (platformsA.length === 0 || platformsB.length === 0) {
            // If we have dates, check them to be safe
            if (a.releaseDate && b.releaseDate) {
                return this.isWithinOneMonth(a, b);
            }
            // If missing dates or platforms, rely on the name match in shouldMerge
            return true;
        }

        // Normalize platform names for comparison
        const normalizedA = new Set(platformsA.map(p => this.normalizePlatform(p)));
        const normalizedB = platformsB.map(p => this.normalizePlatform(p));

        // Check for at least one overlapping platform
        return normalizedB.some(p => normalizedA.has(p));
    }

    /**
     * Normalizes platform names for comparison.
     * Handles variations like "PlayStation 4" vs "PS4", "PC (Windows)" vs "PC"
     */
    private normalizePlatform(platform: string): string {
        const p = platform.toLowerCase();

        // PlayStation variations
        if (p.includes('playstation 5') || p === 'ps5') return 'ps5';
        if (p.includes('playstation 4') || p === 'ps4') return 'ps4';
        if (p.includes('playstation 3') || p === 'ps3') return 'ps3';
        if (p.includes('playstation') || p === 'psn') return 'playstation';

        // Xbox variations
        if (p.includes('xbox series')) return 'xbox-series';
        if (p.includes('xbox one')) return 'xbox-one';
        if (p.includes('xbox 360')) return 'xbox-360';
        if (p.includes('xbox')) return 'xbox';

        // PC variations
        if (p.includes('pc') || p.includes('windows') || p.includes('steam')) return 'pc';

        // Nintendo variations
        if (p.includes('switch')) return 'switch';
        if (p.includes('wii u')) return 'wiiu';
        if (p.includes('3ds')) return '3ds';

        // Mobile
        if (p.includes('ios') || p.includes('iphone') || p.includes('ipad')) return 'ios';
        if (p.includes('android')) return 'android';

        return p;
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
     * 3. Prefer first truthy metadata value (cover, date, rating)
     * 4. Combine sources and platforms arrays (de-duplicated)
     * 
     * @param existing The existing search result
     * @param incoming The new search result to merge in
     * @returns Merged search result
     */
    private mergeResults(existing: SearchResult, incoming: SearchResult): SearchResult {
        // Priority map for cover images (lower is better)
        const priorityMap: Record<string, number> = {
            "IGDB": 1,
            "OpenCritic": 2,
            "RAWG": 4
        };
        const DEFAULT_PRIORITY = 3;

        const getPriority = (source?: string) => source ? (priorityMap[source] || DEFAULT_PRIORITY) : DEFAULT_PRIORITY;

        let coverUrl = existing.coverUrl;
        let coverSource = existing.coverSource;

        if (incoming.coverUrl) {
            if (!existing.coverUrl) {
                coverUrl = incoming.coverUrl;
                coverSource = incoming.coverSource;
            } else {
                const existingPriority = getPriority(existing.coverSource);
                const incomingPriority = getPriority(incoming.coverSource);

                if (incomingPriority < existingPriority) {
                    coverUrl = incoming.coverUrl;
                    coverSource = incoming.coverSource;
                }
            }
        }

        const releaseDate = this.pickFirstTruthy(existing.releaseDate, incoming.releaseDate);

        const merged: SearchResult = {
            ...existing,
            sourceIds: { ...existing.sourceIds, ...incoming.sourceIds },
            name: existing.name.length >= incoming.name.length ? existing.name : incoming.name,
            coverUrl,
            coverSource,
            releaseDate,
            rating: existing.rating ?? incoming.rating,
            sources: Array.from(new Set([...existing.sources, ...incoming.sources])),
            platforms: Array.from(new Set([...(existing.platforms || []), ...(incoming.platforms || [])])),
            releaseType: this.pickBestReleaseType(existing.releaseType, incoming.releaseType)
        };

        return merged;
    }

    /**
     * Returns the first truthy value from the provided arguments.
     * Handles empty strings, null, undefined correctly.
     */
    private pickFirstTruthy<T>(...values: (T | undefined | null)[]): T | undefined {
        for (const value of values) {
            if (value) return value;
        }
        return undefined;
    }

    /**
     * Resolves conflict between two release types, prioritizing specific types over generic/unknown ones.
     * Priority: DLC/EXPANSION/BUNDLE > BASE_GAME > UNKNOWN
     */
    private pickBestReleaseType(
        a: SearchResult['releaseType'],
        b: SearchResult['releaseType']
    ): SearchResult['releaseType'] {
        if (!a || a === 'UNKNOWN') return b || 'UNKNOWN';
        if (!b || b === 'UNKNOWN') return a;

        const specificTypes = new Set(['DLC', 'EXPANSION', 'BUNDLE']);

        // If one is specific and the other is BASE_GAME, prefer specific
        // (This assumes we trust the specific source more than the one saying it's a base game,
        // which helps when OpenCritic defaults to BASE_GAME but IGDB knows it's a DLC)
        if (specificTypes.has(a) && b === 'BASE_GAME') return a;
        if (specificTypes.has(b) && a === 'BASE_GAME') return b;

        // If both are specific or both are BASE_GAME, stick with existing (a)
        return a;
    }
}
