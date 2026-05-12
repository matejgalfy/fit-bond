import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TypeBadge } from './type-badge';
import type { Report } from '../types';

interface ReportDetailPanelProps {
    report?: Report;
    onResolve: (_id: string, _resolution: string) => void;
    onReject: (_id: string, _resolution: string | undefined) => void;
    resolvePending?: boolean;
    rejectPending?: boolean;
    actionError?: string | null;
}

type ActionMode = 'idle' | 'resolve' | 'reject';

export function ReportDetailPanel({
    report,
    onResolve,
    onReject,
    resolvePending,
    rejectPending,
    actionError,
}: ReportDetailPanelProps) {
    const [mode, setMode] = useState<ActionMode>('idle');
    const [resolution, setResolution] = useState('');

    useEffect(() => {
        setMode('idle');
        setResolution('');
    }, [report?.id]);

    const isPending = report?.status === 'pending';
    const trimmed = resolution.trim();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-subheading font-bold">
                    Report Detail
                </CardTitle>
            </CardHeader>
            <CardContent>
                {report ? (
                    <>
                        <dl className="space-y-1.5 text-regular mb-4">
                            <Field
                                label="Reporter"
                                value={report.reporterName ?? 'Unknown'}
                            />
                            <Field
                                label="Type"
                                value={<TypeBadge type={report.reportType} />}
                            />
                            <Field
                                label="Target"
                                value={report.targetLabel ?? '<deleted>'}
                            />
                            <Field label="Reason" value={report.reason} />
                            <Field label="Status" value={report.status} />
                            {report.resolution && (
                                <Field
                                    label="Resolution"
                                    value={report.resolution}
                                />
                            )}
                        </dl>

                        {isPending && mode === 'idle' && (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={() => {
                                        setMode('resolve');
                                    }}
                                    className="bg-primary-green text-surface hover:bg-strong-green"
                                >
                                    <CheckCircle2 size={16} />
                                    Resolve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setMode('reject');
                                    }}
                                >
                                    <XCircle size={16} />
                                    Reject
                                </Button>
                            </div>
                        )}

                        {isPending && mode !== 'idle' && (
                            <div className="flex flex-col gap-2">
                                <Textarea
                                    placeholder={
                                        mode === 'resolve'
                                            ? 'Resolution note (required)'
                                            : 'Resolution note (optional)'
                                    }
                                    value={resolution}
                                    onChange={(e) => {
                                        setResolution(e.target.value);
                                    }}
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setMode('idle');
                                            setResolution('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    {mode === 'resolve' ? (
                                        <Button
                                            onClick={() => {
                                                if (!trimmed) return;
                                                onResolve(report.id, trimmed);
                                            }}
                                            disabled={
                                                !trimmed || resolvePending
                                            }
                                            className="bg-primary-green text-surface hover:bg-strong-green"
                                        >
                                            <CheckCircle2 size={16} />
                                            Confirm resolve
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                onReject(
                                                    report.id,
                                                    trimmed || undefined
                                                );
                                            }}
                                            disabled={rejectPending}
                                        >
                                            <XCircle size={16} />
                                            Confirm reject
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {actionError && (
                            <p className="text-small text-destructive mt-3 m-0">
                                {actionError}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-secondary-text text-regular m-0">
                        Select a report to see its details.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface FieldProps {
    label: string;
    value: React.ReactNode;
}

function Field({ label, value }: FieldProps) {
    return (
        <div className="flex items-center gap-2">
            <dt className="font-bold text-primary-text">{label}:</dt>
            <dd className="m-0 text-secondary-text">{value}</dd>
        </div>
    );
}
