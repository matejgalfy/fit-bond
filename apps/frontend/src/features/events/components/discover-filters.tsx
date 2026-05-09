import { Search, MapPin, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SkillLevel } from '../../../../../backend/src/modules/events/events.types';

export interface DiscoverFiltersState {
    search: string;
    date: string;
    city: string;
    skillLevel: SkillLevel | 'any';
}

interface DiscoverFiltersProps {
    filters: DiscoverFiltersState;
    onChange: (_filters: DiscoverFiltersState) => void;
}

const SKILL_LEVELS: { label: string; value: SkillLevel | 'any' }[] = [
    { label: 'Any', value: 'any' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

export function DiscoverFilters({ filters, onChange }: DiscoverFiltersProps) {
    const updateFilter = <K extends keyof DiscoverFiltersState>(
        key: K,
        value: DiscoverFiltersState[K]
    ) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <Card className="p-5 mb-6 border-outline bg-surface shadow-sm rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                {/* Sport Search Input */}
                <div>
                    <label className="text-small text-secondary-text font-medium mb-1.5 block">
                        Sport
                    </label>
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
                        />
                        <Input
                            type="text"
                            placeholder="Search sport or event name..."
                            className="pl-9 h-10 rounded-xl"
                            value={filters.search}
                            onChange={(e) => {
                                updateFilter('search', e.target.value);
                            }}
                        />
                    </div>
                    {/* Visual representation of an active tag (matching design) */}
                    {filters.search && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-soft-blue text-strong-blue text-tiny px-2.5 py-1 rounded-full font-medium">
                            {filters.search}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    updateFilter('search', '');
                                }}
                                className="h-5 w-5 rounded-full p-0 text-strong-blue hover:bg-primary-blue/20 hover:text-strong-blue"
                                aria-label="Clear search"
                            >
                                <X size={12} />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Date Input */}
                <div>
                    <label className="text-small text-secondary-text font-medium mb-1.5 block">
                        Date
                    </label>
                    <div className="relative">
                        <Input
                            type="date"
                            className="h-10 rounded-xl w-full block text-primary-text"
                            value={filters.date}
                            onChange={(e) => {
                                updateFilter('date', e.target.value);
                            }}
                        />
                    </div>
                </div>

                {/* Location Input */}
                <div>
                    <label className="text-small text-secondary-text font-medium mb-1.5 block">
                        City
                    </label>
                    <div className="relative">
                        <MapPin
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
                        />
                        <Input
                            type="text"
                            placeholder="City or area..."
                            className="pl-9 h-10 rounded-xl"
                            value={filters.city}
                            onChange={(e) => {
                                updateFilter('city', e.target.value);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Skill Level Toggles */}
            <div>
                <label className="text-small text-secondary-text font-medium mb-2 block">
                    Skill level
                </label>
                <div className="flex flex-wrap gap-2">
                    {SKILL_LEVELS.map((level) => {
                        const isActive = filters.skillLevel === level.value;
                        return (
                            <Button
                                key={level.value}
                                variant={isActive ? 'default' : 'outline'}
                                onClick={() => {
                                    updateFilter('skillLevel', level.value);
                                }}
                                className={cn(
                                    'rounded-xl h-9 px-4 text-small transition-colors',
                                    !isActive &&
                                        'text-secondary-text border-outline bg-transparent hover:bg-muted-background hover:text-primary-text'
                                )}
                            >
                                {level.label}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
