import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>;

export function PasswordInput({
    placeholder = 'Password',
    className,
    ...props
}: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
            />

            <Input
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                className={cn('pl-9 pr-10', className)}
                {...props}
            />

            <button
                type="button"
                onClick={() => {
                    setShow(!show);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
                aria-label={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}
