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
            className="h-auto rounded-lg bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-blue-500 hover:bg-card "
        >
            <Check size={16} />
            Mark all as read
        </Button>
    );
}
