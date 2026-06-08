import { useId, useMemo, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { EventCard } from '@/features/events/components/event-card';
import {
    DiscoverFilters,
    type DiscoverFiltersState,
} from '@/features/events/components/discover-filters';
import { useInfiniteAdminEvents } from '../hooks/events';

export function AdminEventsBrowser() {
    const [rawFilters, setRawFilters] = useState<DiscoverFiltersState>({
        search: '',
        date: '',
        city: '',
        skillLevel: 'any',
    });
    const [includeCancelled, setIncludeCancelled] = useState(true);

    const debouncedSearch = useDebounce(rawFilters.search, 300);
    const debouncedCity = useDebounce(rawFilters.city, 300);

    const apiFilters = useMemo(
        () => ({
            search: debouncedSearch || undefined,
            city: debouncedCity || undefined,
            date: rawFilters.date || undefined,
            skillLevel:
                rawFilters.skillLevel === 'any'
                    ? undefined
                    : rawFilters.skillLevel,
            includeCancelled,
            limit: 20,
        }),
        [
            debouncedSearch,
            debouncedCity,
            rawFilters.date,
            rawFilters.skillLevel,
            includeCancelled,
        ]
    );

    const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteAdminEvents(apiFilters);

    const events = data?.pages.flat() ?? [];

    return (
        <>
            <DiscoverFilters
                filters={rawFilters}
                onChange={setRawFilters}
                extraControls={
                    <Toggle
                        label="Include cancelled"
                        checked={includeCancelled}
                        onChange={setIncludeCancelled}
                    />
                }
            />

            <div className="mb-4 text-regular text-secondary-text">
                <strong className="text-primary-text font-semibold">
                    {events.length}
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
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            detailRoute="/admin/event-detail-page"
                        />
                    ))}

                    {events.length === 0 && (
                        <EmptyState className="col-span-full">
                            No events match the current filters.
                        </EmptyState>
                    )}
                </div>
            )}

            {hasNextPage && (
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="secondary"
                        onClick={() => void fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Loading…' : 'Load more'}
                    </Button>
                </div>
            )}
        </>
    );
}

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (_checked: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
    const id = useId();

    return (
        <div className="flex items-center gap-2 text-secondary-text">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(value) => {
                    onChange(value === true);
                }}
            />
            <label htmlFor={id} className="cursor-pointer select-none">
                {label}
            </label>
        </div>
    );
}
