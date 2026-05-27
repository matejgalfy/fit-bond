import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { useEvents } from '../hooks/events';
import { EventCard } from './event-card';
import { DiscoverFilters, type DiscoverFiltersState } from './discover-filters';

interface EventsBrowserProps {
    userId?: string;
    excludeUserInteractions?: boolean;
}

export function EventsBrowser({
    userId,
    excludeUserInteractions,
}: EventsBrowserProps) {
    const [rawFilters, setRawFilters] = useState<DiscoverFiltersState>({
        search: '',
        date: '',
        city: '',
        skillLevel: 'any',
    });

    const debouncedSearch = useDebounce(rawFilters.search, 300);
    const debouncedCity = useDebounce(rawFilters.city, 300);

    const apiFilters = useMemo(
        () => ({
            userId,
            excludeUserInteractions,
            search: debouncedSearch || undefined,
            city: debouncedCity || undefined,
            date: rawFilters.date || undefined,
            skillLevel:
                rawFilters.skillLevel === 'any'
                    ? undefined
                    : rawFilters.skillLevel,
            limit: 20,
        }),
        [
            userId,
            excludeUserInteractions,
            debouncedSearch,
            debouncedCity,
            rawFilters.date,
            rawFilters.skillLevel,
        ]
    );

    const { data: events, isPending } = useEvents(apiFilters);

    return (
        <>
            <DiscoverFilters filters={rawFilters} onChange={setRawFilters} />

            <div className="mb-4 text-regular text-secondary-text">
                <strong className="text-primary-text font-semibold">
                    {events?.length ?? 0}
                </strong>{' '}
                events found
            </div>

            {isPending ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {events?.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}

                    {events?.length === 0 && (
                        <EmptyState className="col-span-full">
                            No events found matching your criteria.
                        </EmptyState>
                    )}
                </div>
            )}
        </>
    );
}
