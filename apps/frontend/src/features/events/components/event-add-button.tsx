import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function EventAddButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            onClick={onClick}
            size="icon"
            className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg bg-primary-orange hover:bg-strong-orange z-50 md:bottom-6"
        >
            <Plus size={40} />
        </Button>
    );
}
