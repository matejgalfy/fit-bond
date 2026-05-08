import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { locationQueryKeys, searchLocations } from '../api/locations-api';

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = window.setTimeout(() => {
            setDebounced(value);
        }, delayMs);
        return () => {
            window.clearTimeout(id);
        };
    }, [value, delayMs]);
    return debounced;
}

export function useLocationSearch(q: string) {
    const debounced = useDebouncedValue(q.trim(), 300);
    const enabled = debounced.length >= 2;

    return useQuery({
        queryKey: locationQueryKeys.search(debounced),
        queryFn: () => searchLocations(debounced),
        enabled,
        staleTime: 60_000,
    });
}
