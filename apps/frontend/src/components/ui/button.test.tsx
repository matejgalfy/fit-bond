import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Button } from './button';

describe('Button Component', () => {
    test('renders correctly with default text', () => {
        render(<Button>Click me</Button>);
        const buttonElement = screen.getByRole('button', { name: 'Click me' });
        expect(buttonElement).toBeInTheDocument();
    });

    test('responds to click (onClick)', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Confirm</Button>);
        const buttonElement = screen.getByRole('button', { name: 'Confirm' });
        fireEvent.click(buttonElement);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('applies the correct CSS classes for different variants', () => {
        render(<Button variant="destructive">Delete event</Button>);
        const buttonElement = screen.getByRole('button', {
            name: 'Delete event',
        });
        expect(buttonElement).toHaveClass('bg-primary-red');
    });

    test('is inactive when the disabled prop is passed', () => {
        render(<Button disabled>Inactive button</Button>);
        const buttonElement = screen.getByRole('button', {
            name: 'Inactive button',
        });
        expect(buttonElement).toBeDisabled();
    });
});
