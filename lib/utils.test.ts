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
        it('should return placeholder for null/undefined/empty url', () => {
            expect(formatImageUrl('')).toBe('/placeholder-game.jpg');
            expect(formatImageUrl(null)).toBe('/placeholder-game.jpg');
            expect(formatImageUrl(undefined)).toBe('/placeholder-game.jpg');
        });

        it('should return custom placeholder when provided', () => {
            expect(formatImageUrl('', { placeholder: '/custom.jpg' })).toBe('/custom.jpg');
        });

        it('should add protocol to protocol-relative urls', () => {
            const url = '//images.igdb.com/igdb/image/upload/t_thumb/test.jpg';
            expect(formatImageUrl(url)).toBe('https://images.igdb.com/igdb/image/upload/t_thumb/test.jpg');
        });

        it('should replace thumbnail when specified', () => {
            const url = '//images.igdb.com/igdb/image/upload/t_thumb/test.jpg';
            expect(formatImageUrl(url, { replaceThumbnail: 't_720p' })).toBe('https://images.igdb.com/igdb/image/upload/t_720p/test.jpg');
        });

        it('should handle urls with existing protocol', () => {
            const url = 'https://example.com/image.jpg';
            expect(formatImageUrl(url)).toBe(url);
        });

        it('should not add protocol when addProtocol is false', () => {
            const url = '//images.igdb.com/test.jpg';
            expect(formatImageUrl(url, { addProtocol: false })).toBe(url);
        });
    });
});
