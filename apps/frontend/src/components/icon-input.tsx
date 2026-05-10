import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface IconInputProps extends React.ComponentProps<'input'> {
    icon: LucideIcon;
    iconSize?: number;
}

export function IconInput({
    icon: Icon,
    iconSize = 16,
    className,
    ...props
}: IconInputProps) {
    return (
        <div className="relative">
            <Icon
                size={iconSize}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
            />
            <Input
                className={cn('pl-9 h-10 rounded-xl', className)}
                {...props}
            />
        </div>
    );
}
