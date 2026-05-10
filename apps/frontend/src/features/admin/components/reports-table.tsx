import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TypeBadge } from './type-badge';
import type { Report } from '../types';

interface ReportsTableProps {
    reports: Report[];
    selectedReportId?: string;
    onSelect: (_id: string) => void;
}

const HEADERS = ['Reporter', 'Type', 'Target', 'Reason', 'Date'] as const;

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
                                {report.reporterName}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <TypeBadge type={report.targetType} />
                            </TableCell>
                            <TableCell className="px-4 py-3 text-primary-text">
                                {report.targetLabel}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-primary-text">
                                {report.reason}
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

function formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
