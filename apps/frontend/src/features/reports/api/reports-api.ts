import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type { CreateReportBody } from '../../../../../backend/src/modules/reports/reports.schema';

export const reportQueryKeys = {
    all: ['reports'] as const,
};

export async function createReport(body: CreateReportBody) {
    const { data, error } = await api.reports.post(body);
    throwIfError(error, 'Failed to submit report');
    return data;
}
