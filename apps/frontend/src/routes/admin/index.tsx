import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportsTable } from '@/features/admin/components/reports-table';
import { ReportDetailPanel } from '@/features/admin/components/report-detail-panel';
import {
    useRejectReport,
    useReports,
    useResolveReport,
} from '@/features/admin/hooks/reports';
import type { Report } from '@/features/admin/types';

export const Route = createFileRoute('/admin/')({
    component: AdminDashboard,
});

const ADMIN_TAB = {
    reports: 'reports',
} as const;

type AdminTabValue = (typeof ADMIN_TAB)[keyof typeof ADMIN_TAB];

function AdminDashboard() {
    const { data: reports } = useReports();
    const resolveReport = useResolveReport();
    const rejectReport = useRejectReport();
    const [selectedId, setSelectedId] = useState<string>();
    const [activeTab, setActiveTab] = useState<AdminTabValue>(
        ADMIN_TAB.reports
    );

    const reportList = reports ?? [];
    const selectedReport: Report | undefined =
        reportList.find((report) => report.id === selectedId) ??
        (reportList.length === 0 ? undefined : reportList[0]);
    const pendingCount = reportList.filter(
        (r) => r.status === 'pending'
    ).length;

    const actionError =
        resolveReport.error?.message ?? rejectReport.error?.message ?? null;

    return (
        <div className="max-w-280">
            <div className="mb-4">
                <h1 className="font-heading text-heading font-bold m-0 text-primary-text">
                    Admin Dashboard
                </h1>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(value) => {
                    if (value === ADMIN_TAB.reports) setActiveTab(value);
                }}
                className="mb-4"
            >
                <TabsList className="flex-wrap w-fit">
                    <TabsTrigger
                        value={ADMIN_TAB.reports}
                        className="flex-none text-regular px-4"
                    >
                        Reports
                        <span className="rounded-full bg-muted-background px-1.5 py-0.5 text-tiny leading-none text-secondary-text group-data-[state=active]:bg-primary-blue group-data-[state=active]:text-surface">
                            {pendingCount}
                        </span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex flex-col gap-4">
                <ReportsTable
                    reports={reportList}
                    selectedReportId={selectedReport?.id}
                    onSelect={setSelectedId}
                />

                <ReportDetailPanel
                    report={selectedReport}
                    resolvePending={resolveReport.isPending}
                    rejectPending={rejectReport.isPending}
                    actionError={actionError}
                    onResolve={(id, resolution) => {
                        resolveReport.mutate({ id, body: { resolution } });
                    }}
                    onReject={(id, resolution) => {
                        rejectReport.mutate({ id, body: { resolution } });
                    }}
                />
            </div>
        </div>
    );
}
