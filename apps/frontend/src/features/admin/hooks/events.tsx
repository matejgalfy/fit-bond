import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AdminEventQueryFilters } from '../../../../../backend/src/modules/admin/admin.schema';
import { adminQueryKeys, listAdminEvents } from '../api/admin-api';

export function useAdminEvents(filters?: AdminEventQueryFilters) {
    return useQuery({
        queryKey: adminQueryKeys.events(filters),
        queryFn: () => listAdminEvents(filters),
        placeholderData: keepPreviousData,
    });
}
