import type { ChangeEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Props {
    type?: string;
    placeholder?: string;
    icon?: LucideIcon;
    className?: string;
    value?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
}

export function TextInput({
    type = 'text',
    placeholder,
    icon: Icon,
    className,
    value,
    onChange,
}: Props) {
    return (
        <div className={cn('relative mb-3.5', className)}>
            {Icon && (
                <Icon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
            )}

            <Input
                type={type}
                placeholder={placeholder}
                className={Icon ? 'pl-9' : undefined}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
