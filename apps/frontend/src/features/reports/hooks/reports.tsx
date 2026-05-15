import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateReportBody } from '../../../../../backend/src/modules/reports/reports.schema';
import { createReport, reportQueryKeys } from '../api/reports-api';

export function useCreateReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateReportBody) => createReport(body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: reportQueryKeys.all,
            });
        },
    });
}
