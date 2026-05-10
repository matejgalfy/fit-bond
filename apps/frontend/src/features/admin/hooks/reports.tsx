import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Report } from '../types';

const reportQueryKeys = {
    all: ['admin', 'reports'] as const,
    list: () => [...reportQueryKeys.all, 'list'] as const,
    detail: (id: string) => [...reportQueryKeys.all, 'detail', id] as const,
};

const MOCK_REPORTS: Report[] = [
    {
        id: 'r-1',
        reporterName: 'Jana K.',
        targetType: 'event',
        targetLabel: 'Spam Fitness Event',
        reason: 'Spam',
        createdAt: '2026-03-21',
        status: 'open',
    },
    {
        id: 'r-2',
        reporterName: 'Eva M.',
        targetType: 'comment',
        targetLabel: '"This is terrible..."',
        reason: 'Inappropriate',
        createdAt: '2026-03-20',
        status: 'open',
    },
    {
        id: 'r-3',
        reporterName: 'Petr S.',
        targetType: 'event',
        targetLabel: 'Illegal Gathering',
        reason: 'Other',
        createdAt: '2026-03-18',
        status: 'open',
    },
    {
        id: 'r-4',
        reporterName: 'Lucie D.',
        targetType: 'user',
        targetLabel: 'SpamBot99',
        reason: 'Spam',
        createdAt: '2026-03-17',
        status: 'open',
    },
];

export function useReports() {
    return useQuery<Report[]>({
        queryKey: reportQueryKeys.list(),
        queryFn: () => Promise.resolve(MOCK_REPORTS),
    });
}

export function useResolveReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => Promise.resolve(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: reportQueryKeys.all,
            });
        },
    });
}

export { reportQueryKeys };
