export interface RAWGPlatform {
    platform: {
        id: number;
        name: string;
        slug: string;
    };
}

export interface RAWGGenre {
    id: number;
    name: string;
    slug: string;
}

export interface RAWGDeveloper {
    id: number;
    name: string;
    slug: string;
}

export interface RAWGPublisher {
    id: number;
    name: string;
    slug: string;
}

export interface RAWGGame {
    id: number;
    slug: string;
    name: string;
    released: string;
    tba: boolean;
    background_image: string;
    rating: number;
    rating_top: number;
    ratings: {
        id: number;
        title: string;
        count: number;
        percent: number;
    }[];
    ratings_count: number;
    reviews_text_count: number;
    added: number;
    metacritic: number;
    playtime: number;
    suggestions_count: number;
    updated: string;
    platforms: RAWGPlatform[];
    genres: RAWGGenre[];
    description?: string;
    description_raw?: string;
    developers?: RAWGDeveloper[];
    publishers?: RAWGPublisher[];
    website?: string;
    reddit_url?: string;
    parent_games?: { platform: RAWGPlatform }[]; // Structure varies, but checking existence is key
    parents_count?: number;
}

export interface RAWGSearchResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: RAWGGame[];
}
export interface RAWGScreenshotResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
        id: number;
        image: string;
        width: number;
        height: number;
        is_deleted: boolean;
    }[];
}
