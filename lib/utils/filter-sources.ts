import { GameSourceInfo } from "@/lib/types/game";
import { AdapterName, AVAILABLE_ADAPTERS } from "@/lib/constants";

/**
 * Filters and orders a sources record by a user's preferred source list.
 *
 * @param allSources - The full sources record from UnifiedGameData
 * @param preferredList - Ordered list of preferred source names (from user preferences).
 *   If undefined, all sources are returned in their original order.
 *   If empty array, returns an empty record (user explicitly disabled all).
 * @returns A new Record containing only the matching sources, ordered by preference priority.
 */
export function filterSources(
    allSources: Record<string, GameSourceInfo>,
    preferredList?: AdapterName[]
): Record<string, GameSourceInfo> {
    if (preferredList === undefined) {
        return allSources;
    }

    const filtered: Record<string, GameSourceInfo> = {};

    // Iterate in preference order so it matches the user's priority ranking
    for (const sourceName of preferredList) {
        if (allSources[sourceName]) {
            filtered[sourceName] = allSources[sourceName];
        }
    }

    return filtered;
}

/**
 * Returns the default preferred sources list (all adapters enabled).
 * Used when a user has no saved preferences.
 */
export function getDefaultPreferredSources(): AdapterName[] {
    return [...AVAILABLE_ADAPTERS];
}
