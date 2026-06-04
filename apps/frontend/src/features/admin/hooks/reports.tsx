import {
    keepPreviousData,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type {
    AdminReportQueryFilters,
    RejectReportBody,
    ResolveReportBody,
} from '../../../../../backend/src/modules/reports/reports.schema';
import {
    adminQueryKeys,
    getAdminReport,
    listAdminReports,
    rejectAdminReport,
    resolveAdminReport,
} from '../api/admin-api';

export function useReports(filters?: AdminReportQueryFilters) {
    return useQuery({
        queryKey: adminQueryKeys.reports(filters),
        queryFn: () => listAdminReports(filters),
        placeholderData: keepPreviousData,
    });
}

export function useInfiniteReports(filters?: AdminReportQueryFilters) {
    const limit = filters?.limit ?? 20;

    return useInfiniteQuery({
        queryKey: adminQueryKeys.infiniteReports(filters),
        queryFn: ({ pageParam }) =>
            listAdminReports({ ...filters, limit, offset: pageParam }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            (lastPage?.length ?? 0) < limit
                ? undefined
                : allPages.length * limit,
        placeholderData: keepPreviousData,
    });
}

export function useReport(id?: string) {
    return useQuery({
        queryKey: adminQueryKeys.reportDetail(id ?? 'missing'),
        queryFn: () => {
            if (!id) {
                throw new Error('Missing report id');
            }
            return getAdminReport(id);
        },
        enabled: Boolean(id),
    });
}

export function useResolveReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: ResolveReportBody }) =>
            resolveAdminReport(id, body),
        onSuccess: async (_data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [...adminQueryKeys.all, 'reports'],
                }),
                queryClient.invalidateQueries({
                    queryKey: adminQueryKeys.reportDetail(variables.id),
                }),
            ]);
        },
    });
}

export function useRejectReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: RejectReportBody }) =>
            rejectAdminReport(id, body),
        onSuccess: async (_data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [...adminQueryKeys.all, 'reports'],
                }),
                queryClient.invalidateQueries({
                    queryKey: adminQueryKeys.reportDetail(variables.id),
                }),
            ]);
        },
    });
}
