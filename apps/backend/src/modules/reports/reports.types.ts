import type { InferSelectModel } from 'drizzle-orm';
import type { reports } from '../../db/schema';
import type {
    CreateReportBody,
    MyReportsQuery,
    AdminReportQueryFilters,
} from './reports.schema';

export type ReportEntity = InferSelectModel<typeof reports>;

export type ReportType = 'user' | 'event' | 'comment';
export type ReportStatus = 'pending' | 'resolved' | 'rejected';

export type CreateReportInput = CreateReportBody;
export type MyReportFilters = MyReportsQuery;
export type AdminReportFilters = AdminReportQueryFilters;
