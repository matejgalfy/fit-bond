export const openapiConfig = {
    documentation: {
        info: {
            title: 'FitBond API',
            version: '1.0.0',
            description:
                'Social sports application for discovering, creating, and joining local sports events',
        },
        tags: [
            { name: 'Events', description: 'Event management' },
            {
                name: 'Participation',
                description: 'Joining, leaving, and marking interest in events',
            },
            { name: 'Sports', description: 'Sports catalog' },
            { name: 'Users', description: 'User management' },
            { name: 'Comments', description: 'Event comments' },
            {
                name: 'Notifications',
                description: 'User notification management',
            },
            {
                name: 'Locations',
                description: 'Address geocoding and lookup',
            },
            {
                name: 'Admin',
                description:
                    'Administrative moderation: user search, ban/unban, profile edits, and admin event search',
            },
            {
                name: 'Reports',
                description: 'User-submitted moderation reports',
            },
        ],
    },
    exclude: { methods: ['OPTIONS'] as const },
} as const;
