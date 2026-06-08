import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface TextInputProps extends ComponentProps<'input'> {
    icon?: LucideIcon;
}

export function TextInput({ icon: Icon, className, ...props }: TextInputProps) {
    return (
        <div className="relative">
            {Icon && (
                <Icon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
                />
            )}

            <Input className={cn(Icon && 'pl-9', className)} {...props} />
        </div>
    );
}
