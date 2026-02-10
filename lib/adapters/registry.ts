import 'server-only';
import { GameAdapter } from "@/lib/types/adapter";
import { IgdbAdapter } from "./igdb-adapter";
import { RawgAdapter } from "./rawg-adapter";
import { OpencriticAdapter } from "./opencritic-adapter";
import { AVAILABLE_ADAPTERS, AdapterName } from "@/lib/constants";

interface AdapterRegistryEntry {
    adapter: GameAdapter;
    /** Lower number = higher priority for primary source selection */
    priority: number;
    enabled: boolean;
}

/**
 * Centralized adapter registry for managing game data sources.
 * 
 * Adding a new source:
 * 1. Add the source name to AVAILABLE_ADAPTERS in @/lib/constants
 * 2. Create the adapter class extending BaseAdapter
 * 3. Add an entry to REGISTRY with appropriate priority
 */
const REGISTRY: Record<AdapterName, AdapterRegistryEntry> = {
    IGDB: { adapter: new IgdbAdapter(), priority: 1, enabled: true },
    RAWG: { adapter: new RawgAdapter(), priority: 2, enabled: true },
    OpenCritic: { adapter: new OpencriticAdapter(), priority: 3, enabled: true },
};

/** Functions for interacting with the adapter registry */
export function getEnabledAdapters(): GameAdapter[] {
    return Object.values(REGISTRY)
        .filter(entry => entry.enabled)
        .sort((a, b) => a.priority - b.priority)
        .map(entry => entry.adapter);
}

export function getPrimaryAdapter(): GameAdapter | null {
    const adapters = getEnabledAdapters();
    return adapters[0] ?? null;
}

export function getAdapter(name: AdapterName): GameAdapter | null {
    const entry = REGISTRY[name];
    return entry?.enabled ? entry.adapter : null;
}

export function getEnabledAdapterNames(): AdapterName[] {
    return AVAILABLE_ADAPTERS.filter(name => REGISTRY[name].enabled);
}
