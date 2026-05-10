import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps extends React.ComponentProps<'div'> {
    children: React.ReactNode;
}

export function EmptyState({ className, children, ...props }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'py-12 text-center text-secondary-text bg-surface rounded-2xl border border-outline',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
