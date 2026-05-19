import { api } from '@/lib/api';
import { throwIfError } from '@/lib/api-error';
import type {
    AdminUserQueryFilters,
    AdminEventQueryFilters,
    UpdateUserAdminBody,
} from '../../../../../backend/src/modules/admin/admin.schema';
import type {
    AdminReportQueryFilters,
    ResolveReportBody,
    RejectReportBody,
} from '../../../../../backend/src/modules/reports/reports.schema';

export const adminQueryKeys = {
    all: ['admin'] as const,
    users: (filters?: AdminUserQueryFilters) =>
        [...adminQueryKeys.all, 'users', filters ?? null] as const,
    userDetail: (id: string) =>
        [...adminQueryKeys.all, 'users', 'detail', id] as const,
    events: (filters?: AdminEventQueryFilters) =>
        [...adminQueryKeys.all, 'events', filters ?? null] as const,
    reports: (filters?: AdminReportQueryFilters) =>
        [...adminQueryKeys.all, 'reports', filters ?? null] as const,
    reportDetail: (id: string) =>
        [...adminQueryKeys.all, 'reports', 'detail', id] as const,
};

export async function listAdminUsers(filters?: AdminUserQueryFilters) {
    const { data, error } = await api.admin.users.get({ query: filters ?? {} });
    throwIfError(error, 'Failed to fetch users');
    return data;
}

export async function getAdminUser(id: string) {
    const { data, error } = await api.admin.users({ id }).get();
    throwIfError(error, 'Failed to fetch user');
    return data;
}

export async function updateAdminUser(id: string, body: UpdateUserAdminBody) {
    const { data, error } = await api.admin.users({ id }).patch(body);
    throwIfError(error, 'Failed to update user');
    return data;
}

export async function deleteAdminUser(id: string) {
    const { data, error } = await api.admin.users({ id }).delete();
    throwIfError(error, 'Failed to delete user');
    return data;
}

export async function listAdminEvents(filters?: AdminEventQueryFilters) {
    const { data, error } = await api.admin.events.get({
        query: filters ?? {},
    });
    throwIfError(error, 'Failed to fetch events');
    return data;
}

export async function listAdminReports(filters?: AdminReportQueryFilters) {
    const { data, error } = await api.admin.reports.get({
        query: filters ?? {},
    });
    throwIfError(error, 'Failed to fetch reports');
    return data;
}

export async function getAdminReport(id: string) {
    const { data, error } = await api.admin.reports({ id }).get();
    throwIfError(error, 'Failed to fetch report');
    return data;
}

export async function resolveAdminReport(id: string, body: ResolveReportBody) {
    const { data, error } = await api.admin.reports({ id }).resolve.post(body);
    throwIfError(error, 'Failed to resolve report');
    return data;
}

export async function rejectAdminReport(id: string, body: RejectReportBody) {
    const { data, error } = await api.admin.reports({ id }).reject.post(body);
    throwIfError(error, 'Failed to reject report');
    return data;
}

export type AdminReport = NonNullable<
    Awaited<ReturnType<typeof getAdminReport>>
>;
export type AdminUser = NonNullable<Awaited<ReturnType<typeof getAdminUser>>>;
export type AdminEvent = NonNullable<
    Awaited<ReturnType<typeof listAdminEvents>>
>[number];
