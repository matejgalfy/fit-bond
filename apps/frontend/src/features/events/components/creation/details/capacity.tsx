import { Users } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

interface CapacityFieldProps {
    capacity: string;
    // eslint-disable-next-line no-unused-vars
    onCapacityChange: (capacity: string) => void;
}

export function CapacityField({
    capacity,
    onCapacityChange,
}: CapacityFieldProps) {
    return (
        <FormField label="Capacity" htmlFor="event-capacity" required>
            <div className="flex items-center gap-2">
                <Users
                    size={16}
                    className="text-secondary-text"
                    aria-hidden="true"
                />
                <Input
                    id="event-capacity"
                    type="text"
                    inputMode="numeric"
                    value={capacity}
                    onChange={(e) => {
                        onCapacityChange(e.target.value);
                    }}
                    className="h-10 w-20 bg-background"
                />
                <span className="text-small text-secondary-text">
                    players max
                </span>
            </div>
        </FormField>
    );
}
