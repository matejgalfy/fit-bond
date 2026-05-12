import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { EventCard } from '@/features/events/components/event-card';
import {
    DiscoverFilters,
    type DiscoverFiltersState,
} from '@/features/events/components/discover-filters';
import { useAdminEvents } from '../hooks/events';

export function AdminEventsBrowser() {
    const [rawFilters, setRawFilters] = useState<DiscoverFiltersState>({
        search: '',
        date: '',
        city: '',
        skillLevel: 'any',
    });
    const [includePrivate, setIncludePrivate] = useState(true);
    const [includeCancelled, setIncludeCancelled] = useState(true);
    const [includeDeleted, setIncludeDeleted] = useState(true);

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
            includePrivate,
            includeCancelled,
            includeDeleted,
            limit: 20,
        }),
        [
            debouncedSearch,
            debouncedCity,
            rawFilters.date,
            rawFilters.skillLevel,
            includePrivate,
            includeCancelled,
            includeDeleted,
        ]
    );

    const { data: events, isPending } = useAdminEvents(apiFilters);

    return (
        <>
            <DiscoverFilters filters={rawFilters} onChange={setRawFilters} />

            <Card className="p-4 mb-4 border-outline bg-surface shadow-sm rounded-2xl">
                <div className="flex flex-wrap gap-4 text-small">
                    <Toggle
                        label="Include private"
                        checked={includePrivate}
                        onChange={setIncludePrivate}
                    />
                    <Toggle
                        label="Include cancelled"
                        checked={includeCancelled}
                        onChange={setIncludeCancelled}
                    />
                    <Toggle
                        label="Include deleted"
                        checked={includeDeleted}
                        onChange={setIncludeDeleted}
                    />
                </div>
            </Card>

            <div className="mb-4 text-regular text-secondary-text">
                <strong className="text-primary-text font-semibold">
                    {events?.length ?? 0}
                </strong>{' '}
                events found
            </div>

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
                        <EmptyState className="col-span-full">
                            No events match the current filters.
                        </EmptyState>
                    )}
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
    return (
        <label className="flex items-center gap-2 text-secondary-text cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                    onChange(e.target.checked);
                }}
                className="size-4 accent-primary-blue"
            />
            {label}
        </label>
    );
}
