import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReportTargetType } from '../types';

const STYLES: Record<ReportTargetType, string> = {
    event: 'bg-soft-orange text-strong-orange',
    comment: 'bg-soft-purple text-strong-purple',
    user: 'bg-soft-blue text-strong-blue',
};

interface TypeBadgeProps {
    type: ReportTargetType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
    return <Badge className={cn('rounded-md', STYLES[type])}>{type}</Badge>;
}
