import { api } from '@/lib/api';

// Is either a list of events or an error response from the API
export type EventsGetData = Awaited<ReturnType<typeof api.events.get>>['data'];

export type EventListResponse = Extract<NonNullable<EventsGetData>, unknown[]>;
export type Event = EventListResponse[number];
