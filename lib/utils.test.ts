import { describe, it, expect } from 'vitest';
import { cn, formatImageUrl } from './utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            expect(cn('c-1', 'c-2')).toBe('c-1 c-2');
        });

        it('should handle conditional class names', () => {
            expect(cn('c-1', true && 'c-2', false && 'c-3')).toBe('c-1 c-2');
        });

        it('should resolve tailwind conflicts', () => {
            expect(cn('p-4', 'p-2')).toBe('p-2');
            expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
        });

        it('should handle arrays and objects', () => {
            expect(cn(['c-1', 'c-2'])).toBe('c-1 c-2');
            expect(cn({ 'c-1': true, 'c-2': false })).toBe('c-1');
        });
    });

    describe('formatImageUrl', () => {
        it('should return empty string for empty url', () => {
            expect(formatImageUrl('')).toBe('');
        });

        it('should return original url if it starts with http', () => {
            const url = 'https://example.com/image.jpg';
            expect(formatImageUrl(url)).toBe(url);
        });

        it('should format protocol-relative url with default resolution', () => {
            const url = '//images.igdb.com/igdb/image/upload/t_thumb/test.jpg';
            expect(formatImageUrl(url)).toBe('https://images.igdb.com/igdb/image/upload/t_1080p/test.jpg');
        });

        it('should format protocol-relative url with custom resolution', () => {
            const url = '//images.igdb.com/igdb/image/upload/t_thumb/test.jpg';
            expect(formatImageUrl(url, 't_720p')).toBe('https://images.igdb.com/igdb/image/upload/t_720p/test.jpg');
        });

        it('should handle relative paths unchanged', () => {
            const url = '/placeholder.jpg';
            expect(formatImageUrl(url)).toBe(url);
        });
    });
});
