/**
 * Application-wide constants
 * Centralized location for magic numbers to improve code maintainability
 */

// ==================== API & Pagination ====================

/** Number of popular games to display on the home page */
export const POPULAR_GAMES_LIMIT = 12;

/** Number of new games to display on the home page */
export const NEW_GAMES_LIMIT = 4;

/** Number of games to fetch when searching by name for matching */
export const NAME_SEARCH_LIMIT = 5;

// ==================== Cache & Performance ====================

/** Cache revalidation time in seconds (1 hour) */
export const CACHE_REVALIDATE_SECONDS = 3600;

/** Cache tag for game data invalidation */
export const CACHE_TAG_GAMES = 'games';


// ==================== Rating Thresholds ====================

/** Rating score threshold for "excellent" rating (green color) */
export const RATING_EXCELLENT_THRESHOLD = 90;

/** Rating score threshold for "good" rating (yellow color) */
export const RATING_GOOD_THRESHOLD = 75;



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
