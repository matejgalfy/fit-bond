import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type { CreateSportBody } from '../../../../../backend/src/modules/sports/sports.schema';
import type { Sport } from '../types';

export const sportQueryKeys = {
    all: ['sports'] as const,
    lists: () => [...sportQueryKeys.all, 'list'] as const,
    details: () => [...sportQueryKeys.all, 'detail'] as const,
    detail: (id?: string) => [...sportQueryKeys.details(), id] as const,
};

export async function listSports() {
    const { data, error } = await api.sports.get();
    throwIfError(error, 'Failed to fetch sports');
    return data;
}

export async function getSport(id: string): Promise<Sport> {
    const { data, error } = await api.sports({ id }).get();
    throwIfError(error, 'Failed to fetch sport');
    return data;
}

export async function createSport(body: CreateSportBody) {
    const { data, error } = await api.sports.post(body);
    throwIfError(error, 'Failed to create sport');
    return data;
}

export async function deleteSport(id: string) {
    const { data, error } = await api.sports({ id }).delete();
    throwIfError(error, 'Failed to delete sport');
    return data;
}
