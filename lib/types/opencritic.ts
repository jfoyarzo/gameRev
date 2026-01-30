/**
 * OpenCritic API Response Types
 *
 * Type definitions for the OpenCritic API via RapidAPI.
 * Based on actual API responses from endpoints like GET /game/{id}.
 */

export interface OpenCriticScreenshot {
    _id?: string;
    fullRes?: string;
    thumbnail?: string;
    og?: string;
    sm?: string;
}

export interface OpenCriticImageVariants {
    og?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
}

export interface OpenCriticImages {
    box?: OpenCriticImageVariants;
    square?: OpenCriticImageVariants;
    masthead?: OpenCriticImageVariants;
    banner?: OpenCriticImageVariants;
    logo?: OpenCriticImageVariants;
    screenshots?: OpenCriticScreenshot[];
}

export interface OpenCriticCompany {
    name: string;
    type: 'DEVELOPER' | 'PUBLISHER';
}

export interface OpenCriticPlatform {
    id: number;
    name: string;
    shortName: string;
    imageSrc?: string;
    releaseDate?: string;
}

export interface OpenCriticGenre {
    id: number;
    name: string;
}

/**
 * Full game details response from GET /game/{id}
 */
export interface OpenCriticGame {
    id: number;
    name: string;
    description?: string;
    url?: string;

    // Ratings
    topCriticScore: number;
    percentRecommended: number;
    medianScore: number;
    tier: string;
    numReviews: number;
    numTopCriticReviews: number;
    percentile?: number;

    // Dates
    firstReleaseDate: string;
    firstReviewDate?: string;
    latestReviewDate?: string;

    // Media
    images?: OpenCriticImages;
    screenshots?: OpenCriticScreenshot[];
    mastheadScreenshot?: OpenCriticScreenshot;
    logoScreenshot?: OpenCriticScreenshot;
    bannerScreenshot?: OpenCriticScreenshot;
    squareScreenshot?: OpenCriticScreenshot;

    // Metadata
    Companies?: OpenCriticCompany[];
    Platforms?: OpenCriticPlatform[];
    Genres?: OpenCriticGenre[];
}

/**
 * Search result item from GET /game (query endpoint)
 */
export interface OpenCriticSearchResult {
    id: number;
    name: string;
    dist?: number;
}

/**
 * Game list item from endpoints like GET /game/popular, GET /game/recently-released
 */
export interface OpenCriticGameListItem {
    id: number;
    name: string;
    topCriticScore: number;
    tier: string;
    firstReleaseDate?: string;
    images?: OpenCriticImages;
    Platforms?: OpenCriticPlatform[];
}
