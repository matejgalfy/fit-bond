import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PasswordInputProps {
    placeholder?: string;
}

export function PasswordInput({
    placeholder = 'Password',
}: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative mb-2.5">
            <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />

            <Input
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                className="pl-9 pr-10"
            />

            <button
                type="button"
                onClick={() => {
                    setShow(!show);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}
