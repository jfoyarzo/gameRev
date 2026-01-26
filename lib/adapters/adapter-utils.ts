/**
 * Shared utility functions for game adapters
 */

import {
    DAYS_IN_MONTH,
    ONE_DAY_MS,
    ONE_SECOND_MS,
    RATING_NORMALIZED_SCALE
} from "@/lib/constants";

/**
 * Normalizes a game name for comparison by removing special characters and converting to lowercase
 * @param name The game name to normalize
 * @returns Normalized name containing only lowercase alphanumeric characters
 */
export function normalizeGameName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
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
 * Formats an image URL with proper protocol and size optimization
 * @param url The image URL to format
 * @param options Formatting options
 * @returns Formatted URL or placeholder
 */
export function formatImageUrl(
    url: string | undefined | null,
    options: {
        addProtocol?: boolean;
        replaceThumbnail?: string;
        placeholder?: string;
    } = {}
): string {
    const {
        addProtocol = true,
        replaceThumbnail,
        placeholder = "/placeholder-game.jpg"
    } = options;

    if (!url) {
        return placeholder;
    }

    let formattedUrl = url;

    // Add protocol if needed
    if (addProtocol && formattedUrl.startsWith("//")) {
        formattedUrl = `https:${formattedUrl}`;
    }

    // Replace thumbnail size if specified
    if (replaceThumbnail) {
        formattedUrl = formattedUrl.replace("t_thumb", replaceThumbnail);
    }

    return formattedUrl;
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
