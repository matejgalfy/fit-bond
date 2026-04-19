import { api } from '@/lib/api';

// Is either a list of events or an error response from the API
export type EventsGetData = Awaited<ReturnType<typeof api.events.get>>['data'];

export type EventListResponse = Extract<NonNullable<EventsGetData>, unknown[]>;
// Infered. type:
// type Event = {
//     id: string;
//     name: string;
//     description: string | null;
//     skillLevel: "beginner" | "intermediate" | "advanced";
//     startTime: Date;
//     duration: number;
//     capacity: number;
//     currentParticipants: number;
//     isPublic: boolean;
//     coverImageUrl: string | null;
//     cancelledAt: Date | null;
//     createdAt: Date;
//     organizer: {
//         id: string;
//         name: string;
//         profilePictureUrl: string | null;
//     };
//     location: {
//         id: string;
//         city: string;
//         country: string;
//     };
//     sport: {
//         id: string;
//         name: string;
//         iconUrl: string | null;
//     };
// }
export type Event = EventListResponse[number];
