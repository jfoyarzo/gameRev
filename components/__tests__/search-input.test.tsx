import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../search-input';

// Mock useRouter
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

describe('SearchInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<SearchInput />);
        expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
    });

    it('updates input value when typing', async () => {
        render(<SearchInput />);
        const input = screen.getByPlaceholderText('Search games...');
        await userEvent.type(input, 'Hades');
        expect(input).toHaveValue('Hades');
    });

    it('navigates to search page on submit', async () => {
        render(<SearchInput />);
        const input = screen.getByPlaceholderText('Search games...');
        await userEvent.type(input, 'Hades');
        await userEvent.keyboard('{Enter}');

        expect(pushMock).toHaveBeenCalledWith('/search?q=Hades');
    });

    it('does not navigate on empty submit', async () => {
        render(<SearchInput />);
        const input = screen.getByPlaceholderText('Search games...');
        await userEvent.type(input, '   '); // whitespace only
        await userEvent.keyboard('{Enter}');

        expect(pushMock).not.toHaveBeenCalled();
    });
});
