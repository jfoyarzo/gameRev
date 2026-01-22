export interface RatingData {
    score: number;       // Normalized 0-100
    sourceName: string;  // e.g., "IGDB", "OpenCritic", "User"
    url?: string;        // Link to full review
    summary?: string;    // Short snippet
    count?: number;      // Number of votes (if applicable)
}

export interface RatingAdapter {
    getGameRatings(gameId: string | number): Promise<RatingData[]>;
}
