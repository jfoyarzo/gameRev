import { SearchAdapter, SearchResult } from "@/lib/types/search";

export class SearchService {
    private adapters: SearchAdapter[] = [];

    constructor(initialAdapters: SearchAdapter[] = []) {
        this.adapters = initialAdapters;
    }

    registerAdapter(adapter: SearchAdapter) {
        this.adapters.push(adapter);
    }

    async search(query: string): Promise<SearchResult[]> {
        // Execute all searches in parallel
        const promises = this.adapters.map(adapter => adapter.search(query));
        const resultsArrays = await Promise.all(promises);
        const allResults = resultsArrays.flat();

        return this.aggregateResults(allResults);
    }

    private aggregateResults(results: SearchResult[]): SearchResult[] {
        const map = new Map<string, SearchResult>();

        for (const result of results) {
            const key = this.normalizeKey(result.name);

            if (map.has(key)) {
                const existing = map.get(key)!;
                map.set(key, this.mergeResults(existing, result));
            } else {
                map.set(key, result);
            }
        }

        return Array.from(map.values())
            .sort((a, b) => {
                // Sort by existence of rating, then value of rating, then name
                if (a.rating && !b.rating) return -1;
                if (!a.rating && b.rating) return 1;
                if (a.rating && b.rating) return b.rating - a.rating;
                return 0;
            });
    }

    private normalizeKey(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    private mergeResults(existing: SearchResult, incoming: SearchResult): SearchResult {
        // Merge strategy:
        // 1. Prefer existing metadata if present, else take incoming
        // 2. Combine platforms
        // 3. Combine sources

        const merged: SearchResult = {
            ...existing,
            // If existing lacks info that incoming has, take it
            coverUrl: existing.coverUrl || incoming.coverUrl,
            releaseDate: existing.releaseDate || incoming.releaseDate,
            rating: existing.rating ?? incoming.rating, // 0 is falsy, so use ??

            // Combine arrays
            sources: Array.from(new Set([...existing.sources, ...incoming.sources])),
            platforms: Array.from(new Set([...(existing.platforms || []), ...(incoming.platforms || [])]))
        };

        return merged;
    }
}
