import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function EmailInput() {
    return (
        <div className="relative mb-3.5">
            <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
            />
            <Input type="email" placeholder="Email address" className="pl-9" />
        </div>
    );
}
