export type ReportTargetType = 'event' | 'comment' | 'user';

export type ReportStatus = 'open' | 'reviewing' | 'resolved';

export interface Report {
    id: string;
    reporterName: string;
    targetType: ReportTargetType;
    targetLabel: string;
    reason: string;
    createdAt: string;
    status: ReportStatus;
}

export type UserRole = 'user' | 'admin';
