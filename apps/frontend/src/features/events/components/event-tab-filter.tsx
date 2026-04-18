import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
    { value: 'organizing', label: 'Organizing' },
    { value: 'joined', label: 'Joined' },
    { value: 'interested', label: 'Interested' },
];

interface EventTabFilterProps {
    value: string;
    counts: Record<string, number>;
    /* eslint-disable-next-line no-unused-vars */
    onValueChange: (value: string) => void;
}

export function EventTabFilter({
    value,
    counts,
    onValueChange,
}: EventTabFilterProps) {
    return (
        <Tabs value={value} onValueChange={onValueChange}>
            <TabsList className="flex-wrap w-fit">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex-none text-sm px-4"
                    >
                        {tab.label}
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground group-data-[state=active]:bg-blue-500 group-data-[state=active]:text-white">
                            {counts[tab.value] ?? 0}
                        </span>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
