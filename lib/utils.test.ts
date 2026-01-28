import { describe, it, expect } from 'vitest';
import { cn } from './utils';

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
});
