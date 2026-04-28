import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateSportBody } from '../../../../../backend/src/modules/sports/sports.schema';
import type { Sport } from '../types';
import {
    createSport,
    deleteSport,
    getSport,
    listSports,
    sportQueryKeys,
} from '../api/sports-api';

export function useSports() {
    return useQuery<Sport[]>({
        queryKey: sportQueryKeys.lists(),
        queryFn: () => listSports(),
    });
}

export function useSport(id?: string) {
    return useQuery<Sport>({
        queryKey: sportQueryKeys.detail(id ?? 'missing'),
        queryFn: () => {
            if (!id) {
                throw new Error('Missing sport id');
            }

            return getSport(id);
        },
        enabled: Boolean(id),
    });
}

export function useCreateSport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateSportBody) => createSport(body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: sportQueryKeys.all,
            });
        },
    });
}

export function useDeleteSport(id?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            if (!id) {
                throw new Error('Missing sport id');
            }

            return deleteSport(id);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: sportQueryKeys.all,
            });
        },
    });
}
