import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DatePicker } from './date-picker';

describe('DatePicker', () => {
    test('does not show the clear button when the value is empty', () => {
        render(<DatePicker value="" clearable onChange={vi.fn()} />);

        expect(
            screen.queryByRole('button', { name: 'Clear date' })
        ).not.toBeInTheDocument();
    });

    test('clears a selected date from a clearable picker', () => {
        const onChange = vi.fn();
        render(<DatePicker value="2026-06-13" clearable onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Clear date' }));

        expect(onChange).toHaveBeenCalledWith('');
    });

    test('does not show the clear button unless clearable is enabled', () => {
        render(<DatePicker value="2026-06-13" onChange={vi.fn()} />);

        expect(
            screen.queryByRole('button', { name: 'Clear date' })
        ).not.toBeInTheDocument();
    });
});
