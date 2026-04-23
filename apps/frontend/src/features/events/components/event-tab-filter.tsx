import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventTab, isEventTabValue, type EventTabValue } from '../event-tabs';

const tabs = [
    { value: EventTab.organizing, label: 'Organizing' },
    { value: EventTab.joined, label: 'Joined' },
    { value: EventTab.interested, label: 'Interested' },
] as const;

interface EventTabFilterProps {
    value: EventTabValue;
    counts: Record<EventTabValue, number>;
    /* eslint-disable-next-line no-unused-vars */
    onValueChange: (value: EventTabValue) => void;
}

export function EventTabFilter({
    value,
    counts,
    onValueChange,
}: EventTabFilterProps) {
    return (
        <Tabs
            value={value}
            onValueChange={(nextValue) => {
                if (isEventTabValue(nextValue)) {
                    onValueChange(nextValue);
                }
            }}
        >
            <TabsList className="flex-wrap w-fit">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex-none text-regular px-4"
                    >
                        {tab.label}
                        <span className="rounded-full bg-muted-background px-1.5 py-0.5 text-tiny leading-none text-secondary-text group-data-[state=active]:bg-primary-blue group-data-[state=active]:text-surface">
                            {counts[tab.value]}
                        </span>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
