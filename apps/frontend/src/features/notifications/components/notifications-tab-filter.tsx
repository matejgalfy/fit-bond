import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
] as const;

export type NotificationTabValue = (typeof tabs)[number]['value'];

interface NotificationsTabFilterProps {
    value: NotificationTabValue;
    counts: Record<NotificationTabValue, number>;
    /* eslint-disable-next-line no-unused-vars */
    onValueChange: (value: NotificationTabValue) => void;
}

export function NotificationsTabFilter({
    value,
    counts,
    onValueChange,
}: NotificationsTabFilterProps) {
    return (
        <Tabs
            value={value}
            onValueChange={(nextValue) => {
                if (nextValue === 'all' || nextValue === 'unread') {
                    onValueChange(nextValue);
                }
            }}
        >
            <TabsList className="flex-wrap w-fit">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex-none text-sm px-4"
                    >
                        {tab.label}
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground group-data-[state=active]:bg-blue-500 group-data-[state=active]:text-white">
                            {counts[tab.value]}
                        </span>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
