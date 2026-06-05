import {
    keepPreviousData,
    useInfiniteQuery,
    useQuery,
} from '@tanstack/react-query';
import type { AdminEventQueryFilters } from '../../../../../backend/src/modules/admin/admin.schema';
import { adminQueryKeys, listAdminEvents } from '../api/admin-api';

export function useAdminEvents(filters?: AdminEventQueryFilters) {
    return useQuery({
        queryKey: adminQueryKeys.events(filters),
        queryFn: () => listAdminEvents(filters),
        placeholderData: keepPreviousData,
    });
}

export function useInfiniteAdminEvents(filters?: AdminEventQueryFilters) {
    const limit = filters?.limit ?? 20;

    return useInfiniteQuery({
        queryKey: adminQueryKeys.infiniteEvents(filters),
        queryFn: ({ pageParam }) =>
            listAdminEvents({ ...filters, limit, offset: pageParam }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < limit ? undefined : allPages.length * limit,
        placeholderData: keepPreviousData,
    });
}
