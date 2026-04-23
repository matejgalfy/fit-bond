import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/api';
import { useEvents } from '@/features/events/hooks/events';
import { EventCard } from '@/features/events/components/event-card';
import {
    DiscoverFilters,
    type DiscoverFiltersState,
} from '@/features/events/components/discover-filters';
import { useDebounce } from '@/hooks/use-debounce';

export const Route = createFileRoute('/pages/discover-page')({
    component: DiscoverPage,
});

function DiscoverPage() {
    const { data: session } = authClient.useSession();

    const [rawFilters, setRawFilters] = useState<DiscoverFiltersState>({
        search: '',
        date: '',
        city: '',
        skillLevel: 'any',
    });

    const debouncedSearch = useDebounce(rawFilters.search, 300);
    const debouncedCity = useDebounce(rawFilters.city, 300);

    const apiFilters = useMemo(() => {
        return {
            userId: session?.user.id,
            excludeUserInteractions: true,
            search: debouncedSearch || undefined,
            city: debouncedCity || undefined,
            date: rawFilters.date || undefined,
            skillLevel:
                rawFilters.skillLevel === 'any'
                    ? undefined
                    : rawFilters.skillLevel,
            limit: 20, // Pagination limit
        };
    }, [
        session?.user.id,
        debouncedSearch,
        debouncedCity,
        rawFilters.date,
        rawFilters.skillLevel,
    ]);

    const { data: events, isPending } = useEvents(apiFilters);

    if (!session?.user) return null;

    return (
        <div className="max-w-240 mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    Discover Events
                </h1>
                <p className="text-regular text-secondary-text mt-1">
                    Find sport activities that match your interests
                </p>
            </div>

            {/* Filtration panel */}
            <DiscoverFilters filters={rawFilters} onChange={setRawFilters} />

            {/* Results Header */}
            <div className="mb-4 text-regular text-secondary-text">
                <strong className="text-primary-text font-semibold">
                    {events?.length ?? 0}
                </strong>{' '}
                events found
            </div>

            {/* Results Grid */}
            {isPending ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-48 bg-muted-background rounded-2xl"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {events?.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}

                    {events?.length === 0 && (
                        <div className="col-span-full py-12 text-center text-secondary-text bg-surface rounded-2xl border border-outline">
                            No events found matching your criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
