/**
 * Custom error types for the DAL layer.
 * Enables specific error handling in Server Components.
 */

export class DataAccessError extends Error {
    constructor(
        message: string,
        public readonly source: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'DataAccessError';
    }
}

export class RateLimitError extends DataAccessError {
    retryAfter?: number;

    constructor(source: string, retryAfter?: number) {
        super(`Rate limit exceeded for ${source}`, source);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

export class AuthenticationError extends DataAccessError {
    constructor(source: string) {
        super(`Authentication failed for ${source}`, source);
        this.name = 'AuthenticationError';
    }
}

export class NotFoundError extends DataAccessError {
    constructor(source: string, identifier: string | number) {
        super(`Resource not found in ${source}: ${identifier}`, source);
        this.name = 'NotFoundError';
    }
}

/**
 * Type guard for expected "not found" results (null)
 */
export function isNotFound<T>(result: T | null): result is null {
    return result === null;
}

/**
 * Checks if an error is a DataAccessError from a specific source
 */
export function isSourceError(error: unknown, source: string): error is DataAccessError {
    return error instanceof DataAccessError && error.source === source;
}
