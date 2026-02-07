/**
 * Application-wide constants
 * Centralized location for magic numbers to improve code maintainability
 */

// ==================== API & Pagination ====================

/** Number of results per page for RAWG API search requests */
export const SEARCH_PAGE_SIZE_RAWG = 10;

/** Number of results per page for IGDB API search requests */
export const SEARCH_PAGE_SIZE_IGDB = 20;

/** Number of popular games to display on the home page */
export const POPULAR_GAMES_LIMIT = 12;

/** Number of new games to display on the home page */
export const NEW_GAMES_LIMIT = 4;

/** Number of games to fetch when searching by name for matching */
export const NAME_SEARCH_LIMIT = 5;

// ==================== Cache & Performance ====================

/** Cache revalidation time in seconds (1 hour) */
export const CACHE_REVALIDATE_SECONDS = 3600;


// ==================== Rating Thresholds ====================

/** Rating score threshold for "excellent" rating (green color) */
export const RATING_EXCELLENT_THRESHOLD = 90;

/** Rating score threshold for "good" rating (yellow color) */
export const RATING_GOOD_THRESHOLD = 75;

/** Target scale for normalized ratings (0-100) */
export const RATING_NORMALIZED_SCALE = 100;

// ==================== Date & Time Calculations ====================

/** Number of milliseconds in one second */
export const ONE_SECOND_MS = 1000;

/** Number of milliseconds in one minute */
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;

/** Number of milliseconds in one hour */
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

/** Number of milliseconds in one day */
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;

/** Default number of days used for "one month" tolerance in date matching */
export const DAYS_IN_MONTH = 31;

// ==================== IGDB Game Types ====================
// See: https://api-docs.igdb.com/#game-enums

export const IGDB_GAME_TYPE_MAIN = 0;
export const IGDB_GAME_TYPE_DLC = 1;
export const IGDB_GAME_TYPE_EXPANSION = 2;
export const IGDB_GAME_TYPE_BUNDLE = 3;
export const IGDB_GAME_TYPE_STANDALONE_EXPANSION = 4;
export const IGDB_GAME_TYPE_MOD = 5;
export const IGDB_GAME_TYPE_EPISODE = 6;
export const IGDB_GAME_TYPE_SEASON = 7;
export const IGDB_GAME_TYPE_REMAKE = 8;
export const IGDB_GAME_TYPE_REMASTER = 9;
export const IGDB_GAME_TYPE_EXPANDED_GAME = 10;
export const IGDB_GAME_TYPE_PORT = 11;
export const IGDB_GAME_TYPE_FORK = 12;
export const IGDB_GAME_TYPE_PACK = 13;
export const IGDB_GAME_TYPE_UPDATE = 14;

