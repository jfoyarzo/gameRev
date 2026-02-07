/**
 * Shared utility functions for game adapters
 */

import {
    DAYS_IN_MONTH,
    ONE_DAY_MS,
    ONE_SECOND_MS
} from "@/lib/constants";

/** Target scale for normalized ratings (0-100) */
const RATING_NORMALIZED_SCALE = 100;

/**
 * Roman numeral to Arabic number mapping (common game sequel numbers)
 */
const ROMAN_TO_ARABIC: [RegExp, string][] = [
    [/\bxiii\b/gi, "13"],
    [/\bxii\b/gi, "12"],
    [/\bxi\b/gi, "11"],
    [/\bviii\b/gi, "8"],
    [/\bvii\b/gi, "7"],
    [/\bvi\b/gi, "6"],
    [/\biv\b/gi, "4"],
    [/\bix\b/gi, "9"],
    [/\biii\b/gi, "3"],
    [/\bii\b/gi, "2"],
    [/\bv\b/gi, "5"],
    [/\bx\b/gi, "10"],
];

/**
 * Converts Roman numerals to Arabic in a string for consistent comparison.
 * e.g., "Street Fighter V" → "Street Fighter 5"
 */
export function convertRomanNumerals(text: string): string {
    let result = text;
    for (const [pattern, replacement] of ROMAN_TO_ARABIC) {
        result = result.replace(pattern, replacement);
    }
    return result;
}

/**
 * Normalizes a game name for comparison:
 * 1. Converts Roman numerals to Arabic (V→5, IV→4, etc.)
 * 2. Removes special characters
 * 3. Converts to lowercase
 */
export function normalizeGameName(name: string): string {
    const withArabic = convertRomanNumerals(name);
    // Replace & with 'and' before stripping special chars to ensure consistent normalization
    const withAnd = withArabic.replace(/&/g, "and");
    return withAnd.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Calculates a relevance score for how well a game name matches a search query.
 * Higher score = better match.
 * 
 * @param query The search query
 * @param resultName The game name to score
 * @returns Score from 0-100
 */
export function calculateSearchScore(query: string, resultName: string): number {
    const normalizedQuery = normalizeGameName(query);
    const normalizedResult = normalizeGameName(resultName);

    // Exact match
    if (normalizedResult === normalizedQuery) {
        return 100;
    }

    // Result starts with query (e.g., "Street Fighter 5" matches "Street Fighter 5: Champion Edition")
    if (normalizedResult.startsWith(normalizedQuery)) {
        return 90;
    }

    // Query starts with result (e.g., "Street Fighter 5 Champion" matches "Street Fighter 5")
    if (normalizedQuery.startsWith(normalizedResult)) {
        return 85;
    }

    // Result contains query
    if (normalizedResult.includes(normalizedQuery)) {
        return 70;
    }

    // Query contains result (for short names like "Hades")
    if (normalizedQuery.includes(normalizedResult) && normalizedResult.length >= 4) {
        return 60;
    }

    // No significant match
    return 0;
}

/**
 * Checks if two games match based on name and optional release date
 * @param targetName The name to match against
 * @param targetDate Optional release date to match against
 * @param gameName The game name to check
 * @param gameDate Optional game release date
 * @param dateToleranceDays Number of days tolerance for date matching (default: 31)
 * @returns true if the game matches the target criteria
 */
export function matchesByNameAndDate(
    targetName: string,
    targetDate: Date | null,
    gameName: string,
    gameDate: Date | null,
    dateToleranceDays: number = DAYS_IN_MONTH
): boolean {
    // Check name match first
    const targetNameKey = normalizeGameName(targetName);
    const gameNameKey = normalizeGameName(gameName);

    if (targetNameKey !== gameNameKey) {
        return false;
    }

    // If we have both dates, they must match within tolerance
    if (targetDate && gameDate) {
        const diffMs = Math.abs(gameDate.getTime() - targetDate.getTime());
        const toleranceMs = dateToleranceDays * ONE_DAY_MS;
        return diffMs <= toleranceMs;
    }

    // If no date comparison needed, name match is sufficient
    return true;
}

/**
 * Converts a Unix timestamp to ISO date string (YYYY-MM-DD)
 * @param timestamp Unix timestamp in seconds
 * @returns ISO date string or undefined if timestamp is invalid
 */
export function unixToISODate(timestamp: number | undefined): string | undefined {
    if (!timestamp) return undefined;
    return new Date(timestamp * ONE_SECOND_MS).toISOString().split('T')[0];
}

/**
 * Normalizes a rating score to a 0-100 scale
 * @param score The original score
 * @param maxScore The maximum value of the original scale (e.g., 5 for a 0-5 scale)
 * @returns Normalized score on a 0-100 scale, rounded to nearest integer
 */
export function normalizeRating(score: number, maxScore: number = RATING_NORMALIZED_SCALE): number {
    return Math.round((score / maxScore) * RATING_NORMALIZED_SCALE);
}

/**
 * Parses a date string or Date object into a Date object
 * @param date Date string or Date object
 * @returns Date object or null if invalid
 */
export function parseDate(date: string | Date | undefined | null): Date | null {
    if (!date) return null;
    if (date instanceof Date) return date;

    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
}
