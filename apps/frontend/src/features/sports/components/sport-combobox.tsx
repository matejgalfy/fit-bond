import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import { useSports } from '../hooks/sports';

interface SportComboboxProps {
    value: string;
    onChange: (sportId: string) => void;
    id?: string;
    placeholder?: string;
}

export function SportCombobox({
    value,
    onChange,
    id,
    placeholder = 'Select a sport',
}: SportComboboxProps) {
    const [open, setOpen] = useState(false);
    const { data: sports, isLoading } = useSports();

    const selectedSport = sports?.find((sport) => sport.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isLoading}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-outline bg-background px-3 py-1 text-regular text-primary-text shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span
                        className={cn(
                            'truncate',
                            !selectedSport && 'text-secondary-text'
                        )}
                    >
                        {isLoading
                            ? 'Loading sports...'
                            : (selectedSport?.name ?? placeholder)}
                    </span>
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
                            {sports?.map((sport) => (
                                <CommandItem
                                    key={sport.id}
                                    value={sport.name}
                                    onSelect={() => {
                                        onChange(sport.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 size-4',
                                            value === sport.id
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                    {sport.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
