import { CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TypeBadge } from './type-badge';
import type { Report } from '../types';

interface ReportDetailPanelProps {
    report?: Report;
    onReview: (_id: string) => void;
    onResolve: (_id: string) => void;
}

export function ReportDetailPanel({
    report,
    onReview,
    onResolve,
}: ReportDetailPanelProps) {
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
                                value={report.reporterName}
                            />
                            <Field
                                label="Type"
                                value={<TypeBadge type={report.targetType} />}
                            />
                            <Field label="Target" value={report.targetLabel} />
                            <Field label="Reason" value={report.reason} />
                        </dl>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => {
                                    onReview(report.id);
                                }}
                                className="bg-primary-green text-surface hover:bg-strong-green"
                            >
                                <Eye size={16} />
                                Review
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onResolve(report.id);
                                }}
                                className="border-primary-green text-primary-green hover:bg-soft-green hover:text-strong-green"
                            >
                                <CheckCircle2 size={16} />
                                Done
                            </Button>
                        </div>
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
