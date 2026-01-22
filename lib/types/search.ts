export interface SearchResult {
    id: string | number;
    name: string;
    coverUrl?: string;
    releaseDate?: string;
    rating?: number;
    sources: string[]; // "IGDB", "OpenCritic", etc.
    platforms?: string[];
}

export interface SearchAdapter {
    search(query: string): Promise<SearchResult[]>;
    name: string;
}
