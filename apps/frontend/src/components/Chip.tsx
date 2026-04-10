import { X } from 'lucide-react';

interface ChipProps {
    label: string;
    onRemove?: () => void;
}

export function Chip({ label, onRemove }: ChipProps) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: '#0080FF15',
                color: '#0080FF',
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 8,
            }}
        >
            {label}
            {onRemove && (
                <X size={12} style={{ cursor: 'pointer' }} onClick={onRemove} />
            )}
        </span>
    );
}
