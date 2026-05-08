import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type { LocationSuggestion } from '../../../../../backend/src/modules/locations/locations.schema';

export const locationQueryKeys = {
    all: ['locations'] as const,
    search: (q: string) => [...locationQueryKeys.all, 'search', q] as const,
};

export async function searchLocations(
    q: string
): Promise<LocationSuggestion[]> {
    const { data, error } = await api.locations.search.get({ query: { q } });
    throwIfError(error, 'Failed to search locations');
    return data;
}
