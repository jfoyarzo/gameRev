import { RatingData } from "./ratings";

export interface GameSourceInfo {
    sourceName: string;
    name?: string;
    description?: string;
    coverUrl?: string;
    screenshots?: {
        id: string | number;
        url: string;
    }[];
    ratings: RatingData[];
    releaseDate?: string;
    developer?: string;
}

export interface UnifiedGameData {
    sourceIds: Record<string, string | number>;
    name: string;
    mainCoverUrl: string;
    mainDescription?: string;
    releaseDate?: string;
    developer?: string;
    genres?: string[];
    platforms?: string[];

    // Data segmented by source for tabbed views
    sources: Record<string, GameSourceInfo>;

    // Metadata about the primary source
    primarySource: string;
}
