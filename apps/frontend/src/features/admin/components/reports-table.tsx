import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TypeBadge } from './type-badge';
import type { Report, ReportStatus } from '../types';

interface ReportsTableProps {
    reports: Report[];
    selectedReportId?: string;
    onSelect: (_id: string) => void;
}

const HEADERS = [
    'Reporter',
    'Type',
    'Target',
    'Reason',
    'Status',
    'Date',
] as const;

const STATUS_STYLES: Record<ReportStatus, string> = {
    pending: 'bg-soft-orange text-strong-orange',
    resolved: 'bg-soft-green text-strong-green',
    rejected: 'bg-muted text-muted-foreground',
};

export function ReportsTable({
    reports,
    selectedReportId,
    onSelect,
}: ReportsTableProps) {
    return (
        <div className="rounded-xl ring-1 ring-primary-text/10 bg-surface overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        {HEADERS.map((label) => (
                            <TableHead
                                key={label}
                                className="text-secondary-text px-4 py-3 h-auto"
                            >
                                {label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <TableRow
                            key={report.id}
                            data-state={
                                report.id === selectedReportId
                                    ? 'selected'
                                    : undefined
                            }
                            onClick={() => {
                                onSelect(report.id);
                            }}
                            className="cursor-pointer"
                        >
                            <TableCell className="px-4 py-3 text-primary-text">
                                {report.reporterName ?? 'Unknown'}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <TypeBadge type={report.reportType} />
                            </TableCell>
                            <TableCell className="px-4 py-3 text-primary-text">
                                {report.targetLabel ?? '<deleted>'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-primary-text">
                                {report.reason}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <Badge
                                    className={`rounded-md ${STATUS_STYLES[report.status]}`}
                                >
                                    {report.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-secondary-text">
                                {formatDate(report.createdAt)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
