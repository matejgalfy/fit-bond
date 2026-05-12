import type { AdminReport } from './api/admin-api';

export type ReportTargetType = 'event' | 'comment' | 'user';

export type ReportStatus = 'pending' | 'resolved' | 'rejected';

export type Report = AdminReport;

export type UserRole = 'user' | 'admin';
