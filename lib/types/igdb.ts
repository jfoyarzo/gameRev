export interface IGDBGame {
    id: number;
    name: string;
    cover?: {
        id: number;
        url: string;
    };
    screenshots?: {
        id: number;
        url: string;
    }[];
    summary?: string;
    total_rating?: number; // Weighted Average of Critic + User
    total_rating_count?: number;
    rating?: number; // IGDB User Rating
    rating_count?: number;
    aggregated_rating?: number; // External Critic Rating
    aggregated_rating_count?: number;
    url?: string; // IGDB Page URL
    first_release_date?: number;
    involved_companies?: {
        company: {
            name: string;
        }
    }[];
    platforms?: {
        name: string;
    }[];
    game_type?: number;
}
