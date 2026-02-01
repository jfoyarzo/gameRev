
import { describe, it, expect } from 'vitest';
import { normalizeGameName } from '../adapter-utils';

describe('normalizeGameName', () => {
    it('should normalize & and "and" to the same value', () => {
        const name1 = "Borderlands 2: Commander Lilith & the Fight for Sanctuary";
        const name2 = "Borderlands 2: Commander Lilith and the Fight for Sanctuary";

        expect(normalizeGameName(name1)).toBe(normalizeGameName(name2));
    });

    it('should handle standard normalization', () => {
        expect(normalizeGameName("God of War")).toBe("godofwar");
        expect(normalizeGameName("Spider-Man")).toBe("spiderman");
        expect(normalizeGameName("The Witcher 3: Wild Hunt")).toBe("thewitcher3wildhunt");
    });

    it('should handle Roman numerals', () => {
        expect(normalizeGameName("Final Fantasy VII")).toBe("finalfantasy7");
        expect(normalizeGameName("Diablo IV")).toBe("diablo4");
    });
});
