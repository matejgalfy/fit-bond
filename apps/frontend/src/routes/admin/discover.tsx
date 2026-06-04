import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminEventsBrowser } from '@/features/admin/components/admin-events-browser';
import { AdminUsersSearch } from '@/features/admin/components/admin-users-search';

export const Route = createFileRoute('/admin/discover')({
    component: AdminDiscoverPage,
});

const DISCOVER_TAB = {
    events: 'events',
    users: 'users',
} as const;

type DiscoverTabValue = (typeof DISCOVER_TAB)[keyof typeof DISCOVER_TAB];

function AdminDiscoverPage() {
    const [activeTab, setActiveTab] = useState<DiscoverTabValue>(
        DISCOVER_TAB.events
    );

    return (
        <div className="max-w-240">
            <div className="mb-6">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    Discover
                </h1>
                <p className="text-regular text-secondary-text mt-1">
                    Browse events and find users on the platform
                </p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(value) => {
                    if (
                        value === DISCOVER_TAB.events ||
                        value === DISCOVER_TAB.users
                    ) {
                        setActiveTab(value);
                    }
                }}
                className="mb-4"
            >
                <TabsList className="flex-wrap w-fit mb-4">
                    <TabsTrigger
                        value={DISCOVER_TAB.events}
                        className="flex-none text-regular px-4"
                    >
                        Events
                    </TabsTrigger>
                    <TabsTrigger
                        value={DISCOVER_TAB.users}
                        className="flex-none text-regular px-4"
                    >
                        Users
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={DISCOVER_TAB.events}>
                    <AdminEventsBrowser />
                </TabsContent>
                <TabsContent value={DISCOVER_TAB.users}>
                    <AdminUsersSearch />
                </TabsContent>
            </Tabs>
        </div>
    );
}
