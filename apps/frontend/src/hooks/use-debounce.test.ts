import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('returns the initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('test', 500));
        expect(result.current).toBe('test');
    });

    test('does not update the value before the delay elapses', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        act(() => {
            vi.advanceTimersByTime(499);
        });

        expect(result.current).toBe('initial');
    });

    test('updates the value after the delay elapses', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('updated');
    });

    test('only applies the last value when updated multiple times within the delay window', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'first' } }
        );

        rerender({ value: 'second' });
        act(() => {
            vi.advanceTimersByTime(200);
        });

        rerender({ value: 'third' });
        act(() => {
            vi.advanceTimersByTime(200);
        });

        rerender({ value: 'fourth' });
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('fourth');
    });

    test('works with numeric values', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 1 } }
        );

        rerender({ value: 42 });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe(42);
    });
});
