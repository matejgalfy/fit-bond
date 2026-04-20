export const EventTab = {
    organizing: 'organizing',
    joined: 'joined',
    interested: 'interested',
} as const;

export type EventTabValue = (typeof EventTab)[keyof typeof EventTab];

export function isEventTabValue(value: string): value is EventTabValue {
    return (
        value === EventTab.organizing ||
        value === EventTab.joined ||
        value === EventTab.interested
    );
}
