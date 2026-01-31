export interface SearchResult {
    sourceIds: Record<string, string | number>;
    name: string;
    coverUrl?: string;
    coverSource?: string;
    releaseDate?: string;
    rating?: number;
    sources: string[]; // "IGDB", "OpenCritic", etc.
    platforms?: string[];
}

export interface SearchAdapter {
    search(query: string): Promise<SearchResult[]>;
    name: string;
}
