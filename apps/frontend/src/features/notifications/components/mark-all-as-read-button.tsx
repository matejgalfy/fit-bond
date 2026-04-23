import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkAllAsReadButtonProps {
    disabled: boolean;
    onClick: () => void;
}

export function MarkAllAsReadButton({
    disabled,
    onClick,
}: MarkAllAsReadButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={onClick}
            className="h-auto rounded-md bg-transparent px-2 py-1 text-small font-medium text-primary-blue hover:bg-surface"
        >
            <Check size={14} />
            Mark all as read
        </Button>
    );
}
