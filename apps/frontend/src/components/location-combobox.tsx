import { useState } from 'react';
import { Check, ChevronsUpDown, MapPin, X } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useLocationSearch } from '@/features/locations/hooks/locations';
import type { LocationSuggestion } from '../../../backend/src/modules/locations/locations.schema';

interface LocationComboboxProps {
    value: LocationSuggestion | null;
    onChange: (value: LocationSuggestion | null) => void;
    id?: string;
    placeholder?: string;
}

export function LocationCombobox({
    value,
    onChange,
    id,
    placeholder = 'Search for a place...',
}: LocationComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { data: suggestions, isFetching } = useLocationSearch(query);

    const trimmed = query.trim();
    let emptyText: string;
    if (trimmed.length < 2) {
        emptyText = 'Type at least 2 characters to search';
    } else if (isFetching) {
        emptyText = 'Searching...';
    } else {
        emptyText = 'No matches';
    }

    // TODO maybe create a shared component for X button
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className="flex h-10 min-w-0 w-full items-center justify-between overflow-hidden rounded-md border border-outline bg-background px-3 py-1 text-regular text-primary-text shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
                >
                    <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        <MapPin className="size-4 shrink-0 text-secondary-text" />
                        <span
                            className={cn(
                                'min-w-0 flex-1 truncate text-left',
                                !value && 'text-secondary-text'
                            )}
                        >
                            {value?.displayName ?? placeholder}
                        </span>
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                        {value && (
                            <button
                                type="button"
                                aria-label="Clear selection"
                                className="p-0.5 rounded-sm text-secondary-text hover:text-primary-red transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(null);
                                }}
                            >
                                <X className="size-4" />
                            </button>
                        )}
                        <ChevronsUpDown className="size-4 text-secondary-text pointer-events-none" />
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
                align="start"
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search address..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        {suggestions && suggestions.length > 0 && (
                            <CommandGroup>
                                {suggestions.map((s) => (
                                    <CommandItem
                                        key={s.placeId}
                                        value={s.placeId}
                                        onSelect={() => {
                                            onChange(s);
                                            setOpen(false);
                                        }}
                                        className="min-w-0 overflow-hidden"
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 size-4 shrink-0',
                                                value?.placeId === s.placeId
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        <span className="min-w-0 flex-1 truncate">
                                            {s.displayName}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
