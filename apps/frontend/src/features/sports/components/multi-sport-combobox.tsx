import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSports } from '../hooks/sports';

interface MultiSportComboboxProps {
    values: string[];
    onChange: (sportIds: string[]) => void;
    id?: string;
    placeholder?: string;
}

export function MultiSportCombobox({
    values,
    onChange,
    id,
    placeholder = 'Select sports',
}: MultiSportComboboxProps) {
    const [open, setOpen] = useState(false);
    const { data: sports, isLoading } = useSports();

    const selectedSports = sports?.filter((sport) => values.includes(sport.id)) || [];

    const toggleSport = (sportId: string) => {
        const newValues = values.includes(sportId)
            ? values.filter((id) => id !== sportId)
            : [...values, sportId];
        onChange(newValues);
    };

    const removeSport = (e: React.MouseEvent, sportId: string) => {
        e.stopPropagation();
        onChange(values.filter((id) => id !== sportId));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isLoading}
                    className="flex min-h-10 w-full items-center justify-between rounded-md border border-outline bg-background px-3 py-1 text-regular text-primary-text shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <div className="flex flex-wrap gap-1">
                        {isLoading ? (
                            <span className="text-secondary-text">Loading sports...</span>
                        ) : selectedSports.length > 0 ? (
                            selectedSports.map((sport) => (
                                <Badge key={sport.id} variant="secondary" className="mr-1">
                                    {sport.name}
                                    <span
                                        className="ml-1 cursor-pointer hover:text-primary-red"
                                        onClick={(e) => removeSport(e, sport.id)}
                                    >
                                        <X className="size-3" />
                                    </span>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-secondary-text">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="size-4 shrink-0 text-secondary-text" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
                align="start"
            >
                <Command>
                    <CommandInput placeholder="Search sport..." />
                    <CommandList>
                        <CommandEmpty>No sport found.</CommandEmpty>
                        <CommandGroup>
                            {sports?.map((sport) => {
                                const isSelected = values.includes(sport.id);
                                return (
                                    <CommandItem
                                        key={sport.id}
                                        value={sport.name}
                                        onSelect={() => toggleSport(sport.id)}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 size-4',
                                                isSelected ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        {sport.name}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}