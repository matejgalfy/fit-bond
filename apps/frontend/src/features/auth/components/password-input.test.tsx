import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
    test('renders with default placeholder and password type', () => {
        render(<PasswordInput />);

        const input = screen.getByPlaceholderText('Password');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'password');
    });

    test('uses a custom placeholder when provided', () => {
        render(<PasswordInput placeholder="Confirm password" />);

        expect(
            screen.getByPlaceholderText('Confirm password')
        ).toBeInTheDocument();
    });

    test('reflects the controlled value prop', () => {
        render(<PasswordInput value="hunter2" onChange={vi.fn()} />);

        expect(screen.getByDisplayValue('hunter2')).toBeInTheDocument();
    });

    test('calls onChange when the user types', () => {
        const handleChange = vi.fn();
        render(<PasswordInput value="" onChange={handleChange} />);

        const input = screen.getByPlaceholderText('Password');
        fireEvent.change(input, { target: { value: 'abc' } });

        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    test('toggle button shows "Show password" label when hidden', () => {
        render(<PasswordInput />);

        expect(
            screen.getByRole('button', { name: 'Show password' })
        ).toBeInTheDocument();
    });

    test('clicking the toggle reveals the password and updates the label', () => {
        render(<PasswordInput />);

        const input = screen.getByPlaceholderText('Password');
        const toggle = screen.getByRole('button', { name: 'Show password' });

        fireEvent.click(toggle);

        expect(input).toHaveAttribute('type', 'text');
        expect(
            screen.getByRole('button', { name: 'Hide password' })
        ).toBeInTheDocument();
    });

    test('clicking the toggle twice hides the password again', () => {
        render(<PasswordInput />);

        const input = screen.getByPlaceholderText('Password');
        fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
        fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));

        expect(input).toHaveAttribute('type', 'password');
    });
});
