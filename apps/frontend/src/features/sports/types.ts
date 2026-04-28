import { api } from '@/lib/api';

export type SportsGetData = Awaited<ReturnType<typeof api.sports.get>>['data'];

export type SportListResponse = Extract<NonNullable<SportsGetData>, unknown[]>;

export type Sport = SportListResponse[number];
